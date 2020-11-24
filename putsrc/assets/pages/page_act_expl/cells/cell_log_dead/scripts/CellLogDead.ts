/*
 * CellLogDead.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ExplLogData } from '../../../../../scripts/ExplUpdater';
import { CellLogBase } from '../../../scripts/CellLogBase';
import { PageActExplLVD } from '../../../scripts/PageActExplLVD';

@ccclass
export class CellLogDead extends CellLogBase {
    @property(cc.Sprite)
    petNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    deadSp: cc.Sprite = null;

    @property(cc.Node)
    baseNode: cc.Node = null;

    init(lvd: PageActExplLVD) {
        super.init(lvd);

        this.lvd.setSpByString(this.deadSp, '被击败了');
    }

    setData(data: ExplLogData) {
        const petName = data.data;
        this.lvd.setSpByString(this.petNameSp, petName);

        let curX = 0;
        for (let index = 0; index < this.baseNode.children.length; index++) {
            const node = this.baseNode.children[index];
            node.x = curX;
            curX += node.width;
        }
        this.baseNode.width = curX;
    }
}
