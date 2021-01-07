/*
 * CellPosBtn.ts
 * 位置列表中的按钮项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellActInfo } from '../../../scripts/PageActLVD';
import { ListViewCell } from '../../../../../scripts/ListViewCell';

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

    clickCallback: (info: CellActInfo) => void = null;

    cellInfo1: CellActInfo = null;
    cellInfo2: CellActInfo = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.btn1.node.on('click', this.callback1.bind(this));
        this.btn2.node.on('click', this.callback2.bind(this));
    }

    setBtn1(cellInfo: CellActInfo) {
        this.cellInfo1 = cellInfo;
        if (this.cellInfo1) {
            this.lblMain1.string = cellInfo.cnName || '';
            const { str, color } = this.getSubInfo(cellInfo);
            this.lblSub1.string = str || '';
            this.lblSub1.node.color = color || cc.color(120, 120, 120);
        } else {
            this.lblMain1.string = '';
            this.lblSub1.string = '';
        }
    }

    setBtn2(cellInfo: CellActInfo) {
        this.cellInfo2 = cellInfo;
        if (this.cellInfo2) {
            this.lblMain2.string = cellInfo.cnName || '';
            const { str, color } = this.getSubInfo(cellInfo);
            this.lblSub2.string = str || '';
            this.lblSub2.node.color = color || cc.color(120, 120, 120);
        } else {
            this.lblMain2.string = '';
            this.lblSub2.string = '';
        }
    }

    callback1() {
        if (this.cellInfo1) this.clickCallback(this.cellInfo1);
    }

    callback2() {
        if (this.cellInfo2) this.clickCallback(this.cellInfo2);
    }

    getSubInfo(actInfo: CellActInfo): { str: string; color?: cc.Color } {
        if (actInfo.getSubInfo) {
            return actInfo.getSubInfo(this.ctrlr) || { str: null };
        } else return { str: null };
    }
}
