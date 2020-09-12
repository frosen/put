/*
 * PageActShop.ts
 * 商店页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { MoneyTool, CnsumDataTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { PageActShopLVD } from './PageActShopLVD';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { ListView } from 'scripts/ListView';
import { CellTransaction } from '../cells/cell_transaction/scripts/CellTransaction';

@ccclass
export class PageActShop extends PageBase {
    @property(ListView)
    list: ListView = null;

    @property(cc.SpriteFrame)
    detailBtnSFrame: cc.SpriteFrame = null;

    totalPrice: number = 0;

    goodsIds: string[];
    countList: number[] = [];

    onLoad() {
        super.onLoad();

        if (CC_EDITOR) return;
        const posId = this.ctrlr.memory.gameData.curPosId;
        this.goodsIds = actPosModelDict[posId].goodsList;

        const lvd = this.list.delegate as PageActShopLVD;
        lvd.page = this;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            return false;
        });
        navBar.setTitle('商店');
    }

    onPageShow() {
        this.list.resetContent(true);
        this.changeTotalPrice();
    }

    changeTotalPrice() {
        let tp = 0;
        for (let index = 0; index < this.goodsIds.length; index++) {
            const goodsId = this.goodsIds[index];
            const count = this.countList[index];
            if (count <= 0) continue;
            const price = CnsumDataTool.getModelById(goodsId).price;
            tp += count * price;
        }

        this.totalPrice = tp;
        this.navBar.setSubTitle('总价 ' + MoneyTool.getStr(tp));
    }

    // -----------------------------------------------------------------

    onCellAddCount(cell: CellTransaction) {}

    onCellRdcCount(cell: CellTransaction) {}

    onCellClick(cell: CellPkgCnsum) {}

    onCellClickDetailBtn(cell: CellPkgCnsum) {}
}
