/*
 * PanelSelfInfo.ts
 * 个人列表中的信息漂浮窗
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { BaseCtrlr } from '../../../scripts/BaseCtrlr';
import { GameData } from '../../../scripts/DataSaved';

const H1 = 384.0;
const H2 = 280.0;

@ccclass
export class PanelSelfInfo extends cc.Component {
    ctrlr: BaseCtrlr = null;

    @property(cc.Node)
    uiMoveNode: cc.Node = null;

    @property(cc.Node)
    uiScaleNode: cc.Node = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    roleName: cc.Label = null;

    @property(cc.Label)
    userInfo: cc.Label = null;

    setData(gameData: GameData) {
        this.roleName.string = gameData.roleName;
    }

    onScrolling(y: number) {
        let realY = y - this.node.height;
        if (realY > 0) realY = 0;
        else if (realY < -200 - this.node.height) realY = -200 - this.node.height;
        this.node.y = realY;

        this.uiScaleNode.scale = this.getRate(realY, -384.0, -280.0) * 0.53 + 0.47;
        this.uiMoveNode.y = this.getRate(realY, -280.0, 0) * 280;

        // this.roleName.node.opacity = Math.ceil(this.getRate(realY, -345.0, -245.0) * 255);
        // this.userInfo.node.opacity = Math.ceil(this.getRate(realY, -200.0, -110.0) * 255);
    }

    getRate(cur: number, n1: number, n2: number): number {
        let rate: number;
        if (cur < n1) rate = 1;
        else if (cur > n2) rate = 0;
        else rate = (cur - n2) / (n1 - n2);
        return rate;
    }
}
