/*
 * PageActPos.ts
 * 位置页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import PageBase from 'scripts/PageBase';
import PageActPosLVD from './PageActPosLVD';
import ListView from 'scripts/ListView';
import { ActPos } from 'scripts/DataSaved';
import { GameDataTool } from 'scripts/Memory';

@ccclass
export default class PageActPos extends PageBase {
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
        this.ctrlr.setTitle('位置');

        let gameData = this.ctrlr.memory.gameData;
        let posId = gameData.curPosId;

        let actPos: ActPos = null;
        if (!gameData.posDataDict.hasOwnProperty(posId)) {
            actPos = GameDataTool.addActPos(this.ctrlr.memory.gameData, posId);
        } else {
            actPos = gameData.posDataDict[posId];
        }

        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.curPosId != actPos.id || this.dirtyToken != curDirtyToken) {
            this.curPosId = actPos.id;
            this.dirtyToken = curDirtyToken;
            this.resetListview();
        }
    }

    resetListview() {
        this.lvd.clearData();
        this.listView.resetContent();
    }
}
