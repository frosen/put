/*
 * ExplUpdater.ts
 * 探索更新器
 * luleyan
 */

import { BattlePageBase } from './BattlePageBase';
import { Memory, GameDataTool, PetDataTool, EquipDataTool, CnsumDataTool } from 'scripts/Memory';
import { BattleController } from './BattleController';
import { GameData, ItemType, Cnsum, CnsumType, ExplMmr } from 'scripts/DataSaved';
import { AttriRatioByRank, AmplAttriType } from './DataOther';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { random, randomArea, randomRate, getRandomOneInListWithRate, getRandomOneInList } from './Random';
import { ExplModel, StepTypesByMax, UpdCntByStep, ExplStepNames, RatesByStepType } from './DataModel';
import { equipModelDict } from 'configs/EquipModelDict';

export enum ExplState {
    none,
    explore,
    battle,
    recover,
    revive
}

enum ExplResult {
    doing,
    gain, // 获取收益
    battle
}

/** 探索时间间隔毫秒 */
const ExplInterval = 750;

export class ExplUpdater {
    page: BattlePageBase = null;
    memory: Memory = null;
    gameData: GameData = null;
    battleCtrlr: BattleController = null;

    curExpl: ExplMmr = null;
    curExplModel: ExplModel = null;

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
        else this.recoverLastExpl(curExpl);

        this.curExpl = this.gameData.curExpl;
        this.curExplModel = actPosModelDict[this.curExpl.curPosId].actDict['exploration'] as ExplModel;

        cc.director.getScheduler().scheduleUpdate(this, 0, false);
        this.lastTime = Date.now();

        this.page.ctrlr.debugTool.setShortCut('ww', this.pauseOrResume.bind(this));
        this.page.ctrlr.debugTool.setShortCut('gg', this.goNext.bind(this));
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

