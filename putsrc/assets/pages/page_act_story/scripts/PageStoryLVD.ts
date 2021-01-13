/*
 * PageStoryLVD.ts
 * 故事页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { NormalPsge, Psge, PsgeType, SelectionPsge } from '../../../scripts/DataModel';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { EvtTool } from '../../../scripts/Memory';
import { CellPsgeEvt } from '../cells/cell_psge_evt/scripts/CellPsgeEvt';
import { CellPsgeNormal } from '../cells/cell_psge_normal/scripts/CellPsgeNormal';
import { CellPsgeQuest } from '../cells/cell_psge_quest/scripts/CellPsgeQuest';
import { CellPsgeSelection } from '../cells/cell_psge_selection/scripts/CellPsgeSelection';
import { PageStory } from './PageStory';

const NORMAL = 'n';
const SELECTION = 's';
const QUEST = 'q';
const EVT = 'e';

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

    cellForCalcHeight!: CellPsgeNormal;

    psgesInList!: Psge[];
    optionIdxDictForList!: { [key: number]: number };

    heights: number[] = [];

    onLoad() {
        const nodeForCalcHeight = cc.instantiate(this.normalPsgePrefab);
        nodeForCalcHeight.parent = this.node;
        nodeForCalcHeight.opacity = 0;

        this.cellForCalcHeight = nodeForCalcHeight.getComponent(CellPsgeNormal);
    }

    initData() {
        const curProg = this.page.evt.prog;
        const psgesInModel = this.page.storyModel.psges;
        const psges: Psge[] = [];
        const optionIdxDict: { [key: number]: number } = {};

        const slcDict = this.page.evt.slcDict;
        const slcDictTemp: { [key: string]: number } = {};

        // 加载之前的
        let index = 0;
        while (true) {
            if (index >= curProg) break;
            const psge = psgesInModel[index];
            psges[psges.length] = psge;
            if (psge.type === PsgeType.normal) {
                index = (psge as NormalPsge).go || index + 1;
            } else if (psge.type === PsgeType.selection) {
                const slcPsge = psge as SelectionPsge;
                const slcId = slcPsge.id;

                let optionIdx = -1;
                for (let index = 0; index < slcPsge.iprtCnt; index++) {
                    if (EvtTool.getSlcRzt(slcDict, slcId, index) !== 1) continue;
                    optionIdx = index;
                    break;
                }

                if (optionIdx !== -1) {
                    let slcIdx = slcPsge.iprtCnt;
                    while (true) {
                        if (slcIdx >= slcPsge.options.length) {
                            optionIdxDict[psges.length - 1] = optionIdx;
                            index = slcPsge.options[optionIdx].go;
                            break;
                        }
                        const curRzt = EvtTool.getSlcRzt(slcDict, slcId, slcIdx);
                        if (curRzt === 1) {
                            const tempRzt = EvtTool.getSlcRzt(slcDictTemp, slcId, slcIdx);
                            if (tempRzt !== 1) {
                                EvtTool.setSlcRzt(slcDictTemp, slcId, slcIdx, 1);
                                optionIdxDict[psges.length - 1] = slcIdx;
                                index = slcPsge.options[slcIdx].go;
                                break;
                            }
                        }
                        slcIdx++;
                    }
                }
            } else {
                index++;
            }
        }

        // 加载随后的
        let addCnt = 10;
        while (true) {
            const psge = psgesInModel[index];
            psges[psges.length] = psge;
            if (psge.type !== PsgeType.normal) break;
            addCnt--;
            if (addCnt === 0) break;
        }

        this.psgesInList = psges;
        this.optionIdxDictForList = optionIdxDict;

        this.heights.length = 0;
    }

    numberOfRows(listView: ListView): number {
        return this.psgesInList.length;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        let h = this.heights[rowIdx];
        if (h) return h;
        const psge = this.psgesInList[rowIdx];
        if (psge.type === PsgeType.normal) {
            this.cellForCalcHeight.setData((psge as NormalPsge).str);
            h = this.cellForCalcHeight.node.height;
        } else if (psge.type === PsgeType.selection) {
            h = CellPsgeSelection.getHeight((psge as SelectionPsge).options.length);
        }
        this.heights[rowIdx] = h;
        return h;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        const t = this.psgesInList[rowIdx].type;
        if (t === PsgeType.normal) return NORMAL;
        else if (t === PsgeType.selection) return SELECTION;
        else if (t === PsgeType.quest) return QUEST;
        else return EVT;
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
        } else {
            const cell = cc.instantiate(this.evtPsgePrefab).getComponent(CellPsgeEvt);
            return cell;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: any) {}
}
