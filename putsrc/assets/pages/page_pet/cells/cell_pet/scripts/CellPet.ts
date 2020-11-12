/*
 * CellPet.ts
 * 精灵列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';
import { petModelDict } from 'configs/PetModelDict';

import { Pet, PetStateNames, EleColors } from 'scripts/DataSaved';
import { featureModelDict } from 'configs/FeatureModelDict';
import { PetTool } from 'scripts/Memory';

@ccclass
export class CellPet extends ListViewCell {
    @property(cc.Label)
    petNameLbl: cc.Label = null;

    @property(cc.Label)
    subNameLbl: cc.Label = null;

    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Node)
    infoLayer: cc.Node = null;

    @property(cc.Sprite)
    petSp: cc.Sprite = null;

    @property(cc.Label)
    stateLbl: cc.Label = null;

    @property(cc.Button)
    stateBtn: cc.Button = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    @property(cc.Prefab)
    infoNodePrefab: cc.Prefab = null;

    infoNodePool: cc.Node[] = [];

    curPet: Pet = null;

    clickCallback: (cell: CellPet) => void = null;
    stateBtnCallback: (cell: CellPet) => void = null;
    funcBtnCallback: (cell: CellPet) => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.stateBtn.node.on('click', this.onClickStateBtn, this);
        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(pet: Pet) {
        this.curPet = pet;

        this.petNameLbl.string = PetTool.getCnName(pet, true);
        this.subNameLbl.string = pet.nickname ? '(' + PetTool.getBaseCnName(pet) + ')' : '';
        this.lvLbl.string = `[L${pet.lv}R${pet.merges.length}]`;
        ListViewCell.rerenderLbl(this.petNameLbl);
        ListViewCell.rerenderLbl(this.subNameLbl);
        ListViewCell.rerenderLbl(this.lvLbl);
        this.petNameLbl.node.parent.getComponent(cc.Layout).updateLayout();

        this.petSp.node.color = EleColors[petModelDict[pet.id].eleType];

        const stateLbl = this.stateBtn.getComponentInChildren(cc.Label);
        stateLbl.string = PetStateNames[pet.state];
        // llytodo stateLbl.node.color

        this.hideAllInfoNode();
        let index = 0;
        const realPrvty = PetTool.getRealPrvty(pet);
        this.setInfoNode(index, `默契 ${realPrvty}`, cc.color(100, 50 + realPrvty, 100));
        index++;
        for (const feature of pet.inbFeatures) {
            const cnName = featureModelDict[feature.id].cnBrief;
            const lv = feature.lv;
            const ex = pet.exFeatureIds.includes(feature.id);
            this.setInfoNode(index, cnName + String(lv), ex ? cc.Color.RED : cc.Color.BLUE);
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

    onClick() {
        cc.log('PUT cell click: ', this.petNameLbl.string, this.curCellIdx);
        if (this.clickCallback) this.clickCallback(this);
    }

    onClickStateBtn() {
        cc.log('PUT change state: ', this.petNameLbl.string, this.curCellIdx);
        if (this.stateBtnCallback) this.stateBtnCallback(this);
    }

    onClickFuncBtn() {
        cc.log('PUT show pet cell func: ', this.petNameLbl.string, this.curCellIdx);
        if (this.funcBtnCallback) this.funcBtnCallback(this);
    }

    changeFuncBtnImgToDetail() {
        this.funcBtn.target.getComponent(cc.Sprite).spriteFrame = this.ctrlr.runningImgMgr.detail;
    }
}
