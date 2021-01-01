/*
 * CellLogBuffHurt.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { EleDarkColors, SimpleEleTypeNames } from '../../../../../scripts/DataSaved';
import { ExplLogData } from '../../../../../scripts/ExplUpdater';

import { CellLogBase } from '../../../scripts/CellLogBase';
import { PageActExplLVD } from '../../../scripts/PageActExplLVD';
import { LogNumSprite } from '../../../scripts/LogNumSprite';

@ccclass
export class CellLogBuffHurt extends CellLogBase {
    @property(cc.Sprite)
    petNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    yinSp: cc.Sprite = null;
    @property(cc.Sprite)
    handleSp: cc.Sprite = null;
    @property(LogNumSprite)
    dmgSp: LogNumSprite = null;
    @property(cc.Sprite)
    pointSp: cc.Sprite = null;

    @property(cc.Node)
    baseNode: cc.Node = null;

    init(lvd: PageActExplLVD) {
        super.init(lvd);

        this.lvd.setSpByString(this.yinSp, '因持续效果');
        this.lvd.setSpByString(this.pointSp, '点');
        this.dmgSp.init(this.lvd);
    }

    setData(data: ExplLogData) {
        const petName = data.data[0];
        const dmg = data.data[1];

        this.lvd.setSpByString(this.petNameSp, petName);

        if (dmg > 0) {
            this.lvd.setSpByString(this.handleSp, '造成伤害');
            this.dmgSp.setNum(dmg, cc.color(200, 50, 50));
        } else {
            this.lvd.setSpByString(this.handleSp, '恢复血量');
            this.dmgSp.setNum(-dmg, cc.color(50, 200, 50));
        }

        let curX = 0;
        for (let index = 0; index < this.baseNode.children.length; index++) {
            const node = this.baseNode.children[index];
            node.x = curX;
            curX += node.width;
        }
        this.baseNode.width = curX;
    }
}
