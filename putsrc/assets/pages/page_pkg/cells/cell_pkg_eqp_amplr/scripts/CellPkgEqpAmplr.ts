/*
 * CellPkgEqpAmplr.ts
 * 道具列表中的装备强化石项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { EqpAmplr } from 'scripts/DataSaved';
import { eqpAmplrModelDict } from 'configs/EqpAmplrModelDict';

@ccclass
export class CellPkgEqpAmplr extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    @property(cc.Label)
    countLbl: cc.Label = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    curItemIdx: number = -1;

    clickCallback: (cell: CellPkgEqpAmplr) => void = null;
    funcBtnCallback: (cell: CellPkgEqpAmplr) => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(itemIdx: number, eqpAmplr: EqpAmplr) {
        this.curItemIdx = itemIdx;
        let eqpAmplrModel = eqpAmplrModelDict[eqpAmplr.id];

        this.nameLbl.string = eqpAmplrModel.cnName;
        this.lvLbl.string = `[MaxL${eqpAmplrModel.lvMax}]`;

        CellPkgEqpAmplr.rerenderLbl(this.nameLbl);
        CellPkgEqpAmplr.rerenderLbl(this.lvLbl);

        this.countLbl.string = 'x ' + String(eqpAmplr.count);

        for (const layout of this.layouts) layout.updateLayout();
    }

    static rerenderLbl(lbl: cc.Label) {
        // @ts-ignore
        lbl._assembler.updateRenderData(lbl);
    }

    onClick() {
        cc.log('PUT click eqpAmplr cell: ', this.curCellIdx, this.curItemIdx);
        if (this.clickCallback) this.clickCallback(this);
    }

    onClickFuncBtn() {
        cc.log('PUT show eqpAmplr cell func: ', this.curCellIdx, this.curItemIdx);
        if (this.funcBtnCallback) this.funcBtnCallback(this);
    }
}
