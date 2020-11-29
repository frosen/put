/*
 * PageMsgLVD.ts
 * 消息页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';

@ccclass
export class PageMsgLVD extends ListViewDelegate {
    numberOfRows(listView: ListView): number {
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
