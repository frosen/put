/*
 * ExplUpdater.ts
 * 探索更新器
 * luleyan
 */

import { BtlPageBase } from './BtlPageBase';
import { Memory, GameDataTool, PetTool, EquipTool, CnsumTool, MoneyTool, QuestTool, CaughtPetTool } from '../scripts/Memory';
import { BtlCtrlr } from './BtlCtrlr';
import {
    GameData,
    ExplMmr,
    Catcher,
    Pet,
    BtlMmr,
    Money,
    PosData,
    PADExpl,
    Quest,
    NeedUpdCntByStep,
    EPetMmr,
    RdcUpdCntForFailByStep,
    BioType,
    EleType
} from '../scripts/DataSaved';
import { RealBtl, BtlPet } from './DataOther';
import { ActPosModelDict, PAKey } from '../configs/ActPosModelDict';
import { randomInt, randomRate, getRandomOneInList, randomAreaInt, random, randomRound, randomAreaByIntRange } from './Random';
import {
    ExplModel,
    StepTypesByMax,
    ExplStepNames,
    CatcherModel,
    QuestType,
    QuestModel,
    FightQuestNeed,
    GatherQuestNeed,
    SearchQuestNeed,
    AmplAttriType
} from './DataModel';
import { CatcherModelDict } from '../configs/CatcherModelDict';
import { PetModelDict } from '../configs/PetModelDict';
import { PTN } from '../configs/ProTtlModelDict';

export enum ExplState {
    none,
    explore,
    prepare,
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
    buffHurt,
    stop,
    dead,
    round
}

export class ExplLogData {
    type!: ExplLogType;
    data: any;
}

export class ExplUpdater {
    page?: BtlPageBase;
    memory!: Memory;
    gameData!: GameData;
    btlCtrlr!: BtlCtrlr;

    _id: string = 'expl'; // 用于cc.Scheduler.update

    state: ExplState = ExplState.none;

    inited: boolean = false;
    pausing: boolean = false;

