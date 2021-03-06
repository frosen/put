/*
 * CellTransaction.ts
 * 交易项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { MoneyTool } from '../../../../../scripts/Memory';
import { rerenderLbl } from '../../../../../scripts/Utils';

@ccclass
export class CellTransaction extends ListViewCell {
    @property(cc.Node)
    itemBaseNode: cc.Node = null!;

    @property(cc.Label)
    priceLbl: cc.Label = null!;

    @property(cc.Label)
    subDataLbl: cc.Label = null!;

    @property(cc.Layout)
    layout: cc.Layout = null!;

    @property(cc.Label)
    numLbl: cc.Label = null!;

    @property(cc.Button)
    addBtn: cc.Button = null!;

    @property(cc.Button)
    rdcBtn: cc.Button = null!;

    priceBaseStr: string = '单价：';

    subCell!: ListViewCell;

    itemId!: string;
    itemCount!: number;

    addCallback!: (cell: CellTransaction, count: number) => void;
    rdcCallback!: (cell: CellTransaction, count: number) => void;

    onLoad() {
        this.addBtn.node.on(cc.Node.EventType.TOUCH_START, this.onAddStart.bind(this));
        this.addBtn.node.on(cc.Node.EventType.TOUCH_END, this.onAddEnd.bind(this));
        this.rdcBtn.node.on(cc.Node.EventType.TOUCH_START, this.onRdcStart.bind(this));
        this.rdcBtn.node.on(cc.Node.EventType.TOUCH_END, this.onRdcEnd.bind(this));
    }

    init(subCell: ListViewCell) {
        this.subCell = subCell;
        subCell.node.parent = this.itemBaseNode;
    }

    setPrice(price: number) {
        this.priceLbl.string = this.priceBaseStr + MoneyTool.getSimpleStr(price);
    }

    setSubData(subData: string, subLblColor?: cc.Color) {
        this.subDataLbl.string = subData || '';
        this.subDataLbl.node.color = subLblColor || cc.color(150, 150, 150);
        if (subData) {
            rerenderLbl(this.priceLbl);
            this.layout.updateLayout();
        }
    }

    setCount(count: number, maxCount: number) {
        this.numLbl.string = String(count);
        this.addBtn.interactable = count < maxCount;
        this.rdcBtn.interactable = count > 0;
        if (count <= 0 || count >= maxCount) this.updateState = 0;
    }

    onAddStart() {
        if (this.updateState === 0) this.updateState = 1;
    }

    onAddEnd() {
        if (this.updateState === 1) this.addCount(1);

        this.updateState = 0;
        this.updateTime = 0;
        this.changeTimes = 0;
    }

    onRdcStart() {
        if (this.updateState === 0) this.updateState = -1;
    }

    onRdcEnd() {
        if (this.updateState === -1) this.rdcCount(1);

        this.updateState = 0;
        this.updateTime = 0;
        this.changeTimes = 0;
    }

    addCount(count: number) {
        if (this.addBtn.interactable) this.addCallback(this, count);
    }

    rdcCount(count: number) {
        if (this.rdcBtn.interactable) this.rdcCallback(this, count);
    }

    updateState: number = 0;
    updateTime: number = 0;
    changeTimes: number = 0;

    update(dt: number) {
        if (this.updateState === 1) {
            this.updateTime += dt;
            if (this.updateTime > 0.8) {
                this.updateState = 2;
                this.updateTime = 0;
            }
        } else if (this.updateState === 2) {
            this.updateTime += dt;
            if (this.updateTime > 0.2) {
                this.addCount(this.getChangeCount());
                this.updateTime = 0;
            }
        } else if (this.updateState === -1) {
            this.updateTime += dt;
            if (this.updateTime > 0.8) {
                this.updateState = -2;
                this.updateTime = 0;
            }
        } else if (this.updateState === -2) {
            this.updateTime += dt;
            if (this.updateTime > 0.2) {
                this.rdcCount(this.getChangeCount());
                this.updateTime = 0;
            }
        }
    }

    getChangeCount() {
        this.changeTimes++;
        if (this.changeTimes <= 10) return 1;
        if (this.changeTimes <= 20) return 10;
        if (this.changeTimes <= 30) return 100;
        return 1000;
    }
}
