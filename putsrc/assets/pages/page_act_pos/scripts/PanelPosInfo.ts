/*
 * PanelPosInfo.ts
 * 位置列表中的信息漂浮窗
 * luleyan
 */

const { ccclass, property } = cc._decorator;

const PosInfoHeight = 335;

@ccclass
export class PanelPosInfo extends cc.Component {
    @property(cc.Label)
    posName: cc.Label = null;

    setData(posName: string) {
        this.posName.string = posName;
    }

    onScrolling(y: number) {
        let realY = y - PosInfoHeight;
        if (realY > 0) realY = 0;
        cc.log('STORM cc ^_^ ??? ', realY);
        this.node.y = realY;
    }
}
