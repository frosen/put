/*
 * PagePkgLVD.ts
 * 道具列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { Item, ItemType, Money, Equip, Cnsum, CnsumType, Drink, Catcher, EqpAmplr, CaughtPet } from '../../../scripts/DataSaved';
import { PagePkgBase } from './PagePkgBase';
import { CellPkgMoney } from '../cells/cell_pkg_money/scripts/CellPkgMoney';
import { CellPkgEquip } from '../cells/cell_pkg_equip/scripts/CellPkgEquip';
import { CellPkgDrink } from '../cells/cell_pkg_drink/scripts/CellPkgDrink';
import { CellPkgCatcher } from '../cells/cell_pkg_catcher/scripts/CellPkgCatcher';
import { CellPkgCaughtPet } from '../cells/cell_pkg_caught_pet/scripts/CellPkgCaughtPet';
import { CellPkgEqpAmplr } from '../cells/cell_pkg_eqp_amplr/scripts/CellPkgEqpAmplr';
import { CellPkgBase } from './CellPkgBase';
import { CellPkgMaterial } from '../cells/cell_pkg_material/scripts/CellPkgMaterial';
import { CellPkgBook } from '../cells/cell_pkg_book/scripts/CellPkgBook';
import { CellPkgSpecial } from '../cells/cell_pkg_special/scripts/CellPkgSpecial';

type CellPkg = CellPkgMoney & CellPkgDrink & CellPkgCatcher & CellPkgEqpAmplr & CellPkgEquip & CellPkgCaughtPet;
type DataPkg = Money & Drink & Catcher & EqpAmplr & Equip & CaughtPet;

const MONEY = 'M';
const DRINK = 'D';
const CATCHER = 'C';
const EQPAMPLR = 'ea';
const BOOK = 'bk';
const SPECIAL = 'sp';
const MATERIAL = 'ml';
const EQUIP = 'E';
const CPET = 'p';
const BLANK = 'blank';

export enum PagePkgCellType {
    normal = 1,
    selection
}

@ccclass
export class PagePkgLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPkgMoneyPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgDrinkPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgCatcherPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgEqpAmplrPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgBookPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgSpecialPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgMaterialPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgEquipPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgCaughtPetPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    cellPkgBlankPrefab: cc.Prefab = null!;

    curItems!: Item[];
    curItemIdxs!: number[];
    page!: PagePkgBase;
    cellType: PagePkgCellType = PagePkgCellType.normal;

    initListData(items: Item[], itemIdxs: number[]) {
        this.curItems = items;
        this.curItemIdxs = itemIdxs;
    }

    numberOfRows(listView: ListView): number {
        return this.curItemIdxs.length + 2;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx <= this.curItemIdxs.length) return BLANK;
        const item = this.curItems[this.curItemIdxs[rowIdx]];
        switch (item.itemType) {
            case ItemType.money:
                return MONEY;
            case ItemType.cnsum: {
                const cnsumType = (item as Cnsum).cnsumType;
                if (cnsumType === CnsumType.drink) return DRINK;
                else if (cnsumType === CnsumType.catcher) return CATCHER;
                else if (cnsumType === CnsumType.eqpAmplr) return EQPAMPLR;
                else if (cnsumType === CnsumType.book) return BOOK;
                else if (cnsumType === CnsumType.special) return SPECIAL;
                else if (cnsumType === CnsumType.material) return MATERIAL;
                else return undefined!;
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
        } else if (cellId === BLANK) {
            return cc.instantiate(this.cellPkgBlankPrefab).getComponent(ListViewCell);
        }

        let cell: CellPkgBase | undefined;
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
            case BOOK:
                cell = cc.instantiate(this.cellPkgBookPrefab).getComponent(CellPkgBook);
                break;
            case SPECIAL:
                cell = cc.instantiate(this.cellPkgSpecialPrefab).getComponent(CellPkgSpecial);
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
            cell!.clickCallback = this.page.onCellClickDetailBtn.bind(this.page);
            cell!.funcBtnCallback = this.page.onCellClickFuncBtn.bind(this.page);
        } else {
            cell!.changeFuncBtnImgToDetail();
            cell!.clickCallback = this.page.onCellClick.bind(this.page);
            cell!.funcBtnCallback = this.page.onCellClickDetailBtn.bind(this.page);
        }
        return cell!;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPkg) {
        if (rowIdx < this.curItemIdxs.length) {
            const itemIdx = this.curItemIdxs[rowIdx];
            cell.setData(itemIdx, this.curItems[itemIdx] as DataPkg);
        }
    }
}
