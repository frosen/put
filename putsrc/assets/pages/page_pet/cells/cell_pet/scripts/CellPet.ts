/*
 * CellPet.ts
 * 宠物列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { petModelDict } from 'configs/PetModelDict';

import { Pet, PetRankNames, PetStateNames, EleColor } from 'scripts/DataSaved';
import { PetModel } from 'scripts/DataModel';
import { featureModelDict } from 'configs/FeatureModelDict';

export enum CellPetType {
    normal,
    selection,
    catch
}

@ccclass
export class CellPet extends ListViewCell {
    @property(cc.Label)
    petNameLbl: cc.Label = null;

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

    @property(cc.Button)
    detailBtn: cc.Button = null;

    @property(cc.Prefab)
    infoNodePrefab: cc.Prefab = null;

    infoNodePool: cc.Node[] = [];

    curPet: Pet = null;

    type: CellPetType = CellPetType.normal;

    clickCallback: (cell: CellPet) => void = null;
    stateBtnCallback: (cell: CellPet) => void = null;
    funcBtnCallback: (cell: CellPet) => void = null;
    detailBtnCallback: (cell: CellPet) => void = null;

    init(type: CellPetType) {
        this.type = type;
        switch (type) {
            case CellPetType.normal:
                this.stateBtn.node.on('click', this.onClickStateBtn, this);
                this.funcBtn.node.on('click', this.onClickFuncBtn, this);
                this.detailBtn.node.active = false;
                break;
            case CellPetType.selection:
                this.stateBtn.node.active = false;
                this.funcBtn.node.active = false;
                this.detailBtn.node.on('click', this.onClickDetailBtn, this);
                break;
            case CellPetType.catch:
                this.stateBtn.node.active = false;
                this.funcBtn.node.active = false;
                this.detailBtn.node.active = false;
                break;
        }
    }

    setData(pet: Pet) {
        this.curPet = pet;
        let petModel: PetModel = petModelDict[pet.id];
        this.petNameLbl.string = petModel.cnName;
        this.lvLbl.string = `[L${pet.lv}${PetRankNames[pet.rank]}]`;

        this.petSp.node.color = EleColor[petModel.eleType];

        let stateLbl = this.stateBtn.getComponentInChildren(cc.Label);
        stateLbl.string = PetStateNames[pet.state];
        // llytodo stateLbl.node.color

        this.hideAllInfoNode();
        let index = 0;
        switch (this.type) {
            case CellPetType.normal:
            case CellPetType.selection:
                this.setInfoNode(index, `默契值：${pet.privity}`, cc.color(100, 50 + 100 * pet.privity * 0.01, 100));
                index++;
            case CellPetType.catch:
                for (const feature of pet.inbornFeatures) {
                    let cnName = featureModelDict[feature.id].cnBrief;
                    let lv = feature.lv;
                    this.setInfoNode(index, '天赋特性・' + cnName + String(lv), cc.Color.RED);
                    index++;
                }
                break;
        }
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
        this.rerenderLbl(lbl);
        infoNode.getComponent(cc.Layout).updateLayout();
    }

    rerenderLbl(lbl: cc.Label) {
        // @ts-ignore
        lbl._assembler.updateRenderData(lbl);
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

    onClickDetailBtn() {
        cc.log('PUT show pet detail', this.petNameLbl.string, this.curCellIdx);
        if (this.detailBtnCallback) this.detailBtnCallback(this);
    }
}
