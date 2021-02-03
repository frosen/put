/*
 * PageActQuesterLVD.ts
 * 任务中心列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { CellUpdateDisplay } from '../../page_act_eqpmkt/cells/cell_update_display/scripts/CellUpdateDisplay';
import { PageActQuester } from './PageActQuester';
import { CellQuest } from '../cells/cell_quest/scripts/CellQuest';
import { QuestModelDict } from '../../../configs/QuestModelDict';

@ccclass
export class PageActQuesterLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellQuestPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellUpdateDisplay: cc.Prefab = null!;

    page!: PageActQuester;

    numberOfRows(listView: ListView): number {
        return 1 + this.page.pADQuester.quests.length;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) return 104;
        else return 334;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) return 'upd';
        else return 'q';
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        if (rowIdx === 0) {
            const cell = cc.instantiate(this.cellUpdateDisplay).getComponent(CellUpdateDisplay);
            cell.refreshBtn.node.active = false;
            return cell;
        } else {
            const cell: CellQuest = cc.instantiate(this.cellQuestPrefab).getComponent(CellQuest);
            cell.clickCallback = this.page.onCellClick.bind(this.page);
            cell.funcBtnCallback = this.page.onCellClickFuncBtn.bind(this.page);
            cell.atQuester = true;
            return cell;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellUpdateDisplay & CellQuest) {
        if (rowIdx === 0) {
            cell.setData(this.page.pADQuester.updateTime);
        } else {
            const idx = rowIdx - 1;
            const quest = this.page.pADQuester.quests[idx];
            const questModel = QuestModelDict[quest.id];
            const questInfo = this.page.acceQuestDict[quest.id] || null;
            cell.setData(questModel, quest, questInfo);
        }
    }
}
