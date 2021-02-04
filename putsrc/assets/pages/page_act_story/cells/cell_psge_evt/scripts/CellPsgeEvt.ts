/*
 * CellPsgeEvt.ts
 * 需要某个事件到达一定程度才能继续的段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPsgeBase } from '../../../scripts/CellPsgeBase';

@ccclass
export class CellPsgeEvt extends CellPsgeBase {
    @property(cc.Label)
    lbl: cc.Label = null!;

    @property(cc.Button)
    btn: cc.Button = null!;

    clickCallback?: (cell: CellPsgeEvt) => void;

    onLoad() {
        if (CC_EDITOR) return;
        this.btn.node.on('click', this.onClick.bind(this));
    }

    setData() {}

    onClick() {
        if (this.clickCallback) this.clickCallback(this);
    }
}
