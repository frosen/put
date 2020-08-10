/*
 * PageActExplLVD.ts
 * 探索页面列表代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { ListViewDelegate } from 'scripts/ListViewDelegate';
import { ListView } from 'scripts/ListView';
import { ListViewCell } from 'scripts/ListViewCell';
import { PageActExpl } from './PageActExpl';
import { CellExplLog } from '../cells/cell_expl_log/scripts/CellExplLog';

@ccclass
export class PageActExplLVD extends ListViewDelegate {
    page: PageActExpl = null;

    @property(cc.Prefab)
    logCellPrefab: cc.Prefab = null;

    numberOfRows(listView: ListView): number {
        return Math.min(this.page.getLogs().length, 99);
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'cellLog';
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        return cc.instantiate(this.logCellPrefab).getComponent(ListViewCell);
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellExplLog) {
        let logList = this.page.getLogs();
        cell.setData(logList[logList.length - rowIdx - 1]);
    }
}
