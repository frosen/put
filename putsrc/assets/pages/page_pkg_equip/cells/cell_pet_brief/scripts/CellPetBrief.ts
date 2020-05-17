/*
 * CellPetBrief.ts
 * 宠物名称项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { PetState, PetStateNames } from 'scripts/DataSaved';

@ccclass
export default class CellPetBrief extends ListViewCell {
    @property(cc.Label)
    petName: cc.Label = null;

    @property(cc.Label)
    state: cc.Label = null;

    setData(petName: string, state: PetState) {
        this.petName.string = petName;
        this.state.string = `[${PetStateNames[state]}]`;
    }
}
