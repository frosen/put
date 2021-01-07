/*
 * ListViewDelegate.ts
 * 列表代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListView } from './ListView';
import { ListViewCell } from './ListViewCell';
import { BaseCtrlr } from './BaseCtrlr';

@ccclass
export abstract class ListViewDelegate extends cc.Component {
    get ctrlr(): BaseCtrlr {
        // @ts-ignore
        if (!this._ctrlr) this._ctrlr = window.baseCtrlr;
        return this._ctrlr;
    }
    _ctrlr!: BaseCtrlr;

    abstract numberOfRows(listView: ListView): number;
    heightForRow(listView: ListView, rowIdx: number): number {
        return 0;
    }

    abstract cellIdForRow(listView: ListView, rowIdx: number): string;
    abstract createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell;
    abstract setCellForRow(listView: ListView, rowIdx: number, cell: ListViewCell): void;
}
