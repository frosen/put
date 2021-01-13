/*
 * PageStory.ts
 * 故事页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { StoryModel } from '../../../scripts/DataModel';
import { Evt } from '../../../scripts/DataSaved';
import { ListView } from '../../../scripts/ListView';
import { PageBase } from '../../../scripts/PageBase';
import { PageStoryLVD } from './PageStoryLVD';

@ccclass
export class PageStory extends PageBase {
    @property(ListView)
    listView: ListView = null!;
    lvd!: PageStoryLVD;

    evtId!: string;
    storyModel!: StoryModel;
    evt!: Evt;

    listRunning: boolean = false;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageStoryLVD;
        this.lvd.page = this;

        this.listView.node.on(ListView.EventType.cellShow, this.onCellShow.bind(this));
    }

    setData(data: { evtId: string }) {
        cc.assert(data && data.evtId, 'PUT Story必有evtId');
        this.evtId = data.evtId;
        this.storyModel = StoryModel[this.evtId];
        this.evt = this.ctrlr.memory.gameData.evtDict[this.evtId];
    }

    onPageShow() {
        if (!this.listRunning) {
            this.listRunning = true;
            this.runListview();
        } else {
            this.updateCurCells();
        }
    }

    runListview() {
        this.lvd.initData();

        let allCellH = 0;
        for (let index = 0; index < this.evt.prog; index++) {
            const cellH = this.lvd.heightForRow(this.listView, index);
            allCellH += cellH;
        }
        const curY = Math.max(allCellH - this.listView.node.height, 0);
        this.listView.clearContent();
        this.listView.createContent(curY);
    }

    updateCurCells() {}

    onCellShow(listView: ListView, key: string, idx: number) {}
}
