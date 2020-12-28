/*
 * EnemyDetail.ts
 * enemy细节
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PetModelDict } from '../../../configs/PetModelDict';
import { FeatureModelDict } from '../../../configs/FeatureModelDict';

import { BattlePet } from '../../../scripts/DataOther';
import { BattleTypeNames, BioTypeNames, EleColors, EleTypeNames, Feature, Pet } from '../../../scripts/DataSaved';
import { PetTool } from '../../../scripts/Memory';
import { petAttrNumStr } from '../../page_pet_detail/scripts/PagePetDetailLVD';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { SkillModelDict } from '../../../configs/SkillModelDict';
import { SkillType } from '../../../scripts/DataModel';

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
    featureLayout1: cc.Label = null;

    @property(cc.Layout)
    featureLayout2: cc.Label = null;

    @property(cc.Prefab)
    infoNodePrefab: cc.Prefab = null;

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
        this.featureTtl.string = `精灵特性（${pet.inbFeatures.length}）`;

        for (let index = 0; index < 2; index++) {
            this.setSklInfoNode(index, pet2.skillIds[index]);
        }

        let featureCnt = 0;
        for (const feature of pet.inbFeatures) {
            this.setFeatureInfoNode(featureCnt, feature, pet);
            featureCnt++;
        }

        for (let index = featureCnt; index < 8; index++) {
            this.setFeatureInfoNode(index);
        }
    }

    setSklInfoNode(idx: number, skillId?: string) {
        if (skillId) {
            const infoNode = this.sklLayout.node.children[idx]!;
            infoNode.opacity = 255;
            const skillModel = SkillModelDict[skillId];
            infoNode.color = EleColors[skillModel.eleType];
            const lbl = infoNode.children[0].getComponent(cc.Label);
            const typeStr = skillModel.skillType === SkillType.ultimate ? '绝・' : '招・';
            lbl.string = typeStr + skillModel.cnName;
            ListViewCell.rerenderLbl(lbl);
            infoNode.getComponent(cc.Layout).updateLayout();
        } else {
            this.sklLayout.node.children[idx]!.opacity = 0;
        }
    }

    setFeatureInfoNode(idx: number, feature?: Feature, pet?: Pet) {
        let infoNode: cc.Node | undefined;
        if (idx < 4) {
            infoNode = this.featureLayout1.node.children[idx];
            if (!infoNode) {
                infoNode = cc.instantiate(this.infoNodePrefab);
                infoNode.parent = this.featureLayout1.node;
            }
        } else {
            infoNode = this.featureLayout2.node.children[idx - 4];
            if (!infoNode) {
                infoNode = cc.instantiate(this.infoNodePrefab);
                infoNode.parent = this.featureLayout2.node;
            }
        }

        if (feature) {
            infoNode.opacity = 255;
            const name = FeatureModelDict[feature.id].cnBrief + String(feature.lv);
            const color = pet.exFeatureIds.includes(feature.id) ? cc.Color.RED : cc.Color.BLUE;
            infoNode!.color = color;
            const lbl = infoNode!.children[0].getComponent(cc.Label);
            lbl.string = name;
            ListViewCell.rerenderLbl(lbl);
            infoNode!.getComponent(cc.Layout).updateLayout();
        } else {
            infoNode.opacity = 0;
        }
    }
}
