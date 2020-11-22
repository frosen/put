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

    @property(cc.Node)
    infoLayer2: cc.Node = null;

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
        const prvtyStr = `默契 ${realPrvty}`;
        const prvtyColor = cc.color(100, 50 + realPrvty, 100);
        this.setInfoNode(index, prvtyStr, prvtyColor);
        index++;

        for (const feature of pet.inbFeatures) {
            const cnName = featureModelDict[feature.id].cnBrief;
            const color = pet.exFeatureIds.includes(feature.id) ? cc.Color.RED : cc.Color.BLUE;
            this.setInfoNode(index, cnName + String(feature.lv), color);
            index++;
        }

        let lndLv = 0;
        for (const feature of pet.lndFeatures) lndLv += feature.lv;
        if (lndLv > 0) {
            this.setInfoNode(index, '习得 ' + String(lndLv), cc.color(75, 165, 130));
            index++;
        }

        this.infoLayer.getComponent(cc.Layout).updateLayout();
        this.infoLayer2.getComponent(cc.Layout).updateLayout();
        this.infoLayer.y = index <= 6 ? -135 : -120;
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
            infoNode.parent = index < 6 ? this.infoLayer : this.infoLayer2;
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
