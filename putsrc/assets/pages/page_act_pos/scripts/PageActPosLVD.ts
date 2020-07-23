/*
 * PageActPosLVD.ts
 * 位置页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { ListViewDelegate } from 'scripts/ListViewDelegate';
import { ListView } from 'scripts/ListView';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { ListViewCell } from 'scripts/ListViewCell';
import { CellPosInfo } from '../cells/cell_pos_info/scripts/CellPosInfo';
import { CellPosBtn } from '../cells/cell_pos_btn/scripts/CellPosBtn';
import { CellPosMov } from '../cells/cell_pos_mov/scripts/CellPosMov';
import { PageActPos } from './PageActPos';
import { PageSwitchAnim, BaseController } from 'scripts/BaseController';
import { PageActExpl } from 'pages/page_act_expl/scripts/PageActExpl';
import { ActPos } from 'scripts/DataSaved';
import { ActPosModel } from 'scripts/DataModel';
import { GameDataTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';

type CellActInfo = { cnName: string; page: { new (): PageBase }; check: (ctrlr: BaseController) => string };

const CellActInfo = {
    work: { cnName: '工作介绍所' },
    quest: { cnName: '任务发布栏' },
    shop: { cnName: '物资商店' },
    equipMarket: { cnName: '装备市场' },
    petMarket: { cnName: '宠物市场' },
    recycler: { cnName: '回收站' },
    store: { cnName: '仓库' },
    awardsCenter: { cnName: '奖励中心' },
    exploration: {
        cnName: '探索',
        page: PageActExpl,
        check: (ctrlr: BaseController): string => {
            if (GameDataTool.getReadyPets(ctrlr.memory.gameData).length >= 2) return '';
            else return '前方危险，请保证你队伍中有至少两只宠物，且处于备战状态！（宠物列表中点击状态按钮可变更状态）';
        }
    }
};

@ccclass
export class PageActPosLVD extends ListViewDelegate {
    @property(cc.Prefab)
    infoPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    btnPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    movPrefab: cc.Prefab = null;

    get curPosId(): string {
        if (!this._curPosId) this._curPosId = this.ctrlr.memory.gameData.curPosId;
        return this._curPosId;
    }
    _curPosId: string = null;

    get curActPos(): ActPos {
        if (!this._curActPos) this._curActPos = this.ctrlr.memory.gameData.posDataDict[this.curPosId];
        return this._curActPos;
    }
    _curActPos: ActPos = null;

    get curActPosModel(): ActPosModel {
        if (!this._curActPosModel) this._curActPosModel = actPosModelDict[this.curPosId];
        return this._curActPosModel;
    }
    _curActPosModel: ActPosModel = null;

    clearData() {
        this._curPosId = null;
        this._curActPos = null;
        this._curActPosModel = null;
    }

    actCellLength: number = 0;
    evtCellLength: number = 0;
    movCellLength: number = 0;

    numberOfRows(listView: ListView): number {
        this.actCellLength = Math.ceil(this.curActPosModel.acts.length * 0.5);
        this.evtCellLength = Math.ceil(this.curActPosModel.evts.length * 0.5);
        this.movCellLength = this.curActPosModel.movs.length;
        return 1 + this.actCellLength + this.evtCellLength + this.movCellLength;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) {
            return 380;
        } else if (rowIdx === this.actCellLength) {
            return 179;
        } else if (rowIdx === this.actCellLength + this.evtCellLength) {
            return 179;
        } else if (rowIdx < this.actCellLength + this.evtCellLength) {
            return 139;
        } else {
            return 176;
        }
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) {
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
        if (rowIdx === 0) {
            cell.setData(this.curActPosModel.cnName);
        } else if (rowIdx <= this.actCellLength) {
            let actIdx = (rowIdx - 1) * 2;
            let actId1 = this.curActPosModel.acts[actIdx];
            let actInfo1 = CellActInfo[actId1];
            cell.setBtn1(actInfo1.cnName, () => {
                this.gotoPage(actInfo1);
            });

            if (actIdx + 1 < this.curActPosModel.acts.length) {
                let actId2 = this.curActPosModel.acts[actIdx + 1];
                let actInfo2 = CellActInfo[actId2];
                cell.setBtn2(actInfo2.cnName, () => {
                    this.gotoPage(actInfo2);
                });
            } else {
                cell.hideBtn2();
            }
        } else if (rowIdx <= this.actCellLength + this.evtCellLength) {
            //
        } else {
            let movIdx = rowIdx - 1 - this.actCellLength - this.evtCellLength;
            let moveType = this.curActPosModel.movs[movIdx];
            let posId = moveType.id;
            let movPosModel = actPosModelDict[posId];
            cell.setData('前往：' + movPosModel.cnName, '花费：' + String(moveType.price), () => {
                if (moveType.price === 0) {
                    this.gotoNextPos(posId);
                } else {
                    let txt = `确定花费${moveType.price}前往“${movPosModel.cnName}”吗？`;
                    this.ctrlr.popAlert(txt, (key: number) => {
                        if (key === 1) this.gotoNextPos(posId);
                    });
                }
            });
        }
    }

    gotoPage(actInfo: CellActInfo) {
        if (!actInfo.hasOwnProperty('check')) {
            this.ctrlr.pushPage(actInfo.page);
        } else {
            let errorStr = actInfo.check(this.ctrlr);
            if (!errorStr) this.ctrlr.pushPage(actInfo.page);
            else this.ctrlr.popToast(errorStr);
        }
    }

    gotoNextPos(nextPosId: string) {
        let curLoc = this.curActPosModel.loc;
        let nextLoc = actPosModelDict[nextPosId].loc;
        let disX = nextLoc.x - curLoc.x;
        let disY = nextLoc.y - curLoc.y;
        let switchAnim: PageSwitchAnim = null;
        if (Math.abs(disX) >= Math.abs(disY)) {
            switchAnim = disX > 0 ? PageSwitchAnim.fromRight : PageSwitchAnim.fromLeft;
        } else {
            switchAnim = disY > 0 ? PageSwitchAnim.fromTop : PageSwitchAnim.fromBottom;
        }

        this.ctrlr.memory.gameData.curPosId = nextPosId;
        this.ctrlr.switchCurPage(PageActPos, null, switchAnim);
    }
}
