/*
 * PagePkgLVD.ts
 * 道具列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from 'scripts/ListViewDelegate';
import { ListView } from 'scripts/ListView';
import { ListViewCell } from 'scripts/ListViewCell';
import { Item, ItemType, Money, Equip, Cnsum, CnsumType, Drink, Catcher, EqpAmplr, CaughtPet } from 'scripts/DataSaved';
import { PagePkgBase } from './PagePkgBase';
import { CellPkgMoney } from '../cells/cell_pkg_money/scripts/CellPkgMoney';
import { CellPkgEquip } from '../cells/cell_pkg_equip/scripts/CellPkgEquip';
import { CellPkgDrink } from '../cells/cell_pkg_drink/scripts/CellPkgDrink';
import { CellPkgCatcher } from '../cells/cell_pkg_catcher/scripts/CellPkgCatcher';
import { CellPkgCaughtPet } from '../cells/cell_pkg_caught_pet/scripts/CellPkgCaughtPet';
import { CellPkgEqpAmplr } from '../cells/cell_pkg_eqp_amplr/scripts/CellPkgEqpAmplr';
import { CellPkgBase } from './CellPkgBase';
import { CellPkgMaterial } from '../cells/cell_pkg_material/scripts/CellPkgMaterial';

type CellPkg = CellPkgMoney & CellPkgDrink & CellPkgCatcher & CellPkgEqpAmplr & CellPkgEquip & CellPkgCaughtPet;
type DataPkg = Money & Drink & Catcher & EqpAmplr & Equip & CaughtPet;

let MONEY = 'M';
let DRINK = 'D';
let CATCHER = 'C';
let EQPAMPLR = 'ea';
let MATERIAL = 'ml';
let EQUIP = 'E';
let CPET = 'p';

export enum PagePkgCellType {
    normal = 1,
    selection
}

@ccclass
export class PagePkgLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPkgMoneyPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgDrinkPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgCatcherPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgEqpAmplrPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgMaterialPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgEquipPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgCaughtPetPrefab: cc.Prefab = null;

    curItems: Item[] = [];
    curItemIdxs: number[] = [];
    page: PagePkgBase = null;
    cellType: PagePkgCellType = PagePkgCellType.normal;

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
                if (cnsumType === CnsumType.drink) return DRINK;
                else if (cnsumType === CnsumType.catcher) return CATCHER;
                else if (cnsumType === CnsumType.eqpAmplr) return EQPAMPLR;
                else if (cnsumType === CnsumType.material) return MATERIAL;
            }
            case ItemType.equip:
                return EQUIP;
            case ItemType.caughtPet:
                return CPET;
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        if (cellId === MONEY) {
            return cc.instantiate(this.cellPkgMoneyPrefab).getComponent(CellPkgMoney);
        }

        let cell: CellPkgBase;
        switch (cellId) {
            case DRINK:
                cell = cc.instantiate(this.cellPkgDrinkPrefab).getComponent(CellPkgDrink);
                break;
            case CATCHER:
                cell = cc.instantiate(this.cellPkgCatcherPrefab).getComponent(CellPkgCatcher);
                break;
            case EQPAMPLR:
                cell = cc.instantiate(this.cellPkgEqpAmplrPrefab).getComponent(CellPkgEqpAmplr);
                break;
            case MATERIAL:
                cell = cc.instantiate(this.cellPkgMaterialPrefab).getComponent(CellPkgMaterial);
                break;
            case EQUIP:
                cell = cc.instantiate(this.cellPkgEquipPrefab).getComponent(CellPkgEquip);
                break;
            case CPET:
                cell = cc.instantiate(this.cellPkgCaughtPetPrefab).getComponent(CellPkgCaughtPet);
                break;
        }

        if (this.cellType === PagePkgCellType.normal) {
            cell.clickCallback = this.page.onCellClickDetailBtn.bind(this.page);
            cell.funcBtnCallback = this.page.onCellClickFuncBtn.bind(this.page);
        } else {
            cell.setFuncBtnUI(this.page.detailBtnSFrame);
            cell.clickCallback = this.page.onCellClick.bind(this.page);
            cell.funcBtnCallback = this.page.onCellClickDetailBtn.bind(this.page);
        }
        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPkg) {
        let itemIdx = this.curItemIdxs[rowIdx];
        cell.setData(itemIdx, this.curItems[itemIdx] as DataPkg);
    }
}
