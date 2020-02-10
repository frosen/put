/*
 * PageAct.ts
 * 活动页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import PageActPos from 'pages/page_act_pos/scripts/PageActPos';

@ccclass
export default class PageAct extends PageBase {
    afterPageShow() {
        this.ctrlr.pushPage(PageActPos, false);
    }
}
