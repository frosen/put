/*
 * PanelPosInfo.ts
 * 位置列表中的信息漂浮窗
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { ActPosModel } from '../../../scripts/DataModel';

const PosInfoHeight = 500;

@ccclass
export class PanelPosInfo extends cc.Component {
    @property(cc.Node)
    uiScaleNode: cc.Node = null;

    @property(cc.Label)
    posName: cc.Label = null;

    setData(actPosModel: ActPosModel) {
        this.posName.string = actPosModel.cnName;
    }

    onScrolling(y: number) {
        let realY = y - PosInfoHeight;
        if (realY > 0) realY = 0;
        this.node.y = realY;

        let rate: number;
        if (realY < -141) rate = 1;
        else if (realY > 0) rate = 0;
        else rate = realY / -141;
        this.uiScaleNode.scale = rate * 0.63 + 0.37;
    }
}
