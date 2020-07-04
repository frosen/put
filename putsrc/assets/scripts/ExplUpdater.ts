/*
 * ExplUpdater.ts
 * 探索更新器
 * luleyan
 */

import { BattlePageBase } from './BattlePageBase';
import { Memory, GameDataTool, PetDataTool } from 'scripts/Memory';
import { BattleController } from './BattleController';
import { GameData, ItemType, Cnsum, CnsumType, ExplMmr, BattleMmr } from 'scripts/DataSaved';
import { AttriRatioByRank } from './DataOther';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { random, randomArea, randomRate } from './Random';

export enum ExplState {
    none,
    explore,
    battle,
    recover
}

enum ExplResult {
    none,
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

    state: ExplState = ExplState.none;

    _id: string = 'idforupdater';

    inited: boolean = false;
    pausing: boolean = false;

    init(page: BattlePageBase) {
        this.page = page;
        this.memory = this.page.ctrlr.memory;
        this.gameData = this.memory.gameData;

        this.battleCtrlr = new BattleController();
        this.battleCtrlr.init(this.page, this.memory, () => {
            this.updateChgUpdCnt();
            this.startRecover();
        });

        let curExpl = this.gameData.curExpl;
        if (!curExpl) this.createExpl(0);
        else this.recoverLastExpl(curExpl);

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

    createExpl(spcBtlId: number) {
        GameDataTool.createExpl(this.gameData);
        if (!spcBtlId) {
            this.startExpl();
        } else {
            this.startBattle(spcBtlId); // 专属作战直接进入战斗
        }

        this.page.handleLog();
    }

    recoverLastExpl(curExpl: ExplMmr) {
        let startTime = curExpl.startTime;
        if (curExpl.curBattle) {
            let timePtr = curExpl.curBattle.startUpdCnt * ExplInterval + startTime;

            let oldPage = this.page;
            let endCall = this.battleCtrlr.endCallback;
            this.page = null;
            this.battleCtrlr.page = null;
            this.battleCtrlr.endCallback = null;

            this.battleCtrlr.resetSelfTeam(true);
            this.battleCtrlr.resetBattle(curExpl.curBattle);

            let inBattle = true;
            while (true) {
                if (this.battleCtrlr.realBattle.start == false) {
                    inBattle = false;
                    break;
                }

                timePtr += ExplInterval;
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
                startTime = timePtr;
            }
        } else {
            startTime += curExpl.chngUpdCnt * ExplInterval;
        }

        let { selfLv, selfRank, enemyLv, enemyRank } = ExplUpdater.getAvgLvRankInMmr(this.gameData);
        let explDura = ExplUpdater.calcExplDura(selfLv, selfRank, enemyLv, enemyRank);

        let diff = Date.now() - startTime;
        let explCount = Math.floor(diff / explDura);
        if (explCount > 10) explCount = randomArea(explCount, 0.1); // 增加随机范围

        let winRate = ExplUpdater.calcWinRate(selfLv, selfRank, enemyLv, enemyRank);
        let winCount = Math.ceil(explCount * randomArea(winRate, 0.1));

        // 计算获取的经验
        let exp = BattleController.calcExpByLvRank(selfLv, selfRank, enemyLv, enemyRank);
        let totalExp = exp * winCount;
        totalExp = randomArea(totalExp, 0.05);

        for (const pet of GameDataTool.getReadyPets(this.gameData)) {
            // 计算饮品的加成 // llytodo
            // expl中selfs的价值？？？？// llytodo
            PetDataTool.addExp(pet, totalExp);
        }

        // 计算捕获

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

    static calcExplDura(selfLv: number, selfRank: number, enemyLv: number, enemyRank: number): number {
        return this.calcBattleDura(selfLv, selfRank, enemyLv, enemyRank) + 15000; // 一场战斗时间，加上15秒恢复(1.5)和探索(13.5)时间
    }

    static calcBattleDura(selfLv: number, selfRank: number, enemyLv: number, enemyRank: number): number {
        // 敌人血量 / 己方攻击伤害+技能伤害 * 每次攻击时间 * 平均一回合攻击次数之和
        let enemyHp = enemyLv * 30 * 25 * AttriRatioByRank[enemyRank];
        let selfDmg = selfLv * 30 * 2 * AttriRatioByRank[selfRank];
        let duration = (enemyHp / selfDmg) * ExplInterval * 6 * 1000;
        return duration;
    }

    static calcWinRate(selfLv: number, selfRank: number, enemyLv: number, enemyRank: number): number {
        return 0.9;
    }

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
        if (this.state == ExplState.explore) this.updateExpl();
        else if (this.state == ExplState.battle) this.updateBattle();
        else if (this.state == ExplState.recover) this.updateRecover();

        if (this.page) this.page.handleLog();
    }

    // -----------------------------------------------------------------

    handleSelfTeamChange() {
        this.battleCtrlr.resetSelfTeam(); // 重置过程不消耗性能，且大概率会触发onMemoryDataChanged
    }

    // -----------------------------------------------------------------

    explTime: number = 0;
    explCnt: number = 0;

    // 一轮是平均5+1乘以0.75 = 4.5 平均2+1轮 也就是13.5s
    startExpl() {
        this.handleSelfTeamChange();

        let enter = this.state != ExplState.explore;
        this.state = ExplState.explore;

        this.explTime = 3 + random(5); // 3-7个空隙

        if (enter) {
            this.explCnt = random(5);
            if (this.gameData.curExpl.hiding) {
                this.explCnt += ExplUpdater.calcHideExplCnt(this.gameData.curExpl, this.battleCtrlr);
            }
            this.page.log('开始探索');
        } else {
            this.explCnt--;
        }

        cc.log('PUT 探索次数和本次时间: ', this.explCnt, this.explTime);
    }

    static calcHideExplCnt(curExpl: ExplMmr, battleCtrlr: BattleController): number {
        let curPosLv = actPosModelDict[curExpl.curPosId].lv;

        let posSens = (100 + curPosLv * 15) * (1 + curExpl.curStep * 0.5);

        let petSens = 0;
        let selfPets = battleCtrlr.realBattle.selfTeam.pets;
        for (const selfPet of selfPets) petSens = Math.max(petSens, selfPet.pet2.sensitivity); // 取最大

        if (petSens < posSens) return 0;
        else {
            let rate = petSens / posSens;
            let baseCnt = Math.floor(rate);
            let rateCnt = randomRate(rate - baseCnt) ? 1 : 0;
            return baseCnt + rateCnt;
        }
    }

    updateExpl() {
        let result = this.getExplResult();
        if (result == ExplResult.none) this.exploreNothing();
        else if (result == ExplResult.gain) this.gainRes();
        else if (result == ExplResult.battle) this.startBattle();
    }

    getExplResult(): ExplResult {
        if (this.explTime > 0) {
            this.explTime--;
            return ExplResult.none;
        } else {
            if (this.explCnt > 0) return ExplResult.gain;
            else return ExplResult.battle;
        }
    }

    exploreNothing() {
        this.page.log('探索中......');
    }

    gainRes() {
        this.handleSelfTeamChange();

        this.page.log('获得了什么');

        this.updateChgUpdCnt();

        // 继续探索
        this.startExpl();
    }

    startBattle(spcBtlId: number = 0) {
        this.handleSelfTeamChange();

        this.state = ExplState.battle;
        this.battleCtrlr.startBattle(this.updCnt, spcBtlId);
    }

    updateChgUpdCnt() {
        this.gameData.curExpl.chngUpdCnt = this.updCnt;
    }

    // -----------------------------------------------------------------

    updateBattle() {
        this.battleCtrlr.update();
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

    startRecover() {
        this.state = ExplState.recover;
    }

    // -----------------------------------------------------------------

    executeCatch(): string {
        let cur = !this.gameData.curExpl.catching;
        if (cur) {
            let items = this.gameData.items;
            let hasCatcher = false;
            for (const item of items) {
                if (item.itemType != ItemType.cnsum || (item as Cnsum).cnsumType != CnsumType.catcher) continue;
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
