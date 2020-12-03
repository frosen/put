/*
 * PanelPosInfo.ts
 * 位置列表中的信息漂浮窗
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { ActPosModel, ActPosType, ReputNames } from '../../../scripts/DataModel';
import { GameData } from '../../../scripts/DataSaved';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { GameDataTool } from '../../../scripts/Memory';

const PosInfoHeight = 500;

@ccclass
export class PanelPosInfo extends cc.Component {
    @property(cc.Node)
    uiScaleNode: cc.Node = null;

    @property(cc.Label)
    posName: cc.Label = null;

    @property(cc.Label)
    typeName: cc.Label = null;

    @property(cc.Label)
    subData: cc.Label = null;

    @property(cc.Layout)
    layout: cc.Layout = null;

    @property(cc.Node)
    townUI: cc.Node = null;

    @property(cc.ProgressBar)
    townBar: cc.ProgressBar = null;

    @property(cc.Label)
    townLbl: cc.Label = null;

    @property(cc.Node)
    wildUI: cc.Node = null;

    @property([cc.Node])
    wildStates: cc.Node[] = [];

    setData(actPosModel: ActPosModel, gameData: GameData) {
        this.posName.string = actPosModel.cnName;
        ListViewCell.rerenderLbl(this.posName);
        this.layout.updateLayout();

        if (actPosModel.type === ActPosType.town) {
            this.townUI.opacity = 255;
            this.wildUI.opacity = 0;

            this.typeName.string = '城镇';
            this.subData.node.parent.opacity = 255;

            const { rank, value, max } = GameDataTool.getCurReputData(gameData, gameData.curPosId);

            this.subData.string = ReputNames[rank];
            this.townBar.progress = value / max;
            this.townLbl.string = `当前声望：${value}/${max}`;
        } else {
            this.wildUI.opacity = 255;
            this.townUI.opacity = 0;

            this.typeName.string = '野外';
            this.subData.node.parent.opacity = 0;
        }
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
