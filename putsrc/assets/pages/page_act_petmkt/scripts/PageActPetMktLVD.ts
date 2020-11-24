/*
 * PageActPetMktLVD.ts
 * 精灵市场页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { PageActPetMkt, PetMktCountMax } from './PageActPetMkt';
import { CellTransaction } from '../../page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellUpdateDisplay } from '../../page_act_eqpmkt/cells/cell_update_display/scripts/CellUpdateDisplay';
import { CellPkgCaughtPet } from '../../page_pkg/cells/cell_pkg_caught_pet/scripts/CellPkgCaughtPet';
import { CellPkgBase } from '../../page_pkg/scripts/CellPkgBase';

@ccclass
export class PageActPetMktLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellTransPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgCPetPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellUpdateDisplay: cc.Prefab = null;

    page: PageActPetMkt;

    numberOfRows(listView: ListView): number {
        return 1 + this.page.goodsList.length;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) return 104;
        else return 220;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) return 'upd';
        else return 'pet';
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        if (rowIdx === 0) {
            const cell = cc.instantiate(this.cellUpdateDisplay).getComponent(CellUpdateDisplay);
            cell.onRefreshCallback = this.page.onRefresh.bind(this.page);
            return cell;
        } else {
            const cell: CellTransaction = cc.instantiate(this.cellTransPrefab).getComponent(CellTransaction);
            cell.addCallback = this.page.onCellAddCount.bind(this.page);
            cell.rdcCallback = this.page.onCellRdcCount.bind(this.page);

            const subCell = cc.instantiate(this.cellPkgCPetPrefab).getComponent(CellPkgCaughtPet);
            subCell.changeFuncBtnImgToDetail();
            subCell.getComponent(cc.Button).interactable = false;
            subCell.funcBtnCallback = this.page.onCellClickDetailBtn.bind(this.page);

            cell.init(subCell);

            return cell;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellUpdateDisplay & CellTransaction) {
        if (rowIdx === 0) {
            cell.setData(this.page.pADPetMkt.updateTime);
        } else {
            const idx = rowIdx - 1;
            const goods = this.page.goodsList[idx];
            (cell.subCell as CellPkgBase).setData(idx, goods);

            const price = this.page.priceList[idx];
            cell.setPrice(price);

            const count = this.page.countList[idx] || 0;
            cell.setCount(count, PetMktCountMax);
        }
    }
}
