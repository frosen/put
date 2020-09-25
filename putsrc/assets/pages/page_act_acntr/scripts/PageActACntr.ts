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
import { Equip, Money, PADACntr } from 'scripts/DataSaved';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { PAKey, ReputAward } from 'scripts/DataModel';

export const ACntrCountMax = 1;

@ccclass
export class PageActACntr extends PageBase {
    @property(ListView)
    list: ListView = null;

    @property(cc.SpriteFrame)
    detailBtnSFrame: cc.SpriteFrame = null;

    totalPrice: number = 0;

    paIdxList: number[] = [];
    itemList: (Equip | string)[] = [];
    awardDataList: ReputAward[] = [];
    countList: number[] = [];

    onLoad() {
        super.onLoad();

        if (CC_EDITOR) return;
        const gameData = this.ctrlr.memory.gameData;
        const posId = gameData.curPosId;

        const pADACntr = GameDataTool.addPA(gameData, posId, PAKey.aCntr) as PADACntr;
        const soldoutList = pADACntr.soldoutList;

        const awardList = actPosModelDict[posId].awardList;
        for (let index = 0; index < awardList.length; index++) {
            const award = awardList[index];
            const soldout = soldoutList[index];
            if (soldout === true) continue;
            this.paIdxList.push(index);
            if (CnsumDataTool.getTypeById(award.fullId)) {
                this.itemList.push(award.fullId);
            } else {
                const eqp = EquipDataTool.createByFullId(award.fullId);
                this.itemList.push(eqp);
            }
            this.awardDataList.push(award);
            this.countList.push(0);
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

        let totalCount = 0;
        for (const count of this.countList) if (count > 0) totalCount++;
        if (totalCount + gameData.weight > GameDataTool.getItemCountMax(gameData)) {
            this.ctrlr.popToast('道具数量超限了');
            return false;
        }

        const posData = gameData.posDataDict[gameData.curPosId];
        const soldoutList = (posData.actDict[PAKey.aCntr] as PADACntr).soldoutList;
        for (let index = 0; index < this.countList.length; index++) {
            const count = this.countList[index];
            if (!count) continue;
            const eqpOrId = this.itemList[index];
            if (typeof eqpOrId === 'string') GameDataTool.addCnsum(gameData, eqpOrId);
            else GameDataTool.addEquip(gameData, eqpOrId);

            const paIdx = this.paIdxList[index];
            soldoutList[paIdx] = true;
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
        for (let index = 0; index < this.countList.length; index++) {
            const count = this.countList[index];
            if (count <= 0) continue;
            tp += this.awardDataList[index].price;
        }

        this.totalPrice = tp;
        this.navBar.setSubTitle('总价 ' + MoneyTool.getSimpleStr(tp));
    }

    // -----------------------------------------------------------------

    onCellAddCount(cell: CellTransaction, count: number) {
        const gameData = this.ctrlr.memory.gameData;
        const price = this.awardDataList[cell.curCellIdx].price;

        const curMoney = GameDataTool.getMoney(gameData);
        if (this.totalPrice + price > curMoney) {
            this.ctrlr.popToast('钱不够啦');
            return;
        }

        let totalCount = 0;
        for (const count of this.countList) if (count > 0) totalCount++;
        if (totalCount + 1 + gameData.weight > GameDataTool.getItemCountMax(gameData)) {
            this.ctrlr.popToast('道具数量超限了');
            return;
        }

        this.countList[cell.curCellIdx] = 1;
        cell.setCount(1, ACntrCountMax);
        this.changeTotal();
    }

    onCellRdcCount(cell: CellTransaction, count: number) {
        this.countList[cell.curCellIdx] = 0;
        cell.setCount(0, ACntrCountMax);
        this.changeTotal();
    }

    onCellClickDetailBtn(cell: CellPkgCnsum) {}
}
