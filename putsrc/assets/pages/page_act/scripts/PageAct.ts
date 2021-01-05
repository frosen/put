/*
 * PageAct.ts
 * 活动页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ExplUpdater } from '../../../scripts/ExplUpdater';
import { PageBase } from '../../../scripts/PageBase';
import { PageActPos } from '../../page_act_pos/scripts/PageActPos';

@ccclass
export class PageAct extends PageBase {
    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const gameData = this.ctrlr.memory.gameData;
        if (gameData.expl && gameData.expl.afb && !ExplUpdater.haveUpdaterInBG()) {
            // 初始化时恢复应有的updater
            const updater = new ExplUpdater();
            updater.init(this.ctrlr, undefined, '', -1);
            ExplUpdater.save(updater);
        }
    }

    afterPageShowAnim() {
        this.ctrlr.pushPage(PageActPos, null, false);
    }
}
