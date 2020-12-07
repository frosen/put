/*
 * PageSelfLVD.ts
 * 个人页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { PageSelf } from './PageSelf';

const INFO = 'i';
const BTN = 'b';
const TITLE = 't';
const TTL = 'p';
const QUEST = 'q';
const EVT = 'e';

@ccclass
export class PageSelfLVD extends ListViewDelegate {
    page: PageSelf;

    @property(cc.Prefab)
    infoPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    btnPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    titlePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    ttlPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    questPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    evtPrefab: cc.Prefab = null;

    ttlCellLen: number;
    questCellLen: number;
    evtCellLen: number;

    initData() {
        const gameData = this.ctrlr.memory.gameData;
        this.ttlCellLen = gameData.proTtlDatas.length;
        this.questCellLen = gameData.acceQuestInfos.length;
        this.evtCellLen = Math.ceil((gameData.ongoingEvtIds.length + gameData.finishedEvtIds.length) * 0.5);
    }

    numberOfRows(listView: ListView): number {
        return 5 + this.ttlCellLen + this.questCellLen + this.evtCellLen;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) return 546;
        else if (rowIdx === 1) return 150;
        else if (rowIdx === 2) return 150;
        else if (rowIdx < 2 + this.ttlCellLen) return 139;
        else if (rowIdx === 2 + this.ttlCellLen) return 139;
        else if (rowIdx === 3 + this.ttlCellLen) return 139;
        else if (rowIdx < 3 + this.ttlCellLen + this.questCellLen) return 139;
        else if (rowIdx === 3 + this.ttlCellLen + this.questCellLen) return 139;
        else if (rowIdx === 4 + this.ttlCellLen + this.questCellLen) return 139;
        else return 139;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) return INFO;
        else if (rowIdx === 1) return BTN;
        else if (rowIdx === 2) return TITLE;
        else if (rowIdx <= 2 + this.ttlCellLen) return TTL;
        else if (rowIdx === 3 + this.ttlCellLen) return TITLE;
        else if (rowIdx <= 3 + this.ttlCellLen + this.questCellLen) return QUEST;
        else if (rowIdx === 4 + this.ttlCellLen + this.questCellLen) return TITLE;
        else return EVT;
    }

    createCellForRow(listView: ListView, rowIdx: number): ListViewCell {
        return null;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: any) {}
}
