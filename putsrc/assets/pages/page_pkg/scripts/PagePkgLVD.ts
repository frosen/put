/*
 * PagePkgLVD.ts
 * 道具列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import { Item, ItemType, Money, Equip, Cnsum, CnsumType, Drink } from 'scripts/DataSaved';
import PagePkg from './PagePkg';
import CellPkgMoney from '../cells/cell_pkg_money/scripts/CellPkgMoney';
import { CellPkgEquip, CellPkgEquipType } from '../cells/cell_pkg_equip/scripts/CellPkgEquip';
import { CellPkgDrink } from '../cells/cell_pkg_drink/scripts/CellPkgDrink';

type CellPkg = CellPkgMoney & CellPkgDrink & CellPkgEquip;
type DataPkg = Money & Drink & Equip;

let MONEY = 'M';
let DRINK = 'D';
let EQUIP = 'E';

@ccclass
export default class PagePkgLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPkgMoneyPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgDrinkPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgEquipPrefab: cc.Prefab = null;

    curItems: Item[] = [];
    curItemIdxs: number[] = [];
    page: PagePkg = null;

    initListData(items: Item[], itemIdxs: number[]) {
        this.curItems = items;
        this.curItemIdxs = itemIdxs;
    }

    numberOfRows(listView: ListView): number {
        return this.curItemIdxs.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        let item = this.curItems[this.curItemIdxs[rowIdx]];
        switch (item.itemType) {
            case ItemType.money:
                return MONEY;
            case ItemType.cnsum: {
                let cnsumType = (item as Cnsum).cnsumType;
                if (cnsumType == CnsumType.drink) return DRINK;
            }
            case ItemType.equip:
                return EQUIP;
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case MONEY:
                return cc.instantiate(this.cellPkgMoneyPrefab).getComponent(CellPkgMoney);
            case DRINK: {
                let cell = cc.instantiate(this.cellPkgDrinkPrefab).getComponent(CellPkgDrink);
                cell.clickCallback = this.page.onCellClick.bind(this.page);
                cell.funcBtnCallback = this.page.onCellClickFuncBtn.bind(this.page);
                return cell;
            }
            case EQUIP: {
                let cell = cc.instantiate(this.cellPkgEquipPrefab).getComponent(CellPkgEquip);
                cell.init(CellPkgEquipType.normal);
                cell.clickCallback = this.page.onCellClick.bind(this.page);
                cell.funcBtnCallback = this.page.onCellClickFuncBtn.bind(this.page);
                return cell;
            }
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPkg) {
        let itemIdx = this.curItemIdxs[rowIdx];
        cell.setData(itemIdx, this.curItems[itemIdx] as DataPkg);
    }
}
