/*
 * PageActShop.ts
 * 商店页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { MoneyTool, CnsumTool, GameDataTool } from '../../../scripts/Memory';
import { PageBase } from '../../../scripts/PageBase';
import { NavBar } from '../../../scripts/NavBar';
import { PageActShopLVD } from './PageActShopLVD';
import { CellPkgCnsum } from '../../page_pkg/scripts/CellPkgCnsum';
import { ActPosModelDict, PAKey } from '../../../configs/ActPosModelDict';
import { ListView } from '../../../scripts/ListView';
import { CellTransaction } from '../cells/cell_transaction/scripts/CellTransaction';
import { Money } from '../../../scripts/DataSaved';
import { CnsumModel, ShopModel } from '../../../scripts/DataModel';
import { ListViewCell } from '../../../scripts/ListViewCell';

export const ShopCountMax: number = 9999;
const ShopReputDiscount: number[] = [1, 1, 0.95, 0.9, 0.85, 0.8];

@ccclass
export class PageActShop extends PageBase {
    @property(ListView)
    list: ListView = null!;

    totalPrice: number = 0;
    totalCount: number = 0;

    goodsIds!: string[];
    countList: number[] = [];

    onLoad() {
        super.onLoad();

        if (CC_EDITOR) return;
        const posId = this.ctrlr.memory.gameData.curPosId;
        const shopModel = ActPosModelDict[posId].actMDict[PAKey.shop] as ShopModel;
        this.goodsIds = shopModel.goodsIdList;

        const lvd = this.list.delegate as PageActShopLVD;
        lvd.page = this;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            if (this.totalPrice <= 0) return true;
            this.ctrlr.popAlert(
                `确定消费${MoneyTool.getStr(this.totalPrice)}购买物资吗？`,
                (key: number) => {
                    if (key === 1) {
                        if (this.buy()) this.ctrlr.popPage();
                    } else if (key === 2) this.ctrlr.popPage();
                },
                '确定',
                '不消费，直接离开'
            );
            return false;
        });
        navBar.setTitle('商店');
    }

    buy(): boolean {
        const gameData = this.ctrlr.memory.gameData;
        if (this.totalPrice > GameDataTool.getMoney(gameData)) {
            this.ctrlr.popToast('钱不够啦');
            return false;
        }

        if (this.totalCount + gameData.weight > GameDataTool.getItemCountMax(gameData)) {
            this.ctrlr.popToast('道具数量超限了');
            return false;
        }

        for (let index = 0; index < this.countList.length; index++) {
            const count = this.countList[index];
            if (!count) continue;
            const goodsId = this.goodsIds[index];
            GameDataTool.addCnsum(gameData, goodsId, count);
        }
        GameDataTool.handleMoney(gameData, (m: Money) => (m.sum -= this.totalPrice));

        return true;
    }

    onPageShow() {
        this.list.resetContent(true);
        this.changeTotal();
    }

    changeTotal() {
        let tp = 0;
        let tc = 0;
        for (let index = 0; index < this.goodsIds.length; index++) {
            const goodsId = this.goodsIds[index];
            const count = this.countList[index] || 0;
            if (count <= 0) continue;
            const price = this.getCnsumReputPrice(CnsumTool.getModelById(goodsId)!);
            tp += count * price;
            tc += count;
        }

        this.totalPrice = tp;
        this.navBar.setSubTitle('总价 ' + MoneyTool.getSimpleStr(tp));
        this.totalCount = tc;
    }

    // -----------------------------------------------------------------

    onCellAddCount(cell: CellTransaction, count: number) {
        const gameData = this.ctrlr.memory.gameData;
        const goodsId = this.goodsIds[cell.curCellIdx];
        const price = this.getCnsumReputPrice(CnsumTool.getModelById(goodsId)!);
        const curMoney = GameDataTool.getMoney(gameData);
        let realCount: number;
        if (this.totalPrice + price * count > curMoney) {
            this.ctrlr.popToast('钱不够啦');
            const left = (curMoney - this.totalPrice) / price;
            if (left < 1) return;
            realCount = Math.floor(left);
        } else realCount = count;

        if (this.totalCount + realCount + gameData.weight > GameDataTool.getItemCountMax(gameData)) {
            this.ctrlr.popToast('道具数量超限了');
            const left = GameDataTool.getItemCountMax(gameData) - gameData.weight - this.totalCount;
            if (left === 0) return;
            realCount = left;
        }

        let curCount = this.countList[cell.curCellIdx] || 0;
        curCount = Math.min(curCount + realCount, ShopCountMax);
        this.countList[cell.curCellIdx] = curCount;
        cell.setCount(curCount, ShopCountMax);
        this.changeTotal();
    }

    onCellRdcCount(cell: CellTransaction, count: number) {
        let curCount = this.countList[cell.curCellIdx] || 0;
        curCount = Math.max(curCount - count, 0);
        this.countList[cell.curCellIdx] = curCount;
        cell.setCount(curCount, ShopCountMax);
        this.changeTotal();
    }

    onCellClickDetailBtn(cell: ListViewCell) {}

    getCnsumReputPrice(model: CnsumModel): number {
        const gameData = this.ctrlr.memory.gameData;
        const reputRank = GameDataTool.getReputRank(gameData, gameData.curPosId);
        return model.price * ShopReputDiscount[reputRank];
    }
}
