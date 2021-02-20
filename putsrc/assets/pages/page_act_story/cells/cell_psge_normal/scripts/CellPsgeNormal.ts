/*
 * CellPsgeNormal.ts
 * 普通段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { rerenderLbl } from '../../../../../scripts/Utils';
import { CellPsgeBase } from '../../../scripts/CellPsgeBase';

@ccclass
export class CellPsgeNormal extends CellPsgeBase {
    @property(cc.Label)
    lbl: cc.Label = null!;

    setData(str: string) {
        this.lbl.string = str;
        rerenderLbl(this.lbl);
        this.node.height = this.lbl.node.height + 40; // label上下边各留出20像素
    }
}
