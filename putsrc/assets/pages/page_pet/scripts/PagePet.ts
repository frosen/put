/*
 * PagePet.ts
 * 宠物列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';

@ccclass
export default class PagePet extends PageBase {
    onPageShow() {
        this.ctrlr.setTitle('宠物');
        this.ctrlr.setBackBtnEnabled(false);
        this.ctrlr.clearFuncBtns();
    }
}
