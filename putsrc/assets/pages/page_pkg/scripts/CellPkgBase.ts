/*
 * CellPkgBase.ts
 * 道具列表中项目的基类
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';

@ccclass
export class CellPkgBase extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    curItemIdx: number = -1;

    clickCallback: (cell: ListViewCell) => void = null;
    funcBtnCallback: (cell: ListViewCell) => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(itemIdx: number, item: any) {
        this.curItemIdx = itemIdx;
    }

    onClick() {
        cc.log('PUT click eqpAmplr cell: ', this.curCellIdx, this.curItemIdx);
        if (this.clickCallback) this.clickCallback(this);
    }

    onClickFuncBtn() {
        cc.log('PUT show eqpAmplr cell func: ', this.curCellIdx, this.curItemIdx);
        if (this.funcBtnCallback) this.funcBtnCallback(this);
    }

    setFuncBtnUI(sFrame: cc.SpriteFrame) {
        this.funcBtn.target.getComponent(cc.Sprite).spriteFrame = sFrame;
    }
}
