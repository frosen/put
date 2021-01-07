/*
 * PanelPosInfo.ts
 * 位置列表中的信息漂浮窗
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { PAKey } from '../../../configs/ActPosModelDict';
import { BaseCtrlr } from '../../../scripts/BaseCtrlr';
import { ActPosModel, ActPosType, ExplModel, ReputNames } from '../../../scripts/DataModel';
import { GameData, PADExpl } from '../../../scripts/DataSaved';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { GameDataTool } from '../../../scripts/Memory';

const NavBarHeight = 141;

@ccclass
export class PanelPosInfo extends cc.Component {
    ctrlr: BaseCtrlr = null;

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

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
        const posId = actPosModel.id;

        this.bg.spriteFrame = this.ctrlr.runningImgMgr[posId].bg;
        this.icon.spriteFrame = this.ctrlr.runningImgMgr[posId].icon;

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

            const posData = gameData.posDataDict[gameData.curPosId];
            let curStep: number;
            if (posData.actDict.hasOwnProperty(PAKey.expl)) {
                const pADExpl = posData.actDict[PAKey.expl] as PADExpl;
                curStep = pADExpl.doneStep + 1;
            } else curStep = 0;

            const explModel: ExplModel = actPosModel.actMDict[PAKey.expl] as ExplModel;
            const stepMax = explModel.stepMax;

            for (let index = 0; index < this.wildStates.length; index++) {
                const stateUI = this.wildStates[index];
                stateUI.opacity = index < curStep ? 255 : 0;
                stateUI.parent.opacity = index < stepMax ? 255 : 0;
            }
        }
    }

    onScrolling(y: number) {
        let realY = y - this.node.height;
        if (realY > 0) realY = 0;
        else if (realY < -200 - this.node.height) realY = -200 - this.node.height;
        this.node.y = realY;

        let rate: number;
        if (realY < -NavBarHeight) rate = 1;
        else if (realY > 0) rate = 0;
        else rate = realY / -NavBarHeight;
        this.uiScaleNode.scale = rate * 0.63 + 0.37;
    }
}
