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
import { featureModelDict } from 'configs/FeatureModelDict';
import { SkillType } from 'scripts/DataModel';

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
export default class CellPkgEquip extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    skillLbl: cc.Label = null;

    @property(cc.Node)
    infoLayer: cc.Node = null;

    @property(cc.Sprite)
    equipSp: cc.Sprite = null;

    @property(cc.Button)
    changeBtn: cc.Button = null;

    @property(cc.Prefab)
    infoNodePrefab: cc.Prefab = null;

    infoNodePool: cc.Node[] = [];

    setData(equip: Equip) {
        let equipModel = equipModelDict[equip.id];
        this.nameLbl.string = EquipDataTool.getCnName(equip);
        this.nameLbl.node.color = RankColor[equipModel.rank];
        this.lvLbl.string = `[L${equipModel.lv}${equip.growth > 0 ? `+${equip.growth}` : ''}]`;

        if (equip.skillId) {
            let skillModel = skillModelDict[equip.skillId];
            let typeStr = skillModel.skillType == SkillType.ultimate ? '绝・' : '技・';
            this.skillLbl.string = typeStr + skillModel.cnName;

            this.skillLbl.node.parent.opacity = 255;
            this.skillLbl.node.parent.color = EleColor[skillModel.eleType];
        } else {
            this.skillLbl.node.parent.opacity = 0;
        }

        this.rerenderLbl(this.nameLbl);
        this.rerenderLbl(this.lvLbl);
        this.rerenderLbl(this.skillLbl);
        this.skillLbl.node.parent.getComponent(cc.Layout).updateLayout();
        this.nameLbl.node.parent.getComponent(cc.Layout).updateLayout();

        let attriInfos = [];
        let attris = EquipDataTool.getFinalAttris(equip);
        for (const key in attris) {
            let value = attris[key];
            if (value > 0) attriInfos.push({ str: AttriStrings[key] + getNumStr(value), c: AttriColors[key] });
        }

        for (let index = 0; index < equip.selfFeatureLvs.length; index++) {
            const id = equipModel.featureIds[index];
            let featureModel = featureModelDict[id];
            let cnName = featureModel.cnBrief;
            const lv = equip.selfFeatureLvs[index];
            attriInfos.push({ str: cnName + String(lv), c: cc.Color.RED });
        }
        for (const feature of equip.affixes) {
            let featureModel = featureModelDict[feature.id];
            attriInfos.push({ str: featureModel.cnBrief + String(feature.lv), c: cc.Color.RED });
        }

        let attriIndex = 0;
        for (; attriIndex < attriInfos.length; attriIndex++) {
            const { str, c } = attriInfos[attriIndex];
            let infoNode = this.infoNodePool[attriIndex];
            if (!infoNode) {
                infoNode = cc.instantiate(this.infoNodePrefab);
                this.infoNodePool[attriIndex] = infoNode;
                infoNode.parent = this.infoLayer;
            }
            infoNode.opacity = 255;

            infoNode.color = c;
            let lbl = infoNode.children[0].getComponent(cc.Label);
            lbl.string = str;
            this.rerenderLbl(lbl);
            infoNode.getComponent(cc.Layout).updateLayout();
        }

        for (; attriIndex < this.infoNodePool.length; attriIndex++) {
            this.infoNodePool[attriIndex].opacity = 0;
        }

        this.infoLayer.getComponent(cc.Layout).updateLayout();
    }

    rerenderLbl(lbl: cc.Label) {
        // @ts-ignore
        lbl._assembler.updateRenderData(lbl);
    }
}
