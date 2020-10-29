/*
 * ExplUpdater.ts
 * 探索更新器
 * luleyan
 */

import { BtlPageBase } from './BtlPageBase';
import { Memory, GameDataTool, PetTool, EquipTool, CnsumTool, MoneyTool, QuestTool, CaughtPetTool } from 'scripts/Memory';
import { BtlCtrlr } from './BtlCtrlr';
import {
    GameData,
    ExplMmr,
    Catcher,
    Pet,
    BattleMmr,
    Money,
    PosData,
    PADExpl,
    Quest,
    NeedUpdCntByStep,
    EPetMmr
} from 'scripts/DataSaved';
import { AmplAttriType, RealBattle, BattlePet, GameJITDataTool } from './DataOther';
import { actPosModelDict } from 'configs/ActPosModelDict';
import {
    randomInt,
    randomArea,
    randomRate,
    getRandomOneInList,
    randomAreaInt,
    random,
    randomRound,
    randomAreaByIntRange
} from './Random';
import {
    ExplModel,
    StepTypesByMax,
    ExplStepNames,
    CatcherModel,
    PAKey,
    QuestType,
    QuestModel,
    FightQuestNeed,
    GatherQuestNeed,
    SearchQuestNeed
} from './DataModel';
import { equipModelDict } from 'configs/EquipModelDict';
import { catcherModelDict } from 'configs/CatcherModelDict';
import { petModelDict } from 'configs/PetModelDict';

export enum ExplState {
    none,
    explore,
    battle,
    recover
}

enum ExplResult {
    doing,
    gain, // 获取收益
    battle
}

/** 探索时间间隔毫秒 */
const ExplIntervalNormal = 750;
const ExplIntervalFast = 150;
let ExplInterval = ExplIntervalNormal;

const AvgExplRdCnt = 3;
const AvgUpdCntForEachExplRd = 8;
const MoneyGainRdEnterRate = 0.6;

const GatherQuestRate = 0.1;
const GatherQuestRateWhenHiding = 0.3;

export enum ExplLogType {
    repeat = 1,
    rich,
    atk,
    miss,
    buff,
    stop,
    dead,
    round
}

export class ExplLogData {
    type: ExplLogType;
    data: any;
}

export class ExplUpdater {
    page: BtlPageBase = null;
    memory: Memory = null;
    gameData: GameData = null;
    btlCtrlr: BtlCtrlr = null;

    _id: string = 'expl'; // 用于cc.Scheduler.update

    state: ExplState = ExplState.none;

    inited: boolean = false;
    pausing: boolean = false;

    init(page: BtlPageBase, spcBtlId: number, startStep: number) {
        this.page = page;
        this.memory = this.page.ctrlr.memory;
        this.gameData = this.memory.gameData;

        cc.director.getScheduler().scheduleUpdate(this, 0, false);

        this.page.ctrlr.debugTool.setShortCut('ww', this.pauseOrResume.bind(this));
        this.page.ctrlr.debugTool.setShortCut('gg', this.goNext.bind(this));
        this.page.ctrlr.debugTool.setShortCut('ff', this.fastUpdate.bind(this));

        this.btlCtrlr = new BtlCtrlr();
        this.btlCtrlr.init(this, this.onBattleEnd.bind(this));

        const curExpl = this.gameData.curExpl;
        if (!curExpl) this.createExpl(spcBtlId, startStep);
        else this.recoverLastExpl(this.gameData);
    }

    pauseOrResume() {
        this.pausing = !this.pausing;
        if (this.pausing) cc.log('PUT 暂停探索更新');
        else cc.log('PUT 重新开始探索更新');
    }

    goNext() {
        if (!this.pausing) {
            cc.log('PUT 暂停期间才可以使用下一步功能');
            return;
        }

        cc.log('PUT 下一步');
        this.lastTime = Date.now();
        this.updCnt += 1;
        this.onUpdate();
    }

    fastUpdate() {
        ExplInterval = ExplInterval === ExplIntervalNormal ? ExplIntervalFast : ExplIntervalNormal;
        if (ExplInterval === ExplIntervalFast) cc.log('PUT 加速');
        else cc.log('PUT 恢复正常速度');
    }

    // -----------------------------------------------------------------

    /** 如果为null，则表示后台运行 */
    runAt(page: BtlPageBase) {
        this.page = page;
        this.btlCtrlr.page = page;
    }

    static updaterInBG: ExplUpdater = null;

    static save(updater: ExplUpdater) {
        ExplUpdater.updaterInBG = updater;
    }

    static popUpdaterInBG(): ExplUpdater {
        const curUpdater = ExplUpdater.updaterInBG;
        ExplUpdater.updaterInBG = null;
        return curUpdater;
    }

    static haveUpdaterInBG(): boolean {
        return ExplUpdater.updaterInBG !== null;
    }

    // -----------------------------------------------------------------

    createExpl(spcBtlId: number, startStep: number) {
        GameDataTool.createExpl(this.gameData, startStep);
        if (!spcBtlId) {
            this.startExpl();
        } else {
            this.startBattle(spcBtlId); // 专属作战直接进入战斗
        }
        this.lastTime = Date.now();

        if (this.page) this.page.handleLog();
    }

