/*
 * CellPet.ts
 * 宠物列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import PagePetDetail from 'pages/page_pet_detail/scripts/PagePetDetail';

@ccclass
export default class CellPet extends ListViewCell {
    @property(cc.Label)
    petNameLbl: cc.Label = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.funcBtn.node.on('click', this.onClickFunc, this);
    }

    setData(name: string) {
        this.petNameLbl.string = name;
    }

    onClick() {
        this.ctrlr.pushPage(PagePetDetail);
    }

    onClickFunc() {
        cc.log('PUT show pet cell func: ', this.petNameLbl.string);
    }
}
