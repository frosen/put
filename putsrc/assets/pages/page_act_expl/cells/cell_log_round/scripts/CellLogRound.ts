/*
 * CellLogRound.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellLogBase } from 'pages/page_act_expl/scripts/CellLogBase';
import { ExplLogData } from 'scripts/ExplUpdater';
import { PageActExplLVD } from 'pages/page_act_expl/scripts/PageActExplLVD';
import { LogNumSprite } from 'pages/page_act_expl/scripts/LogNumSprite';

@ccclass
export class CellLogRound extends CellLogBase {
    @property(cc.Sprite)
    diSp: cc.Sprite = null;
    @property(LogNumSprite)
    numSp: LogNumSprite = null;
    @property(cc.Sprite)
    roundSp: cc.Sprite = null;

    @property(cc.Node)
    baseNode: cc.Node = null;

    init(lvd: PageActExplLVD) {
        super.init(lvd);

        this.lvd.setSpByString(this.diSp, '第');
        this.numSp.init(lvd);
        this.lvd.setSpByString(this.roundSp, '回合');
    }

    setData(data: ExplLogData) {
        const roundNum = data.data;
        this.numSp.setNum(roundNum);

        let curX = 0;
        for (let index = 0; index < this.baseNode.children.length; index++) {
            const node = this.baseNode.children[index];
            node.x = curX;
            curX += node.width;
        }
        this.baseNode.width = curX;
    }
}
