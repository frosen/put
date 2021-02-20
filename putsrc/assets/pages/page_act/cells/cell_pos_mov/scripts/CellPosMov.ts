/*
 * CellPosMov.ts
 * 位置列表中的移动项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ActPosModel } from '../../../../../scripts/DataModel';
import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { rerenderLbl } from '../../../../../scripts/Utils';

@ccclass
export class CellPosMov extends ListViewCell {
    @property(cc.Sprite)
    icon: cc.Sprite = null!;

    @property(cc.Label)
    posNameLbl: cc.Label = null!;

    @property(cc.Label)
    priceLbl: cc.Label = null!;

    @property(cc.Layout)
    layout: cc.Layout = null!;

    @property(cc.Button)
    infoBtn: cc.Button = null!;

    clickCallback!: (cell: CellPosMov) => void;

    movPosModel!: ActPosModel;
    price: number = 0;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.infoBtn.node.on('click', this.onClickInfo, this);
    }

    setData(movPosModel: ActPosModel, price: number) {
        this.movPosModel = movPosModel;
        this.price = price;

        this.icon.spriteFrame = this.ctrlr.runningImgMgr.get(movPosModel.id).icon;
        this.posNameLbl.string = '前往：' + movPosModel.cnName;
        this.priceLbl.string = '花费：' + String(price);

        rerenderLbl(this.posNameLbl);
        rerenderLbl(this.priceLbl);
        this.layout.updateLayout();
    }

    onClick() {
        cc.log('PUT click mov: ', this.posNameLbl.string);
        if (this.clickCallback) this.clickCallback(this);
    }

    onClickInfo() {
        cc.log('PUT click mov info: ', this.posNameLbl.string);
    }
}
