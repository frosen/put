/*
 * CellPkgEquip.ts
 * 道具列表中的装备项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgBase } from '../../../scripts/CellPkgBase';
import { Equip, EleColors } from '../../../../../scripts/DataSaved';
import { EquipTool } from '../../../../../scripts/Memory';
import { SkillModelDict } from '../../../../../configs/SkillModelDict';
import { EquipModelDict } from '../../../../../configs/EquipModelDict';
import { FeatureModelDict } from '../../../../../configs/FeatureModelDict';
import { SkillType } from '../../../../../scripts/DataModel';
import { ListViewCell } from '../../../../../scripts/ListViewCell';

const RankColor = [null, cc.Color.BLACK, cc.Color.BLUE, cc.color(153, 50, 205)];

const AttriStrings = {
    strength: '力',
    concentration: '专',
    durability: '耐',
    agility: '敏',
    sensitivity: '感',
    elegant: '雅',
    armor: '甲'
};

const AttriColors = {
    strength: cc.Color.RED,
    concentration: cc.Color.BLUE,
    durability: cc.Color.BLUE,
    agility: cc.Color.BLUE,
    sensitivity: cc.Color.BLUE,
    elegant: cc.Color.BLUE,
    armor: cc.Color.GRAY
};

function getNumStr(n: number): string {
    return (n * 0.1).toFixed();
}

@ccclass
export class CellPkgEquip extends CellPkgBase {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    skillLbl: cc.Label = null;

    @property(cc.Node)
    infoLayer: cc.Node = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    @property(cc.Prefab)
    infoNodePrefab: cc.Prefab = null;

    infoNodeDataPool: { infoNode: cc.Node; lbl: cc.Label; layout: cc.Layout }[] = [];

    setData(itemIdx: number, equip: Equip) {
        super.setData(itemIdx, equip);
        const equipModel = EquipModelDict[equip.id];
        this.nameLbl.string = EquipTool.getCnName(equip, true);
        this.nameLbl.node.color = RankColor[equipModel.rank];
        this.lvLbl.string = `[L${equipModel.lv}${equip.growth > 0 ? `+${equip.growth}` : ''}]`;

        if (equip.skillId) {
            const skillModel = SkillModelDict[equip.skillId];
            const typeStr = skillModel.skillType === SkillType.ultimate ? '绝・' : '招・';
            this.skillLbl.string = typeStr + skillModel.cnName;

            this.skillLbl.node.parent.opacity = 255;
            this.skillLbl.node.parent.color = EleColors[skillModel.eleType];
        } else {
            this.skillLbl.node.parent.opacity = 0;
        }

        ListViewCell.rerenderLbl(this.nameLbl);
        ListViewCell.rerenderLbl(this.lvLbl);
        ListViewCell.rerenderLbl(this.skillLbl);
        for (const layout of this.layouts) layout.updateLayout();

        const attriInfos = [];
        const attris = EquipTool.getFinalAttris(equip);
        for (const key in attris) {
            const value = attris[key];
            if (value > 0) attriInfos.push({ str: AttriStrings[key] + getNumStr(value), c: AttriColors[key] });
        }

        for (let index = 0; index < equip.selfFeatureLvs.length; index++) {
            const id = equipModel.featureIds[index];
            const featureModel = FeatureModelDict[id];
            const cnName = featureModel.cnBrief;
            const lv = equip.selfFeatureLvs[index];
            attriInfos.push({ str: cnName + String(lv), c: cc.Color.RED });
        }
        for (const feature of equip.affixes) {
            const featureModel = FeatureModelDict[feature.id];
            attriInfos.push({ str: featureModel.cnBrief + String(feature.lv), c: cc.Color.RED });
        }

        let attriIndex = 0;
        for (; attriIndex < attriInfos.length; attriIndex++) {
            const { str, c } = attriInfos[attriIndex];
            let infoNodeData = this.infoNodeDataPool[attriIndex];
            if (!infoNodeData) {
                const infoNode = cc.instantiate(this.infoNodePrefab);
                infoNode.parent = this.infoLayer;
                infoNodeData = {
                    infoNode,
                    lbl: infoNode.children[0].getComponent(cc.Label),
                    layout: infoNode.getComponent(cc.Layout)
                };
                this.infoNodeDataPool[attriIndex] = infoNodeData;
            }
            const { infoNode, lbl, layout } = infoNodeData;

            infoNode.opacity = 255;
            infoNode.color = c;
            lbl.string = str;
            ListViewCell.rerenderLbl(lbl);
            layout.updateLayout();
        }

        for (; attriIndex < this.infoNodeDataPool.length; attriIndex++) {
            this.infoNodeDataPool[attriIndex].infoNode.opacity = 0;
        }

        this.infoLayer.getComponent(cc.Layout).updateLayout();
    }
}
