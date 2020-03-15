/*
 * ExplorationUpdater.ts
 * 探索更新器
 * luleyan
 */

import PageActExploration from './PageActExploration';
import { Memory } from 'scripts/Memory';
import { BattleController } from './BattleController';
import { random } from 'scripts/Random';

enum ExplorationState {
    none,
    explore,
    battle,
    recover
}

enum ExplorationResult {
    none,
    battle
}

export default class ExplorationUpdater {
    page: PageActExploration = null;
    memory: Memory = null;
    battleCtrlr: BattleController = null;

    state: ExplorationState = ExplorationState.none;

    _id: string = 'idforupdater';

    pausing: boolean = false;

    init(page: PageActExploration) {
        this.page = page;
        this.memory = this.page.ctrlr.memory;
        this.battleCtrlr = new BattleController();
        this.battleCtrlr.init(this.page, this.memory, () => {
            this.state = ExplorationState.recover;
        });

        if (!this.memory.gameData.curExploration) {
            this.createExploration();
        } else {
            this.restoreLastExploration();
        }

        this.memory.addDataListener(this);
        cc.director.getScheduler().scheduleUpdate(this, 0, false);
        this.lastTime = new Date().getTime();

        this.page.ctrlr.debugTool.setShortCut('ww', () => {
            this.pausing = !this.pausing;
            if (this.pausing) cc.log('PUT 暂停探索更新');
            else cc.log('PUT 重新开始探索更新');
        });

        this.page.ctrlr.debugTool.setShortCut('gg', () => {
            if (!this.pausing) {
                cc.log('PUT 暂停期间才可以使用下一步功能');
                return;
            }

            cc.log('PUT 下一步');
            this.lastTime = new Date().getTime();
            this.updateCount += 1;
            this.onUpdate();
        });
    }

    createExploration() {
        this.memory.createExploration();
        this.startExploration();
    }

    restoreLastExploration() {}

    destroy() {
        cc.director.getScheduler().unscheduleUpdate(this);
        this.memory.deleteExploration();
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
        if (this.state == ExplorationState.explore) this.updateExploration();
        else if (this.state == ExplorationState.battle) this.updateBattle();
        else if (this.state == ExplorationState.recover) this.updateRecover();
    }

    // -----------------------------------------------------------------

    checkChange(): boolean {
        if (this.selfPetsChangedFlag) {
            this.battleCtrlr.resetSelfTeam();
            this.selfPetsChangedFlag = false;
            return true;
        }
    }

    explorationTime: number = 0;

    startExploration() {
        this.battleCtrlr.resetSelfTeam();
        this.selfPetsChangedFlag = false;

        this.state = ExplorationState.explore;
        // this.explorationTime = 5 + random(5);
        this.explorationTime = 2; // llytest
        this.page.log('开始探索');
    }

    updateExploration() {
        let change = this.checkChange();
        if (change) return;
        let result = this.getExplorationResult();
        if (result == ExplorationResult.none) this.exploreNothing();
        else if (result == ExplorationResult.battle) this.startBattle();
    }

    getExplorationResult(): ExplorationResult {
        if (this.explorationTime > 0) {
            this.explorationTime--;
            return ExplorationResult.none;
        } else {
            return ExplorationResult.battle;
        }
    }

    exploreNothing() {
        this.page.log('探索中......');
    }

    startBattle() {
        this.state = ExplorationState.battle;
        this.battleCtrlr.start();
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
            this.page.resetCenterBar(selfTeam.mp, selfTeam.mpMax, selfTeam.rage);
        }

        if (done) {
            this.startExploration();
        } else {
            this.page.log('休息中');
        }
    }
}
