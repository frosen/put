/*
 * PageActMerger.ts
 * 融合页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CaughtPet, Feature, ItemType, Pet } from 'scripts/DataSaved';
import { GameDataTool, PetTool } from 'scripts/Memory';
import { PagePetDetail } from 'pages/page_pet_detail/scripts/PagePetDetail';
import { CellPet } from 'pages/page_pet/cells/cell_pet/scripts/CellPet';
import { PagePkgSelection } from 'pages/page_pkg_selection/scripts/PagePkgSelection';
import { PagePkg } from 'pages/page_pkg/scripts/PagePkg';
import { PagePet } from 'pages/page_pet/scripts/PagePet';
import { PagePetCellType } from 'pages/page_pet/scripts/PagePetLVD';
import { CellPkgCaughtPet } from 'pages/page_pkg/cells/cell_pkg_caught_pet/scripts/CellPkgCaughtPet';
import { petModelDict } from 'configs/PetModelDict';
import { FeatureGainType } from 'pages/page_pet_detail/cells/cell_feature/scripts/CellFeature';
import { PagePetFeature } from 'pages/page_pet_feature/scripts/PagePetFeature';

const MergeReputDiscount = [1, 1, 0.9, 0.8, 0.7, 0.6];

@ccclass
export class PageActMerger extends PageBase {
    @property(cc.Button)
    petBtn: cc.Button = null;

    @property(cc.Node)
    petNode: cc.Node = null;

    @property(cc.Prefab)
    petPrefab: cc.Prefab = null;

    @property(cc.Label)
    petLbl: cc.Label = null;

    @property(cc.Button)
    cPetBtn: cc.Button = null;

    @property(cc.Node)
    cPetNode: cc.Node = null;

    @property(cc.Prefab)
    cPetPrefab: cc.Prefab = null;

    @property(cc.Label)
    cPetLbl: cc.Label = null;

    @property(cc.Button)
    featureBtn: cc.Button = null;

    @property(cc.Node)
    featureNode: cc.Node = null;

    @property(cc.Prefab)
    featurePrefab: cc.Prefab = null;

    @property(cc.Label)
    featureLbl: cc.Label = null;

    curPet: Pet = null;
    curCaughtPet: CaughtPet = null;
    curFeature: Feature = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.petBtn.node.on('click', this.selectPet.bind(this));
        this.cPetBtn.node.on('click', this.selectCaughtPet.bind(this));
        this.featureBtn.node.on('click', this.selectFeature.bind(this));
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
    }

    clearPet() {
        if (this.petNode.childrenCount > 0) {
            const cell = this.petNode.children[0];
            cell.removeFromParent();
            cell.destroy();
        }
    }

    selectCaughtPet() {
        if (!this.curPet) {
            this.ctrlr.popToast(this.cPetLbl.string);
            return;
        }

        const gameData = this.ctrlr.memory.gameData;
        let cPetIdxs = [];
        PagePkg.getoutItemIdxsByType(gameData.items, cPetIdxs, ItemType.caughtPet);
        this.ctrlr.pushPage(PagePkgSelection, {
            name: '选择捕获状态精灵',
            curItemIdxs: cPetIdxs,
            callback: (cellIdx: number, itemIdx: number, item: CaughtPet) => {
                const rzt = GameDataTool.checkMergeCaughtPet(gameData, this.curPet, item);
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

        const name = petModelDict[cPet.petId].cnName;
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
        if (!this.curPet || !this.curCaughtPet) {
            this.ctrlr.popToast(this.featureLbl.string);
            return;
        }

        const features = this.curCaughtPet.features;
        const gainTypes = [];
        for (const feature of features) {
            if (this.curCaughtPet.exFeatureIds.includes[feature.id]) gainTypes.push(FeatureGainType.expert);
            else gainTypes.push(FeatureGainType.inborn);
        }

        this.ctrlr.pushPage(PagePetFeature, {
            name: '选择特性',
            features,
            gainTypes,
            callback: (feature: Feature, gainType: FeatureGainType) => {
                this.onSelectFeature(feature);
                this.ctrlr.popPage();
            }
        });
    }

    onSelectFeature(feature: Feature) {}

    clearFeature() {
        if (this.featureNode.childrenCount > 0) {
            const cell = this.featureNode.children[0];
            cell.removeFromParent();
            cell.destroy();
        }
    }

    // -----------------------------------------------------------------

    getMergePrice(pet: Pet): number {
        const gameData = this.ctrlr.memory.gameData;
        const reputRank = GameDataTool.getReputRank(gameData, gameData.curPosId);
        return pet.merges.length * 100 * MergeReputDiscount[reputRank];
    }
}
