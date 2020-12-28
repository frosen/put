/*
 * EnemyDetail.ts
 * enemy细节
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PetModelDict } from '../../../configs/PetModelDict';
import { BattlePet } from '../../../scripts/DataOther';
import { BattleTypeNames, BioTypeNames, EleTypeNames } from '../../../scripts/DataSaved';
import { PetTool } from '../../../scripts/Memory';
import { petAttrNumStr } from '../../page_pet_detail/scripts/PagePetDetailLVD';

@ccclass
export class EnemyDetail extends cc.Component {
    @property(cc.Label)
    petName: cc.Label = null;

    @property(cc.Label)
    petType: cc.Label = null;

    @property(cc.Label)
    str: cc.Label = null;

    @property(cc.Label)
    conc: cc.Label = null;

    @property(cc.Label)
    dura: cc.Label = null;

    @property(cc.Label)
    agi: cc.Label = null;

    @property(cc.Label)
    sens: cc.Label = null;

    @property(cc.Label)
    eleg: cc.Label = null;

    @property(cc.Label)
    sklTtl: cc.Label = null;

    @property(cc.Label)
    featureTtl: cc.Label = null;

    @property(cc.Layout)
    sklLayout: cc.Label = null;

    @property(cc.Layout)
    featureLayout: cc.Label = null;

    show() {
        this.node.stopAllActions();
        cc.tween(this.node).to(0.2, { opacity: 255 }).start();
    }

    hide(immediately: boolean = false) {
        this.node.stopAllActions();
        if (immediately) this.node.opacity = 0;
        else cc.tween(this.node).to(0.2, { opacity: 0 }).start();
    }

    setData(bPet: BattlePet) {
        const pet = bPet.pet;
        const petModel = PetModelDict[pet.id];
        const pet2 = bPet.pet2;

        this.petName.string = PetTool.getCnName(pet, true);

        const bioName = BioTypeNames[pet2.exBioTypes.getLast() || petModel.bioType];
        const eleName = EleTypeNames[pet2.exEleTypes.getLast() || petModel.eleType];
        const btlName = BattleTypeNames[pet2.exBattleTypes.getLast() || petModel.battleType];
        let speedName: String | undefined;
        if (pet2.speed >= 80) speedName = '飞快';
        else if (pet2.speed >= 60) speedName = '快速';
        else if (pet2.speed >= 40) speedName = '中速';
        else if (pet2.speed >= 20) speedName = '慢速';
        else speedName = '极慢';

        this.petType.string = `${bioName} ${eleName} ${btlName} ${speedName}`;

        this.str.string = petAttrNumStr(pet2.strength);
        this.conc.string = petAttrNumStr(pet2.concentration);
        this.dura.string = petAttrNumStr(pet2.durability);
        this.agi.string = petAttrNumStr(pet2.agility);
        this.sens.string = petAttrNumStr(pet2.sensitivity);
        this.eleg.string = petAttrNumStr(pet2.elegant);

        this.sklTtl.string = `战斗招式（${pet2.skillIds.length}）`;
        this.featureTtl.string = `精灵特性（${pet.inbFeatures.length + pet.lndFeatures.length}）`;
    }
}
