/*
 * PageActShop.ts
 * 商店页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { MoneyTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { PageActShopLVD } from './PageActShopLVD';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';

@ccclass
export class PageActShop extends PageBase {
    totalPrice: number = 0;

    onLoad() {
        super.onLoad();

        if (CC_EDITOR) return;
        this.getComponent(PageActShopLVD).page = this;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            return false;
        });
        navBar.setTitle('商店');
        this.changeTotalPrice(0);
    }

    changeTotalPrice(tp: number) {
        this.totalPrice = tp;
        this.navBar.setSubTitle('总价 ' + MoneyTool.getStr(tp));
    }

    // -----------------------------------------------------------------

    onCellClick(cell: CellPkgCnsum) {}
}
