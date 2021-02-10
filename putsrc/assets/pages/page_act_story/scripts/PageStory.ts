/*
 * PageStory.ts
 * 故事页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { StoryModelDict } from '../../../configs/EvtModelDict';
import { EvtPsge, NormalPsge, PsgeType, QuestPsge, SelectionPsge, StoryModel } from '../../../scripts/DataModel';
import { Evt, QuestAmplType, QuestDLineType, StoryGainType, StoryJIT } from '../../../scripts/DataSaved';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { EquipTool, EvtTool, GameDataTool, PetTool, QuestTool } from '../../../scripts/Memory';
import { NavBar } from '../../../scripts/NavBar';
import { PageBase } from '../../../scripts/PageBase';
import { CellPsgeEvt } from '../cells/cell_psge_evt/scripts/CellPsgeEvt';
import { CellPsgeQuest } from '../cells/cell_psge_quest/scripts/CellPsgeQuest';
import { CellPsgeSelection } from '../cells/cell_psge_selection/scripts/CellPsgeSelection';
import { CellPsgeBase } from './CellPsgeBase';
import { PageStoryLVD } from './PageStoryLVD';

@ccclass
export class PageStory extends PageBase {
    @property(ListView)
    listView: ListView = null!;
    lvd!: PageStoryLVD;

    @property(cc.Node)
    touchLayer: cc.Node = null!;

    evtId!: string;
    storyModel!: StoryModel;
    evt!: Evt;
    jit!: StoryJIT;

    listRunning: boolean = false;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageStoryLVD;
        this.lvd.page = this;

        this.listView.node.on(ListView.EventType.cellShow, this.onCellShow.bind(this));
        this.listView.node.on(ListView.EventType.scrolling, this.onScrolling.bind(this));

        this.listView.node.on(cc.Node.EventType.TOUCH_MOVE, this.onListMove.bind(this));
        cc.director.on(cc.Director.EVENT_AFTER_DRAW, this.afterDraw, this);

        this.touchLayer.on(cc.Node.EventType.TOUCH_START, this.onGestureStarted.bind(this));
        this.touchLayer.on(cc.Node.EventType.TOUCH_MOVE, this.onGestureMoved.bind(this));
        this.touchLayer.on(cc.Node.EventType.TOUCH_END, this.onGestureEnd.bind(this));
        this.touchLayer.on(cc.Node.EventType.TOUCH_CANCEL, this.onGestureEnd.bind(this));
        // @ts-ignore
        this.touchLayer._touchListener.setSwallowTouches(false);
    }

    setData(pageData: { evtId: string }) {
        cc.assert(pageData && pageData.evtId, 'PUT Story必有evtId');
        const gameData = this.ctrlr.memory.gameData;

        this.evtId = pageData.evtId;
        this.storyModel = StoryModelDict[this.evtId];
        this.evt = gameData.evtDict[this.evtId];

        if (!gameData.curEvtId) GameDataTool.enterEvt(gameData, this.evtId);

        this.jit = gameData.storyJIT!;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            const { itemOverflow, petOverflow } = this.checkStoryGain();
            let str = '确定退出？';
            if (itemOverflow || petOverflow) {
                let name: string | undefined;
                if (itemOverflow && petOverflow) name = '道具和精灵都';
                else if (itemOverflow) name = '道具';
                else if (petOverflow) name = '精灵';
                str += `\n\n注：本次获得的${name!}会超出最大限度，多出部分将被移除！`;
            }

            this.ctrlr.popAlert(str, (key: number) => {
                if (key === 1) {
                    this.handleStoryGain();
                    this.ctrlr.popPage();
                }
            });
            return false;
        });

        navBar.addFuncBtn('undo', [this.ctrlr.runningImgMgr.navUndo], () => {
            this.ctrlr.popAlert('确定要将当前事件进度退回到上次选择之前吗？', (key: number) => {
                if (key === 1) this.onUndo();
            });
        });
    }

    checkStoryGain(): { itemOverflow: boolean; petOverflow: boolean } {
        let itemCnt = 0;
        let petCnt = 0;
        for (const { gains } of this.jit.gainDataList) {
            for (const gain of gains) {
                const { gType: t } = gain;
                if (t === StoryGainType.cnsum || t === StoryGainType.equip) itemCnt++;
                else if (t === StoryGainType.pet) petCnt++;
            }
        }

        const gameData = this.ctrlr.memory.gameData;
        return {
            itemOverflow: itemCnt + gameData.weight > GameDataTool.getItemCountMax(gameData),
            petOverflow: petCnt + gameData.pets.length > GameDataTool.getPetCountMax(gameData)
        };
    }

    handleStoryGain() {
        const gameData = this.ctrlr.memory.gameData;
        for (const { gains } of this.jit.gainDataList) {
            for (const gain of gains) {
                const { gType: t, id } = gain;
                if (t === StoryGainType.cnsum) {
                    GameDataTool.addCnsum(gameData, id);
                } else if (t === StoryGainType.equip) {
                    GameDataTool.addEquip(gameData, EquipTool.createByFullId(id));
                } else if (t === StoryGainType.pet) {
                    GameDataTool.addPetByPet(gameData, PetTool.createByFullId(id));
                } else {
                    GameDataTool.addProTtl(gameData, id);
                }
            }
        }
        this.jit.gainDataList.length = 0;
    }

    onPageShow() {
        if (!this.listRunning) {
            this.listRunning = true;
            this.runListview();
        }
    }

    runListview() {
        this.lvd.initData();

        // 根据进度计算list显示位置
        const lv = this.listView;
        const pLIdxInProg = this.lvd.getPsgeListIdxByProg(this.evt.sProg);
        let allCellH = 0;
        for (let index = 0; ; index++) {
            const pLIdx = this.lvd.getPsgeListIdxByRowIdx(index);
            if (pLIdx > pLIdxInProg) break;
            const cellH = this.lvd.heightForRow(lv, index);
            allCellH += cellH;
            if (pLIdx === -2) break; // end之前一般都是特殊psge，height比较低，不容易露出来，所以多加一个height
        }

        allCellH -= 50; // 最后一个cell少露出一些
        const curY = Math.max(allCellH - lv.node.height, 0);
        lv.clearContent();
        lv.createContent(curY);

        // 根据最终显示位置，更新进度，并显示动画
        const needActiveDataList: { cell: CellPsgeBase; pLIdx: number }[] = [];
        const disCellDataDict = lv.disCellDataDict;
        for (let index = lv.disBtmRowIdx; index >= lv.disTopRowIdx; index--) {
            const pLIdx = this.lvd.getPsgeListIdxByRowIdx(index);
            if (pLIdx < 0) continue;
            if (pLIdx === pLIdxInProg) break;
            const cell = disCellDataDict[index].cell as CellPsgeBase;
            needActiveDataList.push({ cell, pLIdx });
        }

        let delay = 0.1;
        for (let index = needActiveDataList.length - 1; index >= 0; index--) {
            const { cell, pLIdx } = needActiveDataList[index];
            cell.hide();
            cell.showWithAction(delay);
            this.activePsge(pLIdx);
            delay += 0.1;
        }

        if (needActiveDataList.length > 0) {
            const pLIdx = needActiveDataList[0].pLIdx;
            this.evt.sProg = this.lvd.psgesInList[pLIdx].idx;
        }
        this.jit.startLProg = pLIdxInProg;
    }

    activePsge(psgeIdx: number) {
        const psge = this.lvd.psgesInList[psgeIdx];
        if (psge.pType === PsgeType.normal) {
            const nPsge = psge as NormalPsge;
            if (nPsge.gains) this.jit.gainDataList.push({ gains: nPsge.gains, lProg: psgeIdx });
            if (nPsge.mark) this.evt.rztDict[nPsge.mark] = 1;
        } else if (psge.pType === PsgeType.selection) {
            const sPsge = psge as SelectionPsge;
            this.evt.rztDict[sPsge.slcId] = 0;
        } else if (psge.pType === PsgeType.quest) {
            const qPsge = psge as QuestPsge;
            this.evt.rztDict[qPsge.questId] = 1;
        } else if (psge.pType === PsgeType.evt) {
            const ePsge = psge as EvtPsge;
            this.evt.rztDict[ePsge.evtId] = 1;
        } else if (psge.pType === PsgeType.end) {
            GameDataTool.finishEvt(this.ctrlr.memory.gameData, this.evtId);
        }
    }

    toUpdateTop: boolean = false; // onCellShow中检测到需要update，然后在onScrolling中进行，否则会有重复调用的问题
    toUpdateBtm: boolean = false;

    onCellShow(listView: ListView, key: string, idx: number, cellData: { cell: ListViewCell; id: string }) {
        if (key === ListView.CellEventKey.top) {
            if (idx > 0) {
                // pass
            } else {
                cc.log('PUT Story get top');
                this.toUpdateTop = true;
            }
        } else if (key === ListView.CellEventKey.btm) {
            if (idx < this.lvd.numberOfRows(listView) - 1) {
                const pLIdxInProg = this.lvd.getPsgeListIdxByProg(this.evt.sProg);
                const pLIdx = this.lvd.getPsgeListIdxByRowIdx(idx);
                if (pLIdx > pLIdxInProg) (cellData.cell as CellPsgeBase).hide();
            } else {
                cc.log('PUT Story get bottom');
                this.toUpdateBtm = true;
            }
        }
    }

    onScrolling(listView: ListView) {
        if (this.toUpdateTop) {
            this.toUpdateTop = false;
            const lastFrom = this.lvd.from;
            const curPos = this.listView.content.y;
            this.lvd.updateListStrData(false);
            if (this.lvd.from < lastFrom) {
                let newPos = curPos;
                for (let index = this.lvd.from; index < lastFrom; index++) {
                    newPos += this.lvd.heightsInList[index];
                }
                this.listView.clearContent();
                this.listView.createContent(newPos);
            }
        } else if (this.toUpdateBtm) {
            this.toUpdateBtm = false;
            const lastTo = this.lvd.to;
            this.lvd.updateListStrData(true);
            if (this.lvd.to > lastTo) this.listView.resetContent(true);
        } else {
            let progMax = -1;
            const disCellDataDict = listView.disCellDataDict;
            for (let index = listView.disBtmRowIdx; index >= listView.disTopRowIdx; index--) {
                const pLIdx = this.lvd.getPsgeListIdxByRowIdx(index);
                if (pLIdx < 0) continue;
                const cell = disCellDataDict[index].cell as CellPsgeBase;
                if (!cell.isHidden()) break;
                const y = cell.node.y + listView.content.y + listView.node.height - 200;
                if (y < 0) continue;

                // 向上滑动到一定程度时，隐藏的cell会被激活，同时更新进度
                cell.showWithAction();
                this.activePsge(pLIdx);
                if (progMax === -1) progMax = cell.psge.idx;
            }
            if (progMax !== -1) this.evt.sProg = progMax;
        }
    }

    // -----------------------------------------------------------------

    navTabHideRunning: boolean = false;
    touchId?: number;

    afterPageShowAnim() {
        this.navTabHideRunning = true;
    }

    onGestureStarted(event: cc.Event.EventTouch) {
        this.touchId = event.getID();
    }

    onGestureMoved(event: cc.Event.EventTouch) {
        if (!this.navTabHideRunning) return;
        if (this.touchId !== event.getID()) return;
        const curY = event.getLocationY();
        const oriY = event.getStartLocation().y;

        if (curY > oriY + 50) {
            this.navBar.hide(true);
            this.ctrlr.hideTabBar(true);
        } else if (curY < oriY - 50) {
            this.navBar.hide(false);
            this.ctrlr.hideTabBar(false);
        }
    }

    onGestureEnd(event: cc.Event.EventTouch) {
        this.touchId = undefined;
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
            this.ctrlr.hideTabBar(false);
            cc.director.targetOff(this);
            GameDataTool.leaveEvt(this.ctrlr.memory.gameData, this.evtId);
        }
    }

    // 回调 -----------------------------------------------------------------

    onClickOption(slcCell: CellPsgeSelection, index: number) {
        const slcPsge = slcCell.psge as SelectionPsge;
        EvtTool.pushOption(this.evt.rztDict, slcPsge.slcId, index);
        this.resetPsgeDataAndListView(slcPsge.idx);
    }

    onClickQuest(cell: CellPsgeQuest) {
        const gameData = this.ctrlr.memory.gameData;
        const questId = (cell.psge as QuestPsge).questId;
        if (!this.evt.curQuest) {
            const rzt = GameDataTool.addAcceQuest(gameData, questId, undefined, this.evtId);
            if (rzt !== GameDataTool.SUC) {
                this.ctrlr.popToast(rzt);
                return;
            }
            this.evt.curQuest = QuestTool.create(questId, QuestDLineType.none, QuestAmplType.none);
            cell.setData(cell.psge as QuestPsge, this.evt.curQuest);
            this.ctrlr.popToast('suc');
        } else {
            if (this.evt.curQuest.prog < QuestTool.getRealCount(this.evt.curQuest)) {
                this.ctrlr.popToast('suc....');
            } else {
                GameDataTool.removeAcceQuest(gameData, questId, undefined, this.evtId);
                delete this.evt.curQuest;
                this.evt.rztDict[questId] = 2;
                this.resetPsgeDataAndListView(cell.psge.idx);
                this.ctrlr.popToast('suc....');
            }
        }
    }

    onClickEvt(cell: CellPsgeEvt) {
        const gameData = this.ctrlr.memory.gameData;
        const evtId = (cell.psge as EvtPsge).evtId;

        if (!gameData.evtDict[evtId]) {
            this.ctrlr.popToast('suc....');
        } else if (gameData.ongoingEvtIds.includes(evtId)) {
            this.ctrlr.popToast('suc....');
        } else {
            this.evt.rztDict[evtId] = 2;
            this.resetPsgeDataAndListView(cell.psge.idx);
            this.ctrlr.popToast('suc....');
        }
    }

    onInputName() {}

    resetPsgeDataAndListView(lastPsgeIdx: number) {
        const lvd = this.lvd;
        lvd.updateListPsgeData();
        lvd.updateListStrData(true, 3);

        const lv = this.listView;
        lv.resetContent(true);

        const disCellDataDict = lv.disCellDataDict;
        let progMax = -1;

        for (let index = lv.disBtmRowIdx; index >= lv.disTopRowIdx; index--) {
            const pLIdx = lvd.getPsgeListIdxByRowIdx(index);
            if (pLIdx < 0) continue;
            const curPsgeIdx = lvd.psgesInList[pLIdx].idx;
            if (curPsgeIdx === lastPsgeIdx) break;

            const cell = disCellDataDict[index].cell as CellPsgeBase;
            cell.hide();
            cell.showWithAction();
            this.activePsge(pLIdx);
            if (progMax === -1) progMax = curPsgeIdx;
        }
        if (progMax !== -1) this.evt.sProg = progMax;
    }

    // 撤销 -----------------------------------------------------------------

    onUndo() {
        // 检测道具
        // 检测上一次selection
    }
}
