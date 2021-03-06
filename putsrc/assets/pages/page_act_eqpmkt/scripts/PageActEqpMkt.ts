/*
 * PageActEqpMkt.ts
 * 装备市场页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { MoneyTool, GameDataTool, EquipTool } from '../../../scripts/Memory';
import { PageBase } from '../../../scripts/PageBase';
import { NavBar } from '../../../scripts/NavBar';

import { ListView } from '../../../scripts/ListView';
import { Money, Equip, PADEqpMkt } from '../../../scripts/DataSaved';
import { ActPosModel, EqpMktModel, ReputRank } from '../../../scripts/DataModel';
import { ActPosModelDict, PAKey } from '../../../configs/ActPosModelDict';
import { randomInt, getRandomOneInListByRate, getRandomOneInList } from '../../../scripts/Random';
import { CellTransaction } from '../../page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellPkgCnsum } from '../../page_pkg/scripts/CellPkgCnsum';
import { PageActEqpMktLVD } from './PageActEqpMktLVD';

export const EqpMktCountMax: number = 1;
export const EqpMktUpdataInterval: number = 24 * 60 * 60 * 1000; // 更新间隔毫秒

@ccclass
export class PageActEqpMkt extends PageBase {
    @property(ListView)
    list: ListView = null;

    totalPrice: number = 0;

    goodsList: Equip[] = [];
    priceList: number[] = [];
    countList: number[] = [];

    pADEqpMkt!: PADEqpMkt;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const gameData = this.ctrlr.memory.gameData;
        const posId = gameData.curPosId;
        const pADEqpMkt: PADEqpMkt = GameDataTool.addPA(gameData, posId, PAKey.eqpMkt) as PADEqpMkt;
        const now = Date.now();
        if (!pADEqpMkt.updateTime || now > pADEqpMkt.updateTime + EqpMktUpdataInterval) {
            pADEqpMkt.updateTime = now;
            this.resetMktGoods(pADEqpMkt, ActPosModelDict[posId]);
        }

        this.resetCurData(pADEqpMkt);

        const lvd = this.list.delegate as PageActEqpMktLVD;
        lvd.page = this;
    }

    resetMktGoods(pADEqpMkt: PADEqpMkt, posModel: ActPosModel) {
        const eqpMktModel = posModel.actMDict[PAKey.eqpMkt] as EqpMktModel;
        const eqpIdLists = eqpMktModel.eqpIdLists;
        const eqpCount = randomInt(3) + 4;

        const eqps: Equip[] = pADEqpMkt.eqps;
        eqps.length = 0;
        for (let index = 0; index < eqpCount; index++) {
            let eqpList = getRandomOneInListByRate(eqpIdLists, [0.5, 0.75, 0.9]);
            if (!eqpList) eqpList = eqpIdLists[0];
            const eqpId = getRandomOneInList(eqpList);
            const equip = EquipTool.createRandomById(eqpId);
            let need = true;
            for (const eqpInList of eqps) {
                if (equip.id !== eqpInList.id) continue;
                if (equip.skillId !== eqpInList.skillId) continue;
                if (!equip.affixes.equals(eqpInList.affixes, (a, b) => a.id === b.id)) continue;
                need = false;
                break;
            }
            if (need) eqps.push(equip);
        }
    }

    resetCurData(pADEqpMkt: PADEqpMkt) {
        this.goodsList.length = 0;
        this.priceList.length = 0;
        this.countList.length = 0;

        for (let index = 0; index < pADEqpMkt.eqps.length; index++) {
            const goods = pADEqpMkt.eqps[index];
            this.goodsList[index] = goods;
            const price = EquipTool.getPrice(goods);
            this.priceList[index] = price;
            this.countList[index] = 0;
        }
        this.pADEqpMkt = pADEqpMkt;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            if (this.totalPrice <= 0) return true;
            this.ctrlr.popAlert(
                `确定消费${MoneyTool.getStr(this.totalPrice)}购买装备吗？`,
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

    onRefresh() {
        const gameData = this.ctrlr.memory.gameData;
        const curReputRank = GameDataTool.getReputRank(gameData, gameData.curPosId);
        if (curReputRank < ReputRank.renown) {
            this.ctrlr.popToast('需要renown');
        } else {
            const gameData = this.ctrlr.memory.gameData;
            const pADEqpMkt = GameDataTool.addPA(gameData, gameData.curPosId, PAKey.eqpMkt) as PADEqpMkt;
            const refreshPrice = Math.pow(2, pADEqpMkt.refreshCnt) * 100;
            this.ctrlr.popAlert(`确定消费${MoneyTool.getStr(refreshPrice)}刷新列表吗？`, (key: number) => {
                if (key === 1) {
                    const curMoney = GameDataTool.getMoney(gameData);
                    if (refreshPrice > curMoney) {
                        this.ctrlr.popToast('钱不够啦');
                        return;
                    }
                    GameDataTool.handleMoney(gameData, (m: Money) => (m.sum -= refreshPrice));
                    this.refresh();
                }
            });
        }
    }

    refresh() {
        const gameData = this.ctrlr.memory.gameData;
        const pADEqpMkt: PADEqpMkt = GameDataTool.addPA(gameData, gameData.curPosId, PAKey.eqpMkt) as PADEqpMkt;
        pADEqpMkt.updateTime = Date.now();
        pADEqpMkt.refreshCnt++;
        this.resetMktGoods(pADEqpMkt, ActPosModelDict[gameData.curPosId]);
        this.resetCurData(pADEqpMkt);

        this.list.resetContent();
        this.changeTotal();
    }
}
