/*
 * PageActPetMkt.ts
 * 精灵市场页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { MoneyTool, GameDataTool, CaughtPetTool, PetTool } from '../../../scripts/Memory';
import { PageBase } from '../../../scripts/PageBase';
import { NavBar } from '../../../scripts/NavBar';
import { CellPkgCnsum } from '../../page_pkg/scripts/CellPkgCnsum';
import { ListView } from '../../../scripts/ListView';
import { Money, PADPetMkt, CaughtPet } from '../../../scripts/DataSaved';
import { ActPosModel, PetMktModel, ReputRank } from '../../../scripts/DataModel';
import { ActPosModelDict, PAKey } from '../../../configs/ActPosModelDict';
import { randomInt, getRandomOneInListWithRate, getRandomOneInList } from '../../../scripts/Random';
import { CellTransaction } from '../../page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { PageActPetMktLVD } from './PageActPetMktLVD';
import { RealBtl } from '../../../scripts/DataOther';
import { normalRandom } from '../../../scripts/Random';
import { ExpModels } from '../../../configs/ExpModels';

export const PetMktCountMax: number = 1;
export const PetMktUpdataInterval: number = 24 * 60 * 60 * 1000; // 更新间隔毫秒

@ccclass
export class PageActPetMkt extends PageBase {
    @property(ListView)
    list: ListView = null;

    totalPrice: number = 0;

    goodsList: CaughtPet[] = [];
    priceList: number[] = [];
    countList: number[] = [];

    pADPetMkt: PADPetMkt;

    onLoad() {
        super.onLoad();

        if (CC_EDITOR) return;
        const gameData = this.ctrlr.memory.gameData;
        const posId = gameData.curPosId;
        const pADPetMkt: PADPetMkt = GameDataTool.addPA(gameData, posId, PAKey.petMkt) as PADPetMkt;
        const now = Date.now();
        if (!pADPetMkt.updateTime || now > pADPetMkt.updateTime + PetMktUpdataInterval) {
            pADPetMkt.updateTime = now;
            this.resetMktGoods(pADPetMkt, ActPosModelDict[posId]);
        }
        this.resetCurData(pADPetMkt);

        const lvd = this.list.delegate as PageActPetMktLVD;
        lvd.page = this;
    }

    resetMktGoods(pADPetMkt: PADPetMkt, posModel: ActPosModel) {
        const petMktModel = posModel.actMDict[PAKey.petMkt] as PetMktModel;
        const petIdLists = petMktModel.petIdLists;
        const petCount = randomInt(3) + 4;

        const pets = pADPetMkt.pets;
        pets.length = 0;
        for (let index = 0; index < petCount; index++) {
            let step = getRandomOneInListWithRate([0, 1, 2, 3], [0.5, 0.75, 0.9]);
            let petList = petIdLists[step];
            if (!petList) {
                petList = petIdLists[0];
                step = 1;
            }
            const petId = getRandomOneInList(petList);
            const { base: lvBase, range: lvRange } = RealBtl.calcLvArea(posModel, step);

            let lv = lvBase - lvRange + normalRandom(lvRange * 2);
            lv = Math.min(Math.max(1, lv), ExpModels.length);

            const pet = PetTool.createWithRandomFeature(petId, lv);
            const cPet = CaughtPetTool.createByPet(pet);
            pets.push(cPet);
        }
    }

    resetCurData(pADPetMkt: PADPetMkt) {
        this.goodsList.length = 0;
        this.priceList.length = 0;
        this.countList.length = 0;

        for (let index = 0; index < pADPetMkt.pets.length; index++) {
            const goods = pADPetMkt.pets[index];
            this.goodsList[index] = goods;
            const price = CaughtPetTool.getPrice(goods);
            this.priceList[index] = price;
            this.countList[index] = 0;
        }
        this.pADPetMkt = pADPetMkt;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            if (this.totalPrice <= 0) return true;
            this.ctrlr.popAlert(
                `确定消费${MoneyTool.getStr(this.totalPrice)} 购买精灵？`,
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
        navBar.setTitle('精灵市场');
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
            GameDataTool.addCaughtPet(gameData, goods);
            this.pADPetMkt.pets[index] = undefined;
        }
        GameDataTool.handleMoney(gameData, (m: Money) => (m.sum -= this.totalPrice));

        let newPets = [];
        for (let index = 0; index < this.pADPetMkt.pets.length; index++) {
            const pet = this.pADPetMkt.pets[index];
            if (pet) newPets.push(pet);
        }
        this.pADPetMkt.pets = newPets;

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
        cell.setCount(1, PetMktCountMax);
        this.changeTotal();
    }

    onCellRdcCount(cell: CellTransaction, count: number) {
        this.countList[cell.curCellIdx] = 0;
        cell.setCount(0, PetMktCountMax);
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
            const pADPetMkt = GameDataTool.addPA(gameData, gameData.curPosId, PAKey.petMkt) as PADPetMkt;
            const refreshPrice = Math.pow(2, pADPetMkt.refreshCnt) * 100;
            this.ctrlr.popAlert(`确定消费${MoneyTool.getStr(refreshPrice)} 刷新列表？`, (key: number) => {
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
        const posId = gameData.curPosId;
        const pADPetMkt: PADPetMkt = GameDataTool.addPA(gameData, posId, PAKey.petMkt) as PADPetMkt;
        pADPetMkt.updateTime = Date.now();
        pADPetMkt.refreshCnt++;
        this.resetMktGoods(pADPetMkt, ActPosModelDict[posId]);
        this.resetCurData(pADPetMkt);

        this.list.resetContent();
        this.changeTotal();
    }
}
