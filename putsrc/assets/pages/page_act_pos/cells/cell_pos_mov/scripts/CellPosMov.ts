/*
 * CellPosMov.ts
 * 位置列表中的移动项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';

@ccclass
export class CellPosMov extends ListViewCell {
    @property(cc.Label)
    posName: cc.Label = null;

    @property(cc.Label)
    price: cc.Label = null;

    @property(cc.Button)
    infoBtn: cc.Button = null;

    callback: () => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.infoBtn.node.on('click', this.onClickInfo, this);
    }

    setData(name: string, price: string, callback: () => void) {
        this.posName.string = name;
        this.price.string = price;
        this.callback = callback;
    }

    onClick() {
        cc.log('PUT click mov: ', this.posName.string);
        if (this.callback) this.callback();
    }

    onClickInfo() {
        cc.log('PUT click mov info: ', this.posName.string);
    }
}
