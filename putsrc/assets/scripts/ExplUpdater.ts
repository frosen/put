/*
 * ExplUpdater.ts
 * 探索更新器
 * luleyan
 */

import { BattlePageBase } from './BattlePageBase';
import { Memory, GameDataTool, PetDataTool, EquipDataTool, CnsumDataTool } from 'scripts/Memory';
import { BattleController } from './BattleController';
import { GameData, Cnsum, ExplMmr, Catcher, Pet, Feature } from 'scripts/DataSaved';
import { AttriRatioByRank, AmplAttriType, RealBattle, BattlePet } from './DataOther';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { random, randomArea, randomRate, getRandomOneInListWithRate, getRandomOneInList } from './Random';
import { ExplModel, StepTypesByMax, UpdCntByStep, ExplStepNames, CatcherModel } from './DataModel';
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

        this.battleCtrlr = new BattleController();
        this.battleCtrlr.init(this.page, this.memory, this.onBattleEnd.bind(this));

        let curExpl = this.gameData.curExpl;
        if (!curExpl) this.createExpl(spcBtlId, startStep);
        else this.recoverLastExpl(this.gameData);

        cc.director.getScheduler().scheduleUpdate(this, 0, false);
        this.lastTime = Date.now();

        this.page.ctrlr.debugTool.setShortCut('ww', this.pauseOrResume.bind(this));
        this.page.ctrlr.debugTool.setShortCut('gg', this.goNext.bind(this));
        this.page.ctrlr.debugTool.setShortCut('ff', this.fastUpdate.bind(this));
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

    createExpl(spcBtlId: number, startStep: number) {
        GameDataTool.createExpl(this.gameData, startStep);
        if (!spcBtlId) {
            this.startExpl();
        } else {
            this.startBattle(spcBtlId); // 专属作战直接进入战斗
        }

        this.page.handleLog();
    }

    recoverLastExpl(gameData: GameData) {
        let curExpl = gameData.curExpl;
        let inBattle: boolean;
        if (curExpl.curBattle) {
            inBattle = this.recoverExplInBattle(curExpl);
        } else {
            this.handleSelfTeamChange();
            inBattle = false;
        }

        if (!inBattle) {
            // 计算step
            let startUpdCnt = 0;
            for (let idx = 0; idx < curExpl.startStep; idx++) startUpdCnt += UpdCntByStep[idx];

            let diff = Date.now() - curExpl.startTime;
            let curUpdCnt = Math.floor(diff / ExplInterval);

            let realChngUpdCnt = curExpl.chngUpdCnt + startUpdCnt;
            let lastStepUpdCnt = realChngUpdCnt + 1;
            let nextStepUpdCnt = 0;
            for (let idx = 0; idx < curExpl.curStep; idx++) nextStepUpdCnt += UpdCntByStep[idx];

            // 战斗状态
            let selfPets = GameDataTool.getReadyPets(this.gameData);
            let selfLv = selfPets.getAvg((pet: Pet) => pet.lv);
            let selfRank = selfPets.getAvg((pet: Pet) => pet.rank);
            let selfPwr = selfPets.getAvg((pet: Pet) => {
                let totalEqpLv = 0;
                let featureLvs = 0;
                for (const eqp of pet.equips) {
                    if (!eqp) continue;
                    let eqpModel = equipModelDict[eqp.id];
                    let eqpLv = (eqpModel.lv + eqp.growth) * (1 + eqpModel.rank * 0.1);
                    totalEqpLv += eqpLv * 0.15;
                    for (const lv of eqp.selfFeatureLvs) featureLvs += lv;
                    for (const feature of eqp.affixes) featureLvs += feature.lv;
                }
                for (const feature of pet.learnedFeatures) featureLvs += feature.lv;

                let realPrvty = PetDataTool.getRealPrvty(pet);

                let curPower = pet.lv * AttriRatioByRank[pet.rank] + totalEqpLv;
                curPower *= 1 + featureLvs * 0.01 + realPrvty * 0.01 * 20;
                return curPower;
            });

            let posId = curExpl.curPosId;
            let curPosModel = actPosModelDict[posId];

            let enemyLv: number = RealBattle.calcLvArea(curPosModel, curExpl.curStep).base;
            let enemyRank: number = RealBattle.calcRankAreaByExplStep(curExpl.curStep).base;
            let enemyPwr = enemyLv * AttriRatioByRank[enemyRank];

            let agiRate = ExplUpdater.getPosPetAgiRate(curExpl, this.battleCtrlr);
            let sensRate = ExplUpdater.getPosPetSensRate(curExpl, this.battleCtrlr);
            let eleRate = ExplUpdater.getPosPetEleRate(curExpl, this.battleCtrlr);
            let petSt = { selfLv, selfRank, selfPwr, enemyLv, enemyRank, enemyPwr, agiRate, sensRate, eleRate };

            // 捕捉状态
            let catcherIdx = -1;
            if (curExpl.catcherId) {
                catcherIdx = BattleController.getCatcherIdxInItemList(gameData, curExpl.catcherId);
                if (catcherIdx === -1) curExpl.catcherId = null;
            }
            let catchSt = { catcherIdx };

            // 计算探索
            let curExplModel = actPosModelDict[curExpl.curPosId].actDict['exploration'] as ExplModel;
            while (true) {
                let realCurUpdCnt = curUpdCnt + startUpdCnt;
                if (curExpl.curStep >= curExplModel.stepMax - 1) {
                    this.recoverExplInExpl(curExpl.curStep, lastStepUpdCnt, realCurUpdCnt, petSt, catchSt);
                    break;
                }
                nextStepUpdCnt += UpdCntByStep[curExpl.curStep];
                if (realCurUpdCnt < nextStepUpdCnt) {
                    this.recoverExplInExpl(curExpl.curStep, lastStepUpdCnt, realCurUpdCnt, petSt, catchSt);
                    break;
                }
                this.recoverExplInExpl(curExpl.curStep, lastStepUpdCnt, nextStepUpdCnt, petSt, catchSt);
                lastStepUpdCnt = nextStepUpdCnt + 1;
                curExpl.curStep++;
            }
        }

        this.startExpl();
    }

    recoverExplInBattle(curExpl: ExplMmr): boolean {
        let inBattle = true;
        let timePtr = curExpl.curBattle.startUpdCnt * ExplInterval + curExpl.startTime;

        let oldPage = this.page;
        let endCall = this.battleCtrlr.endCallback;
        this.page = null;
        this.battleCtrlr.page = null;
        this.battleCtrlr.endCallback = null;

        this.battleCtrlr.resetSelfTeam(true);
        this.battleCtrlr.resetBattle(curExpl.curBattle);

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

        if (inBattle) {
            this.lastTime = timePtr - ExplInterval;
            this.state = ExplState.battle;

            // msg
        } else {
            curExpl.chngUpdCnt = curExpl.curBattle.startUpdCnt + updCnt;
            this.receiveExp();
            this.catchPet();
        }

        return inBattle;
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
        catchSt: { catcherIdx: number }
    ) {
        let curExpl = this.gameData.curExpl;
        let posId = curExpl.curPosId;
        let curPosModel = actPosModelDict[posId];

        let selfPets = GameDataTool.getReadyPets(this.gameData);

        // 计算回合数和胜利数量 ------------------------------------------
        let eachUpdCnt = ExplUpdater.calcBtlDuraUpdCnt(petSt.selfPwr, petSt.enemyPwr);
        let eachExplRdCnt = 2;
        let eachHidingRdCnt = curExpl.hiding ? ExplUpdater.calcHideExplRdCnt(petSt.agiRate) : 0;
        eachUpdCnt += ExplUpdater.calcExplUpdCntByRdCnt(eachExplRdCnt + eachHidingRdCnt);
        eachUpdCnt += 5; // 恢复5跳

        let diffUpdCnt = toUpdCnt - fromUpdCnt + 1;
        let explRdCnt = Math.floor(diffUpdCnt / eachUpdCnt);
        if (explRdCnt > 10) explRdCnt = randomArea(explRdCnt, 0.1); // 增加随机范围

        let winRate = ExplUpdater.calcWinRate(petSt.selfPwr, petSt.enemyPwr);
        let winCount = Math.max(Math.min(Math.ceil(explRdCnt * randomArea(winRate, 0.1)), explRdCnt), 0);

        // 计算获取的经验 ------------------------------------------
        let exp = ExplUpdater.calcExpByLvRank(petSt.selfLv, petSt.enemyLv, petSt.selfRank, petSt.enemyRank);
        let expTotal = exp * winCount;
        expTotal = randomArea(expTotal, 0.05);

        let gameDataJIT = this.memory.gameDataJIT;
        for (const pet of selfPets) {
            let expEach = expTotal * gameDataJIT.getAmplPercent(pet, AmplAttriType.exp); // 计算饮品的加成
            PetDataTool.addExp(pet, Math.ceil(expEach));
        }

        let explModel: ExplModel = curPosModel.actDict['exploration'] as ExplModel;

        let stepMax = explModel.stepMax;
        let stepType = StepTypesByMax[stepMax][step];

        // 计算捕获
        do {
            let catcherIdx = catchSt.catcherIdx;
            if (catcherIdx === -1) break;
            let catcher = this.gameData.items[catcherIdx] as Catcher;
            let catcherModel: CatcherModel = catcherModelDict[catcher.id];

            let { base: lvBase, range: lvRange } = RealBattle.calcLvArea(curPosModel, step);
            let { base: rankBase, range: rankRange } = RealBattle.calcRankAreaByExplStep(step);
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

            let petIdLists = curPosModel.petIdLists;
            if (!petIdLists || petIdLists.length === 0) cc.error(`${curPosModel.cnName}没有宠物列表petIdLists，无法战斗`);
            let petIds = petIdLists[stepType];

            let realPetIds = [];
            for (const petId of petIds) {
                let petModel = petModelDict[petId];
                if (catcherModel.bioType && catcherModel.bioType !== petModel.bioType) continue;
                if (catcherModel.eleType && catcherModel.eleType !== petModel.eleType) continue;
                if (catcherModel.battleType && catcherModel.battleType !== petModel.battleType) continue;
                realPetIds[realPetIds.length] = petId;
            }
            if (realPetIds.length === 0) break;

            let rate = ExplUpdater.calcCatchRateByEleRate(catcherModel, petSt.eleRate);
            let catchCount = Math.floor(rate * winCount);
            catchCount = Math.min(catchCount, catcher.count);

            let catchIdx = 0;
            for (; catchIdx < catchCount; catchIdx++) {
                let petId = getRandomOneInList(realPetIds);
                let lv = lvMin + random(lvMax - lvMin);
                let rank = rankMin + random(rankMax - rankMin);
                let features = RealBattle.getRandomFeatures(lv);
                let rztStr = GameDataTool.addCaughtPet(this.gameData, petId, lv, rank, features);
                if (rztStr !== GameDataTool.SUC) break;
            }

            if (catchIdx === catcher.count) {
                catchSt.catcherIdx = -1;
                curExpl.catcherId = null;
            }
            GameDataTool.deleteItem(this.gameData, catcherIdx, catchIdx);
        } while (false);

        // 计算获得的物品
        let gainTimes = explRdCnt * (eachExplRdCnt + eachHidingRdCnt);
        let eqpIds = curPosModel.eqpIdLists[stepType];
        let itemIds = curPosModel.itemIdLists[stepType];

        let treasureRate = ExplUpdater.calcTreasureRate(petSt.sensRate);
        let eqpCnt = Math.floor(gainTimes * treasureRate);
        let itemCnt = Math.ceil(gainTimes * (1 - treasureRate));
        let gainMoreRate = Math.min(Math.max(petSt.sensRate, 0), 3); // 与 calcGainCnt 保持一致
        itemCnt = Math.ceil(itemCnt * gainMoreRate);

        for (let index = 0; index < eqpCnt; index++) {
            let eqpId = getRandomOneInList(eqpIds);
            let equip = EquipDataTool.createRandomById(eqpId);
            if (!equip) break;
            let rzt = GameDataTool.addEquip(this.gameData, equip);
            if (rzt !== GameDataTool.SUC) break;
        }

        const eachItemRate = 2 / itemIds.length;
        let itemLeft = itemCnt;
        for (let index = 0; index < itemCnt - 1; index++) {
            let curRate = Math.random() * eachItemRate;
            let curCnt = Math.min(Math.floor(itemCnt * curRate), itemLeft);
            let itemId = itemIds[index];
            GameDataTool.addCnsum(this.gameData, itemId, curCnt);
            itemLeft -= curCnt;
            if (itemLeft <= 0) break;
        }
        if (itemLeft > 0) {
            let itemId = itemIds[itemIds.length - 1];
            GameDataTool.addCnsum(this.gameData, itemId, itemLeft);
        }
    }

    static calcExplUpdCntByRdCnt(RdCnt: number): number {
        return RdCnt * 6;
    }

    static calcBtlDuraUpdCnt(selfPwr: number, enemyPwr: number): number {
        // let enemyHp = enemyPwr * 30 * 25;
        // let selfDmg = selfPwr * 30 * 2;
        // return (enemyHp / selfDmg) * 4; // 敌人血量 / 己方攻击伤害+技能伤害 * 平均一回合攻击次数之和
        // 计算出如下公式
        return (enemyPwr / selfPwr) * 50;
    }

    static calcWinRate(selfPwr: number, enemyPwr: number): number {
        if (selfPwr >= enemyPwr) return 1;
        else if (selfPwr <= enemyPwr * 0.75) return 0;
        else {
            return 4 * (selfPwr / enemyPwr) - 3; // (s - 0.75 * e) / (e - 0.75 * e)
        }
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

        let curTime = Date.now();
        if (curTime - this.lastTime > ExplInterval) {
            this.lastTime = this.lastTime + ExplInterval;
            this.updCnt += 1;
            this.onUpdate();
        }
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

    /** 发现宝藏 */
    trsrFind: boolean = false;
    /** 发现宝藏预动作 */
    trsrPrefind: boolean = false;

    /** 潜行发现敌人 */
    enemyFind: boolean = false;
    /** 发现敌人预动作 */
    enemyPrefind: boolean = false;

    // 一轮是平均5+1乘以0.75 = 4.5 平均2+1轮 也就是13.5s
    startExpl() {
        this.handleSelfTeamChange();

        let curExpl = this.gameData.curExpl;

        let enter = this.state !== ExplState.explore;
        this.state = ExplState.explore;

        this.explTime = 3 + random(5); // 3-7个空隙

        if (enter) {
            this.explRdCnt = random(5);
            if (curExpl.hiding) {
                let agiRate = ExplUpdater.getPosPetAgiRate(curExpl, this.battleCtrlr);
                this.explRdCnt += ExplUpdater.calcHideExplRdCnt(agiRate);
            }
            if (this.page) this.page.log('开始探索');
        } else {
            this.explRdCnt--;
        }

        if (this.explRdCnt > 0) {
            let posId = curExpl.curPosId;
            let curPosModel = actPosModelDict[posId];
            let sensRate = ExplUpdater.getPosPetSensRate(curExpl, this.battleCtrlr);
            if (
                curPosModel.eqpIdLists &&
                curPosModel.eqpIdLists.length > 0 &&
                randomRate(ExplUpdater.calcTreasureRate(sensRate))
            ) {
                this.trsrFind = true;
                this.trsrPrefind = true;
            } else {
                this.trsrFind = false;
                this.gainCnt = ExplUpdater.calcGainCnt(sensRate);
            }
        } else {
            this.trsrFind = false;
            if (curExpl.hiding) {
                this.enemyFind = true;
                this.enemyPrefind = true;
            }
        }

        cc.log('PUT 探索次数和本次时间: ', this.explRdCnt, this.explTime);
    }

    static calcHideExplRdCnt(rate: number): number {
        if (rate < 1) return 1;
        else return Math.ceil(rate);
    }

    static calcTreasureRate(rate: number): number {
        let trsrRate: number;
        if (rate >= 1) trsrRate = 0.04 + Math.min(rate - 1, 1) * 0.04;
        else trsrRate = 0.02;
        return trsrRate;
    }

    static calcGainCnt(rate: number): number {
        if (rate < 1) return 1;
        if (rate < 2) return 1 + (randomRate(rate - 1) ? 1 : 0);
        if (rate < 3) return 2 + (randomRate(rate - 2) ? 1 : 0);
        return 3 + (randomRate(0.2) ? 1 : 0);
    }

    static getPosPetAgiRate(curExpl: ExplMmr, battleCtrlr: BattleController) {
        let posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        let petValue = battleCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.agility);
        return petValue / posValue;
    }

    static getPosPetSensRate(curExpl: ExplMmr, battleCtrlr: BattleController) {
        let posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        let petValue = battleCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.sensitivity);
        return petValue / posValue;
    }

    static getPosPetEleRate(curExpl: ExplMmr, battleCtrlr: BattleController) {
        let posValue = ExplUpdater.getPosSubAttriSbstValue(curExpl);
        let petValue = battleCtrlr.realBattle.selfTeam.pets.getMax((item: BattlePet) => item.pet2.elegant);
        return petValue / posValue;
    }

    static getPosSubAttriSbstValue(curExpl: ExplMmr) {
        if (curExpl.curStep < 0) return 999999;
        let curPosLv = actPosModelDict[curExpl.curPosId].lv;
        return (100 + curPosLv * 15) * (1 + curExpl.curStep * 0.4);
    }

    updateExpl() {
        let result = this.getExplResult();
        if (result === ExplResult.doing) this.doExploration();
        else if (result === ExplResult.gain) this.gainRes();
        else if (result === ExplResult.battle) this.startBattle();
    }

    getExplResult(): ExplResult {
        if (this.explTime > 0) {
            this.explTime--;
            return ExplResult.doing;
        } else {
            if (this.explRdCnt > 0) return ExplResult.gain;
            else return ExplResult.battle;
        }
    }

    explStepPercent: number = -1;

    doExploration() {
        let curExpl = this.gameData.curExpl;
        let curExplModel = actPosModelDict[curExpl.curPosId].actDict['exploration'] as ExplModel;
        let curStep = curExpl.curStep;
        do {
            if (curStep === -1) {
                curExpl.curStep = curExpl.startStep;
                this.explStepPercent = 0;
            } else if (curStep >= curExplModel.stepMax - 1) {
                break;
            } else {
                let startUpdCnt = 0;
                for (let idx = 0; idx < curExpl.startStep; idx++) startUpdCnt += UpdCntByStep[idx];
                let lastStepUpdCnt = 0;
                for (let idx = 0; idx < curStep; idx++) lastStepUpdCnt += UpdCntByStep[idx];

                let curStepUpdCnt = UpdCntByStep[curStep];
                let realUpdCnt = this.updCnt + startUpdCnt;
                if (realUpdCnt >= lastStepUpdCnt + curStepUpdCnt) {
                    curExpl.curStep++;
                    this.updateChgUpdCnt();
                    this.explStepPercent = 0;
                } else {
                    let percent = Math.floor(((realUpdCnt - lastStepUpdCnt) * 100) / curStepUpdCnt);
                    if (percent > 99) percent = 99; // 战斗时候百分比不能停所以百分比在UI上需要禁止超过100%
                    if (percent !== this.explStepPercent) {
                        this.explStepPercent = percent;
                        if (this.page) this.page.setExplStepUI();
                    }
                    break;
                }
            }
            if (this.page) {
                this.page.setExplStepUI();

                let posName = actPosModelDict[curExpl.curPosId].cnName;
                let stepType = StepTypesByMax[curExplModel.stepMax][curExpl.curStep];
                let stepName = ExplStepNames[stepType];
                this.page.log('进入' + posName + stepName);
            }
            return;
        } while (0);

        if (this.page) {
            if (this.trsrFind) {
                if (this.trsrPrefind) {
                    this.trsrPrefind = false;
                    this.page.log('发现远古宝箱');
                } else this.page.log('宝箱解锁中......');
            } else if (this.enemyFind) {
                if (this.enemyPrefind) {
                    this.enemyPrefind = false;
                    this.page.log('发现附近似乎有威胁存在');
                } else this.page.log('潜行接近中......');
            } else this.page.log('探索中......');
        }
    }

    gainRes() {
        let curExpl = this.gameData.curExpl;
        let curExplModel = actPosModelDict[curExpl.curPosId].actDict['exploration'] as ExplModel;

        let posId = curExpl.curPosId;
        let curPosModel = actPosModelDict[posId];
        let step = curExpl.curStep;

        let stepMax = curExplModel.stepMax;
        let stepType = StepTypesByMax[stepMax][step];

        let itemName: string = null;
        let failRzt: string = null;
        if (this.trsrFind) {
            let eqpIdLists = curPosModel.eqpIdLists; // start时验证过eqpIdLists必然存在且有值
            let eqps = eqpIdLists[stepType];
            let eqpId = getRandomOneInList(eqps);
            let equip = EquipDataTool.createRandomById(eqpId);
            if (equip) {
                let rzt = GameDataTool.addEquip(this.gameData, equip);
                if (rzt === GameDataTool.SUC) itemName = equipModelDict[equip.id].cnName;
                else failRzt = rzt;
            } else failRzt = '竟然没有获取到装备';
        }

        if (!failRzt && !itemName) {
            let itemIdLists = curPosModel.itemIdLists;
            let itemIds = itemIdLists[stepType];
            let itemId = getRandomOneInList(itemIds);
            let rzt = GameDataTool.addCnsum(this.gameData, itemId, this.gainCnt);
            if (rzt === GameDataTool.SUC) {
                let model = CnsumDataTool.getModelById(itemId);
                itemName = model.cnName + (this.gainCnt > 1 ? 'x' + String(this.gainCnt) : '');
            } else failRzt = rzt;
        }

        if (this.page) {
            if (failRzt) {
                this.page.log(failRzt);
            } else {
                if (this.trsrFind) this.page.log('宝箱成功被打开');
                this.page.log('获得了' + itemName);
            }
        }

        this.updateChgUpdCnt();

        // 继续探索
        this.startExpl();
    }

    async addCnsumSync(itemId: string) {
        return new Promise<string | Cnsum>(resolve => {
            let rzt = GameDataTool.addCnsum(this.gameData, itemId);
            if (rzt != GameDataTool.SUC) resolve(rzt);
        });
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
            this.receiveExp(); // 计算获得的exp
            this.catchPet();
        }
        this.startRecover();
    }

    receiveExp() {
        let rb = this.battleCtrlr.realBattle;
        let gameDataJIT = this.memory.gameDataJIT;

        let selfLv = rb.selfTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.lv);
        let enemyLv = rb.enemyTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.lv);
        let selfRank = rb.selfTeam.pets.getAvg((bPet: BattlePet) => bPet.pet.rank);
        let enemyRank = RealBattle.calcRankAreaByExplStep(this.gameData.curExpl.curStep).base;
        let exp = ExplUpdater.calcExpByLvRank(selfLv, enemyLv, selfRank, enemyRank);

        for (const selfBPet of rb.selfTeam.pets) {
            let selfPet = selfBPet.pet;

            let curExp = exp * gameDataJIT.getAmplPercent(selfBPet.pet, AmplAttriType.exp);
            curExp = Math.ceil(curExp);

            let curExpPercent = PetDataTool.addExp(selfPet, curExp);
            if (this.page) {
                let petName = petModelDict[selfPet.id].cnName;
                if (curExpPercent <= 0) {
                    // 跳过
                } else if (curExpPercent >= 1) {
                    this.page.log(`${petName}升到了${selfPet.lv}级`);
                } else {
                    let expRate = (curExpPercent * 100).toFixed(1);
                    this.page.log(`${petName}获得${curExp}点经验，升级进度完成了${expRate}%`);
                }
            }
        }
    }

    static calcExpByLvRank(selfLv: number, enemyLv: number, selfRank: number, enemyRank: number): number {
        let exp = enemyLv * 5 + 45;

        if (enemyLv >= selfLv) exp *= 1 + (enemyLv - selfLv) * 0.05;
        else exp *= 1 - Math.min(selfLv - enemyLv, 8) / 8;

        exp *= AttriRatioByRank[enemyRank] / AttriRatioByRank[selfRank];

        return exp;
    }

    catchPet() {
        let gameData = this.gameData;
        let catcherId = gameData.curExpl.catcherId;
        if (!catcherId) return;

        let catcherIdx = BattleController.getCatcherIdxInItemList(gameData, catcherId);
        if (catcherIdx === -1) {
            gameData.curExpl.catcherId = null;
            if (this.page) this.page.setCatchActive(false);
            return;
        }

        let rb = this.battleCtrlr.realBattle;

        let catcherModel: CatcherModel = catcherModelDict[catcherId];
        let eleRate = ExplUpdater.getPosPetEleRate(gameData.curExpl, this.battleCtrlr);
        let catchRate = ExplUpdater.calcCatchRateByEleRate(catcherModel, eleRate);

        for (const battlePet of rb.enemyTeam.pets) {
            // 计算能否捕捉
            let pet = battlePet.pet;
            let petModel = petModelDict[pet.id];
            if (pet.lv < catcherModel.lvMin || catcherModel.lvMax < pet.lv) continue;
            if (pet.rank < catcherModel.rankMin || catcherModel.rankMax < pet.rank) continue;
            if (catcherModel.bioType && catcherModel.bioType !== petModel.bioType) continue;
            if (catcherModel.eleType && catcherModel.eleType !== petModel.eleType) continue;
            if (catcherModel.battleType && catcherModel.battleType !== petModel.battleType) continue;

            // 计算成功几率
            let suc = randomRate(catchRate);

            if (suc) {
                let features: Feature[] = deepCopy(pet.inbornFeatures) as Feature[];
                let rztStr = GameDataTool.addCaughtPet(gameData, pet.id, pet.lv, pet.rank, features);
                if (rztStr === GameDataTool.SUC) {
                    if (this.page) this.page.log(`成功捕获${petModelDict[pet.id].cnName}`);
                    let catcher = this.memory.gameData.items[catcherIdx] as Catcher;
                    if (catcher.count === 1) {
                        gameData.curExpl.catcherId = null;
                        if (this.page) this.page.setCatchActive(false);
                    }
                    GameDataTool.deleteItem(gameData, catcherIdx);
                } else {
                    if (this.page) this.page.log(`捕获失败：${rztStr}`);
                }
                return; // 每场战斗只能捕捉一只宠物
            }
        }
    }

    static calcCatchRateByEleRate(catcherModel: CatcherModel, eleRate: number): number {
        let catchRate = catcherModel.rate * 0.01;
        let realEleRate = Math.min(Math.max(eleRate, 1), 2) - 1;
        catchRate *= 0.5 + realEleRate * 0.5;
        return catchRate;
    }

    // -----------------------------------------------------------------

    startRecover() {
        this.state = ExplState.recover;
    }

    updateRecover() {
        let done = true;
        let selfTeam = this.battleCtrlr.realBattle.selfTeam;
        let battlePets = selfTeam.pets;
        for (let index = 0; index < battlePets.length; index++) {
            const battlePet = battlePets[index];
            let hpMax = battlePet.hpMax;
            if (battlePet.hp < hpMax) {
                done = false;
                battlePet.hp += Math.floor(hpMax * 0.1);
                battlePet.hp = Math.min(hpMax, battlePet.hp);
                this.page.setUIofSelfPet(index);
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
            this.page.resetAttriBar(selfTeam.mp, selfTeam.mpMax, selfTeam.rage);
        }

        if (done) {
            this.startExpl();
        } else {
            this.page.log('休息中');
        }
    }

    // -----------------------------------------------------------------

    executeCatch(catcherId: string) {
        this.gameData.curExpl.catcherId = catcherId;
        this.page.setCatchActive(catcherId !== null);
    }

    executeEscape() {
        this.battleCtrlr.escape();
    }

    executeHide() {
        let cur = !this.gameData.curExpl.hiding;
        this.gameData.curExpl.hiding = cur;
        this.page.setHideActive(cur);
    }
}
