/*
 * CellCatch.ts
 * 宠物捕捉列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { PetRankNames, PetModel, Pet, BioType } from 'scripts/Memory';
import * as petModelDict from 'configs/PetModelDict';
import CellPet from 'pages/page_pet/cells/cell_pet/scripts/CellPet';
import { BattlePet } from 'pages/page_act_expl/scripts/BattleController';
import PageActExplCatch from 'pages/page_act_expl_catch/scripts/PageActExplCatch';

@ccclass
export default class CellCatch extends ListViewCell {
    @property(cc.Label)
    petNameLbl: cc.Label = null;

    @property(cc.Label)
    subLbl: cc.Label = null;

    @property(cc.Sprite)
    petSp: cc.Sprite = null;

    @property(cc.Label)
    featureLbl: cc.Label = null;

    page: PageActExplCatch = null;

    petIndex: number = -1;
    pet: Pet = null;

    setData(index: number, battlePet: BattlePet) {
        this.petIndex = index;
        let pet = battlePet.pet;
        this.pet = pet;
        let petModel: PetModel = petModelDict[pet.id];
        this.petNameLbl.string = petModel.cnName;
        this.subLbl.string = `等级：${pet.lv}   品阶：${PetRankNames[pet.rank]}`;
        this.featureLbl.string = `天赋特性 x ${pet.raFeatures.length}`;
        this.petSp.node.color = CellPet.getPetHeadUI(petModel).color;
    }

    onClick() {
        let petModel: PetModel = petModelDict[this.pet.id];
        let bioType = petModel.bioType;
        if (bioType == BioType.human) {
            this.ctrlr.popToast('人形生物无法被捕捉');
            return;
        }

        if (bioType == BioType.unknown) {
            this.ctrlr.popToast('未知类型生物无法被捕捉');
            return;
        }

        if (this.pet.master) {
            this.ctrlr.popToast('拥有主人的宠物无法被捕捉');
            return;
        }

        this.page.setCatchPetIndex(this.petIndex);
    }
}
