/*
 * PageActRcclrLVD.ts
 * 回收站页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { Cnsum, CnsumType, Item, ItemType } from '../../../scripts/DataSaved';
import { CellTransaction } from '../../page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellPkgDrink } from '../../page_pkg/cells/cell_pkg_drink/scripts/CellPkgDrink';
import { CellPkgCatcher } from '../../page_pkg/cells/cell_pkg_catcher/scripts/CellPkgCatcher';
import { CellPkgEqpAmplr } from '../../page_pkg/cells/cell_pkg_eqp_amplr/scripts/CellPkgEqpAmplr';
import { CellPkgMaterial } from '../../page_pkg/cells/cell_pkg_material/scripts/CellPkgMaterial';
import { PageActRcclr } from './PageActRcclr';
import { PagePkgCellType } from '../../page_pkg/scripts/PagePkgLVD';
import { CellPkgBase } from '../../page_pkg/scripts/CellPkgBase';
import { CellPkgEquip } from '../../page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';
import { CellPkgCaughtPet } from '../../page_pkg/cells/cell_pkg_caught_pet/scripts/CellPkgCaughtPet';
import { CellPkgBook } from '../../page_pkg/cells/cell_pkg_book/scripts/CellPkgBook';
import { CellPkgSpecial } from '../../page_pkg/cells/cell_pkg_special/scripts/CellPkgSpecial';

const DRINK = 'D';
const CATCHER = 'C';
const EQPAMPLR = 'ea';
const BOOK = 'bk';
const SPECIAL = 'sp';
const MATERIAL = 'ml';
const EQUIP = 'E';
const CPET = 'p';

@ccclass
export class PageActRcclrLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellTransPrefab: cc.Prefab = null!;

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

    curItems!: Item[];
    curItemIdxs!: number[];
    page!: PageActRcclr;
    cellType: PagePkgCellType = PagePkgCellType.normal;

    initListData(items: Item[], itemIdxs: number[]) {
        this.curItems = items;
        this.curItemIdxs = itemIdxs;
    }

    numberOfRows(listView: ListView): number {
        return this.curItemIdxs.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        const item = this.curItems[this.curItemIdxs[rowIdx]];
        switch (item.itemType) {
            case ItemType.cnsum: {
                const cnsumType = (item as Cnsum).cnsumType;
                if (cnsumType === CnsumType.drink) return DRINK;
                else if (cnsumType === CnsumType.catcher) return CATCHER;
                else if (cnsumType === CnsumType.eqpAmplr) return EQPAMPLR;
                else if (cnsumType === CnsumType.book) return BOOK;
                else if (cnsumType === CnsumType.special) return SPECIAL;
                else if (cnsumType === CnsumType.material) return MATERIAL;
            }
            case ItemType.equip:
                return EQUIP;
            case ItemType.caughtPet:
                return CPET;
        }

        return undefined!;
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        const cell = cc.instantiate(this.cellTransPrefab).getComponent(CellTransaction);
        cell.addCallback = this.page.onCellAddCount.bind(this.page);
        cell.rdcCallback = this.page.onCellRdcCount.bind(this.page);

        let subCell: CellPkgBase;
        switch (cellId) {
            case DRINK:
                subCell = cc.instantiate(this.cellPkgDrinkPrefab).getComponent(CellPkgDrink);
                break;
            case CATCHER:
                subCell = cc.instantiate(this.cellPkgCatcherPrefab).getComponent(CellPkgCatcher);
                break;
            case EQPAMPLR:
                subCell = cc.instantiate(this.cellPkgEqpAmplrPrefab).getComponent(CellPkgEqpAmplr);
                break;
            case BOOK:
                subCell = cc.instantiate(this.cellPkgBookPrefab).getComponent(CellPkgBook);
                break;
            case SPECIAL:
                subCell = cc.instantiate(this.cellPkgSpecialPrefab).getComponent(CellPkgSpecial);
                break;
            case MATERIAL:
                subCell = cc.instantiate(this.cellPkgMaterialPrefab).getComponent(CellPkgMaterial);
                break;
            case EQUIP:
                subCell = cc.instantiate(this.cellPkgEquipPrefab).getComponent(CellPkgEquip);
                break;
            case CPET:
                subCell = cc.instantiate(this.cellPkgCaughtPetPrefab).getComponent(CellPkgCaughtPet);
                break;
        }
        subCell!.changeFuncBtnImgToDetail();
        subCell!.getComponent(cc.Button).interactable = false;
        subCell!.funcBtnCallback = this.page.onCellClickDetailBtn.bind(this.page);

        cell.init(subCell!);

        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellTransaction) {
        const itemIdx = this.curItemIdxs[rowIdx];
        const item = this.curItems[itemIdx];
        (cell.subCell as CellPkgBase).setData(itemIdx, item);
        cell.setPrice(PageActRcclr.getItemRcclPrice(item));

        const count = this.page.countDict[item.id] || 0;
        const countMax = item.itemType === ItemType.cnsum ? (item as Cnsum).count : 1;
        cell.setCount(count, countMax);
    }
}
