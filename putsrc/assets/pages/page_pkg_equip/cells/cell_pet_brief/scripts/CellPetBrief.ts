/*
 * CellPetBrief.ts
 * 精灵名称项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { BioTypeNames, Pet } from '../../../../../scripts/DataSaved';
import { GameDataTool, PetTool } from '../../../../../scripts/Memory';
import { PetModelDict } from '../../../../../configs/PetModelDict';

@ccclass
export class CellPetBrief extends ListViewCell {
    @property(cc.Label)
    petName: cc.Label = null;

    @property(cc.Label)
    state: cc.Label = null;

    setData(pet: Pet) {
        this.petName.string = PetTool.getCnName(pet);

        if (GameDataTool.checkPetWithMaster(this.ctrlr.memory.gameData, pet) === GameDataTool.SUC) {
            this.state.string = `[${BioTypeNames[PetModelDict[pet.id].bioType]}L${pet.lv}]`;
        } else {
            this.state.string = '[未在身边]';
        }
    }
}