    recoverLastExpl(gameData: GameData) {
        const curExpl = gameData.curExpl;

        if (curExpl.curBattle) {
            const { inBattle, win, updCnt, lastTime } = this.recoverExplInBattle(curExpl.curBattle, curExpl.stepEnterTime);
            if (inBattle) {
                this.updCnt = updCnt;
                this.lastTime = lastTime;

                this.recoverExplStepPercent(curExpl);

                this.state = ExplState.battle;
                this.resetAllUI();
                return;
            } else {
                curExpl.chngUpdCnt = updCnt;
                if (win) {
                    this.receiveExp();
                    this.catchPet();
                }
            }
        } else {
            this.handleSelfTeamChange();
        }

        let nowTime = Date.now();
        const chngSpan = curExpl.chngUpdCnt * ExplInterval;
        const lastTime = curExpl.stepEnterTime + chngSpan;

        // MockSpan用于模拟日志，这部分时间靠update恢复，这样就可以保有日志了
        const MockSpan = (15 + randomInt(35)) * ExplInterval; // 使用一个随机数，让进入位置能分配到各个阶段，感觉更自然
        if (nowTime - lastTime <= MockSpan) {
            this.updCnt = curExpl.chngUpdCnt;
            this.lastTime = lastTime;

            this.recoverExplStepPercent(curExpl);
            this.resetAllUI();
            this.startExpl();
            return;
        }

        this.logList.length = 0;
        nowTime -= MockSpan;

        // 捕捉状态
        let catcherIdx = -1;
        if (curExpl.catcherId) {
            catcherIdx = ExplUpdater.getCatcherIdxInItemList(gameData, curExpl.catcherId);
            if (catcherIdx === -1) curExpl.catcherId = null;
        }
        const catchSt = { catcherIdx };

        // 结果状态
        const rztSt = {
            exp: 0,
            money: 0,
            eqps: [],
            pets: [],
            itemDict: {},
            moveCnt: 0
        };

        const selfPets = GameDataTool.getReadyPets(this.gameData);

        // 计算step
        const posId = curExpl.curPosId;
        const curPosModel = actPosModelDict[posId];
        const curStep = curExpl.curStep;

        const EachSpanUpdCnt = (1000 * 60 * 60 * 3) / ExplIntervalNormal; // 3小时的跳数
        const HangMaxSpan = 8; // 3*8=24小时
        let spanCnt = 0;

        while (true) {
            // 战斗状态
            const selfLv = selfPets.getAvg((pet: Pet) => pet.lv);
            const selfPwr = selfPets.getAvg((pet: Pet) => {
                let totalEqpLv = 0;
                let featureLvs = 0;
                for (const eqp of pet.equips) {
                    if (!eqp) continue;
                    const eqpModel = equipModelDict[eqp.id];
                    const eqpLv = (eqpModel.lv + eqp.growth) * (1 + eqpModel.rank * 0.1);
                    totalEqpLv += eqpLv * 0.15; // 每个装备属性大约等于同等级精灵的20%，但这里只x15%，少于20%
                    for (const lv of eqp.selfFeatureLvs) featureLvs += lv;
                    for (const feature of eqp.affixes) featureLvs += feature.lv;
                }
                for (const feature of pet.lndFeatures) featureLvs += feature.lv;

                const realPrvty = PetTool.getRealPrvty(pet);
                let curPower = pet.lv + totalEqpLv;
                curPower *= 1 + (featureLvs + realPrvty * 0.01 * 20) * 0.01;
                return curPower;
            });
            const enemyLv: number = RealBattle.calcLvArea(curPosModel, curStep).base;
            const enemyPwr = enemyLv;
            const agiRate = ExplUpdater.getPosPetAgiRate(curExpl, this.btlCtrlr);
            const sensRate = ExplUpdater.getPosPetSensRate(curExpl, this.btlCtrlr);
            const eleRate = ExplUpdater.getPosPetEleRate(curExpl, this.btlCtrlr);
            const petSt = { selfLv, selfPwr, enemyLv, enemyPwr, agiRate, sensRate, eleRate };

            const nextUpdCnt = curExpl.chngUpdCnt + EachSpanUpdCnt;
            const nextTime = nextUpdCnt * ExplInterval + curExpl.stepEnterTime;

            if (nextTime < nowTime) {
                this.recoverExplInExpl(curExpl.chngUpdCnt, nextUpdCnt, petSt, catchSt, rztSt, nextTime);
                curExpl.chngUpdCnt = nextUpdCnt;
            } else {
                const curUpdCnt = Math.floor((nowTime - curExpl.stepEnterTime) / ExplInterval);
                this.recoverExplInExpl(curExpl.chngUpdCnt, curUpdCnt, petSt, catchSt, rztSt, nowTime);
                curExpl.chngUpdCnt = curUpdCnt;
                this.updCnt = curUpdCnt;
                this.lastTime = curUpdCnt * ExplInterval + curExpl.stepEnterTime;
                break;
            }

            spanCnt++;
            if (spanCnt >= HangMaxSpan) {
                this.updCnt = nextUpdCnt;
                this.lastTime = nowTime;
                curExpl.stepEnterTime = nowTime - nextUpdCnt * ExplInterval;
                break;
            }
        }

        // 加速
        const agiRate = ExplUpdater.getPosPetAgiRate(this.gameData.curExpl, this.btlCtrlr);
        const speedUpCnt = ExplUpdater.calcSpeedChangeCnt(agiRate);
        const speedChangeCnt = rztSt.moveCnt * speedUpCnt;
        if (speedUpCnt !== 0) {
            this.updCnt += speedChangeCnt;
            this.updateChgUpdCnt();
            this.gameData.curExpl.stepEnterTime -= speedUpCnt * ExplInterval;
        }

        // 调查类任务
        GameDataTool.eachNeedQuest(gameData, QuestType.search, (quest: Quest, model: QuestModel) => {
            const need = model.need as SearchQuestNeed;
            const count = QuestTool.getRealCount(quest);
            if (curExpl.curPosId === need.posId && curStep === need.step && this.updCnt >= count) {
                quest.progress = count;
            }
        });

        this.resetAllUI();
        this.recoverExplStepPercent(curExpl);

        this.startExpl();
    }

    recoverExplStepPercent(curExpl: ExplMmr) {
        const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const curStep = curExpl.curStep;

        if (curStep >= curExplModel.stepMax - 1) {
            this.explStepPercent = 0;
        } else {
            const nextStepUpdCnt = NeedUpdCntByStep[curStep];
            let percent = Math.floor((this.updCnt * 100) / nextStepUpdCnt);
            if (percent > 99) percent = 99; // 百分比在UI上需要禁止超过99%
            this.explStepPercent = percent;
        }

        if (this.page) this.page.setExplStepUI();
    }

    recoverExplInBattle(
        curBattle: BattleMmr,
        stepEnterTime: number
    ): { inBattle: boolean; win: boolean; updCnt: number; lastTime: number } {
        let lastTime = curBattle.startUpdCnt * ExplInterval + stepEnterTime;
        let updCnt = curBattle.startUpdCnt;

        const win = this.mockBattle(curBattle, true, (realBattle: RealBattle): boolean => {
            if (realBattle.start === false) return true;
            if (lastTime + ExplInterval > Date.now()) return true;

            lastTime += ExplInterval;
            updCnt++;

            return false;
        });

        return {
            inBattle: win === null,
            win,
            updCnt,
            lastTime
        };
    }

