/*
 * PagePetLVD.ts
 * 宠物列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import CellPet from '../cells/CellPet';

@ccclass
export default class PagePetLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPetPrefab: cc.Prefab = null;

    numberOfRows(listView: ListView): number {
        return 20;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'pet';
    }

    createCellForRow(listView: ListView, rowIdx: number): ListViewCell {
        let node = cc.instantiate(this.cellPetPrefab);
        let cell = node.getComponent(ListViewCell);
        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPet) {
        cell.setData('xxx' + String(rowIdx));
    }
}
