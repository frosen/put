/*
 * PageActMerger.ts
 * 融合页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from '../../../scripts/PageBase';
import { NavBar } from '../../../scripts/NavBar';
import { CaughtPet, Feature, ItemType, Pet } from '../../../scripts/DataSaved';
import { CaughtPetTool, GameDataTool, MoneyTool, PetTool } from '../../../scripts/Memory';

import { FeatureModelDict } from '../../../configs/FeatureModelDict';

import { PagePetDetail } from '../../page_pet_detail/scripts/PagePetDetail';
import { CellPet } from '../../page_pet/cells/cell_pet/scripts/CellPet';
import { PagePkgSelection } from '../../page_pkg_selection/scripts/PagePkgSelection';
import { PagePkg } from '../../page_pkg/scripts/PagePkg';
import { PagePet } from '../../page_pet/scripts/PagePet';
import { PagePetCellType } from '../../page_pet/scripts/PagePetLVD';
import { CellPkgCaughtPet } from '../../page_pkg/cells/cell_pkg_caught_pet/scripts/CellPkgCaughtPet';
import { CellFeature, FeatureGainType } from '../../page_pet_detail/cells/cell_feature/scripts/CellFeature';
import { PagePetFeature } from '../../page_pet_feature/scripts/PagePetFeature';

const MergeReputDiscount = [1, 1, 0.9, 0.8, 0.7, 0.6];

@ccclass
export class PageActMerger extends PageBase {
    @property(cc.Button)
    petBtn: cc.Button = null!;

    @property(cc.Node)
    petNode: cc.Node = null!;

    @property(cc.Prefab)
    petPrefab: cc.Prefab = null!;

    @property(cc.Label)
    petLbl: cc.Label = null!;

    @property(cc.Button)
    cPetBtn: cc.Button = null!;

    @property(cc.Node)
    cPetNode: cc.Node = null!;

    @property(cc.Prefab)
    cPetPrefab: cc.Prefab = null!;

    @property(cc.Label)
    cPetLbl: cc.Label = null!;

    @property(cc.Button)
    featureBtn: cc.Button = null!;

    @property(cc.Node)
    featureNode: cc.Node = null!;

    @property(cc.Prefab)
    featurePrefab: cc.Prefab = null!;

    @property(cc.Label)
    featureLbl: cc.Label = null!;

    @property(cc.Label)
    priceLbl: cc.Label = null!;

    @property(cc.Label)
    noMoneyLbl: cc.Label = null!;

    @property(cc.Button)
    mergeBtn: cc.Button = null!;

    curPet?: Pet;
    curCaughtPet?: CaughtPet;
    curFeature?: Feature;
    needMoney: number = -1;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.petBtn.node.on('click', this.selectPet.bind(this));
        this.cPetBtn.node.on('click', this.selectCaughtPet.bind(this));
        this.featureBtn.node.on('click', this.selectFeature.bind(this));

        this.mergeBtn.node.on('click', this.gotoMerge.bind(this));
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true);
        navBar.setTitle('精灵融合堂');
    }

    // -----------------------------------------------------------------

    selectPet() {
        const gameData = this.ctrlr.memory.gameData;
        this.ctrlr.pushPage(PagePet, {
            cellPetType: PagePetCellType.selection,
            name: '选择精灵',
            callback: (cellIdx: number, curPet: Pet) => {
                const rzt = GameDataTool.checkMergePet(gameData, curPet);
                if (rzt === GameDataTool.SUC) {
                    this.onSelectPet(curPet);
                    this.ctrlr.popPage();
                } else this.ctrlr.popToast(rzt);
            }
        });
    }

    onSelectPet(pet: Pet) {
        this.clearPet();
        this.clearCaughtPet();
        this.clearFeature();

        const cellPetNode = cc.instantiate(this.petPrefab);
        cellPetNode.parent = this.petNode;

        const cellPet = cellPetNode.getComponent(CellPet);
        cellPet.changeFuncBtnImgToDetail();
        cellPet.clickCallback = this.selectPet.bind(this);
        cellPet.funcBtnCallback = () => this.ctrlr.pushPage(PagePetDetail, { pet });
        cellPet.stateBtn.interactable = false;
        cellPet.setData(pet);

        this.curPet = pet;

        const lv = PetTool.getCurMergeLv(pet);
        this.cPetLbl.string = `选择等级不高于${lv}级的捕获状态精灵`;
        this.featureLbl.string = '先选择要被融掉的捕获状态精灵';

        const { price, discount } = this.getMergePriceAndDiscount(pet);
        if (price > 0) {
            const priceStr = MoneyTool.getSimpleStr(price);
            const discountStr = discount > 0 ? `（已享${discount}%声望折扣）` : '';
            this.priceLbl.string = priceStr + discountStr;
        } else {
            this.priceLbl.string = '本次免费';
        }

        const gameData = this.ctrlr.memory.gameData;
        const curMoney = GameDataTool.getMoney(gameData);
        if (curMoney < price) {
            this.noMoneyLbl.node.opacity = 255;
            this.needMoney = -1;
        } else {
            this.noMoneyLbl.node.opacity = 0;
            this.needMoney = price;
        }
    }

    clearPet() {
        if (this.petNode.childrenCount > 0) {
            const cell = this.petNode.children[0];
            cell.removeFromParent();
            cell.destroy();
        }
    }

    selectCaughtPet() {
        if (!this.curPet) return this.ctrlr.popToast(this.cPetLbl.string);

        const gameData = this.ctrlr.memory.gameData;
        let cPetIdxs: number[] = [];
        PagePkg.getoutItemIdxsByType(gameData.items, cPetIdxs, ItemType.caughtPet);
        this.ctrlr.pushPage(PagePkgSelection, {
            name: '选择捕获状态精灵',
            curItemIdxs: cPetIdxs,
            callback: (cellIdx: number, itemIdx: number, item: CaughtPet) => {
                const rzt = GameDataTool.checkMergeCaughtPet(gameData, this.curPet!, item);
                if (rzt === GameDataTool.SUC) {
                    this.onSelectCaughtPet(item);
                    this.ctrlr.popPage();
                } else this.ctrlr.popToast(rzt);
            }
        });
    }

    onSelectCaughtPet(cPet: CaughtPet) {
        this.clearCaughtPet();
        this.clearFeature();

        const cellCPetNode = cc.instantiate(this.cPetPrefab);
        cellCPetNode.parent = this.cPetNode;

        const cellCaughtPet = cellCPetNode.getComponent(CellPkgCaughtPet);
        cellCaughtPet.changeFuncBtnImgToDetail();
        cellCaughtPet.clickCallback = this.selectCaughtPet.bind(this);
        cellCaughtPet.funcBtnCallback = () => {
            /** llytodo */
        };
        cellCaughtPet.setData(-1, cPet);

        this.curCaughtPet = cPet;

        const name = CaughtPetTool.getCnName(this.curCaughtPet);
        this.featureLbl.string = `选择${name}的一个特性`;
    }

    clearCaughtPet() {
        if (this.cPetNode.childrenCount > 0) {
            const cell = this.cPetNode.children[0];
            cell.removeFromParent();
            cell.destroy();
        }
    }

    selectFeature() {
        if (!this.curPet || !this.curCaughtPet) return this.ctrlr.popToast(this.featureLbl.string);

        const features = this.curCaughtPet.features;
        const gainTypes = [];
        for (const feature of features) {
            if (this.curCaughtPet.exFeatureIds.includes(feature.id)) gainTypes.push(FeatureGainType.expert);
            else gainTypes.push(FeatureGainType.inborn);
        }

        this.ctrlr.pushPage(PagePetFeature, {
            name: '选择特性',
            features,
            gainTypes,
            callback: (feature: Feature, gainType: FeatureGainType) => {
                this.onSelectFeature(feature, gainType);
                this.ctrlr.popPage();
            }
        });
    }

    onSelectFeature(feature: Feature, gainType: FeatureGainType) {
        this.clearFeature();

        const cellFeatureNode = cc.instantiate(this.featurePrefab);
        cellFeatureNode.parent = this.featureNode;

        const cellFeature = cellFeatureNode.getComponent(CellFeature);
        cellFeature.clickCallback = this.selectFeature.bind(this);
        cellFeature.setData(feature, gainType);

        this.curFeature = feature;
    }

    clearFeature() {
        if (this.featureNode.childrenCount > 0) {
            const cell = this.featureNode.children[0];
            cell.removeFromParent();
            cell.destroy();
        }
    }

    gotoMerge() {
        if (!this.curPet) return this.ctrlr.popToast('先选择精灵');
        if (!this.curCaughtPet) return this.ctrlr.popToast('先选择捕获状态精灵');
        if (!this.curFeature) return this.ctrlr.popToast('先选择特性');
        if (this.needMoney < 0) return this.ctrlr.popToast('通用币不足');

        const petName = PetTool.getCnName(this.curPet);
        const cPetName = CaughtPetTool.getCnName(this.curCaughtPet);
        const featureName = FeatureModelDict[this.curFeature.id].cnBrief;
        const str = `确定把“${cPetName}”的特性“${featureName}”\n融合到${petName}身上吗？\n注意：你将失去${cPetName}`;
        this.ctrlr.popAlert(str, (key: number) => {
            if (key === 1) this.merge();
        });
    }

    merge() {
        const gameData = this.ctrlr.memory.gameData;
        const petIdx = GameDataTool.getPetIdx(gameData, this.curPet!);
        if (petIdx === -1) return this.ctrlr.popToast('精灵有误');

        let cPetIdx = GameDataTool.getItemIdx(gameData, this.curCaughtPet!);
        if (cPetIdx === -1) return this.ctrlr.popToast('捕获状态精灵有误');

        const money = GameDataTool.getMoney(gameData);
        if (money < this.needMoney) return this.ctrlr.popToast('通用币不足');

        const rzt = GameDataTool.mergePet(gameData, petIdx, cPetIdx, this.curFeature!.id);
        if (rzt !== GameDataTool.SUC) return this.ctrlr.popToast(rzt);

        const petName = PetTool.getCnName(this.curPet!);
        const featureName = FeatureModelDict[this.curFeature!.id].cnBrief;
        this.ctrlr.popToast(`融合成功“${petName}”\n 特性“${featureName}”+${this.curFeature!.lv}`);

        this.clearPet();
        this.clearCaughtPet();
        this.clearFeature();
        this.curPet = undefined;
        this.curCaughtPet = undefined;
        this.curFeature = undefined;
        this.needMoney = -1;
        this.petLbl.string = '选择精灵';
        this.cPetLbl.string = '先选择准备强化的精灵';
        this.featureLbl.string = '先选择准备强化的精灵';
        this.priceLbl.string = '0块';
        this.noMoneyLbl.node.opacity = 0;
    }

    // -----------------------------------------------------------------

    getMergePriceAndDiscount(pet: Pet): { price: number; discount: number } {
        const gameData = this.ctrlr.memory.gameData;
        const reputRank = GameDataTool.getReputRank(gameData, gameData.curPosId);
        const discount = MergeReputDiscount[reputRank];
        return { price: pet.merges.length * 100 * discount, discount: Math.round((1 - discount) * 100) };
    }
}
