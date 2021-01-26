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
import { ListViewCell } from '../../../scripts/ListViewCell';
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

        this.listView.node.on(ListView.EventType.scrolling, this.onScrolling.bind(this));
        this.listView.node.on(ListView.EventType.cellShow, this.onCellShow.bind(this));

        this.listView.node.on(cc.Node.EventType.TOUCH_MOVE, this.onListMove.bind(this));
        cc.director.on(cc.Director.EVENT_AFTER_DRAW, this.afterDraw.bind(this));
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

        // 根据进度计算list显示位置
        const lv = this.listView;
        const lPos = this.lvd.getListPosByProg(this.evt.sProg);
        let allCellH = 0;
        for (let index = 0; ; index++) {
            const psgeIdx = this.lvd.getPsgeIdxByRowIdx(index);
            if (psgeIdx > lPos) break;
            const cellH = this.lvd.heightForRow(lv, index);
            allCellH += cellH;
        }

        allCellH -= 50; // 最后一个cell少露出一些
        const curY = Math.max(allCellH - lv.node.height, 0);
        lv.clearContent();
        lv.createContent(curY);

        // 根据最终显示位置，更新进度，并显示动画
        const btmCellData = lv.disCellDataDict[lv.disBtmRowIdx];
    }

    updateCurCells() {}

    onScrolling(listView: ListView) {
        cc.log('STORM cc ^_^ >>>>>>> ');
        const disCellDataDict = listView.disCellDataDict;
        for (let index = listView.disBtmRowIdx; index >= listView.disTopRowIdx; index--) {
            const data = disCellDataDict[index];
            const psgeIdx = this.lvd.getPsgeIdxByRowIdx(index);
            if (psgeIdx < 0) continue;
            const psge = this.lvd.psgesInList[psgeIdx];
            cc.log(
                'STORM cc ^_^  ',
                index,
                data.id,
                data.cell.node.y + listView.content.y + listView.node.height - 200 > 0,
                psge ? psge.idx : '??'
            );
        }
    }

    onCellShow(listView: ListView, key: string, idx: number, cellData: { cell: ListViewCell; id: string }) {
        if (idx === 0 && key === ListView.CellEventKey.top) {
            cc.log('PUT Story get top');
        } else if (idx === this.lvd.numberOfRows(listView) - 1) {
            if (key === ListView.CellEventKey.btm) {
                cc.log('PUT Story get bottom');
                this.lvd.updateListStrData(this.lvd.to, true);
                this.listView.resetContent(true);
            } else {
            }
        }
    }

    // 优化：如果当前帧无位置变化则更新 -----------------------------------------------------------------

    optimizing: boolean = false;

    onListMove() {
        this.optimizing = true;
    }

    lastY: number = 0;
    interval: number = 0;

    afterDraw() {
        if (this.optimizing) {
            const curY = this.listView.content.y;
            if (curY === this.lastY) {
                if (this.interval <= 0) {
                    this.interval = 15;
                    this.lvd.loadNextStrData();
                }
            } else this.lastY = curY;

            this.interval--;
        }
    }

    // 退出 -----------------------------------------------------------------

    beforePageHideAnim(willDestroy: boolean) {
        if (willDestroy) {
            GameDataTool.leaveEvt(this.ctrlr.memory.gameData, this.evtId);
        }
    }
}
