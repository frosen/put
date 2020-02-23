/*
 * ExplorationUpdater.ts
 * 探索更新器
 * luleyan
 */

import PageActExploration from './PageActExploration';
import { Memory } from 'scripts/Memory';
import BattleController from './BattleController';

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

    init(page: PageActExploration) {
        this.page = page;
        this.memory = this.page.ctrlr.memory;
        this.battleCtrlr = new BattleController();
        this.battleCtrlr.init(this.page, this.memory, () => {
            this.state = ExplorationState.recover;
        });

        this.lastTime = new Date().getTime();

        this.memory.addDataListener(this);

        if (!this.memory.gameData.curExploration) {
            this.createExploration();
        } else {
            this.restoreLastExploration();
        }
    }

    createExploration() {
        this.memory.createExploration();
        this.battleCtrlr.resetOurTeam();
        this.startExploration();
    }

    restoreLastExploration() {}

    destroy() {
        this.memory.deleteExploration();
    }

    petChangedFlag: boolean = false;
    lvChangeFlag: boolean = false;
    eqpChangeFlag: boolean = false;

    onMemoryDataChanged() {
        let { petChange, lvChange, eqpChange } = this.battleCtrlr.checkIfOurTeamChanged();
        if (petChange) this.petChangedFlag = true;
        if (lvChange) this.lvChangeFlag = true;
        if (eqpChange) this.eqpChangeFlag = true;
    }

    lastTime: number = 0;
    updateCount: number = 0;

    update() {
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
        if (this.petChangedFlag || this.lvChangeFlag || this.eqpChangeFlag) {
            this.battleCtrlr.resetOurTeam();
            if (this.petChangedFlag) this.page.log('队伍变更');
            if (this.eqpChangeFlag) this.page.log('装备变更');
            this.petChangedFlag = false;
            this.lvChangeFlag = false;
            this.eqpChangeFlag = false;
            return true;
        }
    }

    explorationTime: number = 0;

    startExploration() {
        this.checkChange();
        this.state = ExplorationState.explore;
        // this.explorationTime = 5 + Math.floor(Math.random() * 5);
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
        let battlePets = this.battleCtrlr.realBattle.selfPets;
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
        if (done) {
            this.startExploration();
        } else {
            this.page.log('休息中');
        }
    }
}
