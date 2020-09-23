/*
 * PageActPetMkt.ts
 * 宠物市场页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { MoneyTool, GameDataTool, CaughtPetDataTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { ListView } from 'scripts/ListView';
import { Money, PetRankNames, PosData, PADPetMkt, CaughtPet } from 'scripts/DataSaved';
import { PAKey, ActPosModel } from 'scripts/DataModel';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { randomInt, getRandomOneInListWithRate, getRandomOneInList } from 'scripts/Random';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { PageActPetMktLVD } from './PageActPetMktLVD';
import { RealBattle } from 'scripts/DataOther';
import { normalRandom } from 'scripts/Random';
import { expModels } from 'configs/ExpModels';

export const PetMktCountMax: number = 1;
export const PetMktUpdataInterval: number = 24 * 60 * 60 * 1000; // 更新间隔毫秒

@ccclass
export class PageActPetMkt extends PageBase {
    @property(ListView)
    list: ListView = null;

    @property(cc.SpriteFrame)
    detailBtnSFrame: cc.SpriteFrame = null;

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
            this.resetMktGoods(pADPetMkt, actPosModelDict[posId]);
        }

        for (let index = 0; index < pADPetMkt.pets.length; index++) {
            const goods = pADPetMkt.pets[index];
            this.goodsList[index] = goods;
            const price = CaughtPetDataTool.getPrice(goods);
            this.priceList[index] = price;
            this.countList[index] = 0;
        }
        this.pADPetMkt = pADPetMkt;

        const lvd = this.list.delegate as PageActPetMktLVD;
        lvd.page = this;
    }

    resetMktGoods(pADPetMkt: PADPetMkt, posModel: ActPosModel) {
        const petIdLists = posModel.petIdLists;
        cc.assert(petIdLists && petIdLists.length === 5, `${posModel.id}的petIdLists有问题`);
        const petCount = randomInt(3) + 4;

        const pets = pADPetMkt.pets;
        pets.length = 0;
        for (let index = 0; index < petCount; index++) {
            let step = getRandomOneInListWithRate([0, 1, 2, 3, 4], [0, 0.4, 0.7, 0.9]);
            let petList = petIdLists[step];
            if (!petList) {
                petList = petIdLists[1];
                step = 1;
            }
            const petId = getRandomOneInList(petList);
            const { base: lvBase, range: lvRange } = RealBattle.calcLvArea(posModel, step);
            const { base: rankBase, range: rankRange } = RealBattle.calcRankAreaByExplStep(step);

            let lv = lvBase - lvRange + normalRandom(lvRange * 2);
            lv = Math.min(Math.max(1, lv), expModels.length);
            let rank = rankBase - rankRange + normalRandom(rankRange * 2);
            rank = Math.min(Math.max(1, rank), PetRankNames.length - 1);
            const features = RealBattle.getRandomFeatures(lv);

            const cPet = CaughtPetDataTool.create(petId, lv, rank, features);
            pets.push(cPet);
        }
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            if (this.totalPrice <= 0) return true;
            this.ctrlr.popAlert(
                `确定消费${MoneyTool.getStr(this.totalPrice)} 购买宠物？`,
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
        navBar.setTitle('宠物市场');
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
            GameDataTool.addCaughtPet(gameData, goods.id, goods.lv, goods.rank, goods.features);
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
}
