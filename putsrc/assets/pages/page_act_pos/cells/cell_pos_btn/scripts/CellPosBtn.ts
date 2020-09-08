/*
 * CellPosBtn.ts
 * 位置列表中的按钮项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';

@ccclass
export class CellPosBtn extends ListViewCell {
    @property(cc.Button)
    btn1: cc.Button = null;

    @property(cc.Label)
    lblMain1: cc.Label = null;

    @property(cc.Label)
    lblSub1: cc.Label = null;

    @property(cc.Button)
    btn2: cc.Button = null;

    @property(cc.Label)
    lblMain2: cc.Label = null;

    @property(cc.Label)
    lblSub2: cc.Label = null;

    callback1: () => void = null;
    callback2: () => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.btn1.node.on('click', () => {
            if (this.callback1) this.callback1();
        });
        this.btn2.node.on('click', () => {
            if (this.callback2) this.callback2();
        });
    }

    setBtn1(name: string, callback: () => void, sub: string = null, subColor: cc.Color = null) {
        this.lblMain1.string = name || '';
        this.callback1 = callback;

        this.lblSub1.string = sub || '';
        this.lblSub1.node.color = subColor || cc.color(120, 120, 120);
    }

    setBtn2(name: string, callback: () => void, sub: string = null, subColor: cc.Color = null) {
        this.btn2.enabled = !!callback;

        this.lblMain2.string = name || '';
        this.callback2 = callback;

        this.lblSub2.string = sub || '';
        this.lblSub2.node.color = subColor || cc.color(120, 120, 120);
    }
}
