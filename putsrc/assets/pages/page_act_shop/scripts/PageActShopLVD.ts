/*
 * PageActShopLVD.ts
 * 商店页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { CnsumType } from '../../../scripts/DataSaved';
import { CellTransaction } from '../cells/cell_transaction/scripts/CellTransaction';
import { CnsumTool } from '../../../scripts/Memory';
import { CellPkgDrink } from '../../page_pkg/cells/cell_pkg_drink/scripts/CellPkgDrink';
import { CellPkgCatcher } from '../../page_pkg/cells/cell_pkg_catcher/scripts/CellPkgCatcher';
import { CellPkgEqpAmplr } from '../../page_pkg/cells/cell_pkg_eqp_amplr/scripts/CellPkgEqpAmplr';
import { CellPkgMaterial } from '../../page_pkg/cells/cell_pkg_material/scripts/CellPkgMaterial';
import { CellPkgCnsum } from '../../page_pkg/scripts/CellPkgCnsum';
import { PageActShop, ShopCountMax } from './PageActShop';
import { CellPkgBook } from '../../page_pkg/cells/cell_pkg_book/scripts/CellPkgBook';
import { CellPkgSpecial } from '../../page_pkg/cells/cell_pkg_special/scripts/CellPkgSpecial';

const DRINK = 'D';
const CATCHER = 'C';
const EQPAMPLR = 'ea';
const BOOK = 'bk';
const SPECIAL = 'sp';
const MATERIAL = 'ml';

@ccclass
export class PageActShopLVD extends ListViewDelegate {
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

    page!: PageActShop;

    numberOfRows(listView: ListView): number {
        return this.page.goodsIds.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        const goodsId = this.page.goodsIds[rowIdx];
        const cnsumType = CnsumTool.getTypeById(goodsId);
        if (cnsumType === CnsumType.drink) return DRINK;
        else if (cnsumType === CnsumType.catcher) return CATCHER;
        else if (cnsumType === CnsumType.eqpAmplr) return EQPAMPLR;
        else if (cnsumType === CnsumType.book) return BOOK;
        else if (cnsumType === CnsumType.special) return SPECIAL;
        else if (cnsumType === CnsumType.material) return MATERIAL;

        return undefined!;
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        const cell = cc.instantiate(this.cellTransPrefab).getComponent(CellTransaction);
        cell.addCallback = this.page.onCellAddCount.bind(this.page);
        cell.rdcCallback = this.page.onCellRdcCount.bind(this.page);

        let subCell: CellPkgCnsum;
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
        }
        subCell!.changeFuncBtnImgToDetail();
        subCell!.getComponent(cc.Button).interactable = false;
        subCell!.funcBtnCallback = this.page.onCellClickDetailBtn.bind(this.page);

        cell.init(subCell!);

        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellTransaction) {
        const goodsId = this.page.goodsIds[rowIdx];
        const model = CnsumTool.getModelById(goodsId)!;
        (cell.subCell as CellPkgCnsum).setDataByModel(rowIdx, model, -1);

        const price = this.page.getCnsumReputPrice(model);
        cell.setPrice(price);

        const count = this.page.countList[rowIdx] || 0;
        cell.setCount(count, ShopCountMax);
    }
}
