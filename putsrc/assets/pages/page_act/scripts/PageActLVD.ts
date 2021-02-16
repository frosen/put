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
import { CellActInfoDict, PageAct } from './PageAct';
import { Evt, EvtRztKey, EvtRztV, PosData } from '../../../scripts/DataSaved';
import { ActPosModel, MovModel, SpcBtlModel, SpcBtlType, UseCond } from '../../../scripts/DataModel';
import { EvtModelDict, SpcBtlModelDict } from '../../../configs/EvtModelDict';
import { CellEvt } from '../cells/cell_evt/scripts/CellEvt';
import { EvtTool } from '../../../scripts/Memory';

const INFO = 'i';
const EVT = 'e';
const ACT = 'a';
const MOV = 'm';

@ccclass
export class PageActLVD extends ListViewDelegate {
    @property(cc.Prefab)
    infoPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    btnPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    evtPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    movPrefab: cc.Prefab = null!;

    page!: PageAct;

    curPosId!: string;
    curPos!: PosData;
    curActPosModel!: ActPosModel;

    curActKeys: string[] = [];
    curEvtIds: string[] = [];
    curMovs: MovModel[] = [];

    actCellLen!: number;
    evtCellLen!: number;
    movCellLen!: number;

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
            if (gameData.evtDict[evtId].rztDict[EvtRztKey.done] === EvtRztV.had) continue;
            const evtModel = EvtModelDict[evtId];
            let use = true;
            if (evtModel.useCond && !this.checkUseCond(evtModel.useCond)) use = false;

            if (evtModel.startEvtId) {
                const startEvtModel = EvtModelDict[evtModel.startEvtId];
                if (startEvtModel.useCond && !this.checkUseCond(startEvtModel.useCond)) use = false;
            }

            if (use) this.curEvtIds.push(evtId);
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

        const isRztUsed = (evt?: Evt, rzt?: { id: string; num: number }): boolean => {
            if (evt) {
                if (rzt) {
                    if (EvtTool.getRzt(evt.rztDict, rzt.id) === rzt.num) return true;
                } else return true;
            }
            return false;
        };

        let start = false;
        for (const { id, rzt } of useCond.startEvts) {
            if (isRztUsed(gameData.evtDict[id], rzt)) {
                start = true;
                break;
            }
        }
        if (!start) return false;

        if (useCond.endEvts) {
            for (const { id, rzt } of useCond.endEvts) {
                if (isRztUsed(gameData.evtDict[id], rzt)) {
                    return false;
                }
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
                cell.clickCallback = this.page.onClickCellEvt.bind(this.page);
                return cell;
            }
            case INFO:
                return cc.instantiate(this.infoPrefab).getComponent(ListViewCell);
            case ACT: {
                const cell = cc.instantiate(this.btnPrefab).getComponent(CellPosBtn);
                cell.clickCallback = this.page.onClickCellPosBtn.bind(this.page);
                return cell;
            }
            case MOV: {
                const cell = cc.instantiate(this.movPrefab).getComponent(CellPosMov);
                cell.clickCallback = this.page.onClickCellPosMov.bind(this.page);
                return cell;
            }
        }
        return undefined!;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellEvt & CellPosBtn & CellPosMov) {
        if (rowIdx === 0) {
        } else if (rowIdx <= this.actCellLen) {
            const actIdx = (rowIdx - 1) * 2;
            const actKey1 = this.curActKeys[actIdx];
            cell.setBtn1(actKey1, this.getActPosInfo(actKey1));

            if (actIdx + 1 < this.curActKeys.length) {
                const actKey2 = this.curActKeys[actIdx + 1];
                cell.setBtn2(actKey2, this.getActPosInfo(actKey2));
            } else cell.setBtn2(undefined);
        } else if (rowIdx <= this.evtCellLen + this.actCellLen) {
            const evtIdx = (rowIdx - 1 - this.evtCellLen) * 2;
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
            const infoData = actInfo.getSubInfo(this.ctrlr);
            if (infoData) {
                info = infoData.str;
                infoColor = infoData.color;
            }
        }
        return {
            name: actInfo.cnName,
            info: info || '',
            infoColor: infoColor || cc.color(120, 120, 120)
        };
    }
}