    mockBattle(mmr: BattleMmr, logging: boolean, updCallback: (realBattle: RealBattle) => boolean): boolean {
        const oldPage = this.page;
        const endCall = this.btlCtrlr.endCallback;
        let win: boolean = null;
        this.page = null;
        this.btlCtrlr.page = null;
        this.btlCtrlr.endCallback = bw => (win = bw);
        this.btlCtrlr.logging = logging;

        this.btlCtrlr.resetSelfTeam(mmr);
        this.btlCtrlr.resetBattle(mmr);
        while (true) {
            if (updCallback(this.btlCtrlr.realBattle)) break;
            this.btlCtrlr.update();
        }

        this.page = oldPage;
        this.btlCtrlr.page = oldPage;
        this.btlCtrlr.endCallback = endCall;
        this.btlCtrlr.logging = true;
        return win;
    }

    recoverExplInExpl(
        fromUpdCnt: number,
        toUpdCnt: number,
        petSt: {
            selfLv: number;
            selfPwr: number;
            enemyLv: number;
            enemyPwr: number;
            agiRate: number;
            sensRate: number;
            eleRate: number;
        },
        catchSt: { catcherIdx: number },
        rztSt: { exp: number; money: number; eqps: any[]; pets: any[]; itemDict: {}; moveCnt: number },
        spanEndTime: number
    ) {
        // 计算回合数和胜利数量 ------------------------------------------
        let eachBigRdUpdCnt = 0; // 一个大轮次中包括了战斗和探索，恢复的时间
        eachBigRdUpdCnt += ExplUpdater.calcBtlDuraUpdCnt(petSt.selfPwr, petSt.enemyPwr);

        const gameData = this.gameData;
        const curExpl = gameData.curExpl;
        const eachHidingRdCnt = curExpl.hiding ? ExplUpdater.calcHideExplRdCnt(petSt.agiRate) : 0;
        const realExplRdCnt = AvgExplRdCnt + eachHidingRdCnt;
        eachBigRdUpdCnt += realExplRdCnt * AvgUpdCntForEachExplRd;
        eachBigRdUpdCnt += 10; // 恢复10跳，长于非挂机

        const diffUpdCnt = toUpdCnt - fromUpdCnt;
        let bigRdCnt = Math.floor(diffUpdCnt / eachBigRdUpdCnt);
        if (bigRdCnt > 10) bigRdCnt = randomAreaInt(bigRdCnt, 0.1); // 增加随机范围
        const winRate = ExplUpdater.calcWinRate(petSt.selfPwr, petSt.enemyPwr);
        let winCount = Math.ceil(bigRdCnt * randomArea(winRate, 0.1));
        winCount = Math.max(Math.min(winCount, bigRdCnt), 0);

        // 计算获取的经验 ------------------------------------------
        const exp = ExplUpdater.calcExpByLv(petSt.selfLv, petSt.enemyLv);
        let expTotal = exp * winCount;
        expTotal = randomAreaInt(expTotal, 0.05);

        const selfPets = GameDataTool.getReadyPets(gameData);
        for (const pet of selfPets) {
            const expEach = Math.ceil(expTotal * GameJITDataTool.getAmplRate(pet, AmplAttriType.exp)); // 计算饮品的加成
            PetTool.addExp(pet, expEach);
        }
        rztSt.exp += expTotal;

        const curStep = curExpl.curStep;
        const posId = curExpl.curPosId;
        const curPosModel = actPosModelDict[posId];
        const explModel: ExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;

        // 计算捕获
        do {
            const catcherIdx = catchSt.catcherIdx;
            if (catcherIdx === -1) break;
            const catcher = gameData.items[catcherIdx] as Catcher;
            const catcherModel: CatcherModel = catcherModelDict[catcher.id];

            const { base: lvBase, range: lvRange } = RealBattle.calcLvArea(curPosModel, curStep);
            let lvMin = lvBase - lvRange;
            let lvMax = lvBase + lvRange;

            lvMin = Math.max(lvMin, catcherModel.lvMin);
            lvMax = Math.min(lvMax, catcherModel.lvMax);
            if (lvMin > lvMax) break;

            const petIdLists = explModel.petIdLists;
            const petIds = petIdLists[curStep];
            const realPetIds = [];
            for (const petId of petIds) {
                const petModel = petModelDict[petId];
                if (catcherModel.bioType && catcherModel.bioType !== petModel.bioType) continue;
                if (catcherModel.eleType && catcherModel.eleType !== petModel.eleType) continue;
                if (catcherModel.battleType && catcherModel.battleType !== petModel.battleType) continue;
                realPetIds[realPetIds.length] = petId;
            }
            if (realPetIds.length === 0) break;

            const rate = ExplUpdater.calcCatchRateByEleRate(catcherModel, petSt.eleRate);
            let catchCount = Math.floor(rate * winCount);
            catchCount = Math.min(catchCount, catcher.count);
            let catchIdx = 0;
            for (; catchIdx < catchCount; catchIdx++) {
                const petId = getRandomOneInList(realPetIds);
                const lv = lvMin + randomInt(lvMax - lvMin);

                const pet = PetTool.createWithRandomFeature(petId, lv);
                const cPet = CaughtPetTool.createByPet(pet);
                const rztStr = GameDataTool.addCaughtPet(gameData, cPet);
                if (rztStr !== GameDataTool.SUC) break;
                rztSt.pets.push(petId);
            }

            if (catchIdx === catcher.count) {
                catchSt.catcherIdx = -1;
                curExpl.catcherId = null;
            }
            GameDataTool.deleteItem(gameData, catcherIdx, catchIdx);
        } while (false);

        // 战斗类任务
        let fQCnt = 0;
        const curStepPetIdLists = explModel.petIdLists[curStep];
        const curStepPetLen = curStepPetIdLists.length;
        GameDataTool.eachNeedQuest(gameData, QuestType.fight, (quest: Quest, model: QuestModel) => {
            if (fQCnt === winCount) return;
            const need = model.need as FightQuestNeed;
            const needPetIds = need.petIds;
            let petHaveCnt = 0;
            for (const petId of curStepPetIdLists) if (needPetIds.includes(petId)) petHaveCnt++;
            const meetRate = 1 - Math.pow((curStepPetLen - petHaveCnt) / curStepPetLen, 2); // llytodo 测试运算是否正确
            const meetCnt = Math.floor(winCount * meetRate);
            if (meetCnt <= 0) return;
            const count = QuestTool.getRealCount(quest);
            let diff = Math.min(count - quest.progress, meetCnt);
            if (fQCnt + diff >= winCount) diff = winCount - fQCnt;

            fQCnt += diff;
            quest.progress += diff;
        });

        // 计算获得的物品
        let gainCnt = bigRdCnt * (realExplRdCnt - 1);

        // 采集类任务
        const gQuestRate = curExpl.hiding ? GatherQuestRateWhenHiding : GatherQuestRate;
        const gQuestCntMax = Math.floor(gainCnt * gQuestRate);
        let gQuestCnt = 0;
        GameDataTool.eachNeedQuest(gameData, QuestType.gather, (quest: Quest, model: QuestModel) => {
            if (gQuestCnt === gQuestCntMax) return;
            const need = model.need as GatherQuestNeed;
            if (curExpl.curPosId === need.posId && curStep === need.step) {
                let diff = QuestTool.getRealCount(quest) - quest.progress;
                if (gQuestCnt + diff >= gQuestCntMax) diff = gQuestCntMax - gQuestCnt;

                gQuestCnt += diff;
                quest.progress += diff;
            }
        });
        gainCnt -= gQuestCnt;

        // 装备
        const eqpIds = explModel.eqpIdLists[curStep];
        if (eqpIds) {
            const treasureRate = ExplUpdater.calcTreasureRate(petSt.sensRate);
            const eqpGainCnt = Math.floor(gainCnt * treasureRate);
            if (eqpGainCnt > 0) {
                for (let index = 0; index < eqpGainCnt; index++) {
                    const eqpId = getRandomOneInList(eqpIds);
                    const equip = EquipTool.createRandomById(eqpId);
                    if (!equip) break;
                    const rzt = GameDataTool.addEquip(gameData, equip);
                    if (rzt !== GameDataTool.SUC) break;
                    rztSt.eqps.push(eqpId);
                }
                gainCnt -= eqpGainCnt;
            }
        }

        const gainMoreRate = ExplUpdater.calcGainCntRate(petSt.sensRate);

        // 计算钱
        const moneyGainCnt = Math.floor(gainCnt * MoneyGainRdEnterRate);
        if (moneyGainCnt > 0) {
            const eachMoneyCnt = ExplUpdater.calcMoneyGain(curPosModel.lv, curStep, gainMoreRate);
            const moneyAdd = randomAreaInt(eachMoneyCnt * moneyGainCnt, 0.2);
            GameDataTool.handleMoney(gameData, (money: Money) => (money.sum += moneyAdd));
            rztSt.money += moneyAdd;
            gainCnt -= moneyGainCnt;
        }

        // 计算其他道具
        function saveItemRzt(itemId: string, cnt: number) {
            if (rztSt.itemDict.hasOwnProperty(itemId)) rztSt.itemDict[itemId] += cnt;
            else rztSt.itemDict[itemId] = cnt;
        }

        if (gainCnt > 0) {
            const itemMax = GameDataTool.getItemCountMax(gameData);
            const itemCnt = Math.min(Math.ceil(gainCnt * gainMoreRate), itemMax);

            const itemIds = explModel.itemIdLists[curStep];
            const eachItemRate = 2 / itemIds.length;
            let itemLeft = itemCnt;
            for (let index = 0; index < itemIds.length; index++) {
                const curRate = random(eachItemRate);
                const curCnt = Math.min(Math.floor(itemCnt * curRate), itemLeft);
                const itemId = itemIds[index];
                const rzt = GameDataTool.addCnsum(gameData, itemId, curCnt);
                if (rzt !== GameDataTool.SUC) {
                    itemLeft = 0;
                    break;
                }
                itemLeft -= curCnt;
                saveItemRzt(itemId, curCnt);
                if (itemLeft <= 0) break;
            }
            if (itemLeft > 0) {
                const itemId = itemIds[0];
                const rzt = GameDataTool.addCnsum(gameData, itemId, itemLeft);
                if (rzt === GameDataTool.SUC) saveItemRzt(itemId, itemLeft);
            }
        }

        // 计算饮品和默契
        Memory.updateGameDataReal(gameData, spanEndTime);

        // 用于调整速度而记录移动次数
        rztSt.moveCnt += bigRdCnt * realExplRdCnt;
    }

