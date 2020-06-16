/*
 * CellSkill.ts
 * 技能列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';
import { EleColor, EleTypeNames } from 'scripts/DataSaved';
import { SkillModel } from 'scripts/DataModel';
import { skillModelDict } from 'configs/SkillModelDict';
import { buffModelDict } from 'configs/BuffModelDict';

const SkillTypeCellNames = ['', '・技能', '・瞬发技能', '・绝技'];
const SkillDirTypeCellNames = ['', '', '・增益'];
const SkillAimTypeCellNames = ['', '', '・双目标', '・全体', '・敌我'];

@ccclass
export class CellSkill extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    typeLbl: cc.Label = null;

    @property(cc.Label)
    dmgLbl: cc.Label = null;

    @property(cc.Label)
    buffLbl: cc.Label = null;

    @property(cc.Label)
    mprageLbl: cc.Label = null;

    @property(cc.Label)
    cdLbl: cc.Label = null;

    @property(cc.Sprite)
    skillSp: cc.Sprite = null;

    skillId: string = '';

    clickCallback: (cell: CellSkill) => void = null;

    setData(skillId: string) {
        this.skillId = skillId;
        let skillModel: SkillModel = skillModelDict[skillId];

        this.nameLbl.string = skillModel.cnName;
        let ele = EleTypeNames[skillModel.eleType];
        let aim = SkillAimTypeCellNames[skillModel.aimType];
        let dir = SkillDirTypeCellNames[skillModel.dirType];
        let stp = SkillTypeCellNames[skillModel.skillType];
        this.typeLbl.string = ele + aim + dir + stp;
        this.typeLbl.node.parent.color = EleColor[skillModel.eleType];

        this.skillSp.node.color = EleColor[skillModel.eleType];

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
            let buffModel = buffModelDict[skillModel.mainBuffId];
            this.buffLbl.node.parent.color = EleColor[buffModel.eleType];
            this.buffLbl.string = buffModel.cnName;
        } else {
            this.buffLbl.node.parent.scaleX = 0;
        }

        if (skillModel.mp > 0) this.mprageLbl.string = `MP${skillModel.mp}`;
        else this.mprageLbl.string = `RAGE${skillModel.rage}`;

        this.cdLbl.string = `CD${skillModel.cd}`;
    }

    onClick() {
        cc.log('PUT cell click: ', this.skillId, this.curCellIdx);
        if (this.clickCallback) this.clickCallback(this);
    }
}
