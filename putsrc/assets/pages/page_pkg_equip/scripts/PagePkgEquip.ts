/*
 * PagePkgEquip.ts
 * 装备列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from 'scripts/PageBase';
import { ListView } from 'scripts/ListView';
import { PkgEquipItemLVD } from './PkgEquipItemLVD';
import { PkgEquipPetLVD } from './PkgEquipPetLVD';
import { PagePkg } from 'pages/page_pkg/scripts/PagePkg';
import { ListViewCell } from 'scripts/ListViewCell';
import { CellPkgEquip } from 'pages/page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';
import { GameDataTool } from 'scripts/Memory';
import { Pet } from 'scripts/DataSaved';

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

    @property(cc.SpriteFrame)
    detailBtnSFrame: cc.SpriteFrame = null;

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

    setData(data: any) {
        if (data) {
            this.dataForInit = data;
            cc.assert(data.idx != undefined, 'PUT 装备更新页面初始化需要索引');
        }
    }

    onPageShow() {
        this.ctrlr.setTitle('装配');
        this.ctrlr.setBackBtnEnabled(true);

        this.resetList();
    }

    resetList() {
        // set data
        let items = this.ctrlr.memory.gameData.items;
        let idxs = PagePkg.getItemIdxsByListIdx(items, 1);
        idxs.push(GameDataTool.UNWIELD);
        let itemDelegate = this.itemEquipList.delegate as PkgEquipItemLVD;
        itemDelegate.page = this;
        itemDelegate.initListData(items, idxs);

        let pets = this.ctrlr.memory.gameData.pets;
        let petDelegate = this.petEquipList.delegate as PkgEquipPetLVD;
        petDelegate.page = this;
        petDelegate.initListData(pets);

        let cellIdx: number = -1;
        if (this.dataForInit) {
            let selectedEquipIdx = this.dataForInit.idx;
            if (!this.dataForInit.pet) {
                for (let index = 0; index < idxs.length; index++) {
                    if (selectedEquipIdx == idxs[index]) {
                        cellIdx = index;
                        break;
                    }
                }
                if (cellIdx >= 0) this.itemEquipList.content.y = this.itemEquipList.getHeight(cellIdx);
            } else {
                let petEquipDataList = petDelegate.dataList;
                let curPet = this.dataForInit.pet;
                for (let index = 0; index < petEquipDataList.length; index++) {
                    const petEquipData = petEquipDataList[index];
                    if (petEquipData.pet == curPet && petEquipData.equipIndex == selectedEquipIdx) {
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

    selectedItemEquipCell: ListViewCell = null;
    selectedPetEquipCell: ListViewCell = null;

    onItemCellClick(cell: ListViewCell) {
        if (this.selectedItemEquipCell == cell) return;
        this.selectedItemEquipCell = cell;

        if (!this.selectedPetEquipCell) this.selectItemEquip();
        else {
            this.executeEquipChange(() => {
                this.hideItemSelection();
            });
        }
    }

    onItemCellClickDetailBtn(cell: ListViewCell) {}

    onPetCellClick(cell: ListViewCell) {
        if (this.selectedPetEquipCell == cell) return;
        this.selectedPetEquipCell = cell;
        if (!this.selectedItemEquipCell) this.selectPetEquip();
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

    executeEquipChange(callback: () => void) {
        if (!this.selectedItemEquipCell || !this.selectedPetEquipCell) return;
        let itemIdx = (this.selectedItemEquipCell as CellPkgEquip).curItemIdx || GameDataTool.UNWIELD;
        let petLVD = this.petEquipList.delegate as PkgEquipPetLVD;
        let data = petLVD.dataList[this.selectedPetEquipCell.curCellIdx];
        let rzt = GameDataTool.wieldEquip(this.ctrlr.memory.gameData, itemIdx, data.pet, data.equipIndex);
        if (rzt == GameDataTool.SUC) {
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
