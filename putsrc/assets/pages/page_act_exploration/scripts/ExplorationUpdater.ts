/*
 * ExplorationUpdater.ts
 * 探索更新器
 * luleyan
 */

import PageActExploration from './PageActExploration';
import Battle from './Battle';

enum ExplorationState {
    explore,
    battle,
    recover,
    revive
}

enum ExploreResult {
    none,
    battle
}

export default class ExplorationUpdater {
    page: PageActExploration = null;

    state: ExplorationState = ExplorationState.explore;

    executingTimes: number = 5;

    battle: Battle = null;

    init(page: PageActExploration) {
        this.page = page;
        cc.director.getScheduler().scheduleUpdate(this, 0, false);
        this.restoreData();
    }

    destroy() {
        cc.director.getScheduler().unscheduleUpdate(this);
    }

    restoreData() {}

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
        if (this.state == ExplorationState.explore) this.updateExplore();
        else if (this.state == ExplorationState.battle) this.updateBattle();
    }

    // -----------------------------------------------------------------

    updateExplore() {
        let result = this.getExploreResult();
        if (result == ExploreResult.none) this.updateExploreNone();
        else if (result == ExploreResult.battle) this.updateExploreStartBattle();
    }

    getExploreResult(): ExploreResult {
        if (this.executingTimes > 0) {
            this.executingTimes--;
            return ExploreResult.none;
        } else {
            return ExploreResult.none;
        }
    }

    updateExploreNone() {
        this.page.log('探索中......');
    }

    updateExploreStartBattle() {}

    // -----------------------------------------------------------------

    updateBattle() {}
}
