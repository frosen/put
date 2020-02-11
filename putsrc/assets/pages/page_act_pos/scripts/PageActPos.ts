/*
 * PageActPos.ts
 * 位置页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import PageBase from 'scripts/PageBase';
import PageActPosLVD from './PageActPosLVD';
import ListView from 'scripts/ListView';

@ccclass
export default class PageActPos extends PageBase {
    lvd: PageActPosLVD = null;
    listview: ListView = null;

    posToken: string = '';

    onInit() {
        this.lvd = this.getComponent(PageActPosLVD);
        this.listview = this.getComponentInChildren(ListView);
    }

    onPageShow() {
        let gameData = this.ctrlr.memory.gameData;
        let posId = gameData.curPosId;

        let actPos = null;
        if (!gameData.posDataDict.hasOwnProperty(posId)) {
            actPos = this.ctrlr.memory.addActPos(posId);
        } else {
            actPos = gameData.posDataDict[posId];
        }
        let curPosToken = actPos.token;

        if (curPosToken != this.posToken) {
            this.posToken = curPosToken;
            this.lvd.clearData();
            this.listview.clearContent();
            this.listview.createContent();
        }

        this.ctrlr.setTitle('位置');
    }
}
