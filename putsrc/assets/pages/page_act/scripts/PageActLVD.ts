/*
 * PageActLVD.ts
 * 位置页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ActPosModelDict, PAKey } from '../../../configs/ActPosModelDict';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { CellPosBtn } from '../cells/cell_pos_btn/scripts/CellPosBtn';
import { CellPosMov } from '../cells/cell_pos_mov/scripts/CellPosMov';
import { PageAct } from './PageAct';
import { PageSwitchAnim, BaseCtrlr } from '../../../scripts/BaseCtrlr';
import { PageActExpl } from '../../page_act_expl/scripts/PageActExpl';
import { PosData, PADExpl, PADEqpMkt, PADPetMkt } from '../../../scripts/DataSaved';
import { ActPosModel, StepTypesByMax, ExplStepNames, ExplModel, MovModel, UseCond } from '../../../scripts/DataModel';
import { GameDataTool } from '../../../scripts/Memory';
import { PageBase } from '../../../scripts/PageBase';
import { PageActShop } from '../../page_act_shop/scripts/PageActShop';
import { PageActEqpMkt, EqpMktUpdataInterval } from '../../page_act_eqpmkt/scripts/PageActEqpMkt';
import { PageActPetMkt } from '../../page_act_petmkt/scripts/PageActPetMkt';
import { CellUpdateDisplay } from '../../page_act_eqpmkt/cells/cell_update_display/scripts/CellUpdateDisplay';
import { PageActRcclr } from '../../page_act_rcclr/scripts/PageActRcclr';
import { PageActACntr } from '../../page_act_acntr/scripts/PageActACntr';
import { PageActQuester } from '../../page_act_quester/scripts/PageActQuester';
import { PageActMerger } from '../../page_act_merger/scripts/PageActMerger';
import { EvtModelDict, SpcBtlModelDict, StoryModelDict } from '../../../configs/EvtModelDict';
import { CellEvt } from '../cells/cell_evt/scripts/CellEvt';

export class CellActInfo {
    cnName: string;
    getSubInfo?: (ctrlr: BaseCtrlr) => { str: string; color?: cc.Color };
    page?: { new (): PageBase };
    check?: (ctrlr: BaseCtrlr) => string;
    beforeEnter?: (ctrlr: BaseCtrlr, callback: (data: any) => void) => void;
}

export const CellActInfoDict: { [key: string]: CellActInfo } = {
    [PAKey.expl]: {
        cnName: '探索',
        getSubInfo: (ctrlr: BaseCtrlr): { str: string; color?: cc.Color } => {
            const gameData = ctrlr.memory.gameData;
            let ing: string | undefined;
            if (
                gameData.expl &&
                gameData.expl.curPosId === gameData.curPosId &&
                !(gameData.expl.btl && gameData.expl.btl.spcBtlId)
            ) {
                ing = 'ing';
            } else ing = '';

            return { str: String(`${ing}`), color: cc.color(255, 102, 0) };
        },
        page: PageActExpl,
        check: (ctrlr: BaseCtrlr): string => {
            const gameData = ctrlr.memory.gameData;
            if (gameData.expl) {
                const expl = gameData.expl;
                if (gameData.curPosId !== expl.curPosId) {
                    const name = ActPosModelDict[expl.curPosId].cnName;
                    return `无法进入，精灵仍在${name}战斗`;
                }
                if (expl.btl && expl.btl.spcBtlId) {
                    const cnName = SpcBtlModelDict[expl.btl.spcBtlId].cnName;
                    return `无法进入，精灵处于“${cnName}”的战斗中`;
                }
            }
            if (GameDataTool.getReadyPets(ctrlr.memory.gameData).length < 2) {
                return '前方危险，请保证你队伍中有至少两只精灵，且处于备战状态！（精灵列表中点击状态按钮可变更状态）';
            }
            return '';
        },
        beforeEnter: (ctrlr: BaseCtrlr, callback: (data: any) => void): any => {
            const gameData = ctrlr.memory.gameData;
            if (gameData.expl) return callback(null);
            const posData = gameData.posDataDict[gameData.curPosId];
            if (!posData.actDict.hasOwnProperty(PAKey.expl)) return callback(null);
            const pADExpl = posData.actDict[PAKey.expl] as PADExpl;
            if (pADExpl.doneStep === 0) return callback(null);

            const posId = gameData.curPosId;
            const curPosModel = ActPosModelDict[posId];
            const explModel: ExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;

            const stepMax = explModel.stepMax;
            const stepTypes = StepTypesByMax[stepMax];

            const btns = [];
            for (let index = 0; index <= pADExpl.doneStep; index++) {
                const stepName = ExplStepNames[stepTypes[index]];
                btns.push(stepName);
            }

            ctrlr.popAlert(
                '请选择出发位置',
                (key: number) => {
                    if (key > 0) {
                        return callback({ startStep: key - 1 });
                    }
                },
                ...btns
            );
        }
    },
    [PAKey.shop]: { cnName: '物资商店', page: PageActShop },
    [PAKey.eqpMkt]: {
        cnName: '装备市场',
        getSubInfo: (ctrlr: BaseCtrlr): { str: string; color?: cc.Color } => {
            const gameData = ctrlr.memory.gameData;
            const posData = gameData.posDataDict[gameData.curPosId];

            if (!posData.actDict.hasOwnProperty(PAKey.eqpMkt)) return null;
            const pADEqpMkt = posData.actDict[PAKey.eqpMkt] as PADEqpMkt;
            const nextTime = (pADEqpMkt.updateTime || 0) + EqpMktUpdataInterval;
            const diff = nextTime - Date.now();
            if (diff < 0) return null;

            const str = `[${CellUpdateDisplay.getDiffStr(diff)}]`;
            return { str, color: cc.color(120, 120, 120) };
        },
        page: PageActEqpMkt
    },
    [PAKey.petMkt]: {
        cnName: '精灵市场',
        getSubInfo: (ctrlr: BaseCtrlr): { str: string; color?: cc.Color } => {
            const gameData = ctrlr.memory.gameData;
            const posData = gameData.posDataDict[gameData.curPosId];

            if (!posData.actDict.hasOwnProperty(PAKey.petMkt)) return null;
            const pADPetMkt = posData.actDict[PAKey.petMkt] as PADPetMkt;
            const nextTime = (pADPetMkt.updateTime || 0) + EqpMktUpdataInterval;
            const diff = nextTime - Date.now();
            if (diff < 0) return null;

            const str = `[${CellUpdateDisplay.getDiffStr(diff)}]`;
            return { str, color: cc.color(120, 120, 120) };
        },
        page: PageActPetMkt
    },
    [PAKey.work]: { cnName: '精灵应聘广场' },
    [PAKey.quester]: { cnName: '任务大厅', page: PageActQuester },
    [PAKey.aCntr]: { cnName: '奖励中心', page: PageActACntr },
    [PAKey.rcclr]: { cnName: '回收站', page: PageActRcclr },
    [PAKey.merger]: { cnName: '精灵融合堂', page: PageActMerger }
};

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
                cell.clickCallback = this.onClickCellEvt.bind(this);
                return cell;
            }
            case INFO:
                return cc.instantiate(this.infoPrefab).getComponent(ListViewCell);
            case ACT: {
                const cell = cc.instantiate(this.btnPrefab).getComponent(CellPosBtn);
                cell.clickCallback = this.onClickCellPosBtn.bind(this);
                return cell;
            }
            case MOV: {
                const cell = cc.instantiate(this.movPrefab).getComponent(CellPosMov);
                cell.clickCallback = this.onClickCellPosMov.bind(this);
                return cell;
            }
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellEvt & CellPosBtn & CellPosMov) {
        if (rowIdx === 0) {
        } else if (rowIdx <= this.evtCellLen + this.actCellLen) {
            const actIdx = (rowIdx - 1 - this.evtCellLen) * 2;
            const actKey1 = this.curActKeys[actIdx];
            const actInfo1 = CellActInfoDict[actKey1];
            cell.setBtn1(actInfo1);

            if (actIdx + 1 < this.curActKeys.length) {
                const actKey2 = this.curActKeys[actIdx + 1];
                const actInfo2 = CellActInfoDict[actKey2];
                cell.setBtn2(actInfo2);
            } else cell.setBtn2(null);
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

    onClickCellPosBtn(actInfo: CellActInfo) {
        if (actInfo.check) {
            const errorStr = actInfo.check(this.ctrlr);
            if (errorStr) {
                this.ctrlr.popToast(errorStr);
                return;
            }
        }

        if (actInfo.beforeEnter) {
            actInfo.beforeEnter(this.ctrlr, pageData => {
                this.ctrlr.pushPage(actInfo.page, pageData);
            });
        } else this.ctrlr.pushPage(actInfo.page);
    }

    onClickCellEvt(evtId: string) {
        if (evtId in StoryModelDict) {
        } else {
            const spcBtlModel = SpcBtlModelDict[evtId];

            const gameData = this.ctrlr.memory.gameData;
            if (gameData.expl) {
                const expl = gameData.expl;
                if (gameData.curPosId !== expl.curPosId) {
                    const name = ActPosModelDict[expl.curPosId].cnName;
                    return `无法进入，精灵仍在${name}战斗`;
                }
                if (!expl.btl || !expl.btl.spcBtlId) return '无法进入，没有这个战斗';
                if (expl.btl.spcBtlId !== evtId) {
                    const cnName = SpcBtlModelDict[expl.btl.spcBtlId].cnName;
                    return `无法进入，精灵处于“${cnName}”的战斗中`;
                }
            }
            if (GameDataTool.getReadyPets(this.ctrlr.memory.gameData).length < 2) {
                return '前方危险，请保证你队伍中有至少两只精灵，且处于备战状态！（精灵列表中点击状态按钮可变更状态）';
            }

            this.ctrlr.pushPage(PageActExpl, { spcBtlId: spcBtlModel.id });
        }
    }

    onClickCellPosMov(cell: CellPosMov) {
        if (cell.price === 0) {
            this.switchPosPage(cell.movPosModel);
        } else {
            const txt = `确定花费${cell.price}前往“${cell.movPosModel.cnName}”吗？`;
            this.ctrlr.popAlert(txt, (key: number) => {
                if (key === 1) this.switchPosPage(cell.movPosModel);
            });
        }
    }

    switchPosPage(nextPosModel: ActPosModel) {
        const curLoc = this.curActPosModel.loc;
        const nextLoc = nextPosModel.loc;
        const disX = nextLoc.x - curLoc.x;
        const disY = nextLoc.y - curLoc.y;
        let switchAnim: PageSwitchAnim;
        if (Math.abs(disX) >= Math.abs(disY)) {
            switchAnim = disX > 0 ? PageSwitchAnim.fromRight : PageSwitchAnim.fromLeft;
        } else {
            switchAnim = disY > 0 ? PageSwitchAnim.fromTop : PageSwitchAnim.fromBottom;
        }

        this.ctrlr.memory.gameData.curPosId = nextPosModel.id;
        this.ctrlr.switchCurPage(PageAct, null, switchAnim);
    }
}
