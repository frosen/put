/*
 * PageActPosLVD.ts
 * 位置页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import { ActPos, ActPosType } from 'scripts/Memory';
import ListViewCell from 'scripts/ListViewCell';
import CellPosInfo from '../cells/cell_pos_info/scripts/CellPosInfo';
import CellPosBtn from '../cells/cell_pos_btn/scripts/CellPosBtn';
import CellPosMov from '../cells/cell_pos_mov/scripts/CellPosMov';

const CellActInfo = {
    work: { cnName: '工作介绍所' },
    quest: { cnName: '任务发布栏' },
    shop: { cnName: '物资商店' },
    equipMarket: { cnName: '装备市场' },
    petMarket: { cnName: '宠物市场' },
    recycler: { cnName: '回收站' },
    store: { cnName: '仓库' },
    awardsCenter: { cnName: '奖励中心' }
};

@ccclass
export default class PageActPosLVD extends ListViewDelegate {
    @property(cc.Prefab)
    infoPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    btnPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    movPrefab: cc.Prefab = null;

    get curPosKey(): string {
        if (!this._curPosKey) this._curPosKey = this.ctrlr.memory.gameData.curPosKey;
        return this._curPosKey;
    }
    _curPosKey: string = null;

    get curActPos(): ActPos {
        // @ts-ignore
        if (!this._curActPos) this._curActPos = this.ctrlr.memory.gameData.posDataDict[this.curPosKey];
        return this._curActPos;
    }
    _curActPos: ActPos = null;

    get curActPosType(): ActPosType {
        // @ts-ignore
        if (!this._curActPosType) this._curActPosType = this.ctrlr.memory.actPosTypeDict[this.curPosKey];
        return this._curActPosType;
    }
    _curActPosType: ActPosType = null;

    clearData() {
        this._curPosKey = null;
        this._curActPos = null;
        this._curActPosType = null;
    }

    actCellLength: number = 0;
    evtCellLength: number = 0;
    movCellLength: number = 0;

    numberOfRows(listView: ListView): number {
        this.actCellLength = Math.ceil(this.curActPosType.acts.length * 0.5);
        this.evtCellLength = Math.ceil(this.curActPosType.evts.length * 0.5);
        this.movCellLength = this.curActPosType.movs.length;
        return 1 + this.actCellLength + this.evtCellLength + this.movCellLength;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx == 0) {
            return 380;
        } else if (rowIdx == this.actCellLength) {
            return 179;
        } else if (rowIdx == this.actCellLength + this.evtCellLength) {
            return 179;
        } else if (rowIdx < this.actCellLength + this.evtCellLength) {
            return 139;
        } else {
            return 176;
        }
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx == 0) {
            return 'posInfo';
        } else if (rowIdx <= this.actCellLength + this.evtCellLength) {
            return 'posBtn';
        } else {
            return 'posMov';
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case 'posInfo':
                return cc.instantiate(this.infoPrefab).getComponent(ListViewCell);
            case 'posBtn':
                return cc.instantiate(this.btnPrefab).getComponent(ListViewCell);
            case 'posMov':
                return cc.instantiate(this.movPrefab).getComponent(ListViewCell);
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPosInfo & CellPosBtn & CellPosMov) {
        if (rowIdx == 0) {
            cell.setData(this.curActPosType.cnName);
        } else if (rowIdx <= this.actCellLength) {
            let actIdx = (rowIdx - 1) * 2;
            let actKey1 = this.curActPosType.acts[actIdx];
            let actInfo1 = CellActInfo[actKey1];
            cell.setBtn1(actInfo1.cnName, () => {});

            if (actIdx + 1 < this.curActPosType.acts.length) {
                let actKey2 = this.curActPosType.acts[actIdx + 1];
                let actInfo2 = CellActInfo[actKey2];
                cell.setBtn2(actInfo2.cnName, () => {});
            } else {
                cell.hideBtn2();
            }
        } else if (rowIdx <= this.actCellLength + this.evtCellLength) {
            //
        } else {
            let movIdx = rowIdx - 1 - this.actCellLength - this.evtCellLength;
            let moveType = this.curActPosType.movs[movIdx];
            let posKey = moveType.key;
            let movPosType = this.ctrlr.memory.actPosTypeDict[posKey];
            cell.setData('前往：' + movPosType.cnName, '花费：' + moveType.price, () => {});
        }
    }
}
