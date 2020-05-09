/*
 * ExplUpdater.ts
 * 探索更新器
 * luleyan
 */

import BattlePageBase from './BattlePageBase';
import { Memory, GameDataTool } from 'scripts/Memory';
import { BattleController } from './BattleController';
import { GameData } from 'scripts/DataSaved';

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

        if (!this.memory.gameData.curExpl) {
            this.createExpl();
        } else {
            this.restoreLastExpl();
        }

        this.memory.addDataListener(this);
        cc.director.getScheduler().scheduleUpdate(this, 0, false);
        this.lastTime = new Date().getTime();

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
        this.lastTime = new Date().getTime();
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

    restoreLastExpl() {}

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
        let curTime = new Date().getTime();
        if (curTime - this.lastTime > 600) {
            this.lastTime = curTime;
            this.updateCount += 1;
            this.onUpdate();
        }
    }

    onUpdate() {
        if (this.state == ExplState.explore) this.updateExpl();
        else if (this.state == ExplState.battle) this.updateBattle();
        else if (this.state == ExplState.recover) this.updateRecover();

        this.page.handleLog();
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

        this.page.enterState(this.state);
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

        this.battleCtrlr.start();

        this.page.enterState(this.state);
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
        this.page.enterState(this.state);
    }

    // -----------------------------------------------------------------

    executeEscape() {
        this.battleCtrlr.escape();
    }

    executeHide() {
        let cur = !this.memory.gameData.curExpl.hiding;
        this.memory.gameData.curExpl.hiding = cur;
        this.page.setHideActive(cur);
    }
}
