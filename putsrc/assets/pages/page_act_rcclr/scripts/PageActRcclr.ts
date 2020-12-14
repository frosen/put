/*
 * PageActRcclr.ts
 * 回收站页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListView } from '../../../scripts/ListView';
import { PageActRcclrLVD } from './PageActRcclrLVD';
import { GameData, Item, ItemType, Cnsum, CnsumType, Money, Equip, CaughtPet } from '../../../scripts/DataSaved';
import { MoneyTool, GameDataTool, CnsumTool, EquipTool, CaughtPetTool } from '../../../scripts/Memory';
import { NavBar } from '../../../scripts/NavBar';
import { PagePkg } from '../../page_pkg/scripts/PagePkg';
import { CellTransaction } from '../../page_act_shop/cells/cell_transaction/scripts/CellTransaction';
import { CellPkgCnsum } from '../../page_pkg/scripts/CellPkgCnsum';
import { PageBase } from '../../../scripts/PageBase';
import { CellPkgBase } from '../../page_pkg/scripts/CellPkgBase';
import { PkgSelectionBar } from '../../page_pkg/scripts/PkgSelectionBar';
import { TouchLayerForBack } from '../../../scripts/TouchLayerForBack';

const WIDTH = 1080;
const RcclPriceRate = 0.4;

@ccclass
export class PageActRcclr extends PageBase {
    curListIdx: number = 0;

    @property(cc.Node)
    listLayer: cc.Node = null;

    @property(cc.Prefab)
    listPrefab: cc.Prefab = null;

    listDatas: { dirtyToken: number; list: ListView; delegate: PageActRcclrLVD }[] = [];

    @property(cc.Node)
    selectionNode: cc.Node = null;

    @property(cc.Prefab)
    selectionBarPrefab: cc.Node = null;

    selectionBar: PkgSelectionBar = null;

    priceDict: { [key: string]: number } = {};
    countDict: { [key: string]: number } = {};

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const selectionBarNode = cc.instantiate(this.selectionBarPrefab);
        selectionBarNode.parent = this.selectionNode;

        this.selectionBar = selectionBarNode.getComponent(PkgSelectionBar);
        this.selectionBar.onSelection = (curSelection: number) => {
            this.turnList(curSelection);
        };
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
            const rzt = GameDataTool.removeItem(gameData, itemIdx, count);
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

        this.ctrlr.touchLayerForBack.getComponent(TouchLayerForBack).setYLimit(-110);
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
        let curData = this.listDatas[this.curListIdx];
        if (!curData) curData = this.createList(this.curListIdx);
        if (curData.dirtyToken !== curDirtyToken) {
            curData.dirtyToken = curDirtyToken;
            const items = this.ctrlr.memory.gameData.items;
            const idxs = PagePkg.getItemIdxsByListIdx(items, this.curListIdx || -1); // -1是不显示money
            curData.delegate.initListData(items, idxs);
            curData.list.resetContent(true);
        }
    }

    createList(listIdx: number): { dirtyToken: number; list: ListView; delegate: PageActRcclrLVD } {
        const listNode = cc.instantiate(this.listPrefab);
        listNode.parent = this.listLayer;
        listNode.x = listIdx * WIDTH;

        const list = listNode.getComponent(ListView);
        const delegate = list.delegate as PageActRcclrLVD;
        delegate.page = this;

        const listData = { dirtyToken: 0, list, delegate };
        this.listDatas[listIdx] = listData;

        return listData;
    }

    turnning: boolean = false;

    turnList(idx: number) {
        if (this.turnning) return;

        if (this.curListIdx !== idx) {
            this.curListIdx = idx;
            this.resetCurList();

            this.turnning = true;
            this.selectionBar.canTurn = false;
            cc.tween(this.listLayer)
                .to(0.2, { x: idx * WIDTH * -1 }, { easing: 'quadInOut' })
                .call(() => {
                    this.turnning = false;
                    this.selectionBar.canTurn = true;
                })
                .start();
        } else {
            this.resetCurList();
        }
    }

    beforePageHideAnim(willDestroy: boolean) {
        this.ctrlr.touchLayerForBack.getComponent(TouchLayerForBack).setYLimit(0);
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

        for (const listData of this.listDatas) if (listData) listData.dirtyToken = 0; // 所有页面预备刷新
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

        for (const listData of this.listDatas) if (listData) listData.dirtyToken = 0; // 所有页面预备刷新
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
