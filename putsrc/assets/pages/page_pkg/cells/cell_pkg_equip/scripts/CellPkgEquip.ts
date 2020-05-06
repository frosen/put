/*
 * CellPkgEquip.ts
 * 道具列表中的装备项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { Equip, EleColor } from 'scripts/DataSaved';
import { EquipDataTool } from 'scripts/Memory';
import { skillModelDict } from 'configs/SkillModelDict';
import { equipModelDict } from 'configs/EquipModelDict';

const RankColor = [null, cc.Color.BLACK, cc.Color.BLUE, cc.color(153, 50, 205)];

@ccclass
export default class CellPkgEquip extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    growthLbl: cc.Label = null;

    @property(cc.Label)
    skillLbl: cc.Label = null;

    @property(cc.RichText)
    infoLbl: cc.RichText = null;

    @property(cc.Sprite)
    equipSp: cc.Sprite = null;

    @property(cc.Button)
    changeBtn: cc.Button = null;

    setData(equip: Equip) {
        let equipModel = equipModelDict[equip.id];
        this.nameLbl.string = EquipDataTool.getCnName(equip);
        this.nameLbl.node.color = RankColor[equipModel.rank];
        this.growthLbl.string = equip.growth > 0 ? `[+${equip.growth}]` : '';

        if (equip.skillId) {
            let skillModel = skillModelDict[equip.skillId];
            this.skillLbl.string = '（' + skillModel.cnName + '）';
            this.skillLbl.node.color = EleColor[skillModel.eleType];
        } else this.skillLbl.string = '';
    }
}
