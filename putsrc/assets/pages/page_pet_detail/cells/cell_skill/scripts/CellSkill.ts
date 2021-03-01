/*
 * CellSkill.ts
 * 招式列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { BtlType, BtlTypeNames, EleColors, EleType, EleTypeNames } from '../../../../../scripts/DataSaved';
import { SkillRangeType, SkillDirType, SkillModel, SkillType } from '../../../../../scripts/DataModel';
import { SkillModelDict } from '../../../../../configs/SkillModelDict';
import { BuffModelDict } from '../../../../../configs/BuffModelDict';
import { BtlCtrlr } from '../../../../../scripts/BtlCtrlr';
import { Pet2 } from '../../../../../scripts/DataOther';

const SkillDirNames = ['', '', '己方'];
const SkillRangeNames = ['', '', '双目标', '全体', '及自身'];
const SkillTypeNames = ['', '・招式', '・瞬发招式', '・绝杀技'];

export class SkillInfo {
    static infoDict: { [key: string]: string } = {};
    static get(id: string): string {
        if (this.infoDict[id]) return this.infoDict[id];

        const skl: SkillModel = SkillModelDict[id];
        let info = '';
        let aim: string;
        if (skl.dirType === SkillDirType.enemy) {
            switch (skl.spBtlType) {
                case BtlType.none:
                    aim = '敌方单体目标';
                    break;
                case BtlType.melee:
                    aim = '敌方最近单体目标';
                    break;
                case BtlType.shoot:
                    aim = '敌方随机单体目标';
                    break;
                case BtlType.charge:
                    aim = '敌方前排目标';
                    break;
                case BtlType.assassinate:
                    aim = '敌方血量最少目标';
                    break;
            }
        } else {
            switch (skl.spBtlType) {
                case BtlType.none:
                    aim = '己方单体目标';
                    break;
                case BtlType.melee:
                    aim = '自己';
                    break;
                case BtlType.shoot:
                    aim = '己方随机单体目标';
                    break;
                case BtlType.charge:
                    aim = '己方前排目标';
                    break;
                case BtlType.assassinate:
                    aim = '己方血量最少目标';
                    break;
            }
        }

        info += '使' + aim!;
        info += this.getDmg(skl.mainDmg, skl.eleType);
        info += this.getBuff(skl.mainDmg, skl.mainBuffId, skl.mainBuffTime);

        if (skl.rangeType !== SkillRangeType.one) {
            let subAim: string;
            switch (skl.rangeType) {
                case SkillRangeType.oneAndNext:
                    subAim = '下方相邻目标';
                    break;
                case SkillRangeType.oneAndOthers:
                    subAim = (skl.dirType === SkillDirType.enemy ? '敌方' : '己方') + '其他目标';
                    break;
                case SkillRangeType.oneAndSelf:
                    subAim = '自己';
            }

            if (skl.subDmg || skl.subBuffId) {
                info += '；' + subAim!;
                info += this.getDmg(skl.subDmg, skl.eleType, true);
                info += this.getBuff(skl.subDmg, skl.subBuffId, skl.subBuffTime);
            }
        }

        if (skl.hpLimit) {
            info += `\n(目标血量须低于${skl.hpLimit}%才可发动)`;
        }

        this.infoDict[id] = info;
        return info;
    }

    static getDmg(dmg: number | undefined, eleType: EleType, sub: boolean = false): string {
        let info = '';
        if (dmg) {
            if (dmg > 0) {
                info += `受到施放者<color=#ffcb32>${dmg}%招式+100%攻击强度</c>##的${EleTypeNames[eleType]}伤害`;
            } else {
                info += `恢复相当于施放者${-dmg}%招式强度##的血量`;
            }
        }
        if (sub) info = info.replace('##', '^^');

        return info;
    }

    static getBuff(dmg?: number, buffId?: string, buffTime?: number): string {
        let info = '';
        if (buffId) {
            if (dmg) info += '并';
            info += `获得${BuffModelDict[buffId].cnName}效果持续${buffTime}回合`;
        }

        return info;
    }

    static getSklDmgStr(pet2: Pet2, rate: number): string {
        const from = BtlCtrlr.getCastRealDmg(pet2.sklDmgFrom, rate, pet2.atkDmgFrom) * 0.1;
        const to = BtlCtrlr.getCastRealDmg(pet2.sklDmgTo, rate, pet2.atkDmgTo) * 0.1;
        return `<color=#d0d0d0>（${Math.ceil(from)} - ${Math.ceil(to)}点）</c>`;
    }

    static getRealSklStr(skillId: string, pet2?: Pet2): string {
        let info = this.get(skillId);
        const skl: SkillModel = SkillModelDict[skillId];
        if (pet2) {
            if (skl.mainDmg) info = info.replace('##', this.getSklDmgStr(pet2, skl.mainDmg * 0.01));
            if (skl.subDmg) info = info.replace('^^', this.getSklDmgStr(pet2, skl.subDmg * 0.01));
        } else {
            info = info.replace('##', '').replace('^^', '');
        }
        return info;
    }
}

@ccclass
export class CellSkill extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null!;

    @property(cc.Label)
    typeLbl: cc.Label = null!;

    @property(cc.Label)
    dmgLbl: cc.Label = null!;

    @property(cc.Label)
    buffLbl: cc.Label = null!;

    @property(cc.Label)
    mprageLbl: cc.Label = null!;

    @property(cc.Label)
    cdLbl: cc.Label = null!;

    @property(cc.Sprite)
    skillSp: cc.Sprite = null!;

    skillId!: string;
    pet2?: Pet2;

    setData(skillId: string, pet2?: Pet2) {
        this.skillId = skillId;
        this.pet2 = pet2;

        const skillModel: SkillModel = SkillModelDict[skillId];

        this.nameLbl.string = skillModel.cnName;
        const ele = EleTypeNames[skillModel.eleType];
        const dir = SkillDirNames[skillModel.dirType];
        const btl = BtlTypeNames[skillModel.spBtlType];
        const range = SkillRangeNames[skillModel.rangeType];
        const type = SkillTypeNames[skillModel.skillType];
        const aim = dir + btl + range;
        this.typeLbl.string = ele + (aim ? '・' + aim : '') + type;
        this.typeLbl.node.parent.color = EleColors[skillModel.eleType];

        this.skillSp.node.color = EleColors[skillModel.eleType];

        if (skillModel.mainDmg) {
            this.dmgLbl.node.parent.scaleX = 1;
            if (skillModel.mainDmg > 0) {
                this.dmgLbl.node.parent.color = cc.Color.BLACK;
                this.dmgLbl.string = `DMG${skillModel.mainDmg}`;
            } else {
                this.dmgLbl.node.parent.color = cc.color(0, 150, 0);
                this.dmgLbl.string = `HEAL${-skillModel.mainDmg}`;
            }
        } else {
            this.dmgLbl.node.parent.scaleX = 0;
        }

        if (skillModel.mainBuffId) {
            this.buffLbl.node.parent.scaleX = 1;
            const buffModel = BuffModelDict[skillModel.mainBuffId];
            this.buffLbl.node.parent.color = EleColors[buffModel.eleType];
            this.buffLbl.string = buffModel.cnName;
        } else {
            this.buffLbl.node.parent.scaleX = 0;
        }

        if (skillModel.mp) this.mprageLbl.string = `MP${skillModel.mp}`;
        else this.mprageLbl.string = `RAGE${skillModel.rage}`;

        this.cdLbl.string = `CD${skillModel.cd}`;
    }

    static getSkillTip(skillId: string, pet2?: Pet2) {
        const model = SkillModelDict[skillId];

        const name = `<size=60>${model.cnName}</s>`;
        let type: string;
        switch (model.skillType) {
            case SkillType.fast:
                type = '\n\n<color=#ffcb32>瞬发招式（仍可普攻）</c>';
                break;
            case SkillType.ultimate:
                type = '\n\n<color=#ffff00>绝杀技（需要斗志）</c>';
                break;
            default:
                type = '';
                break;
        }

        let buff = '';
        if (model.mainBuffId) {
            const buffModel = BuffModelDict[model.mainBuffId];
            buff += '\n' + buffModel.cnName + '：' + buffModel.getInfo(pet2);
        }
        if (model.subBuffId && model.subBuffId !== model.mainBuffId) {
            const buffModel = BuffModelDict[model.subBuffId];
            buff += '\n' + buffModel.cnName + '：' + buffModel.getInfo(pet2);
        }
        if (buff) buff = '\n' + buff;

        const mp = model.mp ? `\n<color=e060e0>灵能消耗：${model.mp}点</c>` : '';
        const cd = model.cd ? `\n<color=e060e0>招式冷却：${model.cd}回合</c>` : '';
        const rage = model.rage ? `\n<color=#ffff00>所需斗志：${model.rage}</c>` : '';
        const final = mp || rage ? `\n${mp}${cd}${rage}` : '';

        return `
${name}${type}

${SkillInfo.getRealSklStr(skillId, pet2)}${buff}${final}`;
    }

    onClick() {
        cc.log('PUT cell click: ', this.skillId, this.curCellIdx);
        this.ctrlr.popToast(CellSkill.getSkillTip(this.skillId, this.pet2));
    }
}
