/*
 * CellAttri2.ts
 * 属性项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellAttri2 extends ListViewCell {
    @property(cc.Node)
    attri1: cc.Node = null;

    @property(cc.Node)
    attri2: cc.Node = null;

    @property(cc.Label)
    key1: cc.Label = null;

    @property(cc.Label)
    key2: cc.Label = null;

    @property(cc.Label)
    value1: cc.Label = null;

    @property(cc.Label)
    value2: cc.Label = null;

    tip1: string = null;
    tip2: string = null;

    onLoad() {
        // 故意不加 super.onLoad();
        if (CC_EDITOR) {
            this.check();
            return;
        }

        this.attri1.on(cc.Node.EventType.TOUCH_END, this.onClickAttri1, this);
        this.attri2.on(cc.Node.EventType.TOUCH_END, this.onClickAttri2, this);
    }

    setData1(key: string, value: string, tip: string = null) {
        this.key1.string = key;
        this.value1.string = value;
        this.tip1 = tip;
    }

    setData2(key: string, value: string, tip: string = null) {
        this.key2.string = key;
        this.value2.string = value;
        this.tip2 = tip;
    }

    onClickAttri1() {
        if (this.tip1) this.ctrlr.popToast(this.tip1);
    }

    onClickAttri2() {
        if (this.tip2) this.ctrlr.popToast(this.tip2);
    }
}
