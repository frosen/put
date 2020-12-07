/*
 * PageSelfLVD.ts
 * 个人页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { proTtlModelDict } from '../../../configs/ProTtlModelDict';
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

    ttlIds: string[];

    ttlCellLen: number;
    questCellLen: number;
    evtCellLen: number;

    initData() {
        const gameData = this.ctrlr.memory.gameData;

        this.ttlIds = Object.keys(gameData.proTtlDataDict);
        this.ttlIds.sort((a: string, b: string) => {
            const aModel = proTtlModelDict[a];
            const bModel = proTtlModelDict[b];

            const diff1 = aModel.proTtlType - bModel.proTtlType;
            if (diff1 !== 0) return diff1;

            const diff2 = aModel.order - bModel.order;
            if (diff2 !== 0) return diff2;

            return gameData.proTtlDataDict[b].gainTime - gameData.proTtlDataDict[a].gainTime;
        });

        this.ttlCellLen = this.ttlIds.length;
        this.questCellLen = gameData.acceQuestInfos.length;
        this.evtCellLen = Math.ceil((gameData.ongoingEvtIds.length + gameData.finishedEvtIds.length) * 0.5);
    }

    numberOfRows(listView: ListView): number {
        return 5 + this.ttlCellLen + this.questCellLen + this.evtCellLen;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) return 604;
        else if (rowIdx === 1) return 226;
        else if (rowIdx === 2) return 64;
        else if (rowIdx < 2 + this.ttlCellLen) return 154;
        else if (rowIdx === 2 + this.ttlCellLen) return 176;
        else if (rowIdx === 3 + this.ttlCellLen) return 64;
        else if (rowIdx < 3 + this.ttlCellLen + this.questCellLen) return 334;
        else if (rowIdx === 3 + this.ttlCellLen + this.questCellLen) return 356;
        else if (rowIdx === 4 + this.ttlCellLen + this.questCellLen) return 64;
        else return 204;
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
