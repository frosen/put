/*
 * PageMap.ts
 * 活动页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ExplUpdater } from '../../../scripts/ExplUpdater';
import { PageBase } from '../../../scripts/PageBase';
import { PageAct } from '../../page_act/scripts/PageAct';

@ccclass
export class PageMap extends PageBase {
    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        // 初始化时恢复应有的updater
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.expl && gameData.expl.afb && !ExplUpdater.haveUpdaterInBG()) {
            const updater = new ExplUpdater();
            updater.init(this.ctrlr, undefined, '', -1);
            ExplUpdater.save(updater);
        }
    }

    afterPageShowAnim() {
        this.ctrlr.pushPage(PageAct, { posId: this.ctrlr.memory.gameData.curPosId }, false);
    }
}
