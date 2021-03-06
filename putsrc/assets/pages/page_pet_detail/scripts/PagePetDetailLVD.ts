/*
 * PagePetDetailLVD.ts
 * 精灵信息页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { CellAttri } from '../cells/cell_attri/scripts/CellAttri';
import { CellAttri2 } from '../cells/cell_attri2/scripts/CellAttri2';
import { CellPetName } from '../cells/cell_pet_name/scripts/CellPetName';
import { CellTitle } from '../cells/cell_title/scripts/CellTitle';
import { PetModelDict } from '../../../configs/PetModelDict';
import { ExpModels } from '../../../configs/ExpModels';
import { Pet, BioTypeNames, EleTypeNames, BtlTypeNames, Feature } from '../../../scripts/DataSaved';
import { Pet2 } from '../../../scripts/DataOther';
import { PetModel } from '../../../scripts/DataModel';
import { CellPkgEquip } from '../../page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';
import { PagePetDetail } from './PagePetDetail';
import { CellPkgEquipBlank } from '../../page_pkg/cells/cell_pkg_equip_blank/scripts/CellPkgEquipBlank';
import { CellSkill } from '../cells/cell_skill/scripts/CellSkill';
import { CellFeature, FeatureGainType } from '../cells/cell_feature/scripts/CellFeature';
import { PetTool } from '../../../scripts/Memory';
import { DrinkModelDict } from '../../../configs/DrinkModelDict';
import { CellMerge } from '../cells/cell_merge/scripts/CellMerge';

const STATE_TIP = `分为：
   备战中 准备参与战斗
   休息中 不参与战斗
   是否参战可在精灵列表中点击状态按钮修改`;

const LV_TIP = `提高等级可以：
 - 提高基础属性
 - 从<color=#ffcb32>11级</c>开始每<color=#ffcb32>3级</c>随机获取一个特性
 - <color=#ffcb32>10级</c>和<color=#ffcb32>30级</c>时可分别学会一个招式
 - 战斗时攻守双方等级差影响命中率`;
const MERGE_LV_TIP = `将其他精灵的能力融合给当前精灵的次数
从<color=#ffcb32>15级</c>开始每<color=#ffcb32>5级</c>可获得一次融合的机会
融合操作在“精灵融合堂”进行`;
const PRVTY_TIP = `数值<color=#ffcb32>0-100</c>随时间自行提高\n数字越大上升越慢\n可提高暴击率，暴击伤害，命中，闪躲`;
const DRINK_TIP = `使用道具中的“饮品”获得
可以在一定时间内提升获得某种效果
效果大致分成两种：
 - 提升某种资源的获取效率
 - 提升某项战力`;

const BIO_TIP = '分为：\n - 人形生物\n - 魔法生物\n - 机械生物\n - 自然生物\n - 未知生物';
const ELE_TIP = `分为：
 - <color=#c83232>火</c> 克<color=#32c832>空</c>
 - <color=#3232c8>水</c> 克<color=#c83232>火</c>
 - <color=#32c832>空</c> 克<color=#be641e>地</c>
 - <color=#be641e>地</c> 克<color=#3232c8>水</c>
 - <color=#efaa32>光</c> 克<color=#b94eff>暗</c>
 - <color=#b94eff>暗</c> 克光以外一切
对属性克制精灵造成<color=#ffcb32>15%</c>的额外伤害
使用同属性招式灵能消耗减少<color=#ffcb32>10%</c>，伤害增加<color=#ffcb32>5%</c>`;

const BATTLE_TIP = `分为：
 - 近战 攻击正前面的目标
 - 射击 随机攻击任一目标
 - 突袭 攻击排在第一位的目标
 - 刺杀 攻击HP最低的目标
 - 连段 攻击上个己方攻击的目标
 - 停止 不做任何动作
 - 混乱 随机攻击敌人，队友或自己
使用同战斗类型招式时，灵能消耗减少<color=#ffcb32>10%</c>
主动设置目标时，不同战斗类型可设置的范围不同`;
const SPEED_TIP = '数值<color=#ffcb32>1-100</c>，数字越大行动次序越靠前';

const STR_TIP = '每1点力量增加1点物理伤害';
const CON_TIP = '每1点专注增加1点招式强度\n每30点增加1点灵能上限';
const DUN_TIP = '每1点耐久增加25点血量上限';
const AGI_TIP = '影响暴击率和闪躲率\n影响偷袭效果\n数据最高者影响潜行效率和探索移动速度';
const SEN_TIP = '影响制作物品成功的几率\n数据最高者影响察觉宝藏的几率';
const ELG_TIP = '队伍中数据最高者影响声望上升速度和捕捉精灵的几率';

const HP_TIP = '用于战斗\n降低到<color=#ffcb32>0</c>则无法继续作战\n全部精灵降低至<color=#ffcb32>0</c>则战斗失败';
const MP_TIP = '用于战斗\n所有精灵共用一个灵能池，数值为所有精灵灵能之和\n施放招式消耗灵能\n普攻可少量恢复灵能';

const ATK_TIP = '影响普攻伤害量\n影响招式伤害量（在招式强度乘以系数基础上，额外增加1倍攻击强度）';
const SKL_TIP = '影响招式伤害量（招式强度乘以招式系数）';

const EQUIP_TIP = '?';

const SKILL_TIP = '?';

const FEATURE_TIP = `分为：
 - 天赋特性 每种精灵的固有特性
 - 专精特性 天赋特性中天生强化的特性
 - 习得特性 通过其他方式获取，数量不限
 
任何特性都可以通过提升等级增强效果
精灵从<color=#ffcb32>11级</c>开始每<color=#ffcb32>3级</c>随机升级天赋特性`;

const MERGE_TIP = '?';

export function petAttrNumStr(n: number): string {
    return (n * 0.1).toFixed(1);
}

function getAttriTip(attri: number, attriOri: number, tip: string): string {
    const strO = petAttrNumStr(attriOri);
    const strD = petAttrNumStr(attri - attriOri);
    return `基础值 <color=#ffcb32>${strO}</c>\n装备特性加成 <color=#ffcb32>${strD}</c>\n\n<color=#d0d0d0>${tip}</c>`;
}

const PETNAME = 'p';
const ATTRI2 = '2';
const ATTRI1 = '1';
const TITLE = 't';
const EQUIP = 'e';
const EQPBLANK = 'eb';
const SKILL = 's';
const FEATURE = 'f';
const MERGE = 'm';
const BLANK = 'b';

type DetailCell = CellPetName &
    CellAttri &
    CellAttri2 &
    CellTitle &
    CellPkgEquip &
    CellPkgEquipBlank &
    CellSkill &
    CellFeature &
    CellMerge;

@ccclass
export class PagePetDetailLVD extends ListViewDelegate {
    @property(cc.Prefab)
    attriPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    attri2Prefab: cc.Prefab = null!;

    @property(cc.Prefab)
    petNamePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    titlePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    equipPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    equipBlankPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    skillPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    featurePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    mergePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    blankPrefab: cc.Prefab = null!;

    curPet!: Pet;
    curPet2!: Pet2;
    featureDatas: { feature: Feature; type: FeatureGainType }[] = [];

    page!: PagePetDetail;

    skillLen: number = 0;
    featureLen: number = 0;
    mergeLen: number = 0;

    numberOfRows(listView: ListView): number {
        this.skillLen = this.curPet2.skillIds.length;
        this.featureLen = this.featureDatas.length;
        this.mergeLen = this.curPet.merges.length;
        return 21 + 1 + this.skillLen + 1 + this.featureLen + 1 + this.mergeLen + 1;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        // 第一组
        if (rowIdx === 0) return 294;
        else if (rowIdx === 1 || rowIdx === 2) return 104;
        else if (rowIdx === 3) return 126;
        // 第二组
        else if (rowIdx === 4) return 64;
        else if (rowIdx === 5) return 104;
        else if (rowIdx === 6) return 126;
        // 第三组
        else if (rowIdx === 7) return 64;
        else if (rowIdx === 8 || rowIdx === 9) return 104;
        else if (rowIdx === 10) return 126;
        // 第四组
        else if (rowIdx === 11) return 64;
        else if (rowIdx === 12) return 104;
        else if (rowIdx === 13) return 126;
        // 第五组
        else if (rowIdx === 14) return 64;
        else if (rowIdx === 15) return 104;
        else if (rowIdx === 16) return 126;
        // 第六组
        else if (rowIdx === 17) return 64;
        else if (rowIdx === 18 || rowIdx === 19) return 160;
        else if (rowIdx === 20) return 182;
        // 第七组
        else if (rowIdx === 21) return 64;
        else if (rowIdx < 21 + this.skillLen) return 160;
        else if (rowIdx === 21 + this.skillLen) return 182;
        // 第八组
        else if (rowIdx === 21 + this.skillLen + 1) return 64;
        else if (rowIdx < 21 + this.skillLen + 1 + this.featureLen) return 160;
        else if (rowIdx === 21 + this.skillLen + 1 + this.featureLen) return 182;
        // 第九组
        else if (rowIdx === 21 + this.skillLen + 1 + this.featureLen + 1) return 64;
        else if (rowIdx <= 21 + this.skillLen + 1 + this.featureLen + 1 + this.mergeLen) return 104;
        else return 160;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        // 第一组
        if (rowIdx === 0) return PETNAME;
        else if (rowIdx === 1 || rowIdx === 2) return ATTRI2;
        else if (rowIdx === 3) return ATTRI1;
        // 第二组
        else if (rowIdx === 4) return TITLE;
        else if (rowIdx === 5 || rowIdx === 6) return ATTRI2;
        // 第三组
        else if (rowIdx === 7) return TITLE;
        else if (rowIdx === 8 || rowIdx === 9 || rowIdx === 10) return ATTRI2;
        // 第四组
        else if (rowIdx === 11) return TITLE;
        else if (rowIdx === 12 || rowIdx === 13) return ATTRI2;
        // 第五组
        else if (rowIdx === 14) return TITLE;
        else if (rowIdx === 15 || rowIdx === 16) return ATTRI2;
        // 第六组
        else if (rowIdx === 17) return TITLE;
        else if (rowIdx === 18 || rowIdx === 19 || rowIdx === 20) return this.curPet.equips[rowIdx - 18] ? EQUIP : EQPBLANK;
        // 第七组
        else if (rowIdx === 21) return TITLE;
        else if (rowIdx <= 21 + this.skillLen) return SKILL;
        // 第八组
        else if (rowIdx === 21 + this.skillLen + 1) return TITLE;
        else if (rowIdx <= 21 + this.skillLen + 1 + this.featureLen) return FEATURE;
        // 第九组
        else if (rowIdx === 21 + this.skillLen + 1 + this.featureLen + 1) return TITLE;
        else if (rowIdx <= 21 + this.skillLen + 1 + this.featureLen + 1 + this.mergeLen) return MERGE;
        else return BLANK;
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case PETNAME: {
                const cell = cc.instantiate(this.petNamePrefab).getComponent(CellPetName);
                cell.page = this.page;
                return cell;
            }
            case ATTRI1:
                return cc.instantiate(this.attriPrefab).getComponent(ListViewCell);
            case ATTRI2:
                return cc.instantiate(this.attri2Prefab).getComponent(ListViewCell);
            case TITLE:
                return cc.instantiate(this.titlePrefab).getComponent(ListViewCell);
            case EQUIP:
                return cc.instantiate(this.equipPrefab).getComponent(CellPkgEquip);
            case EQPBLANK:
                return cc.instantiate(this.equipBlankPrefab).getComponent(CellPkgEquipBlank);
            case SKILL:
                return cc.instantiate(this.skillPrefab).getComponent(CellSkill);
            case FEATURE:
                return cc.instantiate(this.featurePrefab).getComponent(CellFeature);
            case MERGE:
                return cc.instantiate(this.mergePrefab).getComponent(CellMerge);
            case BLANK:
                return cc.instantiate(this.blankPrefab).getComponent(ListViewCell);
        }

        return undefined!;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: DetailCell) {
        const pet = this.curPet;
        const pet2 = this.curPet2;
        const petModel: PetModel = PetModelDict[pet.id];

        // 第一组
        if (rowIdx === 0) {
            cell.setData(pet, STATE_TIP);
        } else if (rowIdx === 1) {
            cell.setData1('等级', String(pet.lv), LV_TIP);
            cell.setData2('融合层数', String(pet.merges.length), MERGE_LV_TIP);
        } else if (rowIdx === 2) {
            cell.setData1('默契值', String(PetTool.getRealPrvty(pet)) + '%', PRVTY_TIP);
            let drinkStr: string;
            if (pet.drinkId) {
                const drinkModel = DrinkModelDict[pet.drinkId];
                const endTime = pet.drinkTime + drinkModel.dura;
                const leftMins = Math.floor((endTime - Date.now()) / 1000 / 60);
                drinkStr = `${drinkModel.cnName} [${leftMins >= 1 ? leftMins : '<1'}min]`;
            } else drinkStr = '无';
            cell.setData2('增益', drinkStr, DRINK_TIP);
        } else if (rowIdx === 3) {
            let exp: number, expMax: number;
            if (pet.lv >= ExpModels.length) {
                exp = 1;
                expMax = 1;
            } else {
                exp = pet.exp;
                expMax = ExpModels[pet.lv];
            }
            cell.setData('当前经验', `${exp} / ${expMax}`, exp / expMax);
        }
        // 第二组
        else if (rowIdx === 4) {
            cell.setData('基础类型');
        } else if (rowIdx === 5) {
            cell.setData1('生物', BioTypeNames[pet2.exBioTypes.getLast() || petModel.bioType], BIO_TIP);
            cell.setData2('元素', EleTypeNames[pet2.exEleTypes.getLast() || petModel.eleType], ELE_TIP);
        } else if (rowIdx === 6) {
            cell.setData1('战斗', BtlTypeNames[pet2.exBtlTypes.getLast() || petModel.btlType], BATTLE_TIP);
            cell.setData2('反应速度', String(pet2.speed), SPEED_TIP);
        }
        // 第三组
        else if (rowIdx === 7) {
            cell.setData('一级属性');
        } else if (rowIdx === 8) {
            cell.setData1('力量', petAttrNumStr(pet2.strength), getAttriTip(pet2.strength, pet2.strengthOri, STR_TIP));
            cell.setData2(
                '专注',
                petAttrNumStr(pet2.concentration),
                getAttriTip(pet2.concentration, pet2.concentrationOri, CON_TIP)
            );
        } else if (rowIdx === 9) {
            cell.setData1('耐久', petAttrNumStr(pet2.durability), getAttriTip(pet2.durability, pet2.durabilityOri, DUN_TIP));
            cell.setData2('敏捷', petAttrNumStr(pet2.agility), getAttriTip(pet2.agility, pet2.agilityOri, AGI_TIP));
        } else if (rowIdx === 10) {
            cell.setData1('感知', petAttrNumStr(pet2.sensitivity), getAttriTip(pet2.sensitivity, pet2.sensitivityOri, SEN_TIP));
            cell.setData2('优雅', petAttrNumStr(pet2.elegant), getAttriTip(pet2.elegant, pet2.elegantOri, ELG_TIP));
        }
        // 第四组
        else if (rowIdx === 11) {
            cell.setData('二级属性');
        } else if (rowIdx === 12) {
            cell.setData1('血量上限', String(Math.floor(pet2.hpMax * 0.1)), HP_TIP);
            cell.setData2('灵能上限', String(pet2.mpMax), MP_TIP);
        } else if (rowIdx === 13) {
            cell.setData1('攻击强度', `${petAttrNumStr(pet2.atkDmgFrom)}~${petAttrNumStr(pet2.atkDmgTo)}`, ATK_TIP);
            cell.setData2('招式强度', `${petAttrNumStr(pet2.sklDmgFrom)}~${petAttrNumStr(pet2.sklDmgTo)}`, SKL_TIP);
        }
        // 第五组
        else if (rowIdx === 14) {
            cell.setData('身份信息');
        } else if (rowIdx === 15) {
            const masterStr = pet.master || '无';
            cell.setData1('训练师', masterStr);
            cell.setData2('唯一标识', String(pet.catchIdx));
        } else if (rowIdx === 16) {
            let timeStr: string;
            if (pet.catchTime) {
                const date = new Date(pet.catchTime);
                const Y = date.getFullYear() % 100,
                    m = date.getMonth() + 1,
                    d = date.getDate(),
                    H = date.getHours(),
                    i = date.getMinutes();
                timeStr = `${Y}-${m}-${d} ${H}:${i}`;
            } else timeStr = '-';

            cell.setData1('捕获时间', timeStr);
            cell.setData2('初始实力', pet.catchLv ? `L${pet.catchLv}` : '-');
        }
        // 第六组
        else if (rowIdx === 17) {
            cell.setData('持有装备', EQUIP_TIP);
        } else if (rowIdx <= 20) {
            const equips = this.curPet.equips;
            const equipIndex = rowIdx - 18;
            const equip = equips[equipIndex];
            const eqpCell = cell as CellPkgEquip;
            if (equip) {
                eqpCell.setData(-1, equip);
                eqpCell.clickCallback = (cell: ListViewCell) => {
                    this.page.onEquipCellClick(equipIndex, cell);
                };
                if (!this.page.immutable) {
                    eqpCell.funcBtn.node.active = true;
                    eqpCell.funcBtnCallback = (cell: ListViewCell) => {
                        this.page.onEquipCellClickFuncBtn(equipIndex, cell);
                    };
                } else {
                    eqpCell.funcBtn.node.active = false;
                }
            } else {
                if (!this.page.immutable) {
                    eqpCell.clickCallback = (cell: ListViewCell) => {
                        this.page.onEquipBlankCellClick(equipIndex, cell);
                    };
                } else {
                    eqpCell.clickCallback = (cell: ListViewCell) => {};
                }
            }
        }
        // 第七组
        else if (rowIdx === 21) {
            cell.setData(`战斗招式（${this.skillLen}）`, SKILL_TIP);
        } else if (rowIdx <= 21 + this.skillLen) {
            const skillIdx = rowIdx - 22;
            const skillId = this.curPet2.skillIds[skillIdx];
            cell.setData(skillId, this.curPet2);
        }
        // 第八组
        else if (rowIdx === 21 + this.skillLen + 1) {
            cell.setData(`精灵特性（${this.featureLen}）`, FEATURE_TIP);
        } else if (rowIdx <= 21 + this.skillLen + 1 + this.featureLen) {
            const featureData = this.featureDatas[rowIdx - 21 - this.skillLen - 1 - 1];
            cell.setData(featureData.feature, featureData.type);
        }
        // 第九组
        else if (rowIdx === 21 + this.skillLen + 1 + this.featureLen + 1) {
            cell.setData(`融合信息（${this.mergeLen}）`, MERGE_TIP);
        } else if (rowIdx <= 21 + this.skillLen + 1 + this.featureLen + 1 + this.mergeLen) {
            const mergeIdx = rowIdx - 21 - this.skillLen - 1 - this.featureLen - 1 - 1;
            const mergeData = this.curPet.merges[mergeIdx];
            cell.setData(mergeData);
        }
    }
}
