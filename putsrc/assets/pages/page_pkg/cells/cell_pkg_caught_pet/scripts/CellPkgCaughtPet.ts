/*
 * CellPkgCaughtPet.ts
 * 道具列表中的捕捉器项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgBase } from 'pages/page_pkg/scripts/CellPkgBase';
import { CaughtPet } from 'scripts/DataSaved';
import { featureModelDict } from 'configs/FeatureModelDict';
import { CaughtPetTool } from 'scripts/Memory';
import { ListViewCell } from 'scripts/ListViewCell';

@ccclass
export class CellPkgCaughtPet extends CellPkgBase {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Node)
    infoLayer: cc.Node = null;

    @property(cc.Prefab)
    infoNodePrefab: cc.Prefab = null;

    infoNodePool: cc.Node[] = [];

    setData(itemIdx: number, caughtPet: CaughtPet) {
        super.setData(itemIdx, caughtPet);

        this.nameLbl.string = CaughtPetTool.getCnName(caughtPet, true);
        this.lvLbl.string = `[L${caughtPet.lv}]`;

        this.hideAllInfoNode();
        let index = 0;
        for (const feature of caughtPet.features) {
            const cnName = featureModelDict[feature.id].cnBrief;
            const lv = feature.lv;
            this.setInfoNode(index, '天赋特性・' + cnName + String(lv), cc.Color.RED);
            index++;
        }

        this.infoLayer.getComponent(cc.Layout).updateLayout();
    }

    hideAllInfoNode() {
        for (let index = 0; index < this.infoNodePool.length; index++) {
            const node = this.infoNodePool[index];
            if (node) node.opacity = 0;
        }
    }

    setInfoNode(index: number, str: string, color: cc.Color) {
        let infoNode = this.infoNodePool[index];
        if (!infoNode) {
            infoNode = cc.instantiate(this.infoNodePrefab);
            this.infoNodePool[index] = infoNode;
            infoNode.parent = this.infoLayer;
        }
        infoNode.opacity = 255;

        infoNode.color = color;
        const lbl = infoNode.children[0].getComponent(cc.Label);
        lbl.string = str;
        ListViewCell.rerenderLbl(lbl);
        infoNode.getComponent(cc.Layout).updateLayout();
    }
}
