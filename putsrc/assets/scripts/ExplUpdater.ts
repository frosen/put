/*
 * ExplUpdater.ts
 * 探索更新器
 * luleyan
 */

import { BattlePageBase } from './BattlePageBase';
import { Memory, GameDataTool, PetDataTool, EquipDataTool, CnsumDataTool, MmrTool, MoneyTool } from 'scripts/Memory';
import { BattleController } from './BattleController';
import { GameData, ExplMmr, Catcher, Pet, Feature, BattleMmr, Money, PosData, PADExpl, Cnsum, Quest } from 'scripts/DataSaved';
import { AttriRatioByRank, AmplAttriType, RealBattle, BattlePet, GameJITDataTool } from './DataOther';
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
    GatherQuestNeed
} from './DataModel';
import { equipModelDict } from 'configs/EquipModelDict';
import { catcherModelDict } from 'configs/CatcherModelDict';
import { petModelDict } from 'configs/PetModelDict';
import { deepCopy } from './Utils';

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
    page: BattlePageBase = null;
    memory: Memory = null;
    gameData: GameData = null;
    battleCtrlr: BattleController = null;

    _id: string = 'expl'; // 用于cc.Scheduler.update

    state: ExplState = ExplState.none;

    inited: boolean = false;
    pausing: boolean = false;

    init(page: BattlePageBase, spcBtlId: number, startStep: number) {
        this.page = page;
        this.memory = this.page.ctrlr.memory;
        this.gameData = this.memory.gameData;

        cc.director.getScheduler().scheduleUpdate(this, 0, false);

        this.page.ctrlr.debugTool.setShortCut('ww', this.pauseOrResume.bind(this));
        this.page.ctrlr.debugTool.setShortCut('gg', this.goNext.bind(this));
        this.page.ctrlr.debugTool.setShortCut('ff', this.fastUpdate.bind(this));

        this.battleCtrlr = new BattleController();
        this.battleCtrlr.init(this, this.onBattleEnd.bind(this));

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
    runAt(page: BattlePageBase) {
        this.page = page;
        this.battleCtrlr.page = page;
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
            const btlStartUpdCnt = curExpl.curBattle.startUpdCnt;
            const { inBattle, win, updCnt, lastTime } = this.recoverExplInBattle(curExpl.curBattle, curExpl.startTime);
            if (inBattle) {
                this.updCnt = updCnt;
                this.lastTime = lastTime;

                this.recoverExplStepPercent(curExpl);

                this.state = ExplState.battle;
                this.resetAllUI();
                return;
            } else {
                curExpl.chngUpdCnt = btlStartUpdCnt + updCnt;
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
        const lastTime = curExpl.startTime + chngSpan;

        // MockSpan用于模拟日志，这部分时间靠update恢复，这样就可以保有日志了
        const MockSpan = (15 + randomInt(35)) * ExplInterval; // 使用一个随机数，让进入位置能分配到各个阶段，感觉更自然
        if (nowTime - lastTime <= MockSpan) {
            this.updCnt = curExpl.chngUpdCnt;
            this.lastTime = lastTime;

            this.recoverExplStepPercent(curExpl);
            this.startExpl();
            return;
        }

        this.logList.length = 0;
        nowTime -= MockSpan;

        // 计算step
        const HangMaxSpan = 1000 * 60 * 60 * 24;
        const timeIn = nowTime - lastTime <= HangMaxSpan;
        const diffSpan = timeIn ? nowTime - curExpl.startTime : HangMaxSpan + chngSpan; // diffSpan是从开始到最新位置的跨度

        const curUpdCnt = Math.floor(diffSpan / ExplInterval);
        const startUpdCnt = MmrTool.getUpdCntFromExplStep(curExpl.startStep);
        const realCurUpdCnt = curUpdCnt + startUpdCnt;
        const realChngUpdCnt = curExpl.chngUpdCnt + startUpdCnt;
        let lastStepUpdCnt = realChngUpdCnt + 1;

        const posId = curExpl.curPosId;
        const curPosModel = actPosModelDict[posId];
        const curExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;
        let curStep = MmrTool.getCurStep(curExpl, curExplModel);

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
            itemDict: {}
        };

        const selfPets = GameDataTool.getReadyPets(this.gameData);

        while (true) {
            // 战斗状态
            const selfLv = selfPets.getAvg((pet: Pet) => pet.lv);
            const selfRank = selfPets.getAvg((pet: Pet) => pet.rank);
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
                for (const feature of pet.learnedFeatures) featureLvs += feature.lv;

                const realPrvty = PetDataTool.getRealPrvty(pet);
                let curPower = pet.lv * AttriRatioByRank[pet.rank] + totalEqpLv;
                curPower *= 1 + (featureLvs + realPrvty * 0.01 * 20) * 0.01;
                return curPower;
            });
            const enemyLv: number = RealBattle.calcLvArea(curPosModel, curStep).base;
            const enemyRank: number = RealBattle.calcRankAreaByExplStep(curStep).base;
            const enemyPwr = enemyLv * AttriRatioByRank[enemyRank];
            const agiRate = ExplUpdater.getPosPetAgiRate(curExpl, this.battleCtrlr);
            const sensRate = ExplUpdater.getPosPetSensRate(curExpl, this.battleCtrlr);
            const eleRate = ExplUpdater.getPosPetEleRate(curExpl, this.battleCtrlr);
            const petSt = { selfLv, selfRank, selfPwr, enemyLv, enemyRank, enemyPwr, agiRate, sensRate, eleRate };

            // 计算探索
            if (curStep >= curExplModel.stepMax - 1) {
                this.recoverExplInExpl(curStep, lastStepUpdCnt, realCurUpdCnt, petSt, catchSt, rztSt);
                break;
            }
            const nextStepUpdCnt = MmrTool.getUpdCntFromExplStep(curStep + 1);
            if (realCurUpdCnt < nextStepUpdCnt) {
                this.recoverExplInExpl(curStep, lastStepUpdCnt, realCurUpdCnt, petSt, catchSt, rztSt);
                break;
            }
            this.recoverExplInExpl(curStep, lastStepUpdCnt, nextStepUpdCnt, petSt, catchSt, rztSt);

            lastStepUpdCnt = nextStepUpdCnt + 1;
            curStep++;
        }

        curExpl.chngUpdCnt = curUpdCnt;
        this.updCnt = curUpdCnt;
        if (timeIn) {
            this.lastTime = curUpdCnt * ExplInterval + curExpl.startTime;
        } else {
            this.lastTime = nowTime;
            curExpl.startTime = nowTime - curUpdCnt * ExplInterval;
        }

        this.recoverExplStepPercent(curExpl);
        this.saveNewStep(curStep);
        this.startExpl();
    }

    recoverExplStepPercent(curExpl: ExplMmr) {
        const startUpdCnt = MmrTool.getUpdCntFromExplStep(curExpl.startStep);
        const chngUpdCnt = curExpl.chngUpdCnt + startUpdCnt;
        const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const curStep = MmrTool.getCurStep(curExpl, curExplModel);

        if (curStep >= curExplModel.stepMax - 1) {
            this.explStepPercent = 0;
        } else {
            const lastStepUpdCnt = MmrTool.getUpdCntFromExplStep(curStep);
            const nextStepUpdCnt = MmrTool.getUpdCntFromExplStep(curStep + 1);
            const curStepUpdCntRange = nextStepUpdCnt - lastStepUpdCnt;
            this.explStepPercent = Math.floor(((chngUpdCnt - lastStepUpdCnt) * 100) / curStepUpdCntRange);
            if (this.explStepPercent > 99) this.explStepPercent = 99;
        }

        if (this.page) this.page.setExplStepUI();
    }

    recoverExplInBattle(
        curBattle: BattleMmr,
        explStartTime: number
    ): { inBattle: boolean; win: boolean; updCnt: number; lastTime: number } {
        let inBattle = true;
        let timePtr = curBattle.startUpdCnt * ExplInterval + explStartTime;

        const oldPage = this.page;
        const endCall = this.battleCtrlr.endCallback;
        let win: boolean = false;
        this.page = null;
        this.battleCtrlr.page = null;
        this.battleCtrlr.endCallback = bw => (win = bw);

        this.battleCtrlr.resetSelfTeam(true);
        this.battleCtrlr.resetBattle(curBattle);

        let updCnt = 0;
        while (true) {
            if (this.battleCtrlr.realBattle.start === false) {
                inBattle = false;
                break;
            }

            timePtr += ExplInterval;
            updCnt++;
            if (timePtr > Date.now()) break;
            this.battleCtrlr.update();
        }

        this.page = oldPage;
        this.battleCtrlr.page = oldPage;
        this.battleCtrlr.endCallback = endCall;

        return {
            inBattle,
            win,
            updCnt,
            lastTime: timePtr - ExplInterval
        };
    }

    recoverExplInExpl(
        step: number,
        fromUpdCnt: number,
        toUpdCnt: number,
        petSt: {
            selfLv: number;
            selfRank: number;
            selfPwr: number;
            enemyLv: number;
            enemyRank: number;
            enemyPwr: number;
            agiRate: number;
            sensRate: number;
            eleRate: number;
        },
        catchSt: { catcherIdx: number },
        rztSt: { exp: number; money: number; eqps: any[]; pets: any[]; itemDict: {} }
    ) {
        const curExpl = this.gameData.curExpl;
        const posId = curExpl.curPosId;
        const curPosModel = actPosModelDict[posId];

        const selfPets = GameDataTool.getReadyPets(this.gameData);

        // 计算回合数和胜利数量 ------------------------------------------
        let eachBigRdUpdCnt = 0; // 一个大轮次中包括了战斗和探索，恢复的时间
        eachBigRdUpdCnt += ExplUpdater.calcBtlDuraUpdCnt(petSt.selfPwr, petSt.enemyPwr);

        const eachHidingRdCnt = curExpl.hiding ? ExplUpdater.calcHideExplRdCnt(petSt.agiRate) : 0;
        const realExplRdCnt = AvgExplRdCnt + eachHidingRdCnt;
        eachBigRdUpdCnt += realExplRdCnt * AvgUpdCntForEachExplRd;
        eachBigRdUpdCnt += 10; // 恢复10跳，长于非挂机

        const diffUpdCnt = toUpdCnt - fromUpdCnt + 1;
        let bigRdCnt = Math.floor(diffUpdCnt / eachBigRdUpdCnt);
        if (bigRdCnt > 10) bigRdCnt = randomAreaInt(bigRdCnt, 0.1); // 增加随机范围
        const winRate = ExplUpdater.calcWinRate(petSt.selfPwr, petSt.enemyPwr);
        let winCount = Math.ceil(bigRdCnt * randomArea(winRate, 0.1));
        winCount = Math.max(Math.min(winCount, bigRdCnt), 0);

        // 计算获取的经验 ------------------------------------------
        const exp = ExplUpdater.calcExpByLvRank(petSt.selfLv, petSt.enemyLv, petSt.selfRank, petSt.enemyRank);
        let expTotal = exp * winCount;
        expTotal = randomAreaInt(expTotal, 0.05);

        for (const pet of selfPets) {
            const expEach = expTotal * GameJITDataTool.getAmplPercent(pet, AmplAttriType.exp); // 计算饮品的加成
            PetDataTool.addExp(pet, Math.ceil(expEach));
        }
        rztSt.exp += expTotal;

        const explModel: ExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;

        const stepMax = explModel.stepMax;
        const stepType = StepTypesByMax[stepMax][step];

        // 计算捕获
        do {
            const catcherIdx = catchSt.catcherIdx;
            if (catcherIdx === -1) break;
            const catcher = this.gameData.items[catcherIdx] as Catcher;
            const catcherModel: CatcherModel = catcherModelDict[catcher.id];

            const { base: lvBase, range: lvRange } = RealBattle.calcLvArea(curPosModel, step);
            const { base: rankBase, range: rankRange } = RealBattle.calcRankAreaByExplStep(step);
            let lvMin = lvBase - lvRange;
            let lvMax = lvBase + lvRange;
            let rankMin = rankBase - rankRange;
            let rankMax = rankBase + rankRange;

            lvMin = Math.max(lvMin, catcherModel.lvMin);
            lvMax = Math.min(lvMax, catcherModel.lvMax);
            if (lvMin > lvMax) break;

            rankMin = Math.max(rankMin, catcherModel.rankMin);
            rankMax = Math.min(rankMax, catcherModel.rankMax);
            if (rankMin > rankMax) break;

            const petIdLists = explModel.petIdLists;
            if (!petIdLists || petIdLists.length === 0) cc.error(`${curPosModel.cnName}没有精灵列表petIdLists，无法战斗`);
            const petIds = petIdLists[stepType];
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
                const rank = rankMin + randomInt(rankMax - rankMin);
                const features = RealBattle.getRandomFeatures(lv);
                const rztStr = GameDataTool.addCaughtPet(this.gameData, petId, lv, rank, features);
                if (rztStr !== GameDataTool.SUC) break;
                rztSt.pets.push(petId);
            }

            if (catchIdx === catcher.count) {
                catchSt.catcherIdx = -1;
                curExpl.catcherId = null;
            }
            GameDataTool.deleteItem(this.gameData, catcherIdx, catchIdx);
        } while (false);

        // 计算获得的物品
        const gainTimes = bigRdCnt * (realExplRdCnt - 1);

        const itemIds = explModel.itemIdLists[stepType];
        const eqpIds = explModel.eqpIdLists[stepType];

        let itemTimes: number;
        if (eqpIds) {
            const treasureRate = ExplUpdater.calcTreasureRate(petSt.sensRate);
            const eqpTimes = Math.floor(gainTimes * treasureRate);
            itemTimes = gainTimes - eqpTimes;
            for (let index = 0; index < eqpTimes; index++) {
                const eqpId = getRandomOneInList(eqpIds);
                const equip = EquipDataTool.createRandomById(eqpId);
                if (!equip) break;
                const rzt = GameDataTool.addEquip(this.gameData, equip);
                if (rzt !== GameDataTool.SUC) break;
                rztSt.eqps.push(eqpId);
            }
        } else {
            itemTimes = gainTimes;
        }

        const gainMoreRate = ExplUpdater.calcGainCntRate(petSt.sensRate);

        // 计算钱
        const moneyTimes = Math.floor(itemTimes * MoneyGainRdEnterRate);
        if (moneyTimes > 0) {
            const eachMoneyCnt = ExplUpdater.calcMoneyGain(curPosModel.lv, step, gainMoreRate);
            const moneyAdd = randomAreaInt(eachMoneyCnt * moneyTimes, 0.2);
            GameDataTool.handleMoney(this.gameData, (money: Money) => (money.sum += moneyAdd));
            rztSt.money += moneyAdd;
        }

        // 计算其他道具
        itemTimes -= moneyTimes;
        itemTimes = Math.ceil(itemTimes * gainMoreRate);
        const itemMax = GameDataTool.getItemCountMax(this.gameData);
        itemTimes = Math.min(itemTimes, itemMax);

        function saveItemRzt(itemId: string, cnt: number) {
            if (rztSt.itemDict.hasOwnProperty(itemId)) rztSt.itemDict[itemId] += cnt;
            else rztSt.itemDict[itemId] = cnt;
        }

        if (itemTimes > 0) {
            const eachItemRate = 2 / itemIds.length;
            let itemLeft = itemTimes;
            for (let index = 0; index < itemIds.length; index++) {
                const curRate = random(eachItemRate);
                const curCnt = Math.min(Math.floor(itemTimes * curRate), itemLeft);
                const itemId = itemIds[index];
                const rzt = GameDataTool.addCnsum(this.gameData, itemId, curCnt);
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
                const rzt = GameDataTool.addCnsum(this.gameData, itemId, itemLeft);
                if (rzt === GameDataTool.SUC) saveItemRzt(itemId, itemLeft);
            }
        }
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

    static calcWinRate(selfPwr: number, enemyPwr: number): number {
        if (selfPwr >= enemyPwr) return 1;
        else if (selfPwr <= enemyPwr * 0.75) return 0;
        else {
            return 4 * (selfPwr / enemyPwr) - 3; // (s - 0.75 * e) / (e - 0.75 * e)
        }
    }

    resetAllUI() {
        if (!this.page) return;

        if (this.battleCtrlr.realBattle.start) {
            this.battleCtrlr.resetAllUI();
        } else {
            this.page.setUIofSelfPet(-1);

            const team = this.battleCtrlr.realBattle.selfTeam;
            this.page.resetAttriBar(team.mp, team.mpMax, team.rage);
        }

        this.page.setCatchActive(this.gameData.curExpl.catcherId !== null);
        this.page.setHideActive(this.gameData.curExpl.hiding);
    }

    // -----------------------------------------------------------------

    destroy() {
        cc.director.getScheduler().unscheduleUpdate(this);
        GameDataTool.deleteExpl(this.gameData);
        this.memory.removeDataListener(this);
        this.page.ctrlr.debugTool.removeShortCut('ww');
        this.page.ctrlr.debugTool.removeShortCut('gg');
        this.page.ctrlr.debugTool.removeShortCut('ff');
        this.battleCtrlr.destroy();
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
            this.battleCtrlr.page = null;

            const turnCount = Math.floor(diff / ExplInterval);
            for (let index = 0; index < turnCount - 1; index++) this.updateReal();

            this.page = oldPage;
            this.battleCtrlr.page = oldPage;
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
        this.battleCtrlr.resetSelfTeam(); // 重置过程不消耗性能，且大概率会触发onMemoryDataChanged
    }

    // 每个探索+探索结果(battle，gain)后
    updateChgUpdCnt() {
        this.gameData.curExpl.chngUpdCnt = this.updCnt;
    }

    // -----------------------------------------------------------------

    explTime: number = 0;
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

        this.explTime = randomAreaByIntRange(AvgUpdCntForEachExplRd, 2); // 6-10跳

        if (enter) {
            this.explRdCnt = randomAreaByIntRange(AvgExplRdCnt, 2);
            if (curExpl.hiding) {
                const agiRate = ExplUpdater.getPosPetAgiRate(curExpl, this.battleCtrlr);
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
            const curStep = MmrTool.getCurStep(curExpl, curExplModel);
            const sensRate = ExplUpdater.getPosPetSensRate(curExpl, this.battleCtrlr);

            const gQuestData = GameDataTool.getOneQuestByType(
                this.gameData,
                QuestType.gather,
                (quest: Quest, model: QuestModel): boolean => {
                    const need = model.need as GatherQuestNeed;
                    if (quest.progress >= need.count) return false;
                    if (posId !== need.posId || curStep < need.step) return false;
                    return true;
                }
            );

            if (gQuestData && randomRate(0.2)) {
                this.gatherQuestDoing = true;
            } else if (curExplModel.eqpIdLists.length > 0 && randomRate(ExplUpdater.calcTreasureRate(sensRate))) {
                this.trsrFinding = true;
                this.prefindCnt = 1 + randomInt(3);
            } else {
                const gainCntRate = ExplUpdater.calcGainCntRate(sensRate);
                this.moneyGaining = randomRate(MoneyGainRdEnterRate);
                if (this.moneyGaining) {
                    const curStep = MmrTool.getCurStep(curExpl, curExplModel);
                    this.gainCnt = ExplUpdater.calcMoneyGain(curPosModel.lv, curStep, gainCntRate);
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

        cc.log('PUT 探索次数和本次时间: ', this.explRdCnt, this.explTime);
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
        moneyAdd *= GameJITDataTool.getAmplPercent(null, AmplAttriType.expl);
        moneyAdd *= 1 + gainRate * 0.1;
        moneyAdd = Math.max(Math.ceil(moneyAdd), 1);
        return moneyAdd;
    }

    static getPosPetAgiRate(curExpl: ExplMmr, battleCtrlr: BattleController) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        const petValue = battleCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.agility);
        return petValue / posValue;
    }

    static getPosPetSensRate(curExpl: ExplMmr, battleCtrlr: BattleController) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        const petValue = battleCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.sensitivity);
        return petValue / posValue;
    }

    static getPosPetEleRate(curExpl: ExplMmr, battleCtrlr: BattleController) {
        const posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        const petValue = battleCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.elegant);
        return petValue / posValue;
    }

    static getPosSubAttriSbstValue(curExpl: ExplMmr) {
        const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
        const curStep = MmrTool.getCurStep(curExpl, curExplModel);
        const curPosLv = actPosModelDict[curExpl.curPosId].lv;
        return (100 + curPosLv * 15) * (1 + curStep * 0.4);
    }

    updateExpl() {
        const result = this.getExplResult();
        if (result === ExplResult.doing) this.doExploration();
        else if (result === ExplResult.gain) this.gainRes();
        else if (result === ExplResult.battle) this.startBattle();
    }

    getExplResult(): ExplResult {
        if (this.explTime > 1) {
            this.explTime--;
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
        let curStep = MmrTool.getCurStep(curExpl, curExplModel);
        do {
            if (curExpl.chngUpdCnt === 0) {
                this.updateChgUpdCnt();
                this.explStepPercent = 0;
            } else if (curStep >= curExplModel.stepMax - 1) {
                break;
            } else {
                const startUpdCnt = MmrTool.getUpdCntFromExplStep(curExpl.startStep);
                const lastStepUpdCnt = MmrTool.getUpdCntFromExplStep(curStep);
                const nextStepUpdCnt = MmrTool.getUpdCntFromExplStep(curStep + 1);

                const realUpdCnt = this.updCnt + startUpdCnt;
                if (realUpdCnt >= nextStepUpdCnt) {
                    this.updateChgUpdCnt();
                    curStep++;
                    this.saveNewStep(curStep);
                    this.explStepPercent = 0;
                } else {
                    const curStepUpdCntRange = nextStepUpdCnt - lastStepUpdCnt;
                    let percent = Math.floor(((realUpdCnt - lastStepUpdCnt) * 100) / curStepUpdCntRange);
                    if (percent > 99) percent = 99; // 战斗时候百分比不能停所以百分比在UI上需要禁止超过100%
                    if (percent !== this.explStepPercent) {
                        this.explStepPercent = percent;
                        if (this.page) this.page.setExplStepUI();
                    }
                    break;
                }
            }
            if (this.page) this.page.setExplStepUI();

            const posName = actPosModelDict[curExpl.curPosId].cnName;
            const stepType = StepTypesByMax[curExplModel.stepMax][curStep];
            const stepName = ExplStepNames[stepType];
            this.log(ExplLogType.rich, '进入' + posName + stepName);

            return;
        } while (0);

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
                this.log(ExplLogType.repeat, '探索中......');
                this.doSearchQuest();
            }
        }
    }

    saveNewStep(step: number) {
        const posData: PosData = this.gameData.posDataDict[this.gameData.curExpl.curPosId];
        const pADExpl: PADExpl = posData.actDict[PAKey.expl] as PADExpl;
        if (step > pADExpl.doneStep) pADExpl.doneStep = step;
    }

    doSearchQuest() {}

    gainRes() {
        const curExpl = this.gameData.curExpl;
        const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;

        const curStep = MmrTool.getCurStep(curExpl, curExplModel);
        const stepType = StepTypesByMax[curExplModel.stepMax][curStep];

        if (this.gatherQuestDoing) {
            const gQuestData = GameDataTool.getOneQuestByType(
                this.gameData,
                QuestType.gather,
                (quest: Quest, model: QuestModel): boolean => {
                    if (quest.progress >= model.need.count) return false;
                    const need = model.need as GatherQuestNeed;
                    if (curExpl.curPosId !== need.posId || curStep < need.step) return false;
                    return true;
                }
            );
            if (gQuestData) {
                const { quest, model } = gQuestData;
                const need = model.need as GatherQuestNeed;
                quest.progress++;
                this.log(ExplLogType.rich, `采集到${need.name} 任务${model.cnName} ${quest.progress}/${need.count}`);
                if (quest.progress >= need.count) this.log(ExplLogType.rich, '任务完成');
            }
        } else if (this.trsrFinding) {
            const eqpIdLists = curExplModel.eqpIdLists; // start时验证过eqpIdLists必然存在且有值
            const eqps = eqpIdLists[stepType];
            const eqpId = getRandomOneInList(eqps);
            const equip = EquipDataTool.createRandomById(eqpId);
            if (!equip) {
                cc.error('PUT 竟然没有获取到装备');
                return;
            }
            const rzt = GameDataTool.addEquip(this.gameData, equip);
            if (rzt !== GameDataTool.SUC) {
                cc.error(rzt);
                return;
            }

            const itemName = EquipDataTool.getCnName(equip);
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
                const itemIds = itemIdLists[stepType];
                const itemId = getRandomOneInList(itemIds);

                const rzt = GameDataTool.addCnsum(this.gameData, itemId, this.gainCnt);
                if (rzt === GameDataTool.SUC) {
                    const cnsumModel = CnsumDataTool.getModelById(itemId);
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
        this.battleCtrlr.startBattle(this.updCnt, spcBtlId);
    }

    // -----------------------------------------------------------------

    updateBattle() {
        this.battleCtrlr.update();
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
        const rb = this.battleCtrlr.realBattle;

        let exp: number;
        const selfLv = Math.round(rb.selfTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.lv));
        const enemyLv = Math.round(rb.enemyTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.lv));
        const selfRank = Math.round(rb.selfTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.rank));
        const enemyRank = Math.round(rb.enemyTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.rank));
        exp = ExplUpdater.calcExpByLvRank(selfLv, enemyLv, selfRank, enemyRank);

        for (const selfBPet of rb.selfTeam.pets) {
            const selfPet = selfBPet.pet;

            let curExp = exp * GameJITDataTool.getAmplPercent(selfBPet.pet, AmplAttriType.exp);
            curExp = Math.ceil(curExp);

            const curExpPercent = PetDataTool.addExp(selfPet, curExp);

            const petName = PetDataTool.getCnName(selfPet);
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

    static calcExpByLvRank(selfLv: number, enemyLv: number, selfRank: number, enemyRank: number): number {
        let exp: number;
        if (selfLv <= enemyLv) {
            exp = 8 + 5 * selfLv;
        } else {
            exp = 8 + 5 * enemyLv;
            exp *= 1 - Math.min(selfLv - enemyLv, 8) / 8;
        }
        exp *= AttriRatioByRank[enemyRank] / AttriRatioByRank[selfRank];

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

        const rb = this.battleCtrlr.realBattle;

        const catcherModel: CatcherModel = catcherModelDict[catcherId];
        const eleRate = ExplUpdater.getPosPetEleRate(gameData.curExpl, this.battleCtrlr);
        const catchRate = ExplUpdater.calcCatchRateByEleRate(catcherModel, eleRate);

        for (const battlePet of rb.enemyTeam.pets) {
            // 计算能否捕捉
            const pet = battlePet.pet;
            const petModel = petModelDict[pet.id];
            if (pet.lv < catcherModel.lvMin || catcherModel.lvMax < pet.lv) continue;
            if (pet.rank < catcherModel.rankMin || catcherModel.rankMax < pet.rank) continue;
            if (catcherModel.bioType && catcherModel.bioType !== petModel.bioType) continue;
            if (catcherModel.eleType && catcherModel.eleType !== petModel.eleType) continue;
            if (catcherModel.battleType && catcherModel.battleType !== petModel.battleType) continue;

            // 计算成功几率
            const suc = randomRate(catchRate);

            if (suc) {
                const features: Feature[] = deepCopy(pet.inbornFeatures) as Feature[];
                const rztStr = GameDataTool.addCaughtPet(gameData, pet.id, pet.lv, pet.rank, features);
                if (rztStr === GameDataTool.SUC) {
                    this.log(ExplLogType.rich, `成功捕获${PetDataTool.getCnName(pet)}`);
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
        const fQuestData = GameDataTool.getOneQuestByType(
            this.gameData,
            QuestType.fight,
            (quest: Quest, model: QuestModel): boolean => {
                const need = model.need as FightQuestNeed;
                if (quest.progress >= need.count) return false;
                for (const ePet of this.battleCtrlr.realBattle.enemyTeam.pets) {
                    if (need.petIds.includes(ePet.pet.id)) return true;
                }
                return false;
            }
        );
        if (fQuestData) {
            const { quest, model } = fQuestData;
            const need = model.need as FightQuestNeed;
            quest.progress++;
            this.log(ExplLogType.rich, `获得${need.name} 任务 ${model.cnName} ${quest.progress}/${need.count}`);
            if (quest.progress >= need.count) this.log(ExplLogType.rich, `任务 ${model.cnName} 完成`);

            return;
        }

        const fRQuestData = GameDataTool.getOneQuestByType(
            this.gameData,
            QuestType.fightRandom,
            (quest: Quest, model: QuestModel): boolean => {
                const need = model.need as FightQuestNeed;
                if (quest.progress >= need.count) return false;
                for (const ePet of this.battleCtrlr.realBattle.enemyTeam.pets) {
                    if (need.petIds.includes(ePet.pet.id)) return true;
                }
                return false;
            }
        );
        if (fRQuestData && randomRate(0.35)) {
            const { quest, model } = fRQuestData;
            const need = model.need as FightQuestNeed;
            quest.progress++;
            this.log(ExplLogType.rich, `获得${need.name} 任务 ${model.cnName} ${quest.progress}/${need.count}`);
            if (quest.progress >= model.need.count) this.log(ExplLogType.rich, `任务 ${model.cnName} 完成`);
        }
    }

    // -----------------------------------------------------------------

    startRecover() {
        this.state = ExplState.recover;
    }

    updateRecover() {
        let done = true;
        const selfTeam = this.battleCtrlr.realBattle.selfTeam;
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

    executeEscape() {
        this.battleCtrlr.escape();
    }

    executeHide() {
        const cur = !this.gameData.curExpl.hiding;
        this.gameData.curExpl.hiding = cur;
        if (this.page) this.page.setHideActive(cur);
    }

    // -----------------------------------------------------------------

    logList: ExplLogData[] = [];
    newLogCount: number = 0;

    log(type: ExplLogType, data: any) {
        cc.log('PUT EXPL: ', type, data);
        this.logList[this.logList.length] = { type, data };
        if (this.logList.length > 200) this.logList = this.logList.slice(100);
        this.newLogCount++;
    }

    clearNewLogCount() {
        this.newLogCount = 0;
    }
}
