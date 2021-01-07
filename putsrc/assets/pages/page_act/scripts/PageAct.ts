/*
 * PageAct.ts
 * 位置页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { PageBase } from '../../../scripts/PageBase';
import { PageActLVD } from './PageActLVD';
import { ListView } from '../../../scripts/ListView';
import { PADEqpMkt, PADExpl, PADPetMkt, PosData } from '../../../scripts/DataSaved';
import { GameDataTool } from '../../../scripts/Memory';
import { PageActExpl } from '../../page_act_expl/scripts/PageActExpl';
import { PanelPosInfo } from './PanelPosInfo';
import { ActPosModelDict, PAKey } from '../../../configs/ActPosModelDict';
import { PageActShop } from '../../page_act_shop/scripts/PageActShop';
import { PageActEqpMkt, EqpMktUpdataInterval } from '../../page_act_eqpmkt/scripts/PageActEqpMkt';
import { PageActPetMkt } from '../../page_act_petmkt/scripts/PageActPetMkt';
import { CellUpdateDisplay } from '../../page_act_eqpmkt/cells/cell_update_display/scripts/CellUpdateDisplay';
import { PageActRcclr } from '../../page_act_rcclr/scripts/PageActRcclr';
import { PageActACntr } from '../../page_act_acntr/scripts/PageActACntr';
import { PageActQuester } from '../../page_act_quester/scripts/PageActQuester';
import { PageActMerger } from '../../page_act_merger/scripts/PageActMerger';
import { BaseCtrlr, PageSwitchAnim } from '../../../scripts/BaseCtrlr';
import { SpcBtlModelDict, StoryModelDict } from '../../../configs/EvtModelDict';
import { ActPosModel, ExplModel, ExplStepNames, StepTypesByMax } from '../../../scripts/DataModel';
import { CellPosMov } from '../cells/cell_pos_mov/scripts/CellPosMov';

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

@ccclass
export class PageAct extends PageBase {
    navHidden: boolean = true;

    @property(ListView)
    listView: ListView = null;
    lvd: PageActLVD = null;

    @property(PanelPosInfo)
    posInfo: PanelPosInfo = null;

    curPosId: string = '';
    dirtyToken: number = 0;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageActLVD;
        this.lvd.page = this;
        this.listView.node.on(ListView.EventType.scrolling, this.onScrolling.bind(this));

        this.posInfo.ctrlr = this.ctrlr;
    }

    onPageShow() {
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.expl && !gameData.expl.afb) return;

        const posId = gameData.curPosId;
        GameDataTool.addPos(gameData, posId);
        GameDataTool.addEvt(gameData, posId);

        const pd: PosData = gameData.posDataDict[posId];
        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.curPosId !== pd.id || this.dirtyToken !== curDirtyToken) {
            this.curPosId = pd.id;
            this.dirtyToken = curDirtyToken;
            this.resetListview();

            const actPosModel = ActPosModelDict[this.curPosId];
            this.posInfo.setData(actPosModel, gameData);
        }
    }

    resetListview() {
        this.lvd.initData();
        this.listView.resetContent(true);

        const y = PageAct.ListViewPosDict[this.curPosId] || 0;
        this.listView.clearContent();
        this.listView.createContent(y);
        this.posInfo.onScrolling(y);
    }

    afterPageShowAnim() {
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.expl && !gameData.expl.afb) this.ctrlr.pushPage(PageActExpl, null, false);
    }

    static ListViewPosDict: { [key: string]: number } = {};

    onScrolling() {
        const y = this.listView.content.y;
        if (this.curPosId) PageAct.ListViewPosDict[this.curPosId] = y;
        this.posInfo.onScrolling(y);
    }

    // -----------------------------------------------------------------

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
        const curLoc = ActPosModelDict[this.curPosId].loc;
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
