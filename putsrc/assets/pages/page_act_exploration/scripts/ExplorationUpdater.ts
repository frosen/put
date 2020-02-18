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
        this.battleCtrlr.init(this.page, this.memory);

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
    }

    restoreLastExploration() {}

    destroy() {
        this.memory.deleteExploration();
    }

    dataChangedFlag: boolean = false;

    onMemoryDataChanged() {
        if (this.battleCtrlr.checkIfOurTeamChanged()) this.dataChangedFlag = true;
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
    }

    // -----------------------------------------------------------------

    explorationTime: number = 0;

    startExploration() {
        this.explorationTime = 5 + Math.floor(Math.random() * 5);
        this.page.log('开始探索');
    }

    updateExploration() {
        if (this.dataChangedFlag) {
            this.battleCtrlr.resetOurTeam();
            this.page.log('队伍变更');
        } else {
            let result = this.getExplorationResult();
            if (result == ExplorationResult.none) this.exploreNothing();
            else if (result == ExplorationResult.battle) this.startBattle();
        }
    }

    getExplorationResult(): ExplorationResult {
        if (this.explorationTime > 0) {
            this.explorationTime--;
            return ExplorationResult.none;
        } else {
            return ExplorationResult.none;
        }
    }

    exploreNothing() {
        this.page.log('探索中......');
    }

    startBattle() {
        this.battleCtrlr.start();
    }

    // -----------------------------------------------------------------

    updateBattle() {
        this.battleCtrlr.update();
    }
}