    static calcBtlDuraUpdCnt(selfPwr: number, enemyPwr: number): number {
        /**
         * const enemyHp = enemyPwr * 30 * 25;
         * const selfDmg = selfPwr * 30 * 2;
         * return (enemyHp / selfDmg) * 4; // 敌人血量 / 己方攻击伤害+技能伤害 * 平均一回合攻击次数之和
         * 计算出如下公式
         */
        return (enemyPwr / selfPwr) * 50;
    }

    calcBtlDuraUpdCntAndWinRate(gameData: GameData): { updCnt: number; winRate: number } {
        const curExpl = gameData.curExpl;
        const posId = curExpl.curPosId;
        const curPosModel = actPosModelDict[posId];
        const curExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;
        const curStep = curExpl.curStep;
        const petList = curExplModel.petIdLists[curStep];
        const { base: lvBase, range: lvRange } = RealBattle.calcLvArea(curPosModel, curStep);
        const petLen = GameDataTool.getReadyPets(this.gameData).length;

        let updCntTotal: number = 0;
        let winRateTotal: number = 0;
        let curLv = lvBase - lvRange;
        const CalcCnt = 3;
        for (let index = 0; index < CalcCnt; index++) {
            const enemys: EPetMmr[] = [];
            for (let index = 0; index < petLen; index++) {
                const ePet = PetTool.createWithRandomFeature(petList[index], curLv);
                enemys.push({
                    id: ePet.id,
                    lv: ePet.lv,
                    exFeatureIds: ePet.exFeatureIds,
                    features: ePet.inbFeatures
                });
            }
            const mockBattle: BattleMmr = {
                startUpdCnt: 0,
                seed: 0,
                selfs: null,
                enemys,
                spcBtlId: 0
            };

            const win = this.mockBattle(mockBattle, false, (realBattle: RealBattle): boolean => {
                if (realBattle.start === false) return true;
                updCntTotal++;
                return false;
            });

            const rb = this.btlCtrlr.realBattle;
            if (win) for (const bPet of rb.selfTeam.pets) winRateTotal += 0.5 + Math.min(1, bPet.hp / bPet.hpMax / 0.2) * 0.5;
            else for (const bPet of rb.enemyTeam.pets) winRateTotal += 0.5 - Math.min(bPet.hp / bPet.hpMax / 0.2) * 0.5;

            curLv += lvRange;
        }

        const updCnt = Math.floor(updCntTotal / CalcCnt);
        const winRate = winRateTotal / (CalcCnt * petLen);

        return {
            updCnt,
            winRate
        };
    }

