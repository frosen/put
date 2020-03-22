/*
 * PageActExplorationLVD.ts
 * 探索页面列表代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import PageActExploration from './PageActExploration';
import CellExplorationLog from '../cells/cell_exploration_log/scripts/CellExplorationLog';

@ccclass
export default class PageActExplorationLVD extends ListViewDelegate {
    page: PageActExploration = null;

    @property(cc.Prefab)
    logCellPrefab: cc.Prefab = null;

    numberOfRows(listView: ListView): number {
        return Math.min(this.page.logList.length, 99);
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'cellLog';
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        return cc.instantiate(this.logCellPrefab).getComponent(ListViewCell);
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellExplorationLog) {
        cell.setData(this.page.logList[this.page.logList.length - rowIdx - 1]);
    }
}
