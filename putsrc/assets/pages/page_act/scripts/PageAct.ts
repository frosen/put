/*
 * PageAct.ts
 * 位置页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { PageBase } from '../../../scripts/PageBase';
import { PageActLVD } from './PageActLVD';
import { ListView } from '../../../scripts/ListView';
import { PosData } from '../../../scripts/DataSaved';
import { GameDataTool } from '../../../scripts/Memory';
import { PageActExpl } from '../../page_act_expl/scripts/PageActExpl';
import { PanelPosInfo } from './PanelPosInfo';
import { ActPosModelDict } from '../../../configs/ActPosModelDict';

@ccclass
export class PageAct extends PageBase {
    navHidden: boolean = true;

    @property(ListView)
    listView: ListView = null;
    lvd: PageActLVD = null;

    @property(PanelPosInfo)
    posInfo: PanelPosInfo = null;

    curPosId: string = '';
    dirtyToken: number = 0;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageActLVD;
        this.listView.node.on(ListView.EventType.scrolling, this.onScrolling.bind(this));

        this.posInfo.ctrlr = this.ctrlr;
    }

    onPageShow() {
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.expl && !gameData.expl.afb) return;

        const posId = gameData.curPosId;
        GameDataTool.addPos(gameData, posId);
        GameDataTool.addEvt(gameData, posId);

        const pd: PosData = gameData.posDataDict[posId];
        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.curPosId !== pd.id || this.dirtyToken !== curDirtyToken) {
            this.curPosId = pd.id;
            this.dirtyToken = curDirtyToken;
            this.resetListview();

            const actPosModel = ActPosModelDict[this.curPosId];
            this.posInfo.setData(actPosModel, gameData);
        }
    }

    resetListview() {
        this.lvd.initData();
        this.listView.resetContent(true);

        const y = PageAct.ListViewPosDict[this.curPosId] || 0;
        this.listView.clearContent();
        this.listView.createContent(y);
        this.posInfo.onScrolling(y);
    }

    afterPageShowAnim() {
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.expl && !gameData.expl.afb) this.ctrlr.pushPage(PageActExpl, null, false);
    }

    static ListViewPosDict: { [key: string]: number } = {};

    onScrolling() {
        const y = this.listView.content.y;
        if (this.curPosId) PageAct.ListViewPosDict[this.curPosId] = y;
        this.posInfo.onScrolling(y);
    }
}
