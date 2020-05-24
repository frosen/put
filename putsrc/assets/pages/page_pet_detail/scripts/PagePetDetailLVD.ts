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
import { Pet, PetStateNames, PetRankNames, BioTypeNames, EleTypeNames, BattleTypeNames, Feature } from 'scripts/DataSaved';
import { Pet2 } from 'scripts/DataOther';
import { PetModel } from 'scripts/DataModel';
import { CellPkgEquip, CellPkgEquipType } from 'pages/page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';
import PagePetDetail from './PagePetDetail';
import CellPkgEquipBlank from 'pages/page_pkg/cells/cell_pkg_equip_blank/scripts/CellPkgEquipBlank';
import { CellSkill } from '../cells/cell_skill/scripts/CellSkill';
import { CellFeature, FeatureGainType } from '../cells/cell_feature/scripts/CellFeature';

const PETNAME = 'p';
const ATTRI2 = '2';
const ATTRI1 = '1';
const TITLE = 't';
const EQUIP = 't';
const BLANK = 'b';
const SKILL = 's';
const FEATURE = 'f';

type DetailCell = CellPetName & CellAttri & CellAttri2 & CellTitle & CellPkgEquip & CellPkgEquipBlank & CellSkill & CellFeature;

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

    @property(cc.Prefab)
    equipPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    equipBlankPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    skillPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    featurePrefab: cc.Prefab = null;

    curPet: Pet = null;
    curPet2: Pet2 = null;
    featureDatas: { feature: Feature; type: FeatureGainType }[] = [];

    page: PagePetDetail = null;

    numberOfRows(listView: ListView): number {
        return 21 + 1 + this.curPet2.skillIds.length + 1 + this.featureDatas.length;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        // 第一组
        if (rowIdx == 0) return 266;
        else if (rowIdx == 1 || rowIdx == 2) return 106;
        else if (rowIdx == 3) return 126;
        // 第二组
        else if (rowIdx == 4) return 66;
        else if (rowIdx == 5) return 106;
        else if (rowIdx == 6) return 126;
        // 第三组
        else if (rowIdx == 7) return 66;
        else if (rowIdx == 8 || rowIdx == 9) return 106;
        else if (rowIdx == 10) return 126;
        // 第四组
        else if (rowIdx == 11) return 66;
        else if (rowIdx == 12) return 106;
        else if (rowIdx == 13) return 126;
        // 第五组
        else if (rowIdx == 14) return 66;
        else if (rowIdx == 15) return 106;
        else if (rowIdx == 16) return 126;
        // 第六组
        else if (rowIdx == 17) return 66;
        else if (rowIdx == 18 || rowIdx == 19) return 160;
        else if (rowIdx == 20) return 180;
        // 第七组
        else if (rowIdx == 21) return 66;
        else if (rowIdx < 21 + this.curPet2.skillIds.length) return 160;
        else if (rowIdx == 21 + this.curPet2.skillIds.length) return 180;
        // 第八组
        else if (rowIdx == 21 + this.curPet2.skillIds.length + 1) return 66;
        else if (rowIdx <= 21 + this.curPet2.skillIds.length + 1 + this.featureDatas.length) return 160;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        // 第一组
        if (rowIdx == 0) return PETNAME;
        else if (rowIdx == 1 || rowIdx == 2) return ATTRI2;
        else if (rowIdx == 3) return ATTRI1;
        // 第二组
        else if (rowIdx == 4) return TITLE;
        else if (rowIdx == 5 || rowIdx == 6) return ATTRI2;
        // 第三组
        else if (rowIdx == 7) return TITLE;
        else if (rowIdx == 8 || rowIdx == 9 || rowIdx == 10) return ATTRI2;
        // 第四组
        else if (rowIdx == 11) return TITLE;
        else if (rowIdx == 12 || rowIdx == 13) return ATTRI2;
        // 第五组
        else if (rowIdx == 14) return TITLE;
        else if (rowIdx == 15 || rowIdx == 16) return ATTRI2;
        // 第六组
        else if (rowIdx == 17) return TITLE;
        else if (rowIdx == 18 || rowIdx == 19 || rowIdx == 20) return this.curPet.equips[rowIdx - 18] ? EQUIP : BLANK;
        // 第七组
        else if (rowIdx == 21) return TITLE;
        else if (rowIdx <= 21 + this.curPet2.skillIds.length) return SKILL;
        // 第八组
        else if (rowIdx == 21 + this.curPet2.skillIds.length + 1) return TITLE;
        else if (rowIdx <= 21 + this.curPet2.skillIds.length + 1 + this.featureDatas.length) return FEATURE;
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
            case EQUIP: {
                let cell = cc.instantiate(this.equipPrefab).getComponent(CellPkgEquip);
                cell.init(CellPkgEquipType.normal);
                cell.clickCallback = this.page.onCellClick.bind(this.page);
                cell.funcBtnCallback = this.page.onCellClickFuncBtn.bind(this.page);
                return cell;
            }
            case BLANK: {
                let cell = cc.instantiate(this.equipBlankPrefab).getComponent(CellPkgEquipBlank);
                cell.clickCallback = this.page.onCellClick.bind(this.page);
                return cell;
            }
            case SKILL: {
                let cell = cc.instantiate(this.skillPrefab).getComponent(CellSkill);
                cell.clickCallback = this.page.onCellClick.bind(this.page);
                return cell;
            }
            case FEATURE: {
                let cell = cc.instantiate(this.featurePrefab).getComponent(CellFeature);
                cell.clickCallback = this.page.onCellClick.bind(this.page);
                return cell;
            }
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: DetailCell) {
        let pet = this.curPet;
        let pet2 = this.curPet2;
        let petModel: PetModel = petModelDict[pet.id];

        // 第一组
        if (rowIdx == 0) {
            cell.setData(petModel.cnName, PetStateNames[pet.state]);
        } else if (rowIdx == 1) {
            cell.setData1('等级', String(pet.lv));
            cell.setData2('品阶', PetRankNames[pet.rank]);
        } else if (rowIdx == 2) {
            cell.setData1('契合度', String(pet.privity) + '%');
            cell.setData2('饮食', '西红柿炒鸡蛋[59min]');
        } else if (rowIdx == 3) {
            let exp: number, expMax: number;
            if (pet.lv >= expModels.length) {
                exp = 0;
                expMax = 0;
            } else {
                exp = pet.exp;
                expMax = expModels[pet.lv];
            }
            cell.setData('当前经验', `${exp} / ${expMax}`, exp / expMax);
        }
        // 第二组
        else if (rowIdx == 4) {
            cell.setData('基础类型');
        } else if (rowIdx == 5) {
            cell.setData1('生物', BioTypeNames[pet2.exBioTypes.getLast() || petModel.bioType]);
            cell.setData2('元素', EleTypeNames[pet2.exEleTypes.getLast() || petModel.eleType]);
        } else if (rowIdx == 6) {
            cell.setData1('战斗', BattleTypeNames[pet2.exBattleTypes.getLast() || petModel.battleType]);
            cell.setData2('速度', String(pet2.speed));
        }
        // 第三组
        else if (rowIdx == 7) {
            cell.setData('一级属性');
        } else if (rowIdx == 8) {
            cell.setData1('力量', (pet2.strength * 0.1).toFixed(1));
            cell.setData2('专注', (pet2.concentration * 0.1).toFixed(1));
        } else if (rowIdx == 9) {
            cell.setData1('耐久', (pet2.durability * 0.1).toFixed(1));
            cell.setData2('灵敏', (pet2.agility * 0.1).toFixed(1));
        } else if (rowIdx == 10) {
            cell.setData1('感知', (pet2.sensitivity * 0.1).toFixed(1));
            cell.setData2('优雅', (pet2.elegant * 0.1).toFixed(1));
        }
        // 第四组
        else if (rowIdx == 11) {
            cell.setData('二级属性');
        } else if (rowIdx == 12) {
            cell.setData1('HP', String(Math.floor(pet2.hpMax * 0.1)));
            cell.setData2('MP', String(pet2.mpMax));
        } else if (rowIdx == 13) {
            cell.setData1('攻击', `${(pet2.atkDmgFrom * 0.1).toFixed(1)} ~ ${(pet2.atkDmgTo * 0.1).toFixed(1)}`);
            cell.setData2('技能', `${(pet2.sklDmgFrom * 0.1).toFixed(1)} ~ ${(pet2.sklDmgTo * 0.1).toFixed(1)}`);
        }
        // 第五组
        else if (rowIdx == 14) {
            cell.setData('身份信息');
        } else if (rowIdx == 15) {
            cell.setData1('主人', pet.master);
            cell.setData2('唯一标识', String(pet.catchIdx));
        } else if (rowIdx == 16) {
            let date = new Date(pet.catchTime);
            let Y = date.getFullYear() % 100,
                m = date.getMonth() + 1,
                d = date.getDate(),
                H = date.getHours(),
                i = date.getMinutes();
            cell.setData1('捕获时间', `${Y}-${m}-${d} ${H}:${i}`);
            cell.setData2('初始实力', 'L' + String(pet.catchLv) + PetRankNames[pet.catchRank]);
        }
        // 第六组
        else if (rowIdx == 17) {
            cell.setData('持有装备');
        } else if (rowIdx <= 20) {
            let equips = this.curPet.equips;
            let equipIndex = rowIdx - 18;
            let equip = equips[equipIndex];
            if (equip) (cell as CellPkgEquip).setData(-1, equip);
        }
        // 第七组
        else if (rowIdx == 21) {
            cell.setData(`宠物技能（${this.curPet2.skillIds.length}）`);
        } else if (rowIdx <= 21 + this.curPet2.skillIds.length) {
            let skillId = this.curPet2.skillIds[rowIdx - 22];
            cell.setData(skillId);
        }
        // 第八组
        else if (rowIdx == 21 + this.curPet2.skillIds.length + 1) {
            cell.setData(`宠物特性（${this.featureDatas.length}）`);
        } else if (rowIdx <= 21 + this.curPet2.skillIds.length + 1 + this.featureDatas.length) {
            let featureData = this.featureDatas[rowIdx - 21 - this.curPet2.skillIds.length - 1 - 1];
            cell.setData(featureData.feature, featureData.type);
        }
    }
}
