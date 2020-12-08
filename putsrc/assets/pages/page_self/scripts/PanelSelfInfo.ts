/*
 * PanelSelfInfo.ts
 * 个人列表中的信息漂浮窗
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { BaseCtrlr } from '../../../scripts/BaseCtrlr';
import { GameData } from '../../../scripts/DataSaved';

const NavBarHeight = 141;

@ccclass
export class PanelSelfInfo extends cc.Component {
    ctrlr: BaseCtrlr = null;

    @property(cc.Node)
    uiScaleNode: cc.Node = null;

    @property(cc.Node)
    uiOpacityNode: cc.Node = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Label)
    selfName: cc.Label = null;

    @property(cc.Label)
    guildName: cc.Label = null;

    setData(gameData: GameData) {
        this.selfName.string = gameData.roleName;
    }

    onScrolling(y: number) {
        let realY = y - this.node.height;
        // cc.log('STORM cc ^_^ y ', y, realY);
        if (realY > 0) realY = 0;
        else if (realY < -200 - this.node.height) realY = -200 - this.node.height;
        this.node.y = realY;
        // cc.log('STORM cc ^_^ yyyy ', realY);

        let rate: number;
        if (realY < -NavBarHeight) rate = 1;
        else if (realY > 0) rate = 0;
        else rate = realY / -NavBarHeight;
        this.uiScaleNode.scale = rate * 0.63 + 0.37;
    }
}
