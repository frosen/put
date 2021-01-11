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
import { CellPsgeNormal } from '../cells/cell_psge_normal/scripts/CellPsgeNormal';
import { PageStory } from './PageStory';

@ccclass
export class PageStoryLVD extends ListViewDelegate {
    page!: PageStory;

    @property(cc.Prefab)
    normalPsgePrefab: cc.Prefab = null!;

    cellForCalcHeight!: CellPsgeNormal;

    psgesInList!: Psge[];
    optionIdxDictForList: { [key: number]: number } = {};

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
                            this.optionIdxDictForList[psges.length - 1] = optionIdx;
                            index = slcPsge.options[optionIdx].go;
                            break;
                        }
                        const curRzt = EvtTool.getSlcRzt(slcDict, slcId, slcIdx);
                        if (curRzt === 1) {
                            const tempRzt = EvtTool.getSlcRzt(slcDictTemp, slcId, slcIdx);
                            if (tempRzt !== 1) {
                                EvtTool.setSlcRzt(slcDictTemp, slcId, slcIdx, 1);
                                this.optionIdxDictForList[psges.length - 1] = slcIdx;
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
    }

    numberOfRows(listView: ListView): number {
        return this.psgesInList.length;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        const psge = this.psgesInList[rowIdx];
        if (psge.type === PsgeType.normal) {
            this.cellForCalcHeight.setData((psge as NormalPsge).str);
            return this.cellForCalcHeight.node.height;
        } else if (psge.type === PsgeType.selection) {
        }
        return 0;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'msg';
    }

    createCellForRow(listView: ListView, rowIdx: number): ListViewCell {
        return null;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: any) {}
}
