/*
 * ListViewDelegate.ts
 * 列表代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListView from './ListView';
import ListViewCell from './ListViewCell';

@ccclass
export default abstract class ListViewDelegate extends cc.Component {
    abstract numberOfRows(listView: ListView): number;
    abstract heightForRow(listView: ListView, row: number): number;
    abstract cellForRow(listView: ListView, row: number): ListViewCell;
}
