/*
 * PageActACntr.ts
 * 奖励中心页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { MoneyTool, CnsumDataTool, GameDataTool, EquipDataTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { PageActACntrLVD } from './PageActACntrLVD';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { ListView } from 'scripts/ListView';
import { Equip, Item, Money } from 'scripts/DataSaved';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { ReputAward } from 'scripts/DataModel';

@ccclass
export class PageActACntr extends PageBase {
    @property(ListView)
    list: ListView = null;

    @property(cc.SpriteFrame)
    detailBtnSFrame: cc.SpriteFrame = null;

    totalPrice: number = 0;

    awardList: ReputAward[] = [];
    itemList: (Equip | string)[] = [];
    priceList: number[] = [];
    countList: number[] = [];

    onLoad() {
        super.onLoad();

        if (CC_EDITOR) return;
        const posId = this.ctrlr.memory.gameData.curPosId;
        this.awardList = actPosModelDict[posId].awardList;
        for (const award of this.awardList) {
            if (CnsumDataTool.getTypeById(award.fullId)) {
                this.itemList.push(award.fullId);
            } else {
                this.itemList.push(EquipDataTool.createByFullId(award.fullId));
            }
        }

        const lvd = this.list.delegate as PageActACntrLVD;
        lvd.page = this;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            if (this.totalPrice <= 0) return true;
            this.ctrlr.popAlert(
                `确定花费${MoneyTool.getStr(this.totalPrice)} 获取奖励？`,
                (key: number) => {
                    if (key === 1) {
                        if (this.buy()) this.ctrlr.popPage();
                    } else if (key === 2) this.ctrlr.popPage();
                },
                '确定',
                '不花费，直接离开'
            );
            return false;
        });
        navBar.setTitle('奖励中心');
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
            const price = CnsumDataTool.getModelById(goodsId).price;
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
        const eqpOrId = this.itemList[cell.curCellIdx];
        let price: number;
        if (typeof eqpOrId === 'string') price = CnsumDataTool.getModelById(eqpOrId).price;
        else price = EquipDataTool.getPrice(eqpOrId);

        const curMoney = GameDataTool.getMoney(gameData);

        if (this.totalPrice + price > curMoney) {
            this.ctrlr.popToast('钱不够啦');
            return;
        }

        if (this.totalCount + realCount + gameData.weight > GameDataTool.getItemCountMax(gameData)) {
            this.ctrlr.popToast('道具数量超限了');
            const left = GameDataTool.getItemCountMax(gameData) - gameData.weight - this.totalCount;
            if (left === 0) return;
            realCount = left;
        }

        let curCount = this.countList[cell.curCellIdx] || 0;
        curCount = Math.min(curCount + realCount, 1);
        this.countList[cell.curCellIdx] = curCount;
        cell.setCount(curCount, 1);
        this.changeTotal();
    }

    onCellRdcCount(cell: CellTransaction, count: number) {
        let curCount = this.countList[cell.curCellIdx] || 0;
        curCount = Math.max(curCount - count, 0);
        this.countList[cell.curCellIdx] = curCount;
        cell.setCount(curCount, 1);
        this.changeTotal();
    }

    onCellClickDetailBtn(cell: CellPkgCnsum) {}
}
