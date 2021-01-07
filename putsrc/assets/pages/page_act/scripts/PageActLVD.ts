/*
 * PageActLVD.ts
 * 位置页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ActPosModelDict } from '../../../configs/ActPosModelDict';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { CellPosBtn } from '../cells/cell_pos_btn/scripts/CellPosBtn';
import { CellPosMov } from '../cells/cell_pos_mov/scripts/CellPosMov';
import { CellActInfo, CellActInfoDict, PageAct } from './PageAct';
import { PosData } from '../../../scripts/DataSaved';
import { ActPosModel, MovModel, UseCond } from '../../../scripts/DataModel';
import { EvtModelDict } from '../../../configs/EvtModelDict';
import { CellEvt } from '../cells/cell_evt/scripts/CellEvt';

const INFO = 'i';
const EVT = 'e';
const ACT = 'a';
const MOV = 'm';

@ccclass
export class PageActLVD extends ListViewDelegate {
    @property(cc.Prefab)
    infoPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    btnPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    evtPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    movPrefab: cc.Prefab = null;

    page!: PageAct;

    curPosId: string;
    curPos: PosData;
    curActPosModel: ActPosModel;

    curActKeys: string[] = [];
    curEvtIds: string[] = [];
    curMovs: MovModel[] = [];

    actCellLen: number;
    evtCellLen: number;
    movCellLen: number;

    initData() {
        const gameData = this.ctrlr.memory.gameData;
        this.curPosId = gameData.curPosId;
        this.curPos = gameData.posDataDict[this.curPosId];
        this.curActPosModel = ActPosModelDict[this.curPosId];

        this.curActKeys.length = 0;
        this.curEvtIds.length = 0;
        this.curMovs.length = 0;

        for (const pakey in this.curActPosModel.actMDict) {
            if (!this.curActPosModel.actMDict.hasOwnProperty(pakey)) continue;
            const actModel = this.curActPosModel.actMDict[pakey];
            if (actModel.useCond) {
                if (this.checkUseCond(actModel.useCond)) this.curActKeys.push(pakey);
            } else this.curActKeys.push(pakey);
        }

        for (let index = 0; index < this.curActPosModel.evtIds.length; index++) {
            const evtId = this.curActPosModel.evtIds[index];
            if (!gameData.ongoingEvtIds.includes(evtId)) continue;
            const evtModel = EvtModelDict[evtId];
            if (evtModel.useCond) {
                if (this.checkUseCond(evtModel.useCond)) this.curEvtIds.push(evtId);
            } else this.curEvtIds.push(evtId);
        }

        for (let index = 0; index < this.curActPosModel.movs.length; index++) {
            const movModel = this.curActPosModel.movs[index];
            if (movModel.useCond) {
                if (this.checkUseCond(movModel.useCond)) this.curMovs.push(movModel);
            } else this.curMovs.push(movModel);
        }

        this.actCellLen = Math.ceil(this.curActKeys.length * 0.5);
        this.evtCellLen = Math.ceil(this.curEvtIds.length * 0.5);
        this.movCellLen = this.curMovs.length;
    }

    checkUseCond(useCond: UseCond): boolean {
        const gameData = this.ctrlr.memory.gameData;
        if (useCond.needTtlIds) {
            for (const ttlId of useCond.needTtlIds) {
                if (!gameData.proTtlDict.hasOwnProperty(ttlId)) return false;
            }
        }

        for (const evtData of useCond.startEvts) {
            const evt = gameData.evtDict[evtData.id];
            if (!evt || evt.prog < evtData.prog) return false;
        }

        if (useCond.endEvts) {
            for (const evtData of useCond.endEvts) {
                const evt = gameData.evtDict[evtData.id];
                if (evt && evt.prog >= evtData.prog) return false;
            }
        }

        return true;
    }

    numberOfRows(listView: ListView): number {
        return 1 + this.actCellLen + this.evtCellLen + this.movCellLen;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) return 552;
        else if (rowIdx < this.actCellLen) return 139;
        else if (rowIdx === this.actCellLen) return 181;
        else if (rowIdx < this.evtCellLen + this.actCellLen) return 204;
        else if (rowIdx === this.evtCellLen + this.actCellLen) return 246;
        else return 154;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) return INFO;
        else if (rowIdx <= this.actCellLen) return ACT;
        else if (rowIdx <= this.evtCellLen + this.actCellLen) return EVT;
        else return MOV;
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case EVT: {
                const cell = cc.instantiate(this.evtPrefab).getComponent(CellEvt);
                cell.clickCallback = this.page.onClickCellEvt.bind(this);
                return cell;
            }
            case INFO:
                return cc.instantiate(this.infoPrefab).getComponent(ListViewCell);
            case ACT: {
                const cell = cc.instantiate(this.btnPrefab).getComponent(CellPosBtn);
                cell.clickCallback = this.page.onClickCellPosBtn.bind(this);
                return cell;
            }
            case MOV: {
                const cell = cc.instantiate(this.movPrefab).getComponent(CellPosMov);
                cell.clickCallback = this.page.onClickCellPosMov.bind(this);
                return cell;
            }
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellEvt & CellPosBtn & CellPosMov) {
        if (rowIdx === 0) {
        } else if (rowIdx <= this.evtCellLen + this.actCellLen) {
            const actIdx = (rowIdx - 1 - this.evtCellLen) * 2;
            const actKey1 = this.curActKeys[actIdx];
            cell.setBtn1(actKey1, this.getActPosInfo(actKey1));

            if (actIdx + 1 < this.curActKeys.length) {
                const actKey2 = this.curActKeys[actIdx + 1];
                cell.setBtn1(actKey2, this.getActPosInfo(actKey2));
            } else cell.setBtn2(undefined);
        } else if (rowIdx <= this.evtCellLen) {
            const evtIdx = (rowIdx - 1) * 2;
            const evtId1 = this.curEvtIds[evtIdx];
            cell.setEvt1(evtId1);

            if (evtIdx + 1 < this.curEvtIds.length) {
                const evtId2 = this.curEvtIds[evtIdx + 1];
                cell.setEvt2(evtId2);
            } else cell.setEvt2(undefined);
        } else {
            const movIdx = rowIdx - 1 - this.evtCellLen - this.actCellLen;

            const moveType = this.curMovs[movIdx];
            const posId = moveType.id;
            const movPosModel = ActPosModelDict[posId];
            cell.setData(movPosModel, moveType.price);
        }
    }

    getActPosInfo(pAKey: string): { name: string; info: string; infoColor: cc.Color } {
        const actInfo = CellActInfoDict[pAKey];
        let info: string | undefined;
        let infoColor: cc.Color | undefined;
        if (actInfo.getSubInfo) {
            ({ str: info, color: infoColor } = this.getSubInfo(actInfo));
        } else {
            info = '';
            infoColor = cc.color(120, 120, 120);
        }
        return {
            name: actInfo.cnName,
            info,
            infoColor
        };
    }

    getSubInfo(actInfo: CellActInfo): { str?: string; color?: cc.Color } {
        if (actInfo.getSubInfo) {
            return actInfo.getSubInfo(this.ctrlr) || { str: undefined };
        } else return { str: undefined };
    }
}
