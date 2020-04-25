/*
 * PagePetDetail.ts
 * 宠物信息页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PagePetDetailLVD from './PagePetDetailLVD';
import { Pet } from 'scripts/DataSaved';
import { Pet2 } from 'scripts/DataOther';

@ccclass
export default class PagePetDetail extends PageBase {
    curPet: Pet = null;

    setData(data: Pet) {
        this.curPet = data;
    }

    onPageShow() {
        this.ctrlr.setTitle('宠物详情');
        this.ctrlr.setBackBtnEnabled(true);

        let lvd = this.getComponent(PagePetDetailLVD);
        lvd.curPet = this.curPet;

        let pet2 = new Pet2();
        pet2.setData(this.curPet);
        lvd.curPet2 = pet2;

        this.getComponentInChildren(ListView).resetContent();
    }
}
