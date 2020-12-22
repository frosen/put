/*
 * EnemyDetail.ts
 * enemy细节
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { BattlePet } from '../../../scripts/DataOther';

@ccclass
export class EnemyDetail extends cc.Component {
    show() {
        this.node.stopAllActions();
        cc.tween(this.node).to(0.2, { opacity: 255 }).start();
    }

    hide() {
        this.node.stopAllActions();
        if (this.node.opacity > 0) cc.tween(this.node).to(0.2, { opacity: 0 }).start();
    }

    setData(bPet: BattlePet) {}
}
