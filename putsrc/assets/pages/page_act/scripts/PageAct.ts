/*
 * PageAct.ts
 * 活动页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from 'scripts/PageBase';
import { PageActPos } from 'pages/page_act_pos/scripts/PageActPos';

@ccclass
export class PageAct extends PageBase {
    afterPageShowAnim() {
        this.ctrlr.pushPage(PageActPos, null, false);
    }
}