    init(page: BtlPageBase, spcBtlId: string, startStep: number) {
        this.page = page;
        this.memory = this.page.ctrlr.memory;
        this.gameData = this.memory.gameData;

        cc.director.getScheduler().scheduleUpdate(this, 0, false);

        this.page.ctrlr.debugTool.setShortCut('ww', this.pauseOrResume.bind(this));
        this.page.ctrlr.debugTool.setShortCut('gg', this.goNext.bind(this));
        this.page.ctrlr.debugTool.setShortCut('ff', this.fastUpdate.bind(this));

        this.btlCtrlr = new BtlCtrlr();
        this.btlCtrlr.init(this, this.onBtlEnd.bind(this));

        const expl = this.gameData.expl;
        if (!expl) this.createExpl(startStep, spcBtlId);
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

    static updaterInBG?: ExplUpdater;

    static save(updater: ExplUpdater) {
        ExplUpdater.updaterInBG = updater;
    }

    static popUpdaterInBG(): ExplUpdater | undefined {
        const curUpdater = ExplUpdater.updaterInBG;
        ExplUpdater.updaterInBG = undefined;
        return curUpdater;
    }

    static haveUpdaterInBG(): boolean {
        return ExplUpdater.updaterInBG !== undefined;
    }

    // -----------------------------------------------------------------

    createExpl(startStep: number, spcBtlId?: string) {
        GameDataTool.createExpl(this.gameData, startStep);
        if (!spcBtlId) {
            this.logEnter();
            this.startExpl();
        } else {
            this.prepareToBtl(spcBtlId); // 专属作战有个准备时间，然后直接进入战斗，不进入探索
        }
        this.lastTime = Date.now();

        if (this.page) this.page.handleLog();
    }

    recoverLastExpl(gameData: GameData) {
        const expl = gameData.expl!;
        const curStep = expl.curStep;

        if (expl.btl) {
            const { inBtl, win, updCnt, lastTime } = this.recoverExplInBtl(expl.btl, expl.stepEnterTime);
            if (inBtl) {
                this.updCnt = updCnt;
                this.lastTime = lastTime;

                this.recoverExplStepPercent(expl);

                this.state = ExplState.battle;
                this.resetAllUI();
                return;
            } else {
                expl.chngUpdCnt = updCnt;
                if (win) {
                    this.receiveExp();
                    this.catchPet();
                } else {
                    this.rdcExplDegreeByBtlFail(curStep);
                }
            }
        }

        let nowTime = Date.now();
        const chngSpan = expl.chngUpdCnt * ExplInterval;
        const lastTime = expl.stepEnterTime + chngSpan;

        // MockSpan用于模拟日志，这部分时间靠update恢复，这样就可以保有日志了
        const MockSpan = (15 + randomInt(35)) * ExplInterval; // 使用一个随机数，让进入位置能分配到各个阶段，感觉更自然
        if (nowTime - lastTime <= MockSpan) {
            this.updCnt = expl.chngUpdCnt;
            this.lastTime = lastTime;

            this.resetSelfTeamData();
            this.resetAllUI();
            this.recoverExplStepPercent(expl);
            this.startExpl();
            return;
        }

        this.logList.length = 0;
        nowTime -= MockSpan;

        const posId = expl.curPosId;
        const curPosModel = ActPosModelDict[posId];
        const explModel: ExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;

        // 捕捉状态
        const catchSt: { catcherIdx: number; canCatchPetIds: string[]; lvMin: number; lvMax: number } = {
            catcherIdx: -1,
            canCatchPetIds: [],
            lvMin: 0,
            lvMax: 0
        };
        if (expl.catcherId) {
            do {
                const catcherIdx = ExplUpdater.getCatcherIdxInItemList(gameData, expl.catcherId);
                if (catcherIdx === -1) {
                    expl.catcherId = undefined;
                    break;
                }
                const catcher = gameData.items[catcherIdx] as Catcher;
                const catcherModel: CatcherModel = CatcherModelDict[catcher.id];

                const { base: lvBase, range: lvRange } = RealBtl.calcLvArea(curPosModel, curStep);
                let lvMin = lvBase - lvRange;
                let lvMax = lvBase + lvRange;

                lvMin = Math.max(lvMin, catcherModel.lvMin);
                lvMax = Math.min(lvMax, catcherModel.lvMax);
                if (lvMin > lvMax) break;

                const petIdLists = explModel.petIdLists;
                const petIds = petIdLists[curStep];
                const realPetIds = [];
                for (const petId of petIds) {
                    const petModel = PetModelDict[petId];
                    if (petModel.bioType === BioType.human || petModel.bioType === BioType.unknown) continue;
                    if (catcherModel.bioType && catcherModel.bioType !== petModel.bioType) continue;
                    if (catcherModel.eleType && catcherModel.eleType !== petModel.eleType) continue;
                    if (catcherModel.btlType && catcherModel.btlType !== petModel.btlType) continue;
                    realPetIds[realPetIds.length] = petId;
                }
                if (realPetIds.length === 0) break;

                catchSt.catcherIdx = catcherIdx;
                catchSt.canCatchPetIds = realPetIds;
                catchSt.lvMin = lvMin;
                catchSt.lvMin = lvMax;
            } while (false);
        }

        // 结果状态
        const rztSt = {
            winCnt: 0,
            failCnt: 0,
            exp: 0,
            money: 0,
            eqps: [],
            pets: [],
            itemDict: {},
            moveCnt: 0,
            petDeadCnts: [0, 0, 0, 0, 0]
        };

        const selfPets = GameDataTool.getReadyPets(this.gameData);

        // 计算step
        const EachSpanUpdCnt = (1000 * 60 * 60 * 3) / ExplIntervalNormal; // 3小时的跳数
        const HangMaxSpan = 8; // 3*8=24小时
        let spanCnt = 0;

        const recalcSpanIndexs = [0, 1, 2, 3, 5]; // 不用每次都重新计算，不计算的使用上一次的
        let btlDuraUpdCnt!: number;
        let btlWinRate!: number;
        let petAliveRates!: number[];

        while (true) {
            // 战斗状态
            const selfLv = selfPets.getAvg((pet: Pet) => pet.lv);
            const enemyLv: number = RealBtl.calcLvArea(curPosModel, curStep).base;
            if (recalcSpanIndexs.includes(spanCnt)) {
                const calcRzt = this.calcBtlDuraUpdCntAndWinRate(gameData);
                btlDuraUpdCnt = calcRzt.btlDuraUpdCnt;
                btlWinRate = calcRzt.btlWinRate;
                petAliveRates = calcRzt.petAliveRates;
            } else {
                this.resetSelfTeamData(); // getPosPetAgiRate等需要selfTeamData，而上面calcBtl带有resetSelfTeam
            }
            const agiRate = ExplUpdater.getPosPetAgiRate(expl, this.btlCtrlr);
            const sensRate = ExplUpdater.getPosPetSensRate(expl, this.btlCtrlr);
            const eleRate = ExplUpdater.getPosPetEleRate(expl, this.btlCtrlr);
            const petSt = { selfLv, enemyLv, btlDuraUpdCnt, btlWinRate, petAliveRates, agiRate, sensRate, eleRate };

            const nextUpdCnt = expl.chngUpdCnt + EachSpanUpdCnt;
            const nextTime = nextUpdCnt * ExplInterval + expl.stepEnterTime;

            if (nextTime < nowTime) {
                this.recoverExplInExpl(expl.chngUpdCnt, nextUpdCnt, petSt, catchSt, rztSt);
                expl.chngUpdCnt = nextUpdCnt;
            } else {
                const curUpdCnt = Math.floor((nowTime - expl.stepEnterTime) / ExplInterval);
                this.recoverExplInExpl(expl.chngUpdCnt, curUpdCnt, petSt, catchSt, rztSt);
                expl.chngUpdCnt = curUpdCnt;
                this.updCnt = curUpdCnt;
                this.lastTime = curUpdCnt * ExplInterval + expl.stepEnterTime;
                break;
            }

            Memory.updateGameDataReal(gameData, nextTime); // 计算饮品和默契

            spanCnt++;
            if (spanCnt >= HangMaxSpan) {
                this.updCnt = nextUpdCnt;
                this.lastTime = nowTime;
                expl.stepEnterTime = nowTime - nextUpdCnt * ExplInterval;
                break;
            }
        }

        // 加速
        const agiRate = ExplUpdater.getPosPetAgiRate(this.gameData.expl!, this.btlCtrlr);
        const speedUpCnt = ExplUpdater.calcSpeedChangeCnt(agiRate);
        const speedChangeCnt = rztSt.moveCnt * speedUpCnt;
        this.changeExplDegree(speedChangeCnt);

        // 减速
        this.rdcExplDegreeByBtlFail(curStep, rztSt.failCnt);

        // 战斗类任务
        let fQCnt = 0;
        const curStepPetIdLists = explModel.petIdLists[curStep];
        const curStepPetLen = curStepPetIdLists.length;
        GameDataTool.eachNeedQuest(gameData, QuestType.fight, (quest: Quest, model: QuestModel) => {
            if (fQCnt === rztSt.winCnt) return;
            const need = model.need as FightQuestNeed;
            const needPetIds = need.petIds;
            let petHaveCnt = 0;
            for (const petId of curStepPetIdLists) if (needPetIds.includes(petId)) petHaveCnt++;
            if (petHaveCnt === 0) return;
            const meetRate = petHaveCnt / curStepPetLen;
            const meetCnt = Math.floor(rztSt.winCnt * meetRate);
            if (meetCnt === 0) return;
            const count = QuestTool.getRealCount(quest);
            let diff = Math.min(count - quest.progress, meetCnt);
            if (fQCnt + diff >= rztSt.winCnt) diff = rztSt.winCnt - fQCnt;
            fQCnt += diff;
            quest.progress += diff;
        });

        // 调查类任务
        GameDataTool.eachNeedQuest(gameData, QuestType.search, (quest: Quest, model: QuestModel) => {
            const need = model.need as SearchQuestNeed;
            const count = QuestTool.getRealCount(quest);
            if (expl.curPosId === need.posId && curStep === need.step && this.updCnt >= count) {
                quest.progress = count;
            }
        });

        this.resetSelfTeamData();
        this.resetAllUI();
        this.recoverExplStepPercent(expl);

        this.startExpl();
    }

    recoverExplStepPercent(expl: ExplMmr) {
        const explModel = ActPosModelDict[expl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const curStep = expl.curStep;

        if (curStep >= explModel.stepMax - 1) {
            this.explStepPercent = 0;
        } else {
            const nextStepUpdCnt = NeedUpdCntByStep[curStep];
            let percent = Math.floor((this.updCnt * 100) / nextStepUpdCnt);
            if (percent > 99) percent = 99; // 百分比在UI上需要禁止超过99%
            this.explStepPercent = percent;
        }

        if (this.page) this.page.setExplStepUI();
    }

    recoverExplInBtl(btlMmr: BtlMmr, stepEnterTime: number): { inBtl: boolean; win: boolean; updCnt: number; lastTime: number } {
        let lastTime = btlMmr.startUpdCnt * ExplInterval + stepEnterTime;
        let updCnt = btlMmr.startUpdCnt;

        const win = this.mockBtl(btlMmr, true, (realBtl: RealBtl): boolean => {
            if (realBtl.start === false) return true;
            if (lastTime + ExplInterval > Date.now()) return true;

            lastTime += ExplInterval;
            updCnt++;

            return false;
        });

        return {
            inBtl: win === null,
            win,
            updCnt,
            lastTime
        };
    }

    mockBtl(mmr: BtlMmr, logging: boolean, updCallback: (realBtl: RealBtl) => boolean): boolean {
        const oldPage = this.page;
        const endCall = this.btlCtrlr.endCallback;
        let win: boolean = false;
        this.page = undefined;
        this.btlCtrlr.page = undefined;
        this.btlCtrlr.endCallback = bw => (win = bw);
        this.btlCtrlr.logging = logging;

        this.btlCtrlr.resetSelfTeam(mmr.selfs.length > 0 ? mmr : undefined);
        this.btlCtrlr.resetBtl(mmr);
        while (true) {
            if (updCallback(this.btlCtrlr.realBtl)) break;
            this.btlCtrlr.update();
        }

        this.page = oldPage;
        this.btlCtrlr.page = oldPage;
        this.btlCtrlr.endCallback = endCall;
        this.btlCtrlr.logging = true;
        return win;
    }

    resetSelfTeamData() {
        const oldPage = this.btlCtrlr.page;
        this.btlCtrlr.page = undefined;
        this.btlCtrlr.resetSelfTeam();
        this.btlCtrlr.page = oldPage;
    }

    recoverExplInExpl(
        fromUpdCnt: number,
        toUpdCnt: number,
        petSt: {
            selfLv: number;
            enemyLv: number;
            btlDuraUpdCnt: number;
            btlWinRate: number;
            petAliveRates: number[];
            agiRate: number;
            sensRate: number;
            eleRate: number;
        },
        catchSt: { catcherIdx: number; canCatchPetIds: string[]; lvMin: number; lvMax: number },
        rztSt: {
            winCnt: number;
            failCnt: number;
            exp: number;
            money: number;
            eqps: any[];
            pets: any[];
            itemDict: { [key: string]: number };
            moveCnt: number;
            petDeadCnts: number[];
        }
    ) {
        // 计算回合数和胜利数量 ------------------------------------------
        let eachBigRdUpdCnt = 0; // 一个大轮次中包括了战斗和探索，恢复的时间

        eachBigRdUpdCnt += petSt.btlDuraUpdCnt;

        const gameData = this.gameData;
        const expl = gameData.expl!;
        const eachHidingRdCnt = expl.hiding ? ExplUpdater.calcHideExplRdCnt(petSt.agiRate) : 0;
        const realExplRdCnt = AvgExplRdCnt + eachHidingRdCnt;
        eachBigRdUpdCnt += realExplRdCnt * AvgUpdCntForEachExplRd;
        eachBigRdUpdCnt += 10; // 恢复10跳，长于非挂机

        const diffUpdCnt = toUpdCnt - fromUpdCnt;
        const bigRdCnt = Math.floor(diffUpdCnt / eachBigRdUpdCnt);
        const winCount = Math.ceil(bigRdCnt * petSt.btlWinRate);

        rztSt.winCnt += winCount;
        rztSt.failCnt += bigRdCnt - winCount;
        rztSt.moveCnt += bigRdCnt * realExplRdCnt; // 用于调整速度而记录移动次数

        // 计算获取的经验 ------------------------------------------
        const exp = ExplUpdater.calcExpByLv(petSt.selfLv, petSt.enemyLv);
        let expTotal = exp * winCount;
        expTotal = randomAreaInt(expTotal, 0.05);

        const selfPets = GameDataTool.getReadyPets(gameData);
        for (const selfPet of selfPets) this.addExpToPet(selfPet, expTotal);
        rztSt.exp += expTotal;

        const curStep = expl.curStep;
        const posId = expl.curPosId;
        const curPosModel = ActPosModelDict[posId];
        const explModel: ExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;

        // 计算因死亡而损失的默契
        for (let index = 0; index < selfPets.length; index++) {
            const petDeadCnt = Math.floor((1 - petSt.petAliveRates[index]) * bigRdCnt);
            this.rdcPetPrvtyByDead(selfPets[index]);
            rztSt.petDeadCnts[index] += petDeadCnt;
        }

        // 计算捕获
        do {
            const catcherIdx = catchSt.catcherIdx;
            if (catcherIdx === -1) break;

            const catcher = gameData.items[catcherIdx] as Catcher;
            const catcherModel: CatcherModel = CatcherModelDict[catcher.id];

            const rate = ExplUpdater.calcCatchRateByEleRate(catcherModel, petSt.eleRate);
            let catchCount = Math.floor(rate * winCount);
            catchCount = Math.min(catchCount, catcher.count);
            let catchIdx = 0;
            for (; catchIdx < catchCount; catchIdx++) {
                const petId = getRandomOneInList(catchSt.canCatchPetIds);
                const lv = catchSt.lvMin + randomInt(catchSt.lvMax - catchSt.lvMin);

                const pet = PetTool.createWithRandomFeature(petId, lv);
                const cPet = CaughtPetTool.createByPet(pet);
                const rztStr = GameDataTool.addCaughtPet(gameData, cPet);
                if (rztStr !== GameDataTool.SUC) break;
                rztSt.pets.push(petId);
            }

            if (catchIdx === catcher.count) {
                catchSt.catcherIdx = -1;
                expl.catcherId = undefined;
            }
            GameDataTool.removeItem(gameData, catcherIdx, catchIdx);
        } while (false);

        // 计算获得的物品
        let gainCnt = bigRdCnt * (realExplRdCnt - 1);

        // 采集类任务
        const gQuestRate = expl.hiding ? GatherQuestRateWhenHiding : GatherQuestRate;
        const gQuestCntMax = Math.floor(gainCnt * gQuestRate);
        let gQuestCnt = 0;
        GameDataTool.eachNeedQuest(gameData, QuestType.gather, (quest: Quest, model: QuestModel) => {
            if (gQuestCnt === gQuestCntMax) return;
            const need = model.need as GatherQuestNeed;
            if (expl.curPosId === need.posId && curStep === need.step) {
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
            let eachMoneyCnt = ExplUpdater.calcMoneyGain(curPosModel.lv, curStep, gainMoreRate);
            eachMoneyCnt *= GameDataTool.getDrinkAmpl(AmplAttriType.expl, gameData);
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
    }

    calcBtlDuraUpdCntAndWinRate(gameData: GameData): { btlDuraUpdCnt: number; btlWinRate: number; petAliveRates: number[] } {
        const expl = gameData.expl!;
        const posId = expl.curPosId;
        const curPosModel = ActPosModelDict[posId];
        const explModel = curPosModel.actMDict[PAKey.expl] as ExplModel;
        const curStep = expl.curStep;
        const petList = explModel.petIdLists[curStep];
        const { base: lvBase, range: lvRange } = RealBtl.calcLvArea(curPosModel, curStep);
        const petCnt = RealBtl.getEnemyPetCountByLv(lvBase);

        const rb = this.btlCtrlr.realBtl;
        const selfs = rb.selfTeam.pets;
        const enemys = rb.enemyTeam.pets;

        let updCntTotal: number = 0;
        let winRateTotal: number = 0;
        const petAliveRates: number[] = [0, 0, 0, 0, 0];

        const curLvs = [lvBase - lvRange, lvBase, lvBase, lvBase + lvRange];
        const winHpMax = 0.5;
        for (let index = 0; index < curLvs.length; index++) {
            const curLv = curLvs[index];
            const eMmrs: EPetMmr[] = [];
            for (let index = 0; index < petCnt; index++) {
                const ePet = PetTool.createWithRandomFeature(petList[index], curLv);
                eMmrs.push({
                    id: ePet.id,
                    lv: ePet.lv,
                    exFeatureIds: ePet.exFeatureIds,
                    features: ePet.inbFeatures
                });
            }
            const mockData: BtlMmr = {
                startUpdCnt: 0,
                seed: 0,
                selfs: [],
                enemys: eMmrs,
                spcBtlId: '',
                hiding: expl.hiding
            };

            const win = this.mockBtl(mockData, false, (realBtl: RealBtl): boolean => {
                if (realBtl.start === false) return true;
                updCntTotal++;
                return false;
            });

            if (win) {
                let hpRateTotal = 0;
                for (let index = 0; index < selfs.length; index++) {
                    const bPet = selfs[index];
                    hpRateTotal += bPet.hp / bPet.hpMax;
                    petAliveRates[index] += bPet.hp > 0 ? 1 : 0;
                }
                winRateTotal += 0.5 + (Math.min(winHpMax, hpRateTotal / selfs.length) / winHpMax) * 0.5;
            } else {
                let hpRateTotal = 0;
                for (const bPet of enemys) hpRateTotal += bPet.hp / bPet.hpMax;
                winRateTotal += 0.5 - (Math.min(winHpMax, hpRateTotal / enemys.length) / winHpMax) * 0.5;
            }
        }

        const btlDuraUpdCnt = Math.floor(updCntTotal / curLvs.length);
        const btlWinRate = winRateTotal / curLvs.length;
        for (let index = 0; index < petAliveRates.length; index++) petAliveRates[index] /= curLvs.length;

        return {
            btlDuraUpdCnt,
            btlWinRate,
            petAliveRates
        };
    }

    resetAllUI() {
        if (!this.page) return;

        if (this.btlCtrlr.realBtl.start) {
            this.btlCtrlr.resetAllUI();
        } else {
            this.page.setUIOfSelfPet(-1);

            const team = this.btlCtrlr.realBtl.selfTeam;
            this.page.resetAttriBar(team.mp, team.mpMax, team.rage);
        }

        const expl = this.gameData.expl!;
        this.page.setCatchActive(expl.catcherId !== null);
        this.page.setHideActive(expl.hiding);

        this.page.setEnterReady(this.updCnt >= NeedUpdCntByStep[expl.curStep]);
    }

    // -----------------------------------------------------------------

    destroy() {
        cc.director.getScheduler().unscheduleUpdate(this);
        GameDataTool.clearExpl(this.gameData);
        this.memory.removeDataListener(this);
        this.page!.ctrlr.debugTool.removeShortCut('ww');
        this.page!.ctrlr.debugTool.removeShortCut('gg');
        this.page!.ctrlr.debugTool.removeShortCut('ff');
        this.btlCtrlr.destroy();
    }

    lastTime: number = 0;
    updCnt: number = 0;

    update() {
        if (this.pausing) return;
        if (!this.inited) this.inited = true;

        const diff = Date.now() - this.lastTime;
        if (diff < ExplInterval) {
            return;
        } else if (diff < ExplInterval * 2) {
            this.updateReal();
        } else if (diff < ExplInterval * 240) {
            cc.log('PUT recover update in time');
            const oldPage = this.page;
            this.page = undefined;
            this.btlCtrlr.page = undefined;

            const turnCount = Math.floor(diff / ExplInterval);
            for (let index = turnCount - 1; index >= 0; index--) this.updateReal();

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
        else if (this.state === ExplState.prepare) this.updatePrepare();
        else if (this.state === ExplState.battle) this.updateBtl();
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
        this.gameData.expl!.chngUpdCnt = this.updCnt;
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

        const expl = this.gameData.expl!;

        const enter = this.state !== ExplState.explore;
        this.state = ExplState.explore;

        this.explUpdCnt = randomAreaByIntRange(AvgUpdCntForEachExplRd, 2);

        if (enter) {
            this.explRdCnt = randomAreaByIntRange(AvgExplRdCnt, 2);
            if (expl.hiding) {
                const agiRate = ExplUpdater.getPosPetAgiRate(expl, this.btlCtrlr);
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
            const posId = expl.curPosId;
            const curPosModel = ActPosModelDict[posId];
            const explModel = curPosModel.actMDict[PAKey.expl] as ExplModel;
            const curStep = expl.curStep;
            const sensRate = ExplUpdater.getPosPetSensRate(expl, this.btlCtrlr);

            const gQData = GameDataTool.getNeedQuest(
                this.gameData,
                QuestType.gather,
                (quest: Quest, model: QuestModel): boolean => {
                    const need = model.need as GatherQuestNeed;
                    return posId === need.posId && curStep === need.step;
                }
            );

            const gQuestRate = expl.hiding ? GatherQuestRateWhenHiding : GatherQuestRate;
            if (gQData && randomRate(gQuestRate)) {
                this.gatherQuestDoing = true;
            } else if (explModel.eqpIdLists.length > 0 && randomRate(ExplUpdater.calcTreasureRate(sensRate))) {
                this.trsrFinding = true;
                this.prefindCnt = 1 + randomInt(3);
            } else {
                const gainCntRate = ExplUpdater.calcGainCntRate(sensRate);
                this.moneyGaining = randomRate(MoneyGainRdEnterRate);
                if (this.moneyGaining) {
                    const gainCnt = ExplUpdater.calcMoneyGain(curPosModel.lv, expl.curStep, gainCntRate);
                    this.gainCnt = Math.floor(gainCnt * GameDataTool.getDrinkAmpl(AmplAttriType.expl, this.gameData));
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
            if (expl.hiding) {
                this.enemyFinding = true;
                this.prefindCnt = 1 + randomInt(3);
            }
        }

        cc.log('PUT 探索次数和本次跳数: ', this.explRdCnt, this.explUpdCnt);

        this.handleSpeedUp();
    }

    handleSpeedUp() {
        const agiRate = ExplUpdater.getPosPetAgiRate(this.gameData.expl!, this.btlCtrlr);
        const speedUpCnt = ExplUpdater.calcSpeedChangeCnt(agiRate);
        this.changeExplDegree(speedUpCnt);
    }

    changeExplDegree(cnt: number) {
        if (cnt === 0) return;
        let realCnt: number;
        if (cnt > 0) realCnt = cnt;
        else realCnt = Math.max(-this.updCnt, cnt);
        this.updCnt += realCnt;
        this.gameData.expl!.chngUpdCnt += realCnt; // 不用chngUpdCnt = updCnt是为了避免恢复时还没有updCnt造成问题
        this.gameData.expl!.stepEnterTime -= realCnt * ExplInterval;
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
        if (senRate < 1) return 1;
        if (senRate < 3) return 1 + (senRate - 1) * 0.5;
        else return 2;
    }

    static calcMoneyGain(lv: number, step: number, gainRate: number): number {
        let moneyAdd = (lv + step * 2) * (1 + step * 0.1);
        moneyAdd *= 0.7 + gainRate * 0.3;
        moneyAdd = randomAreaInt(moneyAdd, 0.2);
        moneyAdd = moneyAdd - 3 + randomInt(7); // +-20% +-3
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

    static getPosPetAgiRate(expl: ExplMmr, btlCtrlr: BtlCtrlr) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(expl);
        const petValue = btlCtrlr.realBtl.selfTeam.pets.getMax((item: BtlPet) => item.pet2.agility);
        return petValue / posValue;
    }

    static getPosPetSensRate(expl: ExplMmr, btlCtrlr: BtlCtrlr) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(expl);
        const petValue = btlCtrlr.realBtl.selfTeam.pets.getMax((item: BtlPet) => item.pet2.sensitivity);
        return petValue / posValue;
    }

    static getPosPetEleRate(expl: ExplMmr, btlCtrlr: BtlCtrlr) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(expl);
        const petValue = btlCtrlr.realBtl.selfTeam.pets.getMax((item: BtlPet) => item.pet2.elegant);
        return petValue / posValue;
    }

    static getPosSubAttriSbstValue(expl: ExplMmr) {
        const curPosLv = ActPosModelDict[expl.curPosId].lv;
        return (100 + curPosLv * 15) * (1 + expl.curStep * 0.4);
    }

    updateExpl() {
        const result = this.getExplResult();
        if (result === ExplResult.doing) this.doExploration();
        else if (result === ExplResult.gain) this.gainRes();
        else if (result === ExplResult.battle) this.startBtl();
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
    enterIsReady: boolean = false;
    stepEntering: boolean = false;

    doExploration() {
        const expl = this.gameData.expl!;
        const explModel = ActPosModelDict[expl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const curStep = expl.curStep;

        if (this.stepEntering === true) {
            this.stepEntering = false;
            expl.curStep++;
            expl.stepEnterTime = this.lastTime;
            this.saveNewStep(expl.curStep);

            this.updCnt = 0;
            this.updateChgUpdCnt();
            this.explStepPercent = 0;

            this.logEnter();
            this.popToastForEnter();

            if (this.page) this.page.setExplStepUI();
            this.startExpl(); // 重新开始探索
            return;
        } else if (curStep < explModel.stepMax - 1) {
            const nextStepUpdCnt = NeedUpdCntByStep[curStep];
            let percent = Math.floor((this.updCnt * 100) / nextStepUpdCnt);
            if (percent > 99) percent = 99; // 百分比在UI上需要禁止超过99%
            if (percent !== this.explStepPercent) {
                this.explStepPercent = percent;
                if (this.page) this.page.setExplStepUI();
            }
            if (this.updCnt >= nextStepUpdCnt) {
                if (this.enterIsReady === false) {
                    if (this.page) this.page.setEnterReady(true);
                }
                this.enterIsReady = true;
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
                            expl.curPosId === need.posId && curStep === need.step && this.updCnt >= QuestTool.getRealCount(quest)
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
        const expl = this.gameData.expl!;
        const explModel = ActPosModelDict[expl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const stepType = StepTypesByMax[explModel.stepMax][expl.curStep];
        this.log(ExplLogType.rich, `进入 ${ActPosModelDict[expl.curPosId].cnName} ${ExplStepNames[stepType]}`);
    }

    popToastForEnter() {
        const expl = this.gameData.expl!;
        const explModel = ActPosModelDict[expl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const stepType = StepTypesByMax[explModel.stepMax][expl.curStep];
        if (this.page) {
            const str = `进入 ${ActPosModelDict[expl.curPosId].cnName} ${ExplStepNames[stepType]}`;
            this.page.ctrlr.popToast(str);
        }
    }

    saveNewStep(step: number) {
        const posData: PosData = this.gameData.posDataDict[this.gameData.expl!.curPosId];
        const pADExpl: PADExpl = posData.actDict[PAKey.expl] as PADExpl;
        if (step > pADExpl.doneStep) pADExpl.doneStep = step;
    }

    gainRes() {
        const expl = this.gameData.expl!;
        const explModel = ActPosModelDict[expl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const curStep = expl.curStep;

        if (this.gatherQuestDoing) {
            const gQData = GameDataTool.getNeedQuest(
                this.gameData,
                QuestType.gather,
                (quest: Quest, model: QuestModel): boolean => {
                    const need = model.need as GatherQuestNeed;
                    return expl.curPosId === need.posId && curStep === need.step;
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
            const eqpIdLists = explModel.eqpIdLists; // start时验证过eqpIdLists必然存在且有值
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
            let itemName: string | undefined;
            let failRzt: string | undefined;
            if (this.moneyGaining) {
                GameDataTool.handleMoney(this.gameData, (money: Money) => (money.sum += this.gainCnt));
                itemName = '可用物资，折合通用币' + MoneyTool.getStr(this.gainCnt).trim();
            } else {
                const itemIdLists = explModel.itemIdLists;
                const itemIds = itemIdLists[curStep];
                const itemId = getRandomOneInList(itemIds);

                const rzt = GameDataTool.addCnsum(this.gameData, itemId, this.gainCnt);
                if (rzt === GameDataTool.SUC) {
                    const cnsumModel = CnsumTool.getModelById(itemId)!;
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

    // -----------------------------------------------------------------

    prepareUpdCnt: number = 0;

    prepareToBtl(spcBtlId: string) {
        this.handleSelfTeamChange();

        this.state = ExplState.prepare;
        this.btlCtrlr.startBtl(this.updCnt, spcBtlId);

        this.prepareUpdCnt = 15;
    }

    updatePrepare() {
        this.prepareUpdCnt--;
        if (this.prepareUpdCnt > 0) {
            this.log(ExplLogType.rich, `备战！剩余${this.prepareUpdCnt}回合`);
        } else {
            this.log(ExplLogType.rich, `出击！！!`);
            this.startBtlAfterPrepare();
        }
    }

    // -----------------------------------------------------------------

    startBtl(spcBtlId?: string) {
        this.handleSelfTeamChange();

        this.state = ExplState.battle;
        this.btlCtrlr.startBtl(this.updCnt, spcBtlId);
    }

    startBtlAfterPrepare() {
        this.state = ExplState.battle;
    }

    updateBtl() {
        this.btlCtrlr.update();
    }

    onBtlEnd(win: boolean) {
        this.updateChgUpdCnt();
        if (win) {
            this.receiveExp();
            this.catchPet();
            this.doFightQuest();
        } else {
            const expl = this.gameData.expl!;
            this.rdcExplDegreeByBtlFail(expl.curStep);
        }
        this.rdcBPetsPrvtyByDead();
        this.startRecover();
    }

    receiveExp() {
        const rb = this.btlCtrlr.realBtl;

        let exp: number;
        const selfLv = Math.round(rb.selfTeam.pets.getAvg((bPet: BtlPet) => bPet.pet.lv));
        const enemyLv = Math.round(rb.enemyTeam.pets.getAvg((bPet: BtlPet) => bPet.pet.lv));
        exp = ExplUpdater.calcExpByLv(selfLv, enemyLv);

        for (const selfBPet of rb.selfTeam.pets) {
            const selfPet = selfBPet.pet;
            const { realExp, curExpPercent } = this.addExpToPet(selfPet, exp);
            const petName = PetTool.getCnName(selfPet);
            if (curExpPercent <= 0) {
                // 跳过
            } else if (curExpPercent >= 1) {
                this.log(ExplLogType.rich, `${petName}升到了${selfPet.lv}级`);
            } else {
                const expRate = (curExpPercent * 100).toFixed(2);
                this.log(ExplLogType.rich, `${petName}获得${realExp}点经验，升级进度完成了${expRate}%`);
            }
        }
    }

    addExpToPet(pet: Pet, exp: number): { realExp: number; curExpPercent: number } {
        const gd = this.gameData;
        let ampl = GameDataTool.getDrinkAmpl(AmplAttriType.exp, undefined, pet);
        if (GameDataTool.hasProTtl(gd, PTN.XueBa)) ampl += 0.25;
        if (GameDataTool.hasProTtl(gd, PTN.JingLingWang)) ampl += 0.15;

        const model = PetModelDict[pet.id];
        if (model.bioType === BioType.magic) {
            if (GameDataTool.hasProTtl(gd, PTN.DaXueSheng)) ampl += 0.05 * gd.proTtlDict[PTN.DaXueSheng].data;
        } else if (model.bioType === BioType.mech) {
            if (GameDataTool.hasProTtl(gd, PTN.JiXieShi)) ampl += 0.05 * gd.proTtlDict[PTN.JiXieShi].data;
        } else if (model.bioType === BioType.nature) {
            if (GameDataTool.hasProTtl(gd, PTN.SiYangYuan)) ampl += 0.05 * gd.proTtlDict[PTN.SiYangYuan].data;
        }

        if (model.eleType === EleType.fire) {
            if (GameDataTool.hasProTtl(gd, PTN.ZongHuoZhe)) ampl += 0.05 * gd.proTtlDict[PTN.ZongHuoZhe].data;
        } else if (model.eleType === EleType.water) {
            if (GameDataTool.hasProTtl(gd, PTN.YuShuiZhe)) ampl += 0.05 * gd.proTtlDict[PTN.YuShuiZhe].data;
        } else if (model.eleType === EleType.air) {
            if (GameDataTool.hasProTtl(gd, PTN.KongWuZhe)) ampl += 0.05 * gd.proTtlDict[PTN.KongWuZhe].data;
        } else if (model.eleType === EleType.earth) {
            if (GameDataTool.hasProTtl(gd, PTN.DiFuZhe)) ampl += 0.05 * gd.proTtlDict[PTN.DiFuZhe].data;
        } else if (model.eleType === EleType.light) {
            if (GameDataTool.hasProTtl(gd, PTN.GuangShi)) ampl += 0.05 * gd.proTtlDict[PTN.GuangShi].data;
        } else if (model.eleType === EleType.dark) {
            if (GameDataTool.hasProTtl(gd, PTN.AnShi)) ampl += 0.05 * gd.proTtlDict[PTN.AnShi].data;
        }

        const realExp = Math.ceil(exp * ampl);
        const curExpPercent = PetTool.addExp(pet, realExp);
        return { realExp, curExpPercent };
    }

    static calcExpByLv(selfLv: number, enemyLv: number): number {
        let exp = 8 + 5 * enemyLv;
        if (enemyLv < selfLv) exp *= 1 - Math.min(selfLv - enemyLv, 8) / 8;
        return exp;
    }

    catchPet() {
        const gameData = this.gameData;
        const expl = gameData.expl!;
        const catcherId = expl.catcherId;
        if (!catcherId) return;

        const catcherIdx = ExplUpdater.getCatcherIdxInItemList(gameData, catcherId);
        if (catcherIdx === -1) {
            expl.catcherId = undefined;
            if (this.page) this.page.setCatchActive(false);
            return;
        }

        const catcherModel: CatcherModel = CatcherModelDict[catcherId];
        const eleRate = ExplUpdater.getPosPetEleRate(expl, this.btlCtrlr);
        const catchRate = ExplUpdater.calcCatchRateByEleRate(catcherModel, eleRate);

        const rb = this.btlCtrlr.realBtl;
        for (const btlPet of rb.enemyTeam.pets) {
            // 计算能否捕捉
            const pet = btlPet.pet;
            if (pet.master) continue;

            const petModel = PetModelDict[pet.id];
            if (petModel.bioType === BioType.human || petModel.bioType === BioType.unknown) continue;
            if (pet.lv < catcherModel.lvMin || catcherModel.lvMax < pet.lv) continue;
            if (catcherModel.bioType && catcherModel.bioType !== petModel.bioType) continue;
            if (catcherModel.eleType && catcherModel.eleType !== petModel.eleType) continue;
            if (catcherModel.btlType && catcherModel.btlType !== petModel.btlType) continue;

            // 计算成功几率
            const suc = randomRate(catchRate);

            if (suc) {
                const cPet = CaughtPetTool.createByPet(pet);
                const rztStr = GameDataTool.addCaughtPet(gameData, cPet);
                if (rztStr === GameDataTool.SUC) {
                    this.log(ExplLogType.rich, `成功捕获${PetTool.getCnName(pet)}`);
                    const catcher = this.memory.gameData.items[catcherIdx] as Catcher;
                    if (catcher.count === 1) {
                        expl.catcherId = undefined;
                        if (this.page) this.page.setCatchActive(false);
                    }
                    GameDataTool.removeItem(gameData, catcherIdx);
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
            for (const ePet of this.btlCtrlr.realBtl.enemyTeam.pets) {
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

    rdcExplDegreeByBtlFail(curStep: number, failCnt: number = 1) {
        this.changeExplDegree(RdcUpdCntForFailByStep[curStep] * failCnt);
    }

    rdcBPetsPrvtyByDead() {
        const rb = this.btlCtrlr.realBtl;
        for (const selfBPet of rb.selfTeam.pets) {
            if (selfBPet.hp <= 0) this.rdcPetPrvtyByDead(selfBPet.pet);
        }
    }

    rdcPetPrvtyByDead(pet: Pet, deadCnt: number = 1) {
        pet.prvty = Math.floor(pet.prvty - deadCnt * 100);
    }

    // -----------------------------------------------------------------

    startRecover() {
        this.state = ExplState.recover;
    }

    updateRecover() {
        let done = true;
        const selfTeam = this.btlCtrlr.realBtl.selfTeam;
        const btlPets = selfTeam.pets;
        for (let index = 0; index < btlPets.length; index++) {
            const btlPet = btlPets[index];
            const hpMax = btlPet.hpMax;
            if (btlPet.hp < hpMax) {
                done = false;
                btlPet.hp += Math.floor(hpMax * 0.1);
                btlPet.hp = Math.min(hpMax, btlPet.hp);
                if (this.page) this.page.setUIOfSelfPet(index);
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
            this.updateChgUpdCnt();
            this.startExpl();
        } else {
            this.log(ExplLogType.repeat, '休息中');
        }
    }

    // -----------------------------------------------------------------

    executeCatch(catcherId: string) {
        this.gameData.expl!.catcherId = catcherId;
        if (this.page) this.page.setCatchActive(catcherId !== null);
    }

    executeHide() {
        const cur = !this.gameData.expl!.hiding;
        this.gameData.expl!.hiding = cur;
        if (this.page) this.page.setHideActive(cur);
    }

    executeEnter() {
        if (this.enterIsReady) {
            this.enterIsReady = false;
            this.stepEntering = true;
            if (this.page) {
                this.page.setEnterReady(false);
                if (this.state !== ExplState.explore) {
                    const expl = this.gameData.expl!;
                    const explModel = ActPosModelDict[expl.curPosId].actMDict[PAKey.expl] as ExplModel;
                    const stepType = StepTypesByMax[explModel.stepMax][expl.curStep + 1] || 0;
                    const str = `准备进入 ${ActPosModelDict[expl.curPosId].cnName} ${ExplStepNames[stepType]}`;
                    this.page.ctrlr.popToast(str);
                }
            }
        } else {
            if (this.page) this.page.ctrlr.popToast('当前阶段探索度高于99%后才可进入下一阶段');
        }
    }

    // -----------------------------------------------------------------

    logList: ExplLogData[] = [];

    log(type: ExplLogType, data: any) {
        if (CC_DEBUG) cc.log('PUT EXPL: ', type, JSON.stringify(data));
        this.logList[this.logList.length] = { type, data };
    }

    clearLogList() {
        this.logList.length = 0;
    }
}
