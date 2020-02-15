/*
 * PagePetDetail.ts
 * 宠物信息页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';

@ccclass
export default class PagePetDetail extends PageBase {
    onPageShow() {
        this.ctrlr.setTitle('宠物详情');
        this.ctrlr.setBackBtnEnabled(true);

        this.getComponentInChildren(ListView).resetContent();
    }
}
