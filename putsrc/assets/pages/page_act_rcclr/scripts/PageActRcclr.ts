/*
 * PageActRcclr.ts
 * 回收站页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListView } from 'scripts/ListView';
import { PageActRcclrLVD } from './PageActRcclrLVD';
import { Item, ItemType, Cnsum, CnsumType } from 'scripts/DataSaved';
import { GameDataTool, MoneyTool } from 'scripts/Memory';
import { NavBar } from 'scripts/NavBar';
import { PagePkg, LIST_NAMES } from 'pages/page_pkg/scripts/PagePkg';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { PageBase } from 'scripts/PageBase';

const WIDTH = 1080;

@ccclass
export class PageActRcclr extends PageBase {
    curListIdx: number = 0;

    @property(cc.SpriteFrame)
    detailBtnSFrame: cc.SpriteFrame = null;

    @property(cc.Node)
    listLayer: cc.Node = null;

    @property(cc.Prefab)
    listPrefab: cc.Prefab = null;

    listDatas: { dirtyToken: number; list: ListView; delegate: PageActRcclrLVD }[] = [];

    @property(cc.Node)
    selectionLayer: cc.Node = null;

    @property(cc.Node)
    selectionBar: cc.Node = null;

    selectionLblNodes: cc.Node[] = [];

    totalPrice: number = 0;
    countDict: { [key: string]: number } = {};

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const selections = this.selectionLayer.children;
        for (let index = 0; index < LIST_NAMES.length; index++) {
            const listNode = cc.instantiate(this.listPrefab);
            listNode.parent = this.listLayer;
            listNode.x = index * WIDTH;

            const list = listNode.getComponent(ListView);
            const delegate = list.delegate as PageActRcclrLVD;
            delegate.page = this;

            this.listDatas.push({ dirtyToken: 0, list, delegate });

            const selection = selections[index];
            selection.on('click', () => {
                this.turnList(index);
            });

            const lblNode = selection.children[0];
            lblNode.getComponent(cc.Label).string = LIST_NAMES[index];
            this.selectionLblNodes.push(lblNode);
        }
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            if (this.totalPrice <= 0) return true;
            this.ctrlr.popAlert(
                `确定回收资源并获得${MoneyTool.getStr(this.totalPrice)} ？`,
                (key: number) => {
                    if (key === 1) {
                        if (this.recycle()) this.ctrlr.popPage();
                    } else if (key === 2) this.ctrlr.popPage();
                },
                '确定',
                '不回收，直接离开'
            );
            return false;
        });
        navBar.setTitle('回收站');
    }

    recycle(): boolean {
        return true;
    }

    onPageShow() {
        this.turnList(this.curListIdx);
        this.resetSubTitle();
    }

    resetSubTitle() {
        this.navBar.setSubTitle('总价 ' + MoneyTool.getSimpleStr(this.totalPrice));
    }

    resetCurList() {
        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        const curData = this.listDatas[this.curListIdx];
        if (curData.dirtyToken !== curDirtyToken) {
            curData.dirtyToken = curDirtyToken;
            const items = this.ctrlr.memory.gameData.items;
            const idxs = PagePkg.getItemIdxsByListIdx(items, this.curListIdx);
            curData.delegate.initListData(items, idxs);
            curData.list.resetContent(true);
        }
    }

    static getItemIdxsByListIdx(items: Item[], listIdx: number): number[] {
        const idxs: number[] = [];
        if (listIdx === 0) {
            for (let index = 0; index < items.length; index++) idxs[index] = index;
        } else if (listIdx === 1) {
            this.getoutItemIdxsByType(items, idxs, ItemType.equip);
        } else if (listIdx === 2) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.drink);
        } else if (listIdx === 3) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.catcher);
            this.getoutItemIdxsByType(items, idxs, ItemType.caughtPet);
        } else if (listIdx === 4) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.eqpAmplr);
        }
        return idxs;
    }

    static getoutItemIdxsByType(items: Item[], idxsOut: number[], itemType: ItemType, cnsumType: CnsumType = null) {
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (item.itemType === itemType && cnsumType && (item as Cnsum).cnsumType === cnsumType) {
                idxsOut[idxsOut.length] = index;
            }
        }
    }

    turnning: boolean = false;

    turnList(idx: number) {
        if (this.turnning) return;

        if (this.curListIdx !== idx) {
            this.curListIdx = idx;
            this.resetCurList();

            this.turnning = true;
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
        } else {
            this.resetCurList();
        }
    }

    moveList(moveDis: number) {
        const nextIdx = this.curListIdx + moveDis;
        if (nextIdx < 0 || this.listDatas.length <= nextIdx) {
            cc.log('PUT can not move list to ', nextIdx);
            return;
        }

        this.turnList(nextIdx);
    }

    // -----------------------------------------------------------------

    onCellAddCount(cell: CellTransaction, count: number) {
        const itemIdx = cell.cell.curItemIdx;
        const items = this.ctrlr.memory.gameData.items;
        const item = items[itemIdx];

        const price = PageActRcclrLVD.getItemPrice(item);
        this.countDict[item.id] = (this.countDict[item.id] || 0) + count;
        this.totalPrice += price * count;

        const newCount = this.countDict[item.id] || 0;
        const countMax = item.itemType === ItemType.cnsum ? (item as Cnsum).count : 1;
        cell.setCount(newCount, countMax);
        this.resetSubTitle();
    }

    onCellRdcCount(cell: CellTransaction, count: number) {
        const itemIdx = cell.cell.curItemIdx;
        const items = this.ctrlr.memory.gameData.items;
        const item = items[itemIdx];

        const price = PageActRcclrLVD.getItemPrice(item);
        this.countDict[item.id] -= count;
        this.totalPrice -= price * count;

        const newCount = this.countDict[item.id] || 0;
        const countMax = item.itemType === ItemType.cnsum ? (item as Cnsum).count : 1;
        cell.setCount(newCount, countMax);
        this.resetSubTitle();
    }

    onCellClickDetailBtn(cell: CellPkgCnsum) {}
}
