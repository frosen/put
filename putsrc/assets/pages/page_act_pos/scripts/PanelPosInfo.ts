/*
 * PanelPosInfo.ts
 * 位置列表中的信息漂浮窗
 * luleyan
 */

const { ccclass, property } = cc._decorator;

const PosInfoHeight = 335;

@ccclass
export class PanelPosInfo extends cc.Component {
    @property(cc.Node)
    uiScaleNode: cc.Node = null;

    @property(cc.Label)
    posName: cc.Label = null;

    setData(posName: string) {
        this.posName.string = posName;
    }

    onScrolling(y: number) {
        let realY = y - PosInfoHeight;
        if (realY > 0) realY = 0;
        this.node.y = realY;

        let scale: number;
        if (realY < -107) scale = 1;
        else if (realY > 0) scale = 0.37;
        else scale = (realY / -107) * 0.63 + 0.37;
        this.uiScaleNode.scale = scale;
    }
}
