/*
 * CellPsgeEnd.ts
 * 结尾
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPsgeBase } from '../../../scripts/CellPsgeBase';

@ccclass
export class CellPsgeEnd extends CellPsgeBase {
    @property(cc.Label)
    lbl: cc.Label = null!;

    setEvtName(name: string) {
        this.lbl.string = `—————— ${name} 完成 ——————`;
    }
}
