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
        let gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl) return;

        let posId = gameData.curPosId;

        GameDataTool.addPos(gameData, posId);
        let pd: PosData = gameData.posDataDict[posId];

        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.curPosId !== pd.id || this.dirtyToken !== curDirtyToken) {
            this.curPosId = pd.id;
            this.dirtyToken = curDirtyToken;
            this.resetListview();
        }
    }

    resetListview() {
        this.lvd.initData();
        this.listView.resetContent();
    }

    afterPageShowAnim() {
        let gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl) this.ctrlr.pushPage(PageActExpl, null, false);
    }

    onScrolling() {
        let y = this.listView.content.y;
        this.posInfo.onScrolling(y);
    }
}
