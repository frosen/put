/*
 * PagePkgLVD.ts
 * 道具列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import { Item, ItemType, Money, Equip } from 'scripts/DataSaved';
import CellPkgMoney from '../cells/cell_pkg_money/scripts/CellPkgMoney';
import CellPkgEquip from '../cells/cell_pkg_equip/scripts/CellPkgEquip';
import PagePkg from './PagePkg';

type CellPkg = CellPkgMoney & CellPkgEquip;
type DataPkg = Money & Equip;

let MONEY = 'M';
let CNSUM = 'C';
let EQUIP = 'E';

@ccclass
export default class PagePkgLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPkgMoneyPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgCnsumPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgEquipPrefab: cc.Prefab = null;

    curItems: Item[] = [];

    page: PagePkg = null;

    initListData(curItems: Item[]) {
        this.curItems = curItems;
    }

    numberOfRows(listView: ListView): number {
        return this.curItems.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        switch (this.curItems[rowIdx].itemType) {
            case ItemType.money:
                return MONEY;
            case ItemType.cnsum:
                return CNSUM;
            case ItemType.equip:
                return EQUIP;
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case MONEY:
                return cc.instantiate(this.cellPkgMoneyPrefab).getComponent(CellPkgMoney);
            case CNSUM:
                return null;
            case EQUIP:
                let cell = cc.instantiate(this.cellPkgEquipPrefab).getComponent(CellPkgEquip);
                cell.page = this.page;
                return cell;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPkg) {
        cell.setData(rowIdx, this.curItems[rowIdx] as DataPkg);
    }
}
