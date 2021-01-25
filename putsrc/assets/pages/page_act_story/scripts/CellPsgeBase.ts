/*
 * CellPsgeBase.ts
 * 段落基类
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../scripts/ListViewCell';

@ccclass
export class CellPsgeBase extends ListViewCell {
    checkBake() {}

    @property(cc.Node)
    root: cc.Node = null!;
}
