/*
 * PageStoryLVD.ts
 * 故事页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { NormalPsge, Psge, PsgeType, SelectionPsge } from '../../../scripts/DataModel';
import { GameData } from '../../../scripts/DataSaved';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { EvtTool } from '../../../scripts/Memory';
import { CellPsgeEnd } from '../cells/cell_psge_end/scripts/CellPsgeEnd';
import { CellPsgeEvt } from '../cells/cell_psge_evt/scripts/CellPsgeEvt';
import { CellPsgeHead } from '../cells/cell_psge_head/scripts/CellPsgeHead';
import { CellPsgeNameInput } from '../cells/cell_psge_name_input/scripts/CellPsgeNameInput';
import { CellPsgeNormal } from '../cells/cell_psge_normal/scripts/CellPsgeNormal';
import { CellPsgeQuest } from '../cells/cell_psge_quest/scripts/CellPsgeQuest';
import { CellPsgeSelection } from '../cells/cell_psge_selection/scripts/CellPsgeSelection';
import { PageStory } from './PageStory';

const HEAD = 'h';
const NORMAL = 'n';
const SELECTION = 's';
const QUEST = 'q';
const EVT = 'e';
const NAMEINPUT = 'ni';
const END = 'end';
const CHECKERBLANK = 'cb';
const TOPCKR = 'tckr';
const BTMCKR = 'bckr';

type CellPsge = CellPsgeNormal & CellPsgeSelection & CellPsgeQuest & CellPsgeEvt;

@ccclass
export class PageStoryLVD extends ListViewDelegate {
    page!: PageStory;

    @property(cc.Prefab)
    normalPsgePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    selectionPsgePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    questPsgePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    evtPsgePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    nameInputPsgePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    headPsgePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    endPsgePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    blankPrefab: cc.Prefab = null!;

    cellForCalcHeight!: CellPsgeNormal;

    psgesInList: Psge[] = [];
    optionUsingDict: { [key: string]: number } = {};

    heightsInList: number[] = [];
    strsInList: string[] = [];

    from: number = -1;
    to: number = -1;
    radius: number = 16;

    next: number = -1;
    curNext: number = -1;

    onLoad() {
        const nodeForCalcHeight = cc.instantiate(this.normalPsgePrefab);
        nodeForCalcHeight.parent = this.node;
        nodeForCalcHeight.opacity = 0;

        this.cellForCalcHeight = nodeForCalcHeight.getComponent(CellPsgeNormal);
    }

    initData() {
        this.updateListPsgeData();
        this.updateListStrData(this.getListPosByProg(this.page.evt.prog));
    }

    updateListPsgeData() {
        const psgesInModel = this.page.storyModel.psges;
        const rztDict = this.page.evt.rztDict;

        const psges = this.psgesInList;
        const optDict = this.optionUsingDict;

        const handlePsge = (psge: Psge, index: number): number => {
            if (psge.pType === PsgeType.normal) {
                return (psge as NormalPsge).go || index + 1;
            } else if (psge.pType === PsgeType.selection) {
                const slcPsge = psge as SelectionPsge;
                const slcId = slcPsge.id;

                const curOptUsing = (optDict[slcId] || 0) + 1;
                const optionIdx = EvtTool.getOption(rztDict, slcId, curOptUsing);
                if (optionIdx === -1) return -1;

                optDict[slcId] = curOptUsing;
                return slcPsge.options[optionIdx].go;
            } else {
                return index + 1;
            }
        };

        let startIdx: number;
        if (psges.length > 0) {
            const lastIndex = psges[psges.length - 1].idx;
            const lastPsge = psgesInModel[lastIndex];
            const rzt = handlePsge(lastPsge, lastIndex);
            if (rzt === -1) return;
            startIdx = lastIndex + 1;
        } else startIdx = 0;

        // 按顺序价值psge到list中，直到最后或者被卡住的选择和索要
        let curIdx = startIdx;
        while (true) {
            if (curIdx >= psgesInModel.length) break;
            const psge = psgesInModel[curIdx];
            psges[psges.length] = psge;
            const nextIdx = handlePsge(psge, curIdx);
            if (nextIdx === -1) break;
            curIdx = nextIdx;
        }
    }

    getListPosByProg(prog: number): number {
        for (let index = this.psgesInList.length - 1; index >= 0; index--) {
            if (this.psgesInList[index].idx === prog) return index;
        }
        return 0;
    }

    /**
     * btm代表是否是往下文更新
     */
    updateListStrData(pos: number, btm: boolean = true) {
        const psges = this.psgesInList;

        if (this.from === -1) {
            this.from = Math.max(pos - this.radius, 0);
        } else if (!btm) {
        }

        if (this.to === -1) {
            this.to = Math.min(pos + this.radius, psges.length);
        } else if (btm) {
            this.to = Math.min(this.to + this.radius, psges.length);
        }

        this.next = Math.min(this.to + this.radius, psges.length);
        this.curNext = this.to;

        for (let index = this.from; index < this.to; index++) {
            this.calcStrData(index);
            if (PageStoryLVD.labelCharError) {
                // 监测label发现char不能正确生成，大概率因为保存的char缓存已满，需清理缓存重新初始化
                cc.Label.clearCharCache();
                this.radius--; // 减少字符数量，避免进入无限循环
                return this.updateListStrData(pos, btm);
            }
        }
    }

    loadNextStrData() {
        if (this.curNext === this.next) return;
        if (PageStoryLVD.labelCharError) return;
        this.calcStrData(this.curNext);
        if (PageStoryLVD.labelCharError) return;
        this.curNext++;
    }

    calcStrData(index: number) {
        if (this.heightsInList[index]) return;
        const psge = this.psgesInList[index];
        const t = psge.pType;
        if (t === PsgeType.normal) {
            const gameData = this.ctrlr.memory.gameData;
            PageStoryLVD.startLabelCharAtlasMonitor();
            const str = PageStoryLVD.getRealPsgeStr(gameData, psge as NormalPsge);
            this.cellForCalcHeight.setData(str);
            this.heightsInList[index] = this.cellForCalcHeight.node.height;
            this.strsInList[index] = str;
        } else if (t === PsgeType.selection) {
            this.heightsInList[index] = CellPsgeSelection.getHeight((psge as SelectionPsge).options.length);
        } else if (t === PsgeType.quest) {
        } else if (t === PsgeType.evt) {
        } else if (t === PsgeType.nameInput) {
        } else if (t === PsgeType.head) {
            this.heightsInList[index] = 300;
        } else if (t === PsgeType.end) {
            this.heightsInList[index] = 300;
        }
    }

    static getRealPsgeStr(gameData: GameData, psge: NormalPsge): string {
        return psge.str.replace(/RRR/g, gameData.roleName);
    }

    static monitored: boolean = false;
    static labelCharError: boolean = false;

    static startLabelCharAtlasMonitor() {
        if (this.monitored) return;
        // @ts-ignore
        const shareAtlas = cc.Label._shareAtlas;
        if (shareAtlas) {
            this.monitored = true;
            const oldFunc = shareAtlas.getLetterDefinitionForChar;
            shareAtlas.getLetterDefinitionForChar = function (char: any, labelInfo: any) {
                const letter = oldFunc.call(this, char, labelInfo);
                if (!letter) this.labelCharError = true;
                return letter;
            };
        }
    }

    clearStrData() {
        this.from = -1;
        this.to = -1;
        this.heightsInList.length = 0;
        this.strsInList.length = 0;
        cc.Label.clearCharCache();
    }

    // -----------------------------------------------------------------

    numberOfRows(listView: ListView): number {
        return this.to - this.from + 3; // 3代表endblank和2个checker
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) {
            return 200;
        } else {
            const realIdx = rowIdx - 1 + this.from;
            if (realIdx < this.to) return this.heightsInList[realIdx];
            else if (realIdx === this.to) return 200;
            else return 200;
        }
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) {
            return TOPCKR;
        } else {
            const realIdx = rowIdx - 1 + this.from;
            if (realIdx < this.to) {
                const t = this.psgesInList[realIdx].pType;
                if (t === PsgeType.normal) return NORMAL;
                else if (t === PsgeType.selection) return SELECTION;
                else if (t === PsgeType.quest) return QUEST;
                else if (t === PsgeType.evt) return EVT;
                else if (t === PsgeType.nameInput) return NAMEINPUT;
                else if (t === PsgeType.head) return HEAD;
                else if (t === PsgeType.end) return END;
            } else if (realIdx === this.to) return CHECKERBLANK;
            else return BTMCKR;
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        if (cellId === NORMAL) {
            return cc.instantiate(this.normalPsgePrefab).getComponent(ListViewCell);
        } else if (cellId === SELECTION) {
            const cell = cc.instantiate(this.selectionPsgePrefab).getComponent(CellPsgeSelection);
            return cell;
        } else if (cellId === QUEST) {
            const cell = cc.instantiate(this.questPsgePrefab).getComponent(CellPsgeQuest);
            return cell;
        } else if (cellId === EVT) {
            const cell = cc.instantiate(this.evtPsgePrefab).getComponent(CellPsgeEvt);
            return cell;
        } else if (cellId === NAMEINPUT) {
            const cell = cc.instantiate(this.nameInputPsgePrefab).getComponent(CellPsgeNameInput);
            return cell;
        } else if (cellId === HEAD) {
            const cell = cc.instantiate(this.headPsgePrefab).getComponent(CellPsgeHead);
            return cell;
        } else if (cellId === END) {
            const cell = cc.instantiate(this.endPsgePrefab).getComponent(CellPsgeEnd);
            return cell;
        } else if (cellId === TOPCKR) {
            return cc.instantiate(this.blankPrefab).getComponent(ListViewCell);
        } else if (cellId === CHECKERBLANK) {
            return cc.instantiate(this.blankPrefab).getComponent(ListViewCell);
        } else if (cellId === BTMCKR) {
            return cc.instantiate(this.blankPrefab).getComponent(ListViewCell);
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPsge) {
        if (rowIdx > 0) {
            const realIdx = rowIdx - 1 + this.from;
            if (realIdx < this.to) {
                const t = this.psgesInList[realIdx].pType;
                if (t === PsgeType.normal) {
                    cell.setData(this.strsInList[realIdx]);
                } else if (t === PsgeType.selection) {
                } else if (t === PsgeType.quest) {
                } else if (t === PsgeType.evt) {
                }
            }
        }
    }
}
