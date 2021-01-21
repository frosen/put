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
export const TOPCKR = 'tckr';
export const BTMCKR = 'bckr';

type CellPsge = CellPsgeNormal & CellPsgeSelection & CellPsgeQuest & CellPsgeEvt;

@ccclass
export class PageStoryLVD extends ListViewDelegate {
    page!: PageStory;

    @property(cc.Prefab)
    headPsgePrefab: cc.Prefab = null!;

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
    endPsgePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    checkerBlankPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    checkerPrefab: cc.Prefab = null!;

    cellForCalcHeight!: CellPsgeNormal;

    psgesInList!: Psge[];
    optionIdxDictForList!: { [key: number]: number };

    heightsInList: number[] = [];
    strsInList: string[] = [];

    from: number = 0;
    to: number = 0;
    radius: number = 16;

    onLoad() {
        const nodeForCalcHeight = cc.instantiate(this.normalPsgePrefab);
        nodeForCalcHeight.parent = this.node;
        nodeForCalcHeight.opacity = 0;

        this.cellForCalcHeight = nodeForCalcHeight.getComponent(CellPsgeNormal);
    }

    initData() {
        this.initPsgeData();
        this.initStrData();
    }

    initPsgeData() {
        const curProg = this.page.evt.prog;
        const psgesInModel = this.page.storyModel.psges;

        const psges: Psge[] = [];
        const optionIdxDict: { [key: number]: number } = {};

        const slcDict = this.page.evt.slcDict;
        const tempSlcUsingDict: { [key: string]: number } = {};

        let needNext = true;

        // 加载之前的
        let index = 0;
        while (true) {
            if (index >= curProg) break;
            const psge = psgesInModel[index];
            psges[psges.length] = psge;

            if (psge.pType === PsgeType.normal) {
                index = (psge as NormalPsge).go || index + 1;
            } else if (psge.pType === PsgeType.selection) {
                const slcPsge = psge as SelectionPsge;
                const slcId = slcPsge.id;

                const curSlcNumUsing = (tempSlcUsingDict[slcId] || 0) + 1;
                const optionIdx = EvtTool.getOption(slcDict, slcId, curSlcNumUsing);

                if (optionIdx !== -1) {
                    index = slcPsge.options[optionIdx].go;
                } else {
                    needNext = false;
                    break;
                }

                tempSlcUsingDict[slcId] = curSlcNumUsing;
            } else {
                index++;
            }
        }

        // 加载随后的
        if (needNext) {
            let addCnt = 10;
            while (true) {
                const psge = psgesInModel[index];
                if (!psge) break;
                psges[psges.length] = psge;

                if (psge.pType === PsgeType.normal) {
                    index = (psge as NormalPsge).go || index + 1;
                } else if (psge.pType === PsgeType.selection) {
                    break;
                } else {
                    index++;
                }

                addCnt--;
                if (addCnt === 0) break;
            }
        }

        this.psgesInList = psges;
        this.optionIdxDictForList = optionIdxDict;
    }

    initStrData() {
        const curProg = this.page.evt.prog;
        const gameData = this.ctrlr.memory.gameData;
        const psges = this.psgesInList;

        this.from = Math.max(curProg - this.radius, 0);
        this.to = Math.min(curProg + this.radius, psges.length);

        const heights: number[] = [];
        const strs: string[] = [];

        for (let index = this.from; index < this.to; index++) {
            const psge = psges[index];
            const t = psge.pType;
            if (t === PsgeType.normal) {
                const str = PageStoryLVD.getRealPsgeStr(gameData, psge as NormalPsge);
                PageStoryLVD.monitorLabelCharAtlas();
                this.cellForCalcHeight.setData(str);
                if (PageStoryLVD.labelCharError) {
                    // 监测label发现char不能正确生成，大概率因为保存的char缓存已满，需清理缓存重新初始化
                    cc.Label.clearCharCache();
                    return this.initStrData();
                }
                heights[psges.length] = this.cellForCalcHeight.node.height;
                strs[psges.length] = str;
            } else if (t === PsgeType.selection) {
                heights[psges.length] = CellPsgeSelection.getHeight((psge as SelectionPsge).options.length);
            } else if (t === PsgeType.quest) {
            } else if (t === PsgeType.evt) {
            } else if (t === PsgeType.nameInput) {
            } else if (t === PsgeType.head) {
            } else if (t === PsgeType.end) {
            }
        }

        this.heightsInList = heights;
        this.strsInList = strs;
    }

    static getRealPsgeStr(gameData: GameData, psge: NormalPsge): string {
        return psge.str.replace(/RRR/g, gameData.roleName);
    }

    static monitored: boolean = false;
    static labelCharError: boolean = false;

    static monitorLabelCharAtlas() {
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
            return cc.instantiate(this.checkerPrefab).getComponent(ListViewCell);
        } else if (cellId === CHECKERBLANK) {
            return cc.instantiate(this.checkerBlankPrefab).getComponent(ListViewCell);
        } else if (cellId === BTMCKR) {
            return cc.instantiate(this.checkerPrefab).getComponent(ListViewCell);
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
