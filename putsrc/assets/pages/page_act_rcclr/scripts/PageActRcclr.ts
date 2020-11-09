/*
 * PageActRcclr.ts
 * 回收站页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListView } from 'scripts/ListView';
import { PageActRcclrLVD } from './PageActRcclrLVD';
import { GameData, Item, ItemType, Cnsum, CnsumType, Money, Equip, CaughtPet } from 'scripts/DataSaved';
import { MoneyTool, GameDataTool, CnsumTool, EquipTool, CaughtPetTool } from 'scripts/Memory';
import { NavBar } from 'scripts/NavBar';
import { LIST_NAMES } from 'pages/page_pkg/scripts/PagePkg';
import { CellTransaction } from 'pages/page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { PageBase } from 'scripts/PageBase';
import { CellPkgBase } from 'pages/page_pkg/scripts/CellPkgBase';

const WIDTH = 1080;
const RcclPriceRate = 0.4;

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

    priceDict: { [key: string]: number } = {};
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
            const totalPrice = this.getTotalPrice();
            if (totalPrice <= 0) return true;
            this.ctrlr.popAlert(
                `确定回收资源并获得${MoneyTool.getStr(totalPrice)} ？`,
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
        const gameData = this.ctrlr.memory.gameData;
        let realTotalPrice = 0;

        for (const id in this.countDict) {
            if (!this.countDict.hasOwnProperty(id)) continue;
            const count = this.countDict[id];
            if (count <= 0) continue;

            const itemIdx = PageActRcclr.getItemIdxById(gameData, id);
            if (itemIdx === -1) continue;

            const item = gameData.items[itemIdx];
            const price = this.priceDict[id] || PageActRcclr.getItemRcclPrice(item);
            const rzt = GameDataTool.deleteItem(gameData, itemIdx, count);
            if (rzt === GameDataTool.SUC) {
                realTotalPrice += count * price;
            } else {
                this.ctrlr.popToast(rzt);
                break;
            }
        }

        GameDataTool.handleMoney(gameData, (m: Money) => (m.sum += realTotalPrice));

        return true;
    }

    static getItemIdxById(gameData: GameData, id: string): number {
        const items = gameData.items;
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (item.id === id) {
                return index;
            }
        }
        return -1;
    }

    onPageShow() {
        this.checkCountData();
        this.resetSubTitle();
        this.turnList(this.curListIdx);
    }

    checkCountData() {
        const gameData = this.ctrlr.memory.gameData;

        for (const id in this.countDict) {
            if (!this.countDict.hasOwnProperty(id)) continue;
            let count = this.countDict[id];
            const itemIdx = PageActRcclr.getItemIdxById(gameData, id);

            if (itemIdx === -1) {
                this.countDict[id] = 0;
                continue;
            }

            const item = gameData.items[itemIdx];
            const realCount = item.itemType === ItemType.cnsum ? (item as Cnsum).count : 1;
            if (realCount < count) {
                count = realCount;
                this.countDict[id] = realCount;
            }
        }
    }

    getTotalPrice(): number {
        let totalPrice = 0;
        for (const id in this.countDict) {
            if (!this.countDict.hasOwnProperty(id)) continue;
            totalPrice += this.countDict[id] * this.priceDict[id];
        }
        return totalPrice;
    }

    resetSubTitle() {
        this.navBar.setSubTitle('总价 ' + MoneyTool.getSimpleStr(this.getTotalPrice()));
    }

    resetCurList() {
        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        const curData = this.listDatas[this.curListIdx];
        if (curData.dirtyToken !== curDirtyToken) {
            curData.dirtyToken = curDirtyToken;
            const items = this.ctrlr.memory.gameData.items;
            const idxs = PageActRcclr.getItemIdxsByListIdxWithoutMoney(items, this.curListIdx);
            curData.delegate.initListData(items, idxs);
            curData.list.resetContent(true);
        }
    }

    static getItemIdxsByListIdxWithoutMoney(items: Item[], listIdx: number): number[] {
        const idxs: number[] = [];
        if (listIdx === 0) {
            for (let index = 1; index < items.length; index++) idxs[idxs.length] = index;
        } else if (listIdx === 1) {
            this.getoutItemIdxsByTypeWithoutMoney(items, idxs, ItemType.equip);
        } else if (listIdx === 2) {
            this.getoutItemIdxsByTypeWithoutMoney(items, idxs, ItemType.cnsum, CnsumType.drink);
        } else if (listIdx === 3) {
            this.getoutItemIdxsByTypeWithoutMoney(items, idxs, ItemType.cnsum, CnsumType.catcher);
            this.getoutItemIdxsByTypeWithoutMoney(items, idxs, ItemType.caughtPet);
        } else if (listIdx === 4) {
            this.getoutItemIdxsByTypeWithoutMoney(items, idxs, ItemType.cnsum, CnsumType.eqpAmplr);
        }
        return idxs;
    }

    static getoutItemIdxsByTypeWithoutMoney(items: Item[], idxsOut: number[], itemType: ItemType, cnsumType: CnsumType = null) {
        for (let index = 1; index < items.length; index++) {
            const item = items[index];
            if (item.itemType === itemType && (cnsumType ? (item as Cnsum).cnsumType === cnsumType : true)) {
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
        const itemIdx = (cell.subCell as CellPkgBase).curItemIdx;
        const items = this.ctrlr.memory.gameData.items;
        const item = items[itemIdx];

        const countMax = item.itemType === ItemType.cnsum ? (item as Cnsum).count : 1;
        const curCount = this.countDict[item.id] || 0;
        const newCount = Math.min(curCount + count, countMax);

        if (!this.priceDict.hasOwnProperty(item.id)) this.priceDict[item.id] = PageActRcclr.getItemRcclPrice(item);
        this.countDict[item.id] = newCount;

        cell.setCount(newCount, countMax);
        this.resetSubTitle();
    }

    onCellRdcCount(cell: CellTransaction, count: number) {
        const itemIdx = (cell.subCell as CellPkgBase).curItemIdx;
        const items = this.ctrlr.memory.gameData.items;
        const item = items[itemIdx];

        const countMax = item.itemType === ItemType.cnsum ? (item as Cnsum).count : 1;
        const curCount = this.countDict[item.id] || 0;
        const newCount = Math.max(curCount - count, 0);

        if (!this.priceDict.hasOwnProperty(item.id)) this.priceDict[item.id] = PageActRcclr.getItemRcclPrice(item);
        this.countDict[item.id] = newCount;

        cell.setCount(newCount, countMax);
        this.resetSubTitle();
    }

    onCellClickDetailBtn(cell: CellPkgCnsum) {}

    static getItemPrice(item: Item): number {
        switch (item.itemType) {
            case ItemType.cnsum:
                return CnsumTool.getModelById(item.id).price;
            case ItemType.equip:
                return EquipTool.getPrice(item as Equip);
            case ItemType.caughtPet:
                return CaughtPetTool.getPrice(item as CaughtPet);
        }
    }

    static getItemRcclPrice(item: Item): number {
        return PageActRcclr.getItemPrice(item) * RcclPriceRate;
    }
}
