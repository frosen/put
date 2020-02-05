/*
 * CellPet.ts
 * 宠物列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import PagePetDetail from 'pages/page_pet_detail/scripts/PagePetDetail';
import { BaseController } from 'scripts/BaseController';

@ccclass
export default class CellPet extends ListViewCell {
    @property(cc.Label)
    petNameLbl: cc.Label = null;

    setData(name: string) {
        this.petNameLbl.string = name;
    }

    onClickBtn() {
        let baseCtrlr = cc.director.getScene().getComponentInChildren(BaseController);
        baseCtrlr.pushPage(PagePetDetail);
    }
}