    static calcWinRate(selfPwr: number, enemyPwr: number): number {
        if (selfPwr >= enemyPwr) return 1;
        else if (selfPwr <= enemyPwr * 0.75) return 0;
        else {
            return 4 * (selfPwr / enemyPwr) - 3; // (s - 0.75 * e) / (e - 0.75 * e)
        }
    }

    resetAllUI() {
        if (!this.page) return;

        if (this.btlCtrlr.realBattle.start) {
            this.btlCtrlr.resetAllUI();
        } else {
            this.page.setUIofSelfPet(-1);

            const team = this.btlCtrlr.realBattle.selfTeam;
            this.page.resetAttriBar(team.mp, team.mpMax, team.rage);
        }

        const curExpl = this.gameData.curExpl;
        this.page.setCatchActive(curExpl.catcherId !== null);
        this.page.setHideActive(curExpl.hiding);

        this.page.setEnterReady(this.updCnt >= NeedUpdCntByStep[curExpl.curStep]);
    }

    // -----------------------------------------------------------------

    destroy() {
        cc.director.getScheduler().unscheduleUpdate(this);
        GameDataTool.deleteExpl(this.gameData);
        this.memory.removeDataListener(this);
        this.page.ctrlr.debugTool.removeShortCut('ww');
        this.page.ctrlr.debugTool.removeShortCut('gg');
        this.page.ctrlr.debugTool.removeShortCut('ff');
        this.btlCtrlr.destroy();
    }

    lastTime: number = 0;
    updCnt: number = 0;

    update() {
        if (this.pausing) return;
        if (!this.inited) this.inited = true;

        const curTime = Date.now();
        const diff = curTime - this.lastTime;
        if (diff < ExplInterval) {
            return;
        } else if (diff < ExplInterval * 2) {
            this.updateReal();
        } else if (diff < ExplInterval * 240) {
            cc.log('PUT recover update in time');
            const oldPage = this.page;
            this.page = null;
            this.btlCtrlr.page = null;

            const turnCount = Math.floor(diff / ExplInterval);
            for (let index = 0; index < turnCount - 1; index++) this.updateReal();

            this.page = oldPage;
            this.btlCtrlr.page = oldPage;
            this.resetAllUI();

            this.updateReal();
        } else {
            cc.log('PUT recover update out of time');
            this.recoverLastExpl(this.gameData);
        }
    }

    updateReal() {
        this.lastTime += ExplInterval;
        this.updCnt += 1;
        this.onUpdate();
    }

    onUpdate() {
        if (this.state === ExplState.explore) this.updateExpl();
        else if (this.state === ExplState.battle) this.updateBattle();
        else if (this.state === ExplState.recover) this.updateRecover();

        if (this.page) this.page.handleLog();
    }

    // -----------------------------------------------------------------

    // 每个探索和探索结果前触发，除了gain
    handleSelfTeamChange() {
        this.btlCtrlr.resetSelfTeam(); // 重置过程不消耗性能，且大概率会触发onMemoryDataChanged
    }

    // 每个探索+探索结果(battle，gain)后
    updateChgUpdCnt() {
        this.gameData.curExpl.chngUpdCnt = this.updCnt;
    }

    // -----------------------------------------------------------------

    explUpdCnt: number = 0;
    explRdCnt: number = 0;

    /** 本次获取道具的数量 */
    gainCnt: number = 1;
    /** 本次获取的是否是货币 */
    moneyGaining: boolean = false;

    /** 采集任务执行中 */
    gatherQuestDoing: boolean = false;
    /** 宝藏发现中 */
    trsrFinding: boolean = false;
    /** 潜行发现敌人 */
    enemyFinding: boolean = false;
    /** 随机不重要事件 */
    unusedEvts: string[] = [
        '发现远古宝箱，但你们无法打开',
        '陷阱被触发，但你们轻松避过',
        '你们似乎发现四周有些异样',
        '随着探索深入，你们逐渐加快了步伐',
        '不知不觉中，天气在慢慢产生变化'
    ];
    unusedEvtIdx: number = -1;

    /** 事件前跳数 */
    prefindCnt: number = 0;

    // 一轮是平均7+1跳 平均2+1轮 也就是24轮 18s
    startExpl() {
        this.handleSelfTeamChange();

        const curExpl = this.gameData.curExpl;

        const enter = this.state !== ExplState.explore;
        this.state = ExplState.explore;

        this.explUpdCnt = randomAreaByIntRange(AvgUpdCntForEachExplRd, 2);

        if (enter) {
            this.explRdCnt = randomAreaByIntRange(AvgExplRdCnt, 2);
            if (curExpl.hiding) {
                const agiRate = ExplUpdater.getPosPetAgiRate(curExpl, this.btlCtrlr);
                this.explRdCnt += ExplUpdater.calcHideExplRdCnt(agiRate);
            }
            this.log(ExplLogType.repeat, '开始探索');
        } else {
            this.explRdCnt--;
        }

        this.gatherQuestDoing = false;
        this.trsrFinding = false;
        this.enemyFinding = false;

        if (this.explRdCnt > 1) {
            const posId = curExpl.curPosId;
            const curPosModel = actPosModelDict[posId];
            const curExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;
            const curStep = curExpl.curStep;
            const sensRate = ExplUpdater.getPosPetSensRate(curExpl, this.btlCtrlr);

            const gQData = GameDataTool.getNeedQuest(
                this.gameData,
                QuestType.gather,
                (quest: Quest, model: QuestModel): boolean => {
                    const need = model.need as GatherQuestNeed;
                    return posId === need.posId && curStep === need.step;
                }
            );

            const gQuestRate = curExpl.hiding ? GatherQuestRateWhenHiding : GatherQuestRate;
            if (gQData && randomRate(gQuestRate)) {
                this.gatherQuestDoing = true;
            } else if (curExplModel.eqpIdLists.length > 0 && randomRate(ExplUpdater.calcTreasureRate(sensRate))) {
                this.trsrFinding = true;
                this.prefindCnt = 1 + randomInt(3);
            } else {
                const gainCntRate = ExplUpdater.calcGainCntRate(sensRate);
                this.moneyGaining = randomRate(MoneyGainRdEnterRate);
                if (this.moneyGaining) {
                    this.gainCnt = ExplUpdater.calcMoneyGain(curPosModel.lv, curExpl.curStep, gainCntRate);
                } else {
                    this.gainCnt = randomRound(gainCntRate);
                }

                if (randomRate(0.5)) {
                    this.unusedEvtIdx = randomInt(this.unusedEvts.length);
                    this.prefindCnt = 1 + randomInt(3);
                } else {
                    this.unusedEvtIdx = -1;
                }
            }
        } else {
            if (curExpl.hiding) {
                this.enemyFinding = true;
                this.prefindCnt = 1 + randomInt(3);
            }
        }

        cc.log('PUT 探索次数和本次跳数: ', this.explRdCnt, this.explUpdCnt);

        this.handleSpeedUp();
    }

