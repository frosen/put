/*
 * ExplUpdater.ts
 * 探索更新器
 * luleyan
 */

import { BattlePageBase } from './BattlePageBase';
import { Memory, GameDataTool } from 'scripts/Memory';
import { BattleController } from './BattleController';
import { GameData, ItemType, Cnsum, CnsumType, ExplMmr } from 'scripts/DataSaved';
import { AttriRatioByRank } from './DataOther';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { ExplModel } from './DataModel';

export enum ExplState {
    none,
    explore,
    battle,
    recover
}

enum ExplResult {
    none,
    battle
}

export class ExplUpdater {
    page: BattlePageBase = null;
    memory: Memory = null;
    gameData: GameData = null;
    battleCtrlr: BattleController = null;

    state: ExplState = ExplState.none;

    _id: string = 'idforupdater';

    pausing: boolean = false;

    init(page: BattlePageBase) {
        this.page = page;
        this.memory = this.page.ctrlr.memory;
        this.gameData = this.memory.gameData;

        this.battleCtrlr = new BattleController();
        this.battleCtrlr.init(this.page, this.memory, () => {
            this.startRecover();
        });

        let curExpl = this.gameData.curExpl;
        if (!curExpl) this.createExpl();
        else this.restoreLastExpl(curExpl);

        this.memory.addDataListener(this);
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
        this.updateCount += 1;
        this.onUpdate();
    }

    // -----------------------------------------------------------------

    createExpl() {
        GameDataTool.createExpl(this.gameData);
        this.selfPetsChangedFlag = true;
        this.startExpl();
        this.page.handleLog();
    }

    restoreLastExpl(curExpl: ExplMmr) {
        if (curExpl.curBattle) {
            let startTime = curExpl.curBattle.startTime;
            let curTime = Date.now();
            let explDuration = ExplUpdater.calcExplDuration(curExpl);
            let interval = curTime - startTime;
            if (interval < explDuration) {
                this.battleCtrlr.resetSelfTeam();
                // this.battleCtrlr.start;
            }
        }
    }

    static calcExplDuration(curExpl: ExplMmr): number {
        return this.calcBattleDuration(curExpl) + 20; // 一场战斗时间，加上20秒恢复和探索时间
    }

    static calcBattleDuration(curExpl: ExplMmr): number {
        let { selfLv, selfRank, enemyLv, enemyRank } = this.getAvgLvRankInMmr(curExpl);
        // ((enemyLv * 30 * 25 * AttriRatioByRank[enemyRank]) / (selfLv * 30 * 2 * AttriRatioByRank[selfRank])) * 0.75 * 6;
        // 敌人血量 / 己方攻击伤害+技能伤害 * 每次攻击时间 * 平均一回合攻击次数之和
        let duration = ((enemyLv * AttriRatioByRank[enemyRank]) / (selfLv * AttriRatioByRank[selfRank])) * 56.25;
        return duration;
    }

    static getAvgLvRankInMmr(curExpl: ExplMmr): { selfLv: number; selfRank: number; enemyLv: number; enemyRank: number } {
        let selfLv: number = 0,
            selfRank: number = 0;
        let selfPetsMmr = curExpl.selfs;
        for (const selfPetMmr of selfPetsMmr) {
            selfLv += selfPetMmr.lv;
            selfRank += selfPetMmr.rank;
        }
        selfLv /= selfPetsMmr.length;
        selfRank /= selfPetsMmr.length;

        let posId = curExpl.curPosId;
        let curPosModel = actPosModelDict[posId];

        let enemyLv: number = curPosModel.lv,
            enemyRank: number = ExplUpdater.calcRankByExplStep(curExpl.curStep);

        return { selfLv, selfRank, enemyLv, enemyRank };
    }

    static calcRankByExplStep(step: number) {
        return step * 2 + 1;
    }

    destroy() {
        cc.director.getScheduler().unscheduleUpdate(this);
        GameDataTool.deleteExpl(this.gameData);
        this.memory.removeDataListener(this);
        this.page.ctrlr.debugTool.removeShortCut('ww');
        this.page.ctrlr.debugTool.removeShortCut('gg');
        this.battleCtrlr.destroy();
    }

    selfPetsChangedFlag: boolean = false;

    onMemoryDataChanged() {
        let change = this.battleCtrlr.checkIfSelfTeamChanged();
        if (change) this.selfPetsChangedFlag = true;
    }

    lastTime: number = 0;
    updateCount: number = 0;

    update() {
        if (this.pausing) return;
        let curTime = Date.now();
        if (curTime - this.lastTime > 750) {
            this.lastTime = curTime;
            this.updateCount += 1;
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

    checkChange(): boolean {
        if (this.selfPetsChangedFlag) {
            GameDataTool.resetSelfPetsInExpl(this.gameData);
            this.battleCtrlr.resetSelfTeam();
            this.selfPetsChangedFlag = false;
            return true;
        } else return false;
    }

    explTime: number = 0;

    startExpl() {
        this.checkChange();

        this.state = ExplState.explore;
        // this.explTime = 5 + random(5);
        this.explTime = 2; // llytest
        this.page.log('开始探索');
    }

    updateExpl() {
        let change = this.checkChange();
        if (change) return;
        let result = this.getExplResult();
        if (result == ExplResult.none) this.exploreNothing();
        else if (result == ExplResult.battle) this.startBattle();
    }

    getExplResult(): ExplResult {
        if (this.explTime > 0) {
            this.explTime--;
            return ExplResult.none;
        } else {
            return ExplResult.battle;
        }
    }

    exploreNothing() {
        this.page.log('探索中......');
    }

    battleCount: number = 0;

    startBattle() {
        this.state = ExplState.battle;
        this.battleCount++;

        this.battleCtrlr.startBattle();
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
        let cur = !this.memory.gameData.curExpl.catching;
        if (cur) {
            let items = this.memory.gameData.items;
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
        this.memory.gameData.curExpl.hiding = cur;
        this.page.setCatchActive(cur);
        return null;
    }

    executeEscape() {
        this.battleCtrlr.escape();
    }

    executeHide() {
        let cur = !this.memory.gameData.curExpl.hiding;
        this.memory.gameData.curExpl.hiding = cur;
        this.page.setHideActive(cur);
    }
}
