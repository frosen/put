/*
 * CellPkgCatcher.ts
 * 道具列表中的捕捉器项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { Catcher, BioTypeNames, EleTypeNames, BattleTypeNames, PetRankNames } from 'scripts/DataSaved';
import { catcherModelDict } from 'configs/CatcherModelDict';

@ccclass
export class CellPkgCatcher extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    rankLbl: cc.Label = null;

    @property(cc.Label)
    rateLbl: cc.Label = null;

    @property(cc.Label)
    bioLbl: cc.Label = null;

    @property(cc.Label)
    eleLbl: cc.Label = null;

    @property(cc.Label)
    btlTypeLbl: cc.Label = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    @property(cc.Label)
    countLbl: cc.Label = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    curItemIdx: number = -1;

    clickCallback: (cell: CellPkgCatcher) => void = null;
    funcBtnCallback: (cell: CellPkgCatcher) => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(itemIdx: number, catcher: Catcher) {
        this.curItemIdx = itemIdx;
        let catcherModel = catcherModelDict[catcher.id];

        this.nameLbl.string = catcherModel.cnName;
        this.lvLbl.string = `[L${catcherModel.lvMin}~${catcherModel.lvMax}]`;
        this.rankLbl.string = `[${PetRankNames[catcherModel.rankMin]}~${PetRankNames[catcherModel.rankMax]}]`;

        CellPkgCatcher.rerenderLbl(this.nameLbl);
        CellPkgCatcher.rerenderLbl(this.lvLbl);
        CellPkgCatcher.rerenderLbl(this.rankLbl);

        this.rateLbl.string = `成功率+${catcherModel.rate}%`;
        CellPkgCatcher.setTypeName(catcherModel.bioType, BioTypeNames, this.bioLbl, this.bioLbl.node.parent);
        CellPkgCatcher.setTypeName(catcherModel.eleType, EleTypeNames, this.eleLbl, this.eleLbl.node.parent);
        CellPkgCatcher.setTypeName(catcherModel.battleType, BattleTypeNames, this.btlTypeLbl, this.btlTypeLbl.node.parent);

        this.countLbl.string = 'x ' + String(catcher.count);

        for (const layout of this.layouts) layout.updateLayout();
    }

    static rerenderLbl(lbl: cc.Label) {
        // @ts-ignore
        lbl._assembler.updateRenderData(lbl);
    }

    static setTypeName(data: number, names: string[], lbl: cc.Label, baseNode: cc.Node) {
        if (data) {
            baseNode.scaleX = 1;
            lbl.string = names[data];
            this.rerenderLbl(lbl);
        } else {
            baseNode.scaleX = 0;
        }
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