    handleSpeedUp() {
        const agiRate = ExplUpdater.getPosPetAgiRate(this.gameData.curExpl, this.btlCtrlr);
        const speedUpCnt = ExplUpdater.calcSpeedChangeCnt(agiRate);
        if (speedUpCnt !== 0) {
            this.updCnt += speedUpCnt;
            this.updateChgUpdCnt();
            this.gameData.curExpl.stepEnterTime -= speedUpCnt * ExplInterval;
        }
    }

    static calcHideExplRdCnt(rate: number): number {
        if (rate < 1) return 1;
        else return Math.ceil(rate);
    }

    static calcTreasureRate(senRate: number): number {
        let trsrRate: number;
        if (senRate >= 1) trsrRate = 0.04 + Math.min(senRate - 1, 1) * 0.04;
        else trsrRate = 0.02;
        return trsrRate;
    }

    static calcGainCntRate(senRate: number): number {
        let cntRate: number;
        if (senRate < 1) cntRate = 1;
        if (senRate < 3) return 1 + (senRate - 1) * 0.5;
        else cntRate = 2;
        return cntRate + 0.1;
    }

    static calcMoneyGain(lv: number, step: number, gainRate: number): number {
        let moneyAdd = (lv + step * 2) * (1 + step * 0.1);
        moneyAdd = randomAreaInt(moneyAdd, 0.2);
        moneyAdd = moneyAdd - 3 + randomInt(7); // +-20% +-3
        moneyAdd *= GameJITDataTool.getAmplRate(null, AmplAttriType.expl);
        moneyAdd *= 1 + gainRate * 0.1;
        moneyAdd = Math.max(Math.ceil(moneyAdd), 1);
        return moneyAdd;
    }

    static calcSpeedChangeCnt(agiRate: number): number {
        if (agiRate >= 1.5) return 3;
        else if (agiRate >= 1.3) return 2;
        else if (agiRate >= 1.1) return 1;
        else if (agiRate >= 0.9) return 0;
        else if (agiRate >= 0.7) return -1;
        else return 2;
    }

