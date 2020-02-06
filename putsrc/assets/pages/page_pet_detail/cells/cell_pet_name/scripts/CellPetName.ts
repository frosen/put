/*
 * CellPetName.ts
 * 宠物名称项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';

@ccclass
export default class CellPetName extends ListViewCell {
    @property(cc.Label)
    petName: cc.Label = null;

    @property(cc.Label)
    masterName: cc.Label = null;

    setData(petName: string, masterName: string) {
        this.petName.string = petName;
        this.masterName.string = '主人：' + masterName;
    }
}
