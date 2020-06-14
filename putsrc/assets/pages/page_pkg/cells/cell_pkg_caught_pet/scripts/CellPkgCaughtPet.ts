/*
 * CellPkgCaughtPet.ts
 * 道具列表中的捕捉器项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { CaughtPet, PetRankNames } from 'scripts/DataSaved';
import { petModelDict } from 'configs/PetModelDict';
import { PetModel } from 'scripts/DataModel';
import { featureModelDict } from 'configs/FeatureModelDict';

@ccclass
export class CellPkgCaughtPet extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Node)
    infoLayer: cc.Node = null;

    @property(cc.Prefab)
    infoNodePrefab: cc.Prefab = null;

    infoNodePool: cc.Node[] = [];

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    curItemIdx: number = -1;

    clickCallback: (cell: CellPkgCaughtPet) => void = null;
    funcBtnCallback: (cell: CellPkgCaughtPet) => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(itemIdx: number, caughtPet: CaughtPet) {
        this.curItemIdx = itemIdx;
        let petModel: PetModel = petModelDict[caughtPet.petId];

        this.nameLbl.string = '捕获：' + petModel.cnName;
        this.lvLbl.string = `[L${caughtPet.lv}${PetRankNames[caughtPet.rank]}]`;

        this.hideAllInfoNode();
        let index = 0;
        for (const feature of caughtPet.features) {
            let cnName = featureModelDict[feature.id].cnBrief;
            let lv = feature.lv;
            this.setInfoNode(index, '天赋特性・' + cnName + String(lv), cc.Color.RED);
            index++;
        }

        this.infoLayer.getComponent(cc.Layout).updateLayout();
    }

    hideAllInfoNode() {
        for (let index = 0; index < this.infoNodePool.length; index++) {
            let node = this.infoNodePool[index];
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
        let lbl = infoNode.children[0].getComponent(cc.Label);
        lbl.string = str;
        CellPkgCaughtPet.rerenderLbl(lbl);
        infoNode.getComponent(cc.Layout).updateLayout();
    }

    static rerenderLbl(lbl: cc.Label) {
        // @ts-ignore
        lbl._assembler.updateRenderData(lbl);
    }

    onClick() {
        cc.log('PUT click catcher cell: ', this.curCellIdx, this.curItemIdx);
        if (this.clickCallback) this.clickCallback(this);
    }

    onClickFuncBtn() {
        cc.log('PUT show catcher cell func: ', this.curCellIdx, this.curItemIdx);
        if (this.funcBtnCallback) this.funcBtnCallback(this);
    }
}
