/*
 * PagePetDetailLVD.ts
 * 宠物信息页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import CellAttri from 'pubcells/cell_attri/scripts/CellAttri';
import CellAttri2 from 'pubcells/cell_attri2/scripts/CellAttri2';
import CellPetName from '../cells/cell_pet_name/scripts/CellPetName';
import CellTitle from 'pubcells/cell_title/scripts/CellTitle';
import { petModelDict } from 'configs/PetModelDict';
import { expModels } from 'configs/ExpModels';
import { Pet, PetStateNames, PetRankNames, BioTypeNames, EleTypeNames, BattleTypeNames } from 'scripts/DataSaved';
import { Pet2 } from 'scripts/DataOther';
import { PetModel } from 'scripts/DataModel';

@ccclass
export default class PagePetDetailLVD extends ListViewDelegate {
    @property(cc.Prefab)
    attriPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    attri2Prefab: cc.Prefab = null;

    @property(cc.Prefab)
    petNamePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    titlePrefab: cc.Prefab = null;

    curPet: Pet = null;
    curPet2: Pet2 = null;

    numberOfRows(listView: ListView): number {
        return 16;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        switch (rowIdx) {
            case 0:
                return 206;
            case 1:
            case 2:
                return 106;
            case 3:
                return 126;
            case 4:
                return 66;
            case 5:
                return 106;
            case 6:
                return 126;
            case 7:
                return 66;
            case 8:
            case 9:
                return 106;
            case 10:
                return 126;
            case 11:
                return 66;
            case 12:
                return 106;
            case 13:
                return 126;
            case 14:
                return 66;
            case 15:
                return 106;
        }
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        switch (rowIdx) {
            case 0:
                return 'petName';
            case 1:
            case 2:
                return 'attri2';
            case 3:
                return 'attri';
            case 4:
                return 'title';
            case 5:
            case 6:
                return 'attri2';
            case 7:
                return 'title';
            case 8:
            case 9:
            case 10:
                return 'attri2';
            case 11:
                return 'title';
            case 12:
            case 13:
                return 'attri2';
            case 14:
                return 'title';
            case 15:
                return 'attri2';
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case 'petName':
                return cc.instantiate(this.petNamePrefab).getComponent(ListViewCell);
            case 'attri':
                return cc.instantiate(this.attriPrefab).getComponent(ListViewCell);
            case 'attri2':
                return cc.instantiate(this.attri2Prefab).getComponent(ListViewCell);
            case 'title':
                return cc.instantiate(this.titlePrefab).getComponent(ListViewCell);
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPetName & CellAttri & CellAttri2 & CellTitle) {
        let pet = this.curPet;
        let petModel: PetModel = petModelDict[pet.id];

        switch (rowIdx) {
            case 0:
                cell.setData(petModel.cnName, PetStateNames[pet.state]);
                break;
            case 1:
                cell.setData1('等级', String(pet.lv));
                cell.setData2('品阶', PetRankNames[pet.rank]);
                break;
            case 2:
                cell.setData1('默契值', String(pet.privity));
                cell.setData2('学习值', 'Me');
                break;
            case 3:
                {
                    let exp, expMax;
                    if (pet.lv >= expModels.length) {
                        exp = 0;
                        expMax = 0;
                    } else {
                        exp = pet.exp;
                        expMax = expModels[pet.lv];
                    }
                    cell.setData('当前经验', `${exp} / ${expMax}`, exp / expMax);
                }
                break;
            case 4:
                cell.setData('基础类型');
                break;
            case 5:
                cell.setData1('生物类型', BioTypeNames[this.curPet2.exBioTypes.getLast() || petModel.bioType]);
                cell.setData2('元素类型', EleTypeNames[this.curPet2.exEleTypes.getLast() || petModel.eleType]);
                break;
            case 6:
                cell.setData1('战斗类型', BattleTypeNames[this.curPet2.exBattleTypes.getLast() || petModel.battleType]);
                cell.setData2('速度', String(this.curPet2.speed));
                break;
            case 7:
                cell.setData('一级属性');
                break;
            case 8:
                cell.setData1('强壮', String((this.curPet2.strength * 0.1).toFixed(1)));
                cell.setData2('专注', String((this.curPet2.concentration * 0.1).toFixed(1)));
                break;
            case 9:
                cell.setData1('耐久', String((this.curPet2.durability * 0.1).toFixed(1)));
                cell.setData2('灵敏', String((this.curPet2.agility * 0.1).toFixed(1)));
                break;
            case 10:
                cell.setData1('细腻', String((this.curPet2.sensitivity * 0.1).toFixed(1)));
                cell.setData2('优雅', String((this.curPet2.elegant * 0.1).toFixed(1)));
                break;
            case 11:
                cell.setData('二级属性');
                break;
            case 12:
                cell.setData1('HP', String(Math.floor(this.curPet2.hpMax * 0.1)));
                cell.setData2('MP', String(this.curPet2.mpMax));
                break;
            case 13:
                cell.setData1(
                    '攻击伤害',
                    `${(this.curPet2.atkDmgFrom * 0.1).toFixed(1)} ~ ${(this.curPet2.atkDmgTo * 0.1).toFixed(1)}`
                );
                cell.setData2(
                    '技能伤害',
                    `${(this.curPet2.sklDmgFrom * 0.1).toFixed(1)} ~ ${(this.curPet2.sklDmgTo * 0.1).toFixed(1)}`
                );
                break;
            case 14:
                cell.setData('宠物特性');
                break;
            case 15:
                cell.setData1('攻击伤害', 'aaa');
                cell.setData2('技能伤害', 'Me');
                break;
        }
    }
}
