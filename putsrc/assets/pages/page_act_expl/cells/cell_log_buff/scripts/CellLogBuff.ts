/*
 * CellLogBuff.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ExplLogData } from '../../../../../scripts/ExplUpdater';
import { CellLogBase } from '../../../scripts/CellLogBase';
import { PageActExplLVD } from '../../../scripts/PageActExplLVD';

@ccclass
export class CellLogBuff extends CellLogBase {
    @property(cc.Sprite)
    petNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    takeSp: cc.Sprite = null;
    @property(cc.Sprite)
    casterSp: cc.Sprite = null;
    @property(cc.Sprite)
    srcSp: cc.Sprite = null;
    @property(cc.Sprite)
    makeSp: cc.Sprite = null;
    @property(cc.Sprite)
    buffNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    effectSp: cc.Sprite = null;

    @property(cc.Node)
    baseNode: cc.Node = null;

    init(lvd: PageActExplLVD) {
        super.init(lvd);

        this.lvd.setSpByString(this.takeSp, '受到');
        this.lvd.setSpByString(this.makeSp, '造成的');
        this.lvd.setSpByString(this.effectSp, '效果');
    }

    setData(data: ExplLogData) {
        const petName = data.data[0];
        const buffName = data.data[1];
        const casterName = data.data[2];
        const srcName = data.data[3];

        this.lvd.setSpByString(this.petNameSp, petName);
        this.lvd.setSpByString(this.casterSp, casterName);
        this.lvd.setSpByString(this.srcSp, srcName);
        this.lvd.setSpByString(this.buffNameSp, buffName);

        let curX = 0;
        for (let index = 0; index < this.baseNode.children.length; index++) {
            const node = this.baseNode.children[index];
            node.x = curX;
            curX += node.width;
        }
        this.baseNode.width = curX;
    }
}
