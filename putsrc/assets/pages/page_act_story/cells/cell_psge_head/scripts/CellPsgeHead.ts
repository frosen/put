/*
 * CellPsgeHead.ts
 * 开头
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPsgeBase } from '../../../scripts/CellPsgeBase';

@ccclass
export class CellPsgeHead extends CellPsgeBase {
    @property(cc.Label)
    lbl: cc.Label = null!;

    setEvtName(name: string) {
        this.lbl.string = `◇ ${name} ◇`;
    }
}
