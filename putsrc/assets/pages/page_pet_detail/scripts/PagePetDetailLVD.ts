/*
 * PagePetDetailLVD.ts
 * 宠物信息页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import CellAttri from '../cells/cell_attri/scripts/CellAttri';
import CellAttri2 from '../cells/cell_attri2/scripts/CellAttri2';
import CellPetName from '../cells/cell_pet_name/scripts/CellPetName';
import CellTitle from '../cells/cell_title/scripts/CellTitle';
import { petModelDict } from 'configs/PetModelDict';
import { expModels } from 'configs/ExpModels';
import { Pet, PetStateNames, PetRankNames, BioTypeNames, EleTypeNames, BattleTypeNames } from 'scripts/DataSaved';
import { Pet2 } from 'scripts/DataOther';
import { PetModel } from 'scripts/DataModel';

const PNAME = 'p';
const ATTR2 = '2';
const ATTR1 = '1';
const TITLE = 't';

let CellList = [
    { id: PNAME, h: 266 },
    { id: ATTR2, h: 106 },
    { id: ATTR2, h: 106 },
    { id: ATTR1, h: 126 },

    { id: TITLE, h: 66 },
    { id: ATTR2, h: 106 },
    { id: ATTR2, h: 126 },

    { id: TITLE, h: 66 },
    { id: ATTR2, h: 10 },
    { id: ATTR2, h: 106 },
    { id: ATTR2, h: 126 },

    { id: TITLE, h: 66 },
    { id: ATTR2, h: 106 },
    { id: ATTR2, h: 126 },

    { id: TITLE, h: 66 },
    { id: ATTR2, h: 106 }
];

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
                return 226;
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
                106;
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
                return PETNAME;
            case 1:
                ATTRI2;
            case 2:
                return ATTRI2;
            case 3:
                return ATTRI1;
            case 4:
                return TITLE;
            case 5:
                ATTRI2;
            case 6:
                return ATTRI2;
            case 7:
                return TITLE;
            case 8:
                ATTRI2;
            case 9:
                ATTRI2;
            case 10:
                return ATTRI2;
            case 11:
                return TITLE;
            case 12:
                ATTRI2;
            case 13:
                return ATTRI2;
            case 14:
                return TITLE;
            case 15:
                return ATTRI2;
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case PETNAME:
                return cc.instantiate(this.petNamePrefab).getComponent(ListViewCell);
            case ATTRI1:
                return cc.instantiate(this.attriPrefab).getComponent(ListViewCell);
            case ATTRI2:
                return cc.instantiate(this.attri2Prefab).getComponent(ListViewCell);
            case TITLE:
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
                cell.setData1('契合度', String(pet.privity) + '%');
                cell.setData2('饮食', '西红柿炒鸡蛋[59min]');
                break;
            case 3: {
                let exp, expMax;
                if (pet.lv >= expModels.length) {
                    exp = 0;
                    expMax = 0;
                } else {
                    exp = pet.exp;
                    expMax = expModels[pet.lv];
                }
                cell.setData('当前经验', `${exp} / ${expMax}`, exp / expMax);
                break;
            }
            case 4:
                cell.setData('基础类型');
                break;
            case 5:
                cell.setData1('生物', BioTypeNames[this.curPet2.exBioTypes.getLast() || petModel.bioType]);
                cell.setData2('元素', EleTypeNames[this.curPet2.exEleTypes.getLast() || petModel.eleType]);
                break;
            case 6:
                cell.setData1('战斗', BattleTypeNames[this.curPet2.exBattleTypes.getLast() || petModel.battleType]);
                cell.setData2('速度', String(this.curPet2.speed));
                break;
            case 7:
                cell.setData('一级属性');
                break;
            case 8:
                cell.setData1('力量', (this.curPet2.strength * 0.1).toFixed(1));
                cell.setData2('专注', (this.curPet2.concentration * 0.1).toFixed(1));
                break;
            case 9:
                cell.setData1('耐久', (this.curPet2.durability * 0.1).toFixed(1));
                cell.setData2('灵敏', (this.curPet2.agility * 0.1).toFixed(1));
                break;
            case 10:
                cell.setData1('感知', (this.curPet2.sensitivity * 0.1).toFixed(1));
                cell.setData2('优雅', (this.curPet2.elegant * 0.1).toFixed(1));
                break;
            case 11:
                cell.setData('二级属性');
                break;
            case 12:
                cell.setData1('HP', String(Math.floor(this.curPet2.hpMax * 0.1)));
                cell.setData2('MP', String(this.curPet2.mpMax));
                break;
            case 13: {
                let atkFrom = (this.curPet2.atkDmgFrom * 0.1).toFixed(1);
                let atkTo = (this.curPet2.atkDmgTo * 0.1).toFixed(1);
                let sklFrom = (this.curPet2.sklDmgFrom * 0.1).toFixed(1);
                let sklTo = (this.curPet2.sklDmgTo * 0.1).toFixed(1);
                cell.setData1('攻击', `${atkFrom} ~ ${atkTo}`);
                cell.setData2('技能', `${sklFrom} ~ ${sklTo}`);
                break;
            }
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
