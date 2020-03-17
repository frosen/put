/*
 * PageActExplorationLVD.ts
 * 探索页面列表代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';

@ccclass
export default class PageActExplorationLVD extends ListViewDelegate {
    numberOfRows(listView: ListView): number {}
    cellIdForRow(listView: ListView, rowIdx: number): string {}
    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {}
    setCellForRow(listView: ListView, rowIdx: number, cell: ListViewCell) {}
}
