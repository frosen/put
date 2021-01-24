/*
 * PageStory.ts
 * 故事页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { StoryModelDict } from '../../../configs/EvtModelDict';
import { StoryModel } from '../../../scripts/DataModel';
import { Evt, StoryGainType } from '../../../scripts/DataSaved';
import { ListView } from '../../../scripts/ListView';
import { GameDataTool } from '../../../scripts/Memory';
import { NavBar } from '../../../scripts/NavBar';
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

    setData(pageData: { evtId: string }) {
        cc.assert(pageData && pageData.evtId, 'PUT Story必有evtId');
        const gameData = this.ctrlr.memory.gameData;

        this.evtId = pageData.evtId;
        this.storyModel = StoryModelDict[this.evtId];
        this.evt = gameData.evtDict[this.evtId];

        if (!gameData.curEvtId) GameDataTool.enterEvt(gameData, this.evtId);
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            this.ctrlr.popAlert('确定退出？', this.onClickBack.bind(this));
            return false;
        });
        navBar.setTitle(this.storyModel.cnName);
    }

    onClickBack(key: number) {
        if (key === 1) {
            const storyJIT = this.ctrlr.memory.gameData.storyJIT;
            for (const gain of storyJIT.gains) {
                const t = gain.gType;
                if (t === StoryGainType.cnsum) {
                } else if (t === StoryGainType.equip) {
                } else if (t === StoryGainType.pet) {
                } else {
                }
            }
            this.ctrlr.popPage();
        }
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

    onCellShow(listView: ListView, key: string, idx: number) {
        if (idx === 0 && key === ListView.CellEventKey.top) {
            cc.log('^_^! get top');
        } else if (idx === this.lvd.numberOfRows(listView) - 1 && key === ListView.CellEventKey.btm) {
            cc.log('^_^! get bottom');
        }
    }

    beforePageHideAnim(willDestroy: boolean) {
        if (willDestroy) {
            GameDataTool.leaveEvt(this.ctrlr.memory.gameData, this.evtId);
        }
    }
}
