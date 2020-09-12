/*
 * CellTransaction.ts
 * 交易项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';
import { CnsumModel } from 'scripts/DataModel';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { MoneyTool } from 'scripts/Memory';

@ccclass
export class CellTransaction extends ListViewCell {
    @property(cc.Node)
    itemBaseNode: cc.Node = null;

    @property(cc.Label)
    priceLbl: cc.Label = null;

    @property(cc.Label)
    numLbl: cc.Label = null;

    @property(cc.Button)
    addBtn: cc.Button = null;

    @property(cc.Button)
    rdcBtn: cc.Button = null;

    cell: CellPkgCnsum;

    itemId: string;
    itemCount: number;

    addCallback: (cell: CellTransaction) => void;
    rdcCallback: (cell: CellTransaction) => void;

    init(cell: CellPkgCnsum) {
        this.cell = cell;
        cell.node.parent = this.itemBaseNode;
    }

    setData(itemIdx: number, model: CnsumModel) {
        this.cell.setDataByModel(itemIdx, model);
        this.setPrice(model.price);
    }

    setPrice(price: number) {
        this.priceLbl.string = MoneyTool.getStr(price);
    }

    setCount(count: number) {
        this.numLbl.string = String(count);
    }

    onClickAdd() {
        this.addCallback(this);
    }

    onClickRdc() {
        this.rdcCallback(this);
    }
}
