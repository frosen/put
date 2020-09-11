/*
 * CellLogBuff.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellLogBase } from 'pages/page_act_expl/scripts/CellLogBase';
import { ExplLogData } from 'scripts/ExplUpdater';
import { PageActExplLVD } from 'pages/page_act_expl/scripts/PageActExplLVD';

@ccclass
export class CellLogBuff extends CellLogBase {
    @property(cc.Sprite)
    petNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    takeSp: cc.Sprite = null;
    @property(cc.Sprite)
    buffNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    effectSp: cc.Sprite = null;

    @property(cc.Node)
    baseNode: cc.Node = null;

    init(lvd: PageActExplLVD) {
        super.init(lvd);

        this.lvd.setSpByString(this.takeSp, '受到了');
        this.lvd.setSpByString(this.effectSp, '效果');
    }

    setData(data: ExplLogData) {
        // const logStr = `${petModelDict[aim.pet.id].cnName}受到${name}效果`;
        // this.logCallback(logStr);

        const petName = data.data[0];
        const buffName = data.data[1];

        this.lvd.setSpByString(this.petNameSp, petName);
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
