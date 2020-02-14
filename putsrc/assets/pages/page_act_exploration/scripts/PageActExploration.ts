/*
 * PageActExploration.ts
 * 探索页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import PageBase from 'scripts/PageBase';
import ExplorationUpdater from './ExplorationUpdater';

const BattleUnitYs = [-60, -220, -380, -540, -700];

@ccclass
export default class PageActExploration extends PageBase {
    updater: ExplorationUpdater = null;

    onInit() {
        this.updater = new ExplorationUpdater();
        this.updater.init(this);
    }

    onDestroy() {
        if (!CC_EDITOR) this.updater.destroy();
    }

    onPageShow() {
        this.ctrlr.setBackBtnEnabled(true);
        this.ctrlr.setTitle('探索');
    }

    log(str: string) {}
}
