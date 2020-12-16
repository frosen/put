/*
 * CellPet.ts
 * 精灵列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { petModelDict } from '../../../../../configs/PetModelDict';

import { Pet, PetStateNames, EleColors, BioType } from '../../../../../scripts/DataSaved';
import { featureModelDict } from '../../../../../configs/FeatureModelDict';
import { PetTool } from '../../../../../scripts/Memory';
import { RunningImgMgr } from '../../../../../scripts/RunningImgMgr';

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
    petIconBG: cc.Sprite = null;

    @property(cc.Sprite)
    petIcon: cc.Sprite = null;

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

    infoIdx: number = 0;
    infoW: number = 0;

    setData(pet: Pet) {
        this.curPet = pet;

        this.petNameLbl.string = PetTool.getCnName(pet, true);
        this.subNameLbl.string = pet.nickname ? '(' + PetTool.getBaseCnName(pet) + ')' : '';
        this.lvLbl.string = `[L${pet.lv}R${pet.merges.length}]`;
        ListViewCell.rerenderLbl(this.petNameLbl);
        ListViewCell.rerenderLbl(this.subNameLbl);
        ListViewCell.rerenderLbl(this.lvLbl);
        this.petNameLbl.node.parent.getComponent(cc.Layout).updateLayout();

        const { img, color } = CellPet.getPetIcon(pet, this.ctrlr.runningImgMgr);
        this.petIcon.spriteFrame = img;
        this.petIconBG.node.color = color;

        const stateLbl = this.stateBtn.getComponentInChildren(cc.Label);
        stateLbl.string = PetStateNames[pet.state];
        // llytodo stateLbl.node.color

        this.hideAllInfoNode();
        this.infoIdx = 0;
        this.infoW = 0;

        const realPrvty = PetTool.getRealPrvty(pet);
        this.setInfoNode(`默契 ${realPrvty}`, cc.color(100, 50 + realPrvty, 100));

        for (const feature of pet.inbFeatures) {
            const cnName = featureModelDict[feature.id].cnBrief;
            const color = pet.exFeatureIds.includes(feature.id) ? cc.Color.RED : cc.Color.BLUE;
            this.setInfoNode(cnName + String(feature.lv), color);
        }

        let lndLv = 0;
        for (const feature of pet.lndFeatures) lndLv += feature.lv;
        if (lndLv > 0) this.setInfoNode('习得 ' + String(lndLv), cc.color(75, 165, 130));

        this.infoLayer.getComponent(cc.Layout).updateLayout();
        this.infoLayer2.getComponent(cc.Layout).updateLayout();
        this.infoLayer.y = this.infoLayer2.childrenCount === 0 ? -135 : -120;
    }

    static getPetIcon(pet: Pet, rImgMgr: RunningImgMgr): { img: cc.SpriteFrame; color: cc.Color } {
        const petModel = petModelDict[pet.id];
        const color = EleColors[petModel.eleType];

        switch (petModel.bioType) {
            case BioType.human:
                return { img: rImgMgr.humanPet, color };
            case BioType.magic:
                return { img: rImgMgr.magicPet, color };
            case BioType.mech:
                return { img: rImgMgr.mechPet, color };
            case BioType.nature:
                return { img: rImgMgr.naturePet, color };
            case BioType.unknown:
                return { img: rImgMgr.unknownPet, color };
        }
    }

    hideAllInfoNode() {
        for (let index = 0; index < this.infoNodePool.length; index++) {
            const node = this.infoNodePool[index];
            if (node) node.opacity = 0;
        }
    }

    setInfoNode(str: string, color: cc.Color) {
        let infoNode = this.infoNodePool[this.infoIdx];
        if (!infoNode) {
            infoNode = cc.instantiate(this.infoNodePrefab);
            this.infoNodePool[this.infoIdx] = infoNode;
            infoNode.parent = this.infoLayer; // 为了rerenderLbl，必须先设定一个parent，否则会报错
        }
        infoNode.opacity = 255;

        infoNode.color = color;
        const lbl = infoNode.children[0].getComponent(cc.Label);
        lbl.string = str;
        ListViewCell.rerenderLbl(lbl);
        infoNode.getComponent(cc.Layout).updateLayout();

        this.infoIdx++;
        this.infoW += infoNode.width + this.infoLayer.getComponent(cc.Layout).spacingX;

        infoNode.parent = this.infoW < 600 ? this.infoLayer : this.infoLayer2;
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
