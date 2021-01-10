/*
 * CellPsgeNormal.ts
 * 普通段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellPsgeNormal extends ListViewCell {
    checkBake() {}

    @property(cc.Label)
    lbl: cc.Label = null!;

    setData(str: string) {
        this.lbl.string = str;
        ListViewCell.rerenderLbl(this.lbl);
        this.node.height = this.lbl.node.height + 30; // label上下边各留出15像素
    }
}