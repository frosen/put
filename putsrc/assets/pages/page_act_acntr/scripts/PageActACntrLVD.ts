/*
 * PageActACntrLVD.ts
 * 奖励中心页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { CnsumType } from '../../../scripts/DataSaved';
import { CnsumTool } from '../../../scripts/Memory';
import { ReputNames } from '../../../scripts/DataModel';

import { PageActACntr, ACntrCountMax } from './PageActACntr';

import { CellPkgDrink } from '../../page_pkg/cells/cell_pkg_drink/scripts/CellPkgDrink';
import { CellPkgCatcher } from '../../page_pkg/cells/cell_pkg_catcher/scripts/CellPkgCatcher';
import { CellPkgEqpAmplr } from '../../page_pkg/cells/cell_pkg_eqp_amplr/scripts/CellPkgEqpAmplr';
import { CellPkgMaterial } from '../../page_pkg/cells/cell_pkg_material/scripts/CellPkgMaterial';
import { CellTransaction } from '../../page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellPkgBase } from '../../page_pkg/scripts/CellPkgBase';
import { CellPkgEquip } from '../../page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';
import { CellPkgCnsum } from '../../page_pkg/scripts/CellPkgCnsum';
import { CellPkgBook } from '../../page_pkg/cells/cell_pkg_book/scripts/CellPkgBook';
import { CellPkgSpecial } from '../../page_pkg/cells/cell_pkg_special/scripts/CellPkgSpecial';

const DRINK = 'D';
const CATCHER = 'C';
const EQPAMPLR = 'ea';
const BOOK = 'bk';
const SPECIAL = 'sp';
const MATERIAL = 'ml';
const EQUIP = 'E';

@ccclass
export class PageActACntrLVD extends ListViewDelegate {
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

    page!: PageActACntr;

    numberOfRows(listView: ListView): number {
        return this.page.itemList.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        const eqpOrId = this.page.itemList[rowIdx];
        if (typeof eqpOrId === 'string') {
            const cnsumType = CnsumTool.getTypeById(eqpOrId);
            if (cnsumType === CnsumType.drink) return DRINK;
            else if (cnsumType === CnsumType.catcher) return CATCHER;
            else if (cnsumType === CnsumType.eqpAmplr) return EQPAMPLR;
            else if (cnsumType === CnsumType.book) return BOOK;
            else if (cnsumType === CnsumType.special) return SPECIAL;
            else if (cnsumType === CnsumType.material) return MATERIAL;
        } else {
            return EQUIP;
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
        }
        subCell!.changeFuncBtnImgToDetail();
        subCell!.getComponent(cc.Button).interactable = false;
        subCell!.funcBtnCallback = this.page.onCellClickDetailBtn.bind(this.page);

        cell.init(subCell!);

        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellTransaction) {
        const eqpOrId = this.page.itemList[rowIdx];
        const award = this.page.awardDataList[rowIdx];
        if (typeof eqpOrId === 'string') {
            (cell.subCell as CellPkgCnsum).setDataByModel(rowIdx, CnsumTool.getModelById(eqpOrId)!, ACntrCountMax);
        } else {
            (cell.subCell as CellPkgBase).setData(rowIdx, eqpOrId);
        }
        cell.setPrice(award.price);
        cell.setSubData(`[声望需求：${ReputNames[award.need]}]`);

        const count = this.page.countList[rowIdx];
        cell.setCount(count, ACntrCountMax);
    }
}
