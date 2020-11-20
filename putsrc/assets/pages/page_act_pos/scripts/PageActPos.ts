/*
 * PageActPos.ts
 * 位置页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { PageBase } from 'scripts/PageBase';
import { PageActPosLVD } from './PageActPosLVD';
import { ListView } from 'scripts/ListView';
import { PosData } from 'scripts/DataSaved';
import { GameDataTool } from 'scripts/Memory';
import { PageActExpl } from 'pages/page_act_expl/scripts/PageActExpl';
import { PanelPosInfo } from './PanelPosInfo';
import { actPosModelDict } from 'configs/ActPosModelDict';

@ccclass
export class PageActPos extends PageBase {
    navHidden: boolean = true;

    @property(ListView)
    listView: ListView = null;
    lvd: PageActPosLVD = null;

    @property(PanelPosInfo)
    posInfo: PanelPosInfo = null;

    curPosId: string = '';
    dirtyToken: number = 0;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageActPosLVD;
        this.listView.node.on('scrolling', this.onScrolling.bind(this));
    }

    onPageShow() {
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl && !gameData.curExpl.afb) return;

        const posId = gameData.curPosId;

        GameDataTool.addPos(gameData, posId);
        const pd: PosData = gameData.posDataDict[posId];

        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.curPosId !== pd.id || this.dirtyToken !== curDirtyToken) {
            this.curPosId = pd.id;
            this.dirtyToken = curDirtyToken;
            this.resetListview();
        }
    }

    resetListview() {
        this.lvd.initData();
        this.listView.resetContent(true);

        const y = PageActPos.ListViewPosDict[this.curPosId] || 0;
        this.listView.clearContent();
        this.listView.createContent(y);
        this.posInfo.onScrolling(y);

        const actPosModel = actPosModelDict[this.curPosId];
        this.posInfo.setData(actPosModel);
    }

    afterPageShowAnim() {
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl && !gameData.curExpl.afb) this.ctrlr.pushPage(PageActExpl, null, false);
    }

    static ListViewPosDict: { [key: string]: number } = {};

    onScrolling() {
        const y = this.listView.content.y;
        if (this.curPosId) PageActPos.ListViewPosDict[this.curPosId] = y;
        this.posInfo.onScrolling(y);
    }
}
