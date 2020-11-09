/*
 * PkgEquipItemLVD.ts
 * 装备页面的物品栏中物品列表
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from 'scripts/ListViewDelegate';
import { ListView } from 'scripts/ListView';
import { ListViewCell } from 'scripts/ListViewCell';
import { Item, Equip } from 'scripts/DataSaved';
import { PagePkgEquip } from './PagePkgEquip';
import { CellPkgEquip } from 'pages/page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';
import { GameDataTool } from 'scripts/Memory';
import { CellPkgEquipUnwield } from 'pages/page_pkg/cells/cell_pkg_equip_unwield/scripts/CellPkgEquipUnwield';

const UNWIELD = 'u';
const EQUIP = 'e';

@ccclass
export class PkgEquipItemLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPkgEquipPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellUnwieldPrefab: cc.Prefab = null;

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
        return this.curItemIdxs[rowIdx] === GameDataTool.UNWIELD ? UNWIELD : EQUIP;
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        if (cellId === EQUIP) {
            const cell = cc.instantiate(this.cellPkgEquipPrefab).getComponent(CellPkgEquip);
            cell.changeFuncBtnImgToDetail();
            cell.clickCallback = this.page.onItemCellClick.bind(this.page);
            cell.funcBtnCallback = this.page.onItemCellClickDetailBtn.bind(this.page);
            return cell;
        } else if (cellId === UNWIELD) {
            const cell = cc.instantiate(this.cellUnwieldPrefab).getComponent(CellPkgEquipUnwield);
            cell.clickCallback = this.page.onItemCellClick.bind(this.page);
            return cell;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPkgEquip) {
        const itemIdx = this.curItemIdxs[rowIdx];
        if (itemIdx !== GameDataTool.UNWIELD) cell.setData(itemIdx, this.curItems[itemIdx] as Equip);
    }
}
