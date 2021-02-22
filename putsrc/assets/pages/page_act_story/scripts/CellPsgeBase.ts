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
    checkRoot() {}

    @property(cc.Node)
    root: cc.Node = null!;

    psge!: Psge;

    hidden: boolean = false;

    show() {
        this.hidden = false;
        this.root.stopAllActions();
        this.root.y = 0;
        this.root.opacity = 255;
    }

    showWithAction(delay: number = 0) {
        this.hidden = false;
        this.root.stopAllActions();
        if (delay > 0) {
            cc.tween(this.root).delay(delay).set({ opacity: 255 }).to(0.3, { y: 0 }, { easing: cc.easing.quadOut }).start();
        } else {
            cc.tween(this.root).set({ opacity: 255 }).to(0.3, { y: 0 }, { easing: cc.easing.quadOut }).start();
        }
    }

    hide() {
        this.hidden = true;
        this.root.stopAllActions();
        this.root.y = -500;
        this.root.opacity = 0;
    }

    isHidden() {
        return this.hidden;
    }
}
