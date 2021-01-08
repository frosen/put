/*
 * CellPosBtn.ts
 * 位置列表中的按钮项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellPosBtn extends ListViewCell {
    @property(cc.Button)
    btn1: cc.Button = null!;

    @property(cc.Label)
    lblMain1: cc.Label = null!;

    @property(cc.Label)
    lblSub1: cc.Label = null!;

    @property(cc.Button)
    btn2: cc.Button = null!;

    @property(cc.Label)
    lblMain2: cc.Label = null!;

    @property(cc.Label)
    lblSub2: cc.Label = null!;

    clickCallback!: (pAKey: string) => void;

    pAKey1!: string;
    pAKey2?: string;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.btn1.node.on('click', this.callback1.bind(this));
        this.btn2.node.on('click', this.callback2.bind(this));
    }

    setBtn1(pAKey: string, data: { name: string; info: string; infoColor: cc.Color }) {
        this.pAKey1 = pAKey;
        this.lblMain1.string = data.name;
        this.lblSub1.string = data.info;
        this.lblSub1.node.color = data.infoColor;
    }

    setBtn2(pAKey?: string, data?: { name: string; info: string; infoColor: cc.Color }) {
        if (pAKey) {
            this.pAKey2 = pAKey;
            this.lblMain2.string = data!.name;
            this.lblSub2.string = data!.info;
            this.lblSub2.node.color = data!.infoColor;
        } else {
            this.pAKey2 = undefined;
            this.lblMain2.string = '';
            this.lblSub2.string = '';
        }
    }

    callback1() {
        this.clickCallback(this.pAKey1);
    }

    callback2() {
        if (this.pAKey2) this.clickCallback(this.pAKey2);
    }
}
