/*
 * PkgEquipItemLVD.ts
 * 装备页面的物品栏中物品列表
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import { Item, Equip } from 'scripts/DataSaved';
import { PagePkgEquip } from './PagePkgEquip';
import CellPkgEquip from 'pages/page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';

@ccclass
export default class PkgEquipItemLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPkgEquipPrefab: cc.Prefab = null;

    curItems: Item[] = [];
    curItemIdxs: number[] = [];
    page: PagePkgEquip = null;

    initListData(items: Item[], itemIdxs: number[]) {
        this.curItems = items;
        this.curItemIdxs = itemIdxs;
    }

    numberOfRows(listView: ListView): number {
        return this.curItemIdxs.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'equip';
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        let cell = cc.instantiate(this.cellPkgEquipPrefab).getComponent(CellPkgEquip);
        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPkgEquip) {
        let itemIdx = this.curItemIdxs[rowIdx];
        cell.setData(itemIdx, this.curItems[itemIdx] as Equip);
    }
}
