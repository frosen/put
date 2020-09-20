/*
 * PageActEqpMkt.ts
 * 装备市场页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { MoneyTool, GameDataTool, EquipDataTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { ListView } from 'scripts/ListView';
import { Money, Equip, PosData, PADEqpMkt } from 'scripts/DataSaved';
import { PAKey, ActPosModel } from 'scripts/DataModel';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { randomInt, getRandomOneInListWithRate, getRandomOneInList } from 'scripts/Random';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { PageActEqpMktLVD } from './PageActEqpMktLVD';

export const EqpMktCountMax: number = 1;
export const EqpMktUpdataInterval: number = 24 * 60 * 60 * 1000; // 更新间隔毫秒

@ccclass
export class PageActEqpMkt extends PageBase {
    @property(ListView)
    list: ListView = null;

    @property(cc.SpriteFrame)
    detailBtnSFrame: cc.SpriteFrame = null;

    totalPrice: number = 0;

    goodsList: Equip[] = [];
    priceList: number[] = [];
    countList: number[] = [];

    pADEqpMkt: PADEqpMkt;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const gameData = this.ctrlr.memory.gameData;
        const posId = gameData.curPosId;
        GameDataTool.addPA(gameData, posId, PAKey.eqpMkt);
        const posData: PosData = gameData.posDataDict[posId];
        const pADEqpMkt: PADEqpMkt = posData.actDict[PAKey.eqpMkt] as PADEqpMkt;
        const now = Date.now();
        if (!pADEqpMkt.updateTime || now > pADEqpMkt.updateTime + EqpMktUpdataInterval) {
            pADEqpMkt.updateTime = now;
            this.resetMktGoods(pADEqpMkt, actPosModelDict[posId]);
        }

        for (let index = 0; index < pADEqpMkt.eqps.length; index++) {
            const goods = pADEqpMkt.eqps[index];
            this.goodsList[index] = goods;
            const price = EquipDataTool.getPrice(goods);
            this.priceList[index] = price;
            this.countList[index] = 0;
        }
        this.pADEqpMkt = pADEqpMkt;

        const lvd = this.list.delegate as PageActEqpMktLVD;
        lvd.page = this;
    }

    resetMktGoods(pADEqpMkt: PADEqpMkt, posModel: ActPosModel) {
        const eqpIdLists = posModel.eqpIdLists;
        cc.assert(eqpIdLists && eqpIdLists.length === 5, `${posModel.id}的eqpIdLists有问题`);
        const eqpCount = randomInt(3) + 4;

        const newEqps: Equip[] = [];
        for (let index = 0; index < eqpCount; index++) {
            let eqpList = getRandomOneInListWithRate(eqpIdLists, [0, 0.4, 0.7, 0.9]);
            if (!eqpList) eqpList = eqpIdLists[1];
            const eqpId = getRandomOneInList(eqpList);
            const equip = EquipDataTool.createRandomById(eqpId);
            let need = true;
            for (const eqpInList of newEqps) {
                if (equip.id !== eqpInList.id) continue;
                if (equip.skillId !== eqpInList.skillId) continue;
                if (!equip.selfFeatureLvs.equals(eqpInList.selfFeatureLvs, (a, b) => a === b)) continue;
                if (!equip.affixes.equals(eqpInList.affixes, (a, b) => a.id === b.id)) continue;
                need = false;
                break;
            }
            if (need) newEqps.push(equip);
        }
        pADEqpMkt.eqps = newEqps;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            if (this.totalPrice <= 0) return true;
            this.ctrlr.popAlert(
                `确定消费${MoneyTool.getStr(this.totalPrice)} 购买装备？`,
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
        navBar.setTitle('装备市场');
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

        for (let index = 0; index < this.countList.length; index++) {
            const count = this.countList[index];
            if (!count) continue;
            const goods = this.goodsList[index];
            GameDataTool.addEquip(gameData, goods);
            this.pADEqpMkt.eqps[index] = undefined;
        }
        GameDataTool.handleMoney(gameData, (m: Money) => (m.sum -= this.totalPrice));

        let newEqps = [];
        for (let index = 0; index < this.pADEqpMkt.eqps.length; index++) {
            const eqp = this.pADEqpMkt.eqps[index];
            if (eqp) newEqps.push(eqp);
        }
        this.pADEqpMkt.eqps = newEqps;

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
            tp += this.priceList[index];
        }

        this.totalPrice = tp;
        this.navBar.setSubTitle('总价 ' + MoneyTool.getSimpleStr(tp));
    }

    // -----------------------------------------------------------------

    onCellAddCount(cell: CellTransaction) {
        const gameData = this.ctrlr.memory.gameData;
        const price = this.priceList[cell.curCellIdx];
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
        cell.setCount(1, EqpMktCountMax);
        this.changeTotal();
    }

    onCellRdcCount(cell: CellTransaction, count: number) {
        this.countList[cell.curCellIdx] = 0;
        cell.setCount(0, EqpMktCountMax);
        this.changeTotal();
    }

    onCellClickDetailBtn(cell: CellPkgCnsum) {}
}
