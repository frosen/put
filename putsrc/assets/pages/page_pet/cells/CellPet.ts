/*
 * CellPet.ts
 * 宠物列表中的项目
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;

import ListViewCell from '../../../scripts/ListViewCell';

@ccclass
@executeInEditMode
export default class CellPet extends ListViewCell {
    @property(cc.Label)
    petNameLbl: cc.Label = null;

    setData(name: string) {
        this.petNameLbl.string = name;
    }

    onClick() {
        cc.log('^_^! name: ', this.petNameLbl.string);
    }
}
