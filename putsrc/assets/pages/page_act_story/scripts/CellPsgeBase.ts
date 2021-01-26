/*
 * CellPsgeBase.ts
 * 段落基类
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { Psge } from '../../../scripts/DataModel';
import { ListViewCell } from '../../../scripts/ListViewCell';

@ccclass
export class CellPsgeBase extends ListViewCell {
    checkBake() {}

    @property(cc.Node)
    root: cc.Node = null!;

    psge!: Psge;

    hidden: boolean = false;

    show() {
        this.hidden = false;
        this.root.stopAllActions();
    }

    showWithAction(delay: number = 0) {
        this.hidden = false;
        this.root.stopAllActions();
    }

    hide() {
        this.hidden = true;
        this.root.stopAllActions();
    }

    isHidden() {
        return this.hidden;
    }
}
