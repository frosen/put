/*
 * PagePkgEquip.ts
 * 装备列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PkgEquipItemLVD from './PkgEquipItemLVD';
import PkgEquipPetLVD from './PkgEquipPetLVD';
import PagePkg from 'pages/page_pkg/scripts/PagePkg';
import ListViewCell from 'scripts/ListViewCell';

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
        this.itemEquipSelection.parent.on(cc.Node.EventType.TOUCH_START, this.hideItemSelection, this);
        // @ts-ignore
        this.itemEquipSelection.parent._touchListener.setSwallowTouches(false);

        this.petEquipSelection.parent.on(cc.Node.EventType.TOUCH_START, this.hidePetSelection, this);
        // @ts-ignore
        this.petEquipSelection.parent._touchListener.setSwallowTouches(false);
    }

    onPageShow() {
        this.ctrlr.setTitle('装配');
        this.ctrlr.setBackBtnEnabled(true);

        // set data
        let items = this.ctrlr.memory.gameData.items;
        let idxs = PagePkg.getItemIdxsByListIdx(items, 1);
        let itemDelegate = this.itemEquipList.delegate as PkgEquipItemLVD;
        itemDelegate.page = this;
        itemDelegate.initListData(items, idxs);

        let pets = this.ctrlr.memory.gameData.pets;
        let petDelegate = this.petEquipList.delegate as PkgEquipPetLVD;
        petDelegate.page = this;
        petDelegate.initListData(pets);

        // reset list
        this.itemEquipList.resetContent(true);
        this.petEquipList.resetContent(true);
    }

    // -----------------------------------------------------------------

    selectedItemEquipCell: ListViewCell = null;
    selectedPetEquipCell: ListViewCell = null;

    onItemCellClick(cell: ListViewCell) {
        if (this.selectedItemEquipCell == cell) return;
        this.selectedItemEquipCell = cell;

        if (!this.selectedPetEquipCell) this.selectItemEquip();
        else this.executeEquipChange();
    }

    onItemCellClickDetailBtn(cell: ListViewCell) {}

    onPetCellClick(cell: ListViewCell) {
        if (this.selectedPetEquipCell == cell) return;
        this.selectedPetEquipCell = cell;

        if (!this.selectedItemEquipCell) this.selectPetEquip();
        else this.executeEquipChange();
    }

    onPetCellClickDetailBtn(cell: ListViewCell) {}

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
        if (!this.selectedItemEquipCell) return;
        let wp = this.selectedItemEquipCell.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let realY = cc.v2(this.node.convertToNodeSpaceAR(wp)).y;
        this.itemEquipSelection.y = realY - 78;
    }

    hideItemSelection() {
        this.itemEquipSelection.stopAllActions();
        cc.tween(this.itemEquipSelection)
            .to(0.1, { scale: 6 })
            .call(() => {
                this.itemEquipSelection.parent.scaleX = 0;
                this.selectedItemEquipCell = null;
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
        if (!this.selectedPetEquipCell) return;
        let wp = this.selectedPetEquipCell.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let realY = cc.v2(this.petEquipLayer.convertToNodeSpaceAR(wp)).y;
        this.petEquipSelection.y = realY - 78;
    }

    hidePetSelection() {
        this.petEquipSelection.stopAllActions();
        cc.tween(this.petEquipSelection)
            .to(0.1, { scale: 6 })
            .call(() => {
                this.petEquipSelection.parent.scaleX = 0;
                this.selectedPetEquipCell = null;
            })
            .start();
    }

    executeEquipChange() {
        if (!this.selectedItemEquipCell || !this.selectedPetEquipCell) return;
    }
}
