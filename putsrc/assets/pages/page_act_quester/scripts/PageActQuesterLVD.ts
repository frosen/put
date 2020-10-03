/*
 * PageActQuesterLVD.ts
 * 任务中心列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from 'scripts/ListViewDelegate';
import { ListView } from 'scripts/ListView';
import { ListViewCell } from 'scripts/ListViewCell';
import { PageActPetMkt, PetMktCountMax } from './PageActPetMkt';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellUpdateDisplay } from 'pages/page_act_eqpmkt/cells/cell_update_display/scripts/CellUpdateDisplay';
import { CellPkgCaughtPet } from 'pages/page_pkg/cells/cell_pkg_caught_pet/scripts/CellPkgCaughtPet';
import { PageActQuester } from './PageActQuester';

@ccclass
export class PageActQuesterLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellQuestPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellUpdateDisplay: cc.Prefab = null;

    page: PageActQuester;

    numberOfRows(listView: ListView): number {
        return 1 + this.page.pADQuester.questIds.length;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) return 104;
        else return 304;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) return 'upd';
        else return 'q';
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        if (rowIdx === 0) {
            const cell = cc.instantiate(this.cellUpdateDisplay).getComponent(CellUpdateDisplay);
            cell.refreshBtn.node.active = false;
            return cell;
        } else {
            const cell: CellTransaction = cc.instantiate(this.cellTransPrefab).getComponent(CellTransaction);
            cell.addCallback = this.page.onCellAddCount.bind(this.page);
            cell.rdcCallback = this.page.onCellRdcCount.bind(this.page);

            const subCell = cc.instantiate(this.cellPkgCPetPrefab).getComponent(CellPkgCaughtPet);
            subCell.setFuncBtnUI(this.page.detailBtnSFrame);
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
            const price = this.page.priceList[idx];
            cell.setData(idx, goods, price);

            const count = this.page.countList[idx] || 0;
            cell.setCount(count, PetMktCountMax);
        }
    }
}
