/*
 * PagePkgEquip.ts
 * 装备列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from '../../../scripts/PageBase';
import { ListView } from '../../../scripts/ListView';
import { PkgEquipItemLVD } from './PkgEquipItemLVD';
import { PkgEquipPetLVD } from './PkgEquipPetLVD';
import { PagePkg } from '../../page_pkg/scripts/PagePkg';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { CellPkgEquip } from '../../page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';
import { GameDataTool } from '../../../scripts/Memory';
import { Pet, ItemType, PetState } from '../../../scripts/DataSaved';
import { NavBar } from '../../../scripts/NavBar';

@ccclass
export class PagePkgEquip extends PageBase {
    @property(ListView)
    itemEquipList: ListView = null;

    @property(cc.Node)
    itemEquipSelection: cc.Node = null;

    @property(ListView)
    petEquipList: ListView = null;

    @property(cc.Node)
    petEquipSelection: cc.Node = null;

    @property(cc.Node)
    petEquipLayer: cc.Node = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.itemEquipSelection.parent.on(cc.Node.EventType.TOUCH_START, this.hideItemSelection, this);
        // @ts-ignore
        this.itemEquipSelection.parent._touchListener.setSwallowTouches(false);

        this.petEquipSelection.parent.on(cc.Node.EventType.TOUCH_START, this.hidePetSelection, this);
        // @ts-ignore
        this.petEquipSelection.parent._touchListener.setSwallowTouches(false);
    }

    dataForInit: { pet: Pet; idx: number } = null;

    setData(pageData: any) {
        if (pageData) {
            this.dataForInit = pageData;
            cc.assert(pageData.idx || pageData.idx === 0, 'PUT 装备更新页面初始化需要索引');
        }
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true);
        navBar.setTitle('装配');
    }

    onPageShow() {
        this.resetList();
    }

    resetList() {
        // set data
        const items = this.ctrlr.memory.gameData.items;
        const idxs = [];
        PagePkg.getoutItemIdxsByType(items, idxs, ItemType.equip);
        idxs.push(GameDataTool.UNWIELD);
        const itemDelegate = this.itemEquipList.delegate as PkgEquipItemLVD;
        itemDelegate.page = this;
        itemDelegate.initListData(items, idxs);

        const pets = this.ctrlr.memory.gameData.pets;
        const petDelegate = this.petEquipList.delegate as PkgEquipPetLVD;
        petDelegate.page = this;
        petDelegate.initListData(pets);

        let cellIdx: number = -1;
        if (this.dataForInit) {
            const slcEqpIdx = this.dataForInit.idx;
            if (!this.dataForInit.pet) {
                for (let index = 0; index < idxs.length; index++) {
                    if (slcEqpIdx === idxs[index]) {
                        cellIdx = index;
                        break;
                    }
                }
                if (cellIdx >= 0) this.itemEquipList.content.y = this.itemEquipList.getHeight(cellIdx);
            } else {
                const petEquipDataList = petDelegate.dataList;
                const curPet = this.dataForInit.pet;
                for (let index = 0; index < petEquipDataList.length; index++) {
                    const petEquipData = petEquipDataList[index];
                    if (petEquipData.pet === curPet && petEquipData.equipIndex === slcEqpIdx) {
                        cellIdx = index;
                        break;
                    }
                }
                if (cellIdx >= 0) this.petEquipList.content.y = this.petEquipList.getHeight(cellIdx);
            }
        }

        // reset list
        this.itemEquipList.resetContent(true);
        this.petEquipList.resetContent(true);

        if (this.dataForInit) {
            if (cellIdx < 0) {
                cc.error('PUT PagePkgEquip初始化时错误的cellIdx');
            } else {
                if (!this.dataForInit.pet) {
                    this.onItemCellClick(this.itemEquipList.disCellDataDict[cellIdx].cell);
                } else {
                    this.onPetCellClick(this.petEquipList.disCellDataDict[cellIdx].cell);
                }
            }

            this.dataForInit = null;
        }
    }

    // -----------------------------------------------------------------

    slcItemEquipCell: ListViewCell = null;
    slcPetEquipCell: ListViewCell = null;

    onItemCellClick(cell: ListViewCell) {
        if (this.slcItemEquipCell === cell) return;
        this.slcItemEquipCell = cell;

        if (!this.slcPetEquipCell) this.selectItemEquip();
        else {
            this.executeEquipChange(() => {
                this.hideItemSelection();
            });
        }
    }

    onItemCellClickDetailBtn(cell: ListViewCell) {}

    onPetCellClick(cell: ListViewCell) {
        if (this.slcPetEquipCell === cell) return;

        const petLVD = this.petEquipList.delegate as PkgEquipPetLVD;
        const pet = petLVD.dataList[cell.curCellIdx].pet;
        const gameData = this.ctrlr.memory.gameData;
        const withRzt = GameDataTool.checkPetWithMaster(gameData, pet);
        if (withRzt !== GameDataTool.SUC) return this.ctrlr.popToast(withRzt);

        this.slcPetEquipCell = cell;
        if (!this.slcItemEquipCell) this.selectPetEquip();
        else {
            this.executeEquipChange(() => {
                this.hidePetSelection();
            });
        }
    }

    onPetCellClickFuncBtn(cell: ListViewCell) {}

    // -----------------------------------------------------------------

    update() {
        this.setItemEquipCellPos();
        this.setPetEquipCellPos();
    }

    selectItemEquip() {
        this.itemEquipSelection.parent.scaleX = 1;
        this.setItemEquipCellPos();
        this.itemEquipSelection.scale = 6;
        this.itemEquipSelection.stopAllActions();
        cc.tween(this.itemEquipSelection).to(0.1, { scale: 1 }).start();
    }

    setItemEquipCellPos() {
        if (!this.slcItemEquipCell) return;
        const wp = this.slcItemEquipCell.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const realY = cc.v2(this.node.convertToNodeSpaceAR(wp)).y;
        this.itemEquipSelection.y = realY - 78;
    }

    hideItemSelection() {
        this.itemEquipSelection.stopAllActions();
        cc.tween(this.itemEquipSelection)
            .to(0.1, { scale: 6 })
            .call(() => {
                this.itemEquipSelection.parent.scaleX = 0;
                this.slcItemEquipCell = null;
            })
            .start();
    }

    selectPetEquip() {
        this.petEquipSelection.parent.scaleX = 1;
        this.setItemEquipCellPos();
        this.petEquipSelection.scale = 6;
        this.petEquipSelection.stopAllActions();
        cc.tween(this.petEquipSelection).to(0.1, { scale: 1 }).start();
    }

    setPetEquipCellPos() {
        if (!this.slcPetEquipCell) return;
        const wp = this.slcPetEquipCell.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const realY = cc.v2(this.petEquipLayer.convertToNodeSpaceAR(wp)).y;
        this.petEquipSelection.y = realY - 78;
    }

    hidePetSelection() {
        this.petEquipSelection.stopAllActions();
        cc.tween(this.petEquipSelection)
            .to(0.1, { scale: 6 })
            .call(() => {
                this.petEquipSelection.parent.scaleX = 0;
                this.slcPetEquipCell = null;
            })
            .start();
    }

    executeEquipChange(callback: () => void) {
        if (!this.slcItemEquipCell || !this.slcPetEquipCell) return;
        const itemIdx = (this.slcItemEquipCell as CellPkgEquip).curItemIdx || GameDataTool.UNWIELD;
        const petLVD = this.petEquipList.delegate as PkgEquipPetLVD;
        const data = petLVD.dataList[this.slcPetEquipCell.curCellIdx];
        const gameData = this.ctrlr.memory.gameData;
        const petIdx = GameDataTool.getPetIdx(gameData, data.pet);
        if (petIdx === -1) return this.ctrlr.popToast('精灵有误');
        const rzt = GameDataTool.wieldEquip(gameData, itemIdx, petIdx, data.equipIndex);
        if (rzt === GameDataTool.SUC) {
            this.resetList();
            this.ctrlr.popToast('装备更新');
            this.hideItemSelection();
            this.hidePetSelection();
        } else {
            this.ctrlr.popToast(rzt);
            callback();
        }
    }
}