    recoverLastExpl(curExpl: ExplMmr) {
        let inBattle = curExpl.curBattle ? this.recoverExplInBattle(curExpl) : false;

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

            while (true) {
                let realCurUpdCnt = curUpdCnt + startUpdCnt;
                if (curExpl.curStep >= this.curExplModel.stepMax - 1) {
                    this.recoverExplInExpl(curExpl, curExpl.curStep, lastStepUpdCnt, realCurUpdCnt);
                    break;
                }
                nextStepUpdCnt += UpdCntByStep[curExpl.curStep];
                if (realCurUpdCnt < nextStepUpdCnt) {
                    this.recoverExplInExpl(curExpl, curExpl.curStep, lastStepUpdCnt, realCurUpdCnt);
                    break;
                }
                this.recoverExplInExpl(curExpl, curExpl.curStep, lastStepUpdCnt, nextStepUpdCnt);
                lastStepUpdCnt = nextStepUpdCnt + 1;
                curExpl.curStep++;
            }
        }
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
        }

        return inBattle;
    }

    recoverExplInExpl(curExpl: ExplMmr, step: number, fromUpdCnt: number, toUpdCnt: number) {
        let { selfLv, selfRank, enemyLv, enemyRank } = ExplUpdater.getAvgLvRankInMmr(this.gameData);
        let explDuraUpdCnt = ExplUpdater.calcExplDuraUpdCnt(selfLv, selfRank, enemyLv, enemyRank);

        let diffUpdCnt = toUpdCnt - fromUpdCnt + 1;
        let explCnt = Math.floor(diffUpdCnt / explDuraUpdCnt);
        if (explCnt > 10) explCnt = randomArea(explCnt, 0.1); // 增加随机范围

        let selfPets = GameDataTool.getReadyPets(this.gameData);
        let winRate = ExplUpdater.calcWinRate(selfLv, selfRank, enemyLv, enemyRank, selfPets.length);
        let winCount = Math.ceil(explCnt * randomArea(winRate, 0.1));

        // 计算获取的经验
        let exp = BattleController.calcExpByLvRank(selfLv, selfRank, enemyLv, enemyRank);
        let expTotal = exp * winCount;
        expTotal = randomArea(expTotal, 0.05);

        let gameDataJIT = this.memory.gameDataJIT;
        for (const pet of selfPets) {
            let expEach = expTotal * gameDataJIT.getAmplPercent(pet, AmplAttriType.exp); // 计算饮品的加成
            PetDataTool.addExp(pet, Math.ceil(expEach));
        }

        // 计算捕获
        if (curExpl.catching) {
            let petList = [];
            let catchers = [];
        }

        // 计算获得的物品 // llytodo

        // 考虑潜行
    }

    static getAvgLvRankInMmr(gameData: GameData): { selfLv: number; selfRank: number; enemyLv: number; enemyRank: number } {
        let selfLv: number = 0,
            selfRank: number = 0;
        let selfPetsMmr = GameDataTool.getReadyPets(gameData);
        for (const selfPetMmr of selfPetsMmr) {
            selfLv += selfPetMmr.lv;
            selfRank += selfPetMmr.rank;
        }
        selfLv /= selfPetsMmr.length;
        selfRank /= selfPetsMmr.length;

        let posId = gameData.curExpl.curPosId;
        let curPosModel = actPosModelDict[posId];

        let enemyLv: number = curPosModel.lv,
            enemyRank: number = ExplUpdater.calcRankByExplStep(gameData.curExpl.curStep);

        return { selfLv, selfRank, enemyLv, enemyRank };
    }

    static calcRankByExplStep(step: number) {
        return step * 2 + 1;
    }

    static calcExplDuraUpdCnt(selfLv: number, selfRank: number, enemyLv: number, enemyRank: number): number {
        return this.calcBtlDuraUpdCnt(selfLv, selfRank, enemyLv, enemyRank) + 20; // 一场战斗时间，加上2跳恢复18跳和探索
    }

    static calcBtlDuraUpdCnt(selfLv: number, selfRank: number, enemyLv: number, enemyRank: number): number {
        let enemyHp = enemyLv * 30 * 25 * AttriRatioByRank[enemyRank];
        let selfDmg = selfLv * 30 * 2 * AttriRatioByRank[selfRank];
        return (enemyHp / selfDmg) * 6; // 敌人血量 / 己方攻击伤害+技能伤害 * 平均一回合攻击次数之和
    }

    static calcWinRate(selfLv: number, selfRank: number, enemyLv: number, enemyRank: number, selfLen: number): number {
        let rate = Math.min(0.9 + (selfLv - enemyLv) * 0.05 + (selfRank - enemyRank) * 0.05, 1);
        let lenRate = Math.min((selfLen + 1) * 0.2, 1);
        return rate * lenRate;
    }

    // -----------------------------------------------------------------

    destroy() {
        cc.director.getScheduler().unscheduleUpdate(this);
        GameDataTool.deleteExpl(this.gameData);
        this.memory.removeDataListener(this);
        this.page.ctrlr.debugTool.removeShortCut('ww');
        this.page.ctrlr.debugTool.removeShortCut('gg');
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
        else if (this.state === ExplState.recover) this.updateRecover(false);
        else if (this.state === ExplState.revive) this.updateRecover(true);

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
    explCnt: number = 0;

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

        let enter = this.state !== ExplState.explore;
        this.state = ExplState.explore;

        this.explTime = 3 + random(5); // 3-7个空隙

        let sensRate = ExplUpdater.getPosPetSensRate(this.gameData.curExpl, this.battleCtrlr);

        if (enter) {
            this.explCnt = random(5);
            if (this.gameData.curExpl.hiding) {
                this.explCnt += ExplUpdater.calcHideExplCnt(sensRate);
            }
            if (this.page) this.page.log('开始探索');
        } else {
            this.explCnt--;
        }

        if (this.explCnt > 0) {
            let posId = this.curExpl.curPosId;
            let curPosModel = actPosModelDict[posId];
            if (curPosModel.eqpIdLists && curPosModel.eqpIdLists.length > 0 && ExplUpdater.calcFindTreasure(sensRate)) {
                this.trsrFind = true;
                this.trsrPrefind = true;
            } else {
                this.trsrFind = false;
                this.gainCnt = ExplUpdater.calcGainCnt(sensRate);
            }
        } else {
            this.trsrFind = false;
            if (this.gameData.curExpl.hiding) {
                this.enemyFind = true;
                this.enemyPrefind = true;
            }
        }

        cc.log('PUT 探索次数和本次时间: ', this.explCnt, this.explTime);
    }

    static calcHideExplCnt(rate: number): number {
        if (rate < 1) return 0;
        else {
            let baseCnt = Math.floor(rate);
            let rateCnt = randomRate(rate - baseCnt) ? 1 : 0;
            return baseCnt + rateCnt;
        }
    }

    static calcFindTreasure(rate: number): boolean {
        let trsrRate: number;
        if (rate >= 1) trsrRate = 0.04 + Math.min(rate - 1, 1) * 0.04;
        else trsrRate = 0.02;
        return randomRate(trsrRate);
    }

    static calcGainCnt(rate: number): number {
        if (rate < 1) return 1;
        if (rate < 1.5) return 1 + (randomRate(rate - 1) ? 1 : 0);
        if (rate < 2.5) return 1 + (randomRate(0.5) ? 1 : 0) + (randomRate(rate - 1.5) ? 1 : 0);
        return 2 + (randomRate(0.5) ? 1 : 0);
    }

    static getPosPetSensRate(curExpl: ExplMmr, battleCtrlr: BattleController) {
        let posSens = ExplUpdater.getPosSens(curExpl);
        let petSens = ExplUpdater.getSelfSens(battleCtrlr);
        return petSens / posSens;
    }

    static getPosSens(curExpl: ExplMmr) {
        if (curExpl.curStep < 0) return 999999;
        let curPosLv = actPosModelDict[curExpl.curPosId].lv;
        return (100 + curPosLv * 15) * (1 + curExpl.curStep * 0.7);
    }

    static getSelfSens(battleCtrlr: BattleController) {
        let petSens = 0;
        let selfPets = battleCtrlr.realBattle.selfTeam.pets;
        for (const selfPet of selfPets) petSens = Math.max(petSens, selfPet.pet2.sensitivity); // 取最大
        return petSens;
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
            if (this.explCnt > 0) return ExplResult.gain;
            else return ExplResult.battle;
        }
    }

    explStepPercent: number = -1;

    doExploration() {
        let curStep = this.curExpl.curStep;
        do {
            if (curStep === -1) {
                this.curExpl.curStep = this.curExpl.startStep;
                this.explStepPercent = 0;
            } else if (curStep >= this.curExplModel.stepMax - 1) {
                break;
            } else {
                let startUpdCnt = 0;
                for (let idx = 0; idx < this.curExpl.startStep; idx++) startUpdCnt += UpdCntByStep[idx];
                let lastStepUpdCnt = 0;
                for (let idx = 0; idx < curStep; idx++) lastStepUpdCnt += UpdCntByStep[idx];

                let curStepUpdCnt = UpdCntByStep[curStep];
                let realUpdCnt = this.updCnt + startUpdCnt;
                if (realUpdCnt >= lastStepUpdCnt + curStepUpdCnt) {
                    this.curExpl.curStep++;
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

                let posName = actPosModelDict[this.curExpl.curPosId].cnName;
                let stepType = StepTypesByMax[this.curExplModel.stepMax][this.curExpl.curStep];
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
        let posId = this.curExpl.curPosId;
        let curPosModel = actPosModelDict[posId];
        let step = this.curExpl.curStep;

        let stepMax = this.curExplModel.stepMax;
        let stepType = StepTypesByMax[stepMax][step];
        let rates = RatesByStepType[stepType];

        let itemName: string = null;
        let failRzt: string = null;
        if (this.trsrFind) {
            let eqpIdLists = curPosModel.eqpIdLists; // start时验证过eqpIdLists必然存在且有值
            let eqpIdList = getRandomOneInListWithRate(eqpIdLists, rates);
            let eqpId = getRandomOneInList(eqpIdList);
            let equip = EquipDataTool.createRandomById(eqpId);
            if (equip) {
                let rzt = GameDataTool.addEquip(this.gameData, equip);
                if (rzt === GameDataTool.SUC) itemName = equipModelDict[equip.id].cnName;
                else failRzt = rzt;
            } else failRzt = '竟然没有获取到装备';
        }

        if (!failRzt && !itemName) {
            let itemIdLists = curPosModel.itemIdLists;
            let itemIdList = getRandomOneInListWithRate(itemIdLists, rates);
            let itemId = getRandomOneInList(itemIdList);
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
        if (win) this.startRecover();
        else this.startRevive();
    }

    startRecover() {
        this.state = ExplState.recover;
    }

    startRevive() {
        this.state = ExplState.revive;
    }

    updateRecover(revive: boolean) {
        let done = true;
        let selfTeam = this.battleCtrlr.realBattle.selfTeam;
        let battlePets = selfTeam.pets;
        for (let index = 0; index < battlePets.length; index++) {
            const battlePet = battlePets[index];
            let hpMax = battlePet.hpMax;
            if (battlePet.hp < hpMax) {
                done = false;
                battlePet.hp += Math.floor(hpMax * (revive ? 0.05 : 0.1));
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
            this.page.log(revive ? '复原中' : '休息中');
        }
    }

    // -----------------------------------------------------------------

    executeCatch(): string {
        let cur = !this.gameData.curExpl.catching;
        if (cur) {
            let items = this.gameData.items;
            let hasCatcher = false;
            for (const item of items) {
                if (item.itemType !== ItemType.cnsum || (item as Cnsum).cnsumType !== CnsumType.catcher) continue;
                hasCatcher = true;
                break;
            }

            if (!hasCatcher) {
                return '没有捕捉装置，不能开始捕捉';
            }
        }
        this.gameData.curExpl.hiding = cur;
        this.page.setCatchActive(cur);
        return null;
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
