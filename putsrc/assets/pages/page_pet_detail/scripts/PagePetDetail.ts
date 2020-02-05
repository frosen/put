/*
 * PagePetDetail.ts
 * 宠物信息页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import PagePetDetailLVD from './PagePetDetailLVD';

@ccclass
export default class PagePetDetail extends PageBase {
    onInit() {
        this.getComponent(PagePetDetailLVD).init(this.ctrlr);
    }
    onPageShow() {
        this.ctrlr.setTitle('宠物详情');
        this.ctrlr.setBackBtnEnabled(true);
        this.ctrlr.clearFuncBtns();
    }
}
