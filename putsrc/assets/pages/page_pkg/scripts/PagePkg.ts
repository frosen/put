/*
 * PagePkg.ts
 * 道具列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PagePkgLVD from './PagePkgLVD';
import { Item, ItemType } from 'scripts/DataSaved';

// const LIST_NAMES = ['全部', '装备'];
const LIST_NAMES = ['全部'];
const WIDTH = 1080;

@ccclass
export default class PagePkg extends PageBase {
    curListIdx: number = 0;

    @property(cc.Node)
    listLayer: cc.Node = null;

    @property(cc.Prefab)
    listPrefab: cc.Prefab = null;

    listDatas: { dirtyToken: number; list: ListView; delegate: PagePkgLVD }[] = [];

    onLoad() {
        if (CC_EDITOR) return;
        for (let index = 0; index < LIST_NAMES.length; index++) {
            let listNode = cc.instantiate(this.listPrefab);
            listNode.parent = this.listLayer;
            listNode.x = index * WIDTH;

            let list = listNode.getComponent(ListView);
            this.listDatas.push({
                dirtyToken: 0,
                list,
                delegate: list.delegate as PagePkgLVD
            });
        }
    }

    onPageShow() {
        this.ctrlr.setTitle('道具');
        this.resetCurList();
    }

    resetCurList() {
        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        let curData = this.listDatas[this.curListIdx];
        if (curData.dirtyToken != curDirtyToken) {
            curData.dirtyToken = curDirtyToken;
            let items = this.getItemsByIdx(this.curListIdx);
            curData.delegate.initListData(items);
            curData.list.resetContent();
        }
    }

    getItemsByIdx(idx: number): Item[] {
        if (idx == 0) {
            return this.ctrlr.memory.gameData.items;
        } else if (idx == 1) {
            return this.ctrlr.memory.gameData.items.filter((value: Item): boolean => {
                return value.itemType == ItemType.equip;
            });
        }
    }

    turnning: boolean = false;

    turnList(idx: number) {
        if (this.turnning) return;
        if (idx == this.curListIdx) return;
        this.curListIdx = idx;

        this.turnning = true;
        this.resetCurList();
        cc.tween(this.listLayer)
            .to(0.2, { x: idx * WIDTH }, { easing: 'quadInOut' })
            .call(() => {
                this.turnning = false;
            });
    }
}
