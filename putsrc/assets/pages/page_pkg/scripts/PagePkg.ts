/*
 * PagePkg.ts
 * 道具列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PagePkgLVD from './PagePkgLVD';
import { Item, ItemType, Cnsum, CnsumType, Pet, CaughtPet } from 'scripts/DataSaved';
import { GameDataTool } from 'scripts/Memory';
import { PagePkgEquip } from 'pages/page_pkg_equip/scripts/PagePkgEquip';
import ListViewCell from 'scripts/ListViewCell';
import FuncBar from 'pages/page_pet/prefabs/prefab_func_bar/scripts/FuncBar';
import PagePet from 'pages/page_pet/scripts/PagePet';
import { CellPetType } from 'pages/page_pet/cells/cell_pet/scripts/CellPet';

const LIST_NAMES = ['全部', '装备', '饮品', '捕捉', '强化', '其他'];
const WIDTH = 1080;

@ccclass
export default class PagePkg extends PageBase {
    curListIdx: number = 0;

    @property(cc.Node)
    listLayer: cc.Node = null;

    @property(cc.Prefab)
    listPrefab: cc.Prefab = null;

    listDatas: { dirtyToken: number; list: ListView; delegate: PagePkgLVD }[] = [];

    @property(cc.Node)
    selectionLayer: cc.Node = null;

    @property(cc.Node)
    selectionBar: cc.Node = null;

    selectionLblNodes: cc.Node[] = [];

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null;

    funcBar: FuncBar = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        let selections = this.selectionLayer.children;
        for (let index = 0; index < LIST_NAMES.length; index++) {
            let listNode = cc.instantiate(this.listPrefab);
            listNode.parent = this.listLayer;
            listNode.x = index * WIDTH;

            let list = listNode.getComponent(ListView);
            let delegate = list.delegate as PagePkgLVD;
            delegate.page = this;

            this.listDatas.push({ dirtyToken: 0, list, delegate });

            let selection = selections[index];
            selection.on('click', () => {
                this.turnList(index);
            });

            let lblNode = selection.children[0];
            lblNode.getComponent(cc.Label).string = LIST_NAMES[index];
            this.selectionLblNodes.push(lblNode);
        }

        let funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node.getChildByName('root');

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([
            { str: '使用', callback: this.onUseCell.bind(this) },
            { str: '上移', callback: this.onMoveUpCell.bind(this) },
            { str: '下移', callback: this.onMoveDownCell.bind(this) },
            { str: '丢弃', callback: this.onRemoveCell.bind(this) }
        ]);
    }

    onPageShow() {
        this.ctrlr.setTitle('道具');
        let gameData = this.ctrlr.memory.gameData;
        this.ctrlr.setSubTitle(`${gameData.weight}/${GameDataTool.getItemCountMax(gameData)}`);

        this.turnList(this.curListIdx);
    }

    resetCurList() {
        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        let curData = this.listDatas[this.curListIdx];
        if (curData.dirtyToken != curDirtyToken) {
            curData.dirtyToken = curDirtyToken;
            let items = this.ctrlr.memory.gameData.items;
            let idxs = PagePkg.getItemIdxsByListIdx(items, this.curListIdx);
            curData.delegate.initListData(items, idxs);
            curData.list.resetContent(true);
        }
    }

    static getItemIdxsByListIdx(items: Item[], listIdx: number): number[] {
        let idxs: number[] = [];
        if (listIdx == 0) {
            for (let index = 0; index < items.length; index++) idxs[index] = index;
        } else if (listIdx == 1) {
            for (let index = 0; index < items.length; index++) {
                if (items[index].itemType == ItemType.equip) idxs[idxs.length] = index;
            }
        } else if (listIdx == 2) {
            for (let index = 0; index < items.length; index++) {
                let item = items[index];
                if (item.itemType == ItemType.cnsum && (item as Cnsum).cnsumType == CnsumType.drink) idxs[idxs.length] = index;
            }
        } else if (listIdx == 3) {
            for (let index = 0; index < items.length; index++) {
                let item = items[index];
                if (
                    (item.itemType == ItemType.cnsum && (item as Cnsum).cnsumType == CnsumType.catcher) ||
                    item.itemType == ItemType.caughtPet
                ) {
                    idxs[idxs.length] = index;
                }
            }
        }
        return idxs;
    }

    turnning: boolean = false;

    turnList(idx: number) {
        if (this.turnning) return;
        this.turnning = true;

        this.curListIdx = idx;

        this.resetCurList();
        cc.tween(this.listLayer)
            .to(0.2, { x: idx * WIDTH * -1 }, { easing: 'quadInOut' })
            .call(() => {
                this.turnning = false;
            })
            .start();

        for (const lblNode of this.selectionLblNodes) lblNode.color = cc.color(90, 90, 90);
        this.selectionLblNodes[idx].color = cc.Color.RED;

        cc.tween(this.selectionBar)
            .to(0.2, { x: idx * 180 + 90 }, { easing: 'quadInOut' })
            .start();
    }

    // -----------------------------------------------------------------

    onCellClick(cell: ListViewCell) {}

    onCellClickFuncBtn(cell: ListViewCell) {
        this.funcBar.showFuncBar(cell.curCellIdx, cell.node);
    }

    // -----------------------------------------------------------------

    onUseCell(cellIdx: number) {
        let gameData = this.ctrlr.memory.gameData;
        let idList = this.listDatas[this.curListIdx].delegate.curItemIdxs;
        let itemId = idList[cellIdx];
        let item = gameData.items[itemId];
        cc.log('PUT 使用道具：', item.id);

        // llytodo
        if (item.itemType == ItemType.cnsum) {
            let cnsum = item as Cnsum;
            if (cnsum.cnsumType == CnsumType.drink) {
                this.ctrlr.pushPage(PagePet, {
                    cellPetType: CellPetType.selection,
                    name: '选择宠物',
                    callback: (cellIdx: number, curPet: Pet) => {
                        let rzt = GameDataTool.useDrinkToPet(gameData, curPet, cnsum);
                        if (rzt == GameDataTool.SUC) this.ctrlr.popPage();
                        else this.ctrlr.popToast(rzt);
                    }
                });
            } else if (cnsum.cnsumType == CnsumType.catcher) {
                this.ctrlr.popToast('捕捉器会在战斗中开启“捕捉”后自动使用');
            }
        } else if (item.itemType == ItemType.equip) {
            this.ctrlr.pushPage(PagePkgEquip, { idx: itemId });
        } else if (item.itemType == ItemType.caughtPet) {
            let caughtPet = item as CaughtPet;
            let rzt = GameDataTool.addPet(gameData, caughtPet.id, caughtPet.lv, caughtPet.rank, caughtPet.features);
            if (rzt == GameDataTool.SUC) {
                GameDataTool.deleteItem(gameData, itemId);
                this.resetCurList();
            } else this.ctrlr.popToast(rzt);
        }
    }

    onMoveUpCell(cellIdx: number) {
        let rzt = GameDataTool.moveItemInList(this.ctrlr.memory.gameData, cellIdx, cellIdx - 1);
        if (rzt == GameDataTool.SUC) this.resetCurList();
        else this.ctrlr.popToast(rzt);
    }

    onMoveDownCell(cellIdx: number) {
        let rzt = GameDataTool.moveItemInList(this.ctrlr.memory.gameData, cellIdx, cellIdx + 1);
        if (rzt == GameDataTool.SUC) this.resetCurList();
        else if (rzt) this.ctrlr.popToast(rzt);
    }

    onRemoveCell(cellIdx: number) {
        let str = `确定将该道具丢弃吗？ ` + '\n注意：丢弃后将无法找回哦！';
        this.ctrlr.popAlert(str, (key: number) => {
            if (key == 1) {
                let rzt = GameDataTool.deleteItem(this.ctrlr.memory.gameData, cellIdx);
                if (rzt == GameDataTool.SUC) this.resetCurList();
                else this.ctrlr.popToast(rzt);
            }
        });
    }
}