    static getPosPetAgiRate(curExpl: ExplMmr, btlCtrlr: BtlCtrlr) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        const petValue = btlCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.agility);
        return petValue / posValue;
    }

    static getPosPetSensRate(curExpl: ExplMmr, btlCtrlr: BtlCtrlr) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        const petValue = btlCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.sensitivity);
        return petValue / posValue;
    }

    static getPosPetEleRate(curExpl: ExplMmr, btlCtrlr: BtlCtrlr) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        const petValue = btlCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.elegant);
        return petValue / posValue;
    }

    static getPosSubAttriSbstValue(curExpl: ExplMmr) {
        const curPosLv = actPosModelDict[curExpl.curPosId].lv;
        return (100 + curPosLv * 15) * (1 + curExpl.curStep * 0.4);
    }

    updateExpl() {
        const result = this.getExplResult();
        if (result === ExplResult.doing) this.doExploration();
        else if (result === ExplResult.gain) this.gainRes();
        else if (result === ExplResult.battle) this.startBattle();
    }

    getExplResult(): ExplResult {
        if (this.explUpdCnt > 1) {
            this.explUpdCnt--;
            return ExplResult.doing;
        } else {
            if (this.explRdCnt > 1) return ExplResult.gain;
            else return ExplResult.battle;
        }
    }

    explStepPercent: number = -1;

    doExploration() {
        const curExpl = this.gameData.curExpl;
        const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const curStep = curExpl.curStep;

        if (curExpl.chngUpdCnt === 0) {
            this.updateChgUpdCnt();
            this.explStepPercent = 0;
            this.logEnter();
            if (this.page) this.page.setExplStepUI();
            return;
        } else if (this.stepEntering === true) {
            this.stepEntering = false;
            curExpl.curStep++;
            curExpl.stepEnterTime = this.lastTime;
            this.saveNewStep(curExpl.curStep);

            this.updCnt = 0;
            this.updateChgUpdCnt();
            this.explStepPercent = 0;

            this.logEnter();
            this.popToastForEnter();

            if (this.page) this.page.setExplStepUI();
            this.startExpl(); // 重新开始探索
            return;
        } else if (curStep < curExplModel.stepMax - 1) {
            const nextStepUpdCnt = NeedUpdCntByStep[curStep];
            let percent = Math.floor((this.updCnt * 100) / nextStepUpdCnt);
            if (percent > 99) percent = 99; // 百分比在UI上需要禁止超过99%
            if (percent !== this.explStepPercent) {
                this.explStepPercent = percent;
                if (this.page) this.page.setExplStepUI();
            }
            if (this.updCnt >= nextStepUpdCnt) {
                if (this.page) this.page.setEnterReady(true);
            }
        }

        if (this.prefindCnt > 1) {
            this.prefindCnt--;
            this.log(ExplLogType.repeat, '探索中......');
        } else if (this.prefindCnt === 1) {
            this.prefindCnt = 0;
            if (this.trsrFinding) this.log(ExplLogType.repeat, '发现远古宝箱');
            else if (this.enemyFinding) this.log(ExplLogType.repeat, '发现附近似乎有威胁存在');
            else if (this.unusedEvtIdx >= 0) this.log(ExplLogType.repeat, this.unusedEvts[this.unusedEvtIdx]);
            else this.log(ExplLogType.repeat, '探索中......');
        } else {
            if (this.trsrFinding) this.log(ExplLogType.repeat, '宝箱解锁中......');
            else if (this.enemyFinding) this.log(ExplLogType.repeat, '潜行接近中......');
            else {
                const sQData = GameDataTool.getNeedQuest(
                    this.gameData,
                    QuestType.search,
                    (quest: Quest, model: QuestModel): boolean => {
                        const need = model.need as SearchQuestNeed;
                        return (
                            curExpl.curPosId === need.posId &&
                            curStep === need.step &&
                            this.updCnt >= QuestTool.getRealCount(quest)
                        );
                    }
                );

                if (sQData && randomRate(0.1)) {
                    const { quest, model } = sQData;
                    const need = model.need as GatherQuestNeed;
                    quest.progress = QuestTool.getRealCount(quest);
                    this.log(ExplLogType.rich, `找到${need.name} 任务 ${model.cnName} 完成`);
                } else {
                    this.log(ExplLogType.repeat, '探索中......');
                }
            }
        }
    }

    logEnter() {
        const curExpl = this.gameData.curExpl;
        const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const stepType = StepTypesByMax[curExplModel.stepMax][curExpl.curStep];
        this.log(ExplLogType.rich, `进入 ${actPosModelDict[curExpl.curPosId].cnName} ${ExplStepNames[stepType]}`);
    }

    popToastForEnter() {
        const curExpl = this.gameData.curExpl;
        const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const stepType = StepTypesByMax[curExplModel.stepMax][curExpl.curStep];
        this.page.ctrlr.popToast(`进入 ${actPosModelDict[curExpl.curPosId].cnName} ${ExplStepNames[stepType]}`);
    }

    saveNewStep(step: number) {
        const posData: PosData = this.gameData.posDataDict[this.gameData.curExpl.curPosId];
        const pADExpl: PADExpl = posData.actDict[PAKey.expl] as PADExpl;
        if (step > pADExpl.doneStep) pADExpl.doneStep = step;
    }

    stepEntering: boolean = false;

    enterNextStep() {
        this.stepEntering = true;
        if (this.page && this.state !== ExplState.explore) {
            const curExpl = this.gameData.curExpl;
            const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
            const stepType = StepTypesByMax[curExplModel.stepMax][curExpl.curStep + 1] || 0;
            this.page.ctrlr.popToast(`准备进入 ${actPosModelDict[curExpl.curPosId].cnName} ${ExplStepNames[stepType]}`);
        }
    }

    gainRes() {
        const curExpl = this.gameData.curExpl;
        const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const curStep = curExpl.curStep;

        if (this.gatherQuestDoing) {
            const gQData = GameDataTool.getNeedQuest(
                this.gameData,
                QuestType.gather,
                (quest: Quest, model: QuestModel): boolean => {
                    const need = model.need as GatherQuestNeed;
                    return curExpl.curPosId === need.posId && curStep === need.step;
                }
            );
            if (gQData) {
                const { quest, model } = gQData;
                quest.progress++;
                const need = model.need as GatherQuestNeed;
                const count = QuestTool.getRealCount(quest);
                this.log(ExplLogType.rich, `采集到${need.name} 任务 ${model.cnName} ${quest.progress}/${count}`);
                if (quest.progress >= count) this.log(ExplLogType.rich, `任务 ${model.cnName} 完成`);
            }
        } else if (this.trsrFinding) {
            const eqpIdLists = curExplModel.eqpIdLists; // start时验证过eqpIdLists必然存在且有值
            const eqps = eqpIdLists[curStep];
            const eqpId = getRandomOneInList(eqps);
            const equip = EquipTool.createRandomById(eqpId);
            if (!equip) {
                cc.error('PUT 竟然没有获取到装备');
                return;
            }
            const rzt = GameDataTool.addEquip(this.gameData, equip);
            if (rzt !== GameDataTool.SUC) {
                cc.error(rzt);
                return;
            }

            const itemName = EquipTool.getCnName(equip);
            this.log(ExplLogType.repeat, '宝箱成功被打开');
            this.log(ExplLogType.rich, '获得' + itemName);
        } else {
            let itemName: string = null;
            let failRzt: string = null;
            if (this.moneyGaining) {
                GameDataTool.handleMoney(this.gameData, (money: Money) => (money.sum += this.gainCnt));
                itemName = '可用物资，折合通用币' + MoneyTool.getStr(this.gainCnt).trim();
            } else {
                const itemIdLists = curExplModel.itemIdLists;
                const itemIds = itemIdLists[curStep];
                const itemId = getRandomOneInList(itemIds);

                const rzt = GameDataTool.addCnsum(this.gameData, itemId, this.gainCnt);
                if (rzt === GameDataTool.SUC) {
                    const cnsumModel = CnsumTool.getModelById(itemId);
                    itemName = cnsumModel.cnName + (this.gainCnt > 1 ? 'x' + String(this.gainCnt) : '');
                } else failRzt = rzt;
            }

            if (failRzt) cc.error(failRzt);
            else this.log(ExplLogType.rich, '获得' + itemName);
        }

        this.updateChgUpdCnt();

        // 继续探索
        this.startExpl();
    }

    startBattle(spcBtlId: number = 0) {
        this.handleSelfTeamChange();

        this.state = ExplState.battle;
        this.btlCtrlr.startBattle(this.updCnt, spcBtlId);
    }

    // -----------------------------------------------------------------

    updateBattle() {
        this.btlCtrlr.update();
    }

    onBattleEnd(win: boolean) {
        this.updateChgUpdCnt();
        if (win) {
            this.receiveExp();
            this.catchPet();
            this.doFightQuest();
        }
        this.startRecover();
    }

    receiveExp() {
        const rb = this.btlCtrlr.realBattle;

        let exp: number;
        const selfLv = Math.round(rb.selfTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.lv));
        const enemyLv = Math.round(rb.enemyTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.lv));
        exp = ExplUpdater.calcExpByLv(selfLv, enemyLv);

        for (const selfBPet of rb.selfTeam.pets) {
            const selfPet = selfBPet.pet;

            const curExp = Math.ceil(exp * GameJITDataTool.getAmplRate(selfBPet.pet, AmplAttriType.exp));
            const curExpPercent = PetTool.addExp(selfPet, curExp);

            const petName = PetTool.getCnName(selfPet);
            if (curExpPercent <= 0) {
                // 跳过
            } else if (curExpPercent >= 1) {
                this.log(ExplLogType.rich, `${petName}升到了${selfPet.lv}级`);
            } else {
                const expRate = (curExpPercent * 100).toFixed(1);
                this.log(ExplLogType.rich, `${petName}获得${curExp}点经验，升级进度完成了${expRate}%`);
            }
        }
    }

    static calcExpByLv(selfLv: number, enemyLv: number): number {
        let exp: number;
        if (selfLv <= enemyLv) {
            exp = 8 + 5 * selfLv;
        } else {
            exp = 8 + 5 * enemyLv;
            exp *= 1 - Math.min(selfLv - enemyLv, 8) / 8;
        }

        return exp;
    }

    catchPet() {
        const gameData = this.gameData;
        const catcherId = gameData.curExpl.catcherId;
        if (!catcherId) return;

        const catcherIdx = ExplUpdater.getCatcherIdxInItemList(gameData, catcherId);
        if (catcherIdx === -1) {
            gameData.curExpl.catcherId = null;
            if (this.page) this.page.setCatchActive(false);
            return;
        }

        const rb = this.btlCtrlr.realBattle;

        const catcherModel: CatcherModel = catcherModelDict[catcherId];
        const eleRate = ExplUpdater.getPosPetEleRate(gameData.curExpl, this.btlCtrlr);
        const catchRate = ExplUpdater.calcCatchRateByEleRate(catcherModel, eleRate);

        for (const battlePet of rb.enemyTeam.pets) {
            // 计算能否捕捉
            const pet = battlePet.pet;
            const petModel = petModelDict[pet.id];
            if (pet.lv < catcherModel.lvMin || catcherModel.lvMax < pet.lv) continue;
            if (catcherModel.bioType && catcherModel.bioType !== petModel.bioType) continue;
            if (catcherModel.eleType && catcherModel.eleType !== petModel.eleType) continue;
            if (catcherModel.battleType && catcherModel.battleType !== petModel.battleType) continue;

            // 计算成功几率
            const suc = randomRate(catchRate);

            if (suc) {
                const cPet = CaughtPetTool.createByPet(pet);
                const rztStr = GameDataTool.addCaughtPet(gameData, cPet);
                if (rztStr === GameDataTool.SUC) {
                    this.log(ExplLogType.rich, `成功捕获${PetTool.getCnName(pet)}`);
                    const catcher = this.memory.gameData.items[catcherIdx] as Catcher;
                    if (catcher.count === 1) {
                        gameData.curExpl.catcherId = null;
                        if (this.page) this.page.setCatchActive(false);
                    }
                    GameDataTool.deleteItem(gameData, catcherIdx);
                } else {
                    this.log(ExplLogType.rich, `捕获失败：${rztStr}`);
                }
                break; // 每场战斗只能捕捉一只精灵
            }
        }
    }

    static getCatcherIdxInItemList(gameData: GameData, catcherId: string): number {
        const items = gameData.items;
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (item.id !== catcherId) continue;
            const catcherInList = item as Catcher;
            return catcherInList.count > 0 ? index : -1;
        }
        return -1;
    }

    static calcCatchRateByEleRate(catcherModel: CatcherModel, eleRate: number): number {
        let catchRate = catcherModel.rate * 0.01;
        const realEleRate = Math.min(Math.max(eleRate, 1), 2) - 1;
        catchRate *= 0.5 + realEleRate * 0.5;
        return catchRate;
    }

    doFightQuest() {
        const fQData = GameDataTool.getNeedQuest(this.gameData, QuestType.fight, (quest: Quest, model: QuestModel): boolean => {
            const need = model.need as FightQuestNeed;
            for (const ePet of this.btlCtrlr.realBattle.enemyTeam.pets) {
                if (need.petIds.includes(ePet.pet.id)) return true;
            }
            return false;
        });
        if (fQData) {
            const { quest, model } = fQData;
            const need = model.need as FightQuestNeed;
            quest.progress++;
            const count = QuestTool.getRealCount(quest);
            this.log(ExplLogType.rich, `获得${need.name} 任务 ${model.cnName} ${quest.progress}/${count}`);
            if (quest.progress >= count) this.log(ExplLogType.rich, `任务 ${model.cnName} 完成`);
        }
    }

    // -----------------------------------------------------------------

    startRecover() {
        this.state = ExplState.recover;
    }

    updateRecover() {
        let done = true;
        const selfTeam = this.btlCtrlr.realBattle.selfTeam;
        const battlePets = selfTeam.pets;
        for (let index = 0; index < battlePets.length; index++) {
            const battlePet = battlePets[index];
            const hpMax = battlePet.hpMax;
            if (battlePet.hp < hpMax) {
                done = false;
                battlePet.hp += Math.floor(hpMax * 0.1);
                battlePet.hp = Math.min(hpMax, battlePet.hp);
                if (this.page) this.page.setUIofSelfPet(index);
            }
        }

        if (selfTeam.mp < selfTeam.mpMax || selfTeam.rage > 0) {
            if (selfTeam.mp < selfTeam.mpMax) {
                done = false;
                selfTeam.mp += Math.floor(selfTeam.mpMax * 0.2);
                selfTeam.mp = Math.min(selfTeam.mpMax, selfTeam.mp);
            }
            if (selfTeam.rage > 0) {
                done = false;
                selfTeam.rage -= 30;
                selfTeam.rage = Math.max(0, selfTeam.rage);
            }
            if (this.page) this.page.resetAttriBar(selfTeam.mp, selfTeam.mpMax, selfTeam.rage);
        }

        if (done) {
            this.startExpl();
        } else {
            this.log(ExplLogType.repeat, '休息中');
        }
    }

    // -----------------------------------------------------------------

    executeCatch(catcherId: string) {
        this.gameData.curExpl.catcherId = catcherId;
        if (this.page) this.page.setCatchActive(catcherId !== null);
    }

    executeHide() {
        const cur = !this.gameData.curExpl.hiding;
        this.gameData.curExpl.hiding = cur;
        if (this.page) this.page.setHideActive(cur);
    }

    executeEnter() {}

    // -----------------------------------------------------------------

    logList: ExplLogData[] = [];

    log(type: ExplLogType, data: any) {
        cc.log('PUT EXPL: ', type, data);
        this.logList[this.logList.length] = { type, data };
    }

    clearLogList() {
        this.logList.length = 0;
    }
}
