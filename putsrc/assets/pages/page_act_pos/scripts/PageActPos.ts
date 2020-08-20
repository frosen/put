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

@ccclass
export class PageActPos extends PageBase {
    lvd: PageActPosLVD = null;
    listView: ListView = null;

    curPosId: string = '';
    dirtyToken: number = 0;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.lvd = this.getComponent(PageActPosLVD);
        this.listView = this.getComponentInChildren(ListView);
    }

    onPageShow() {
        let gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl) return;

        this.ctrlr.setTitle('位置');
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
        this.lvd.clearData();
        this.listView.resetContent();
    }

    afterPageShowAnim() {
        let gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl) this.ctrlr.pushPage(PageActExpl, null, false);
    }
}
