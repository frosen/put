/*
 * PageActEqpMktLVD.ts
 * 装备市场页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from 'scripts/ListViewDelegate';
import { ListView } from 'scripts/ListView';
import { ListViewCell } from 'scripts/ListViewCell';
import { PageActEqpMkt, EqpMktCountMax } from './PageActEqpMkt';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellPkgEquip } from 'pages/page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';

@ccclass
export class PageActEqpMktLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellTransPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgEquipPrefab: cc.Prefab = null;

    page: PageActEqpMkt;

    numberOfRows(listView: ListView): number {
        return 1 + this.page.goodsList.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) return 'upd';
        else return 'eqp';
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        if (rowIdx === 0) return null;
        else {
            const cell: CellTransaction = cc.instantiate(this.cellTransPrefab).getComponent(CellTransaction);
            cell.addCallback = this.page.onCellAddCount.bind(this.page);
            cell.rdcCallback = this.page.onCellRdcCount.bind(this.page);

            const subCell = cc.instantiate(this.cellPkgEquipPrefab).getComponent(CellPkgEquip);
            subCell.setFuncBtnUI(this.page.detailBtnSFrame);
            subCell.getComponent(cc.Button).interactable = false;
            subCell.funcBtnCallback = this.page.onCellClickDetailBtn.bind(this.page);

            cell.init(subCell);

            return cell;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellTransaction) {
        if (rowIdx === 0) {
        } else {
            const idx = rowIdx - 1;

            const goods = this.page.goodsList[idx];
            const price = this.page.priceList[idx];
            cell.setData(idx, goods, price);

            const count = this.page.countList[idx] || 0;
            cell.setCount(count, EqpMktCountMax);
        }
    }
}
