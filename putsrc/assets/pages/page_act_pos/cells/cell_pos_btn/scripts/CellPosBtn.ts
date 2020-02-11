/*
 * CellPosBtn.ts
 * 位置列表中的按钮项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';

@ccclass
export default class CellPosBtn extends ListViewCell {
    @property(cc.Button)
    btn1: cc.Button = null;

    @property(cc.Button)
    btn2: cc.Button = null;

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

    setBtn1(name: string, callback: () => void) {
        this.btn1.getComponentInChildren(cc.Label).string = name;
        this.callback1 = callback;
    }

    setBtn2(name: string, callback: () => void) {
        this.btn2.node.active = true;
        this.btn2.getComponentInChildren(cc.Label).string = name;
        this.callback2 = callback;
    }

    hideBtn2() {
        this.btn2.node.active = false;
    }
}
