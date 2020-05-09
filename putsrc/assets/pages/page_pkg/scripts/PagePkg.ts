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
import { GameDataTool } from 'scripts/Memory';

const LIST_NAMES = ['全部', '装备'];
const WIDTH = 1080;

@ccclass
export default class PagePkg extends PageBase {
    curListIdx: number = -1;

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

    onLoad() {
        if (CC_EDITOR) return;

        let selections = this.selectionLayer.children;
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

            let selection = selections[index];
            selection.on('click', () => {
                this.turnList(index);
            });

            let lblNode = selection.children[0];
            lblNode.getComponent(cc.Label).string = LIST_NAMES[index];
            this.selectionLblNodes.push(lblNode);
        }
    }

    onPageShow() {
        this.ctrlr.setTitle('道具');
        let gameData = this.ctrlr.memory.gameData;
        this.ctrlr.setSubTitle(`${gameData.weight}/${GameDataTool.getItemCountMax(gameData)}`);
        this.turnList(0);
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
            .to(0.2, { x: idx * WIDTH * -1 }, { easing: 'quadInOut' })
            .call(() => {
                this.turnning = false;
            })
            .start();

        for (const lblNode of this.selectionLblNodes) lblNode.color = cc.color(90, 90, 90);
        this.selectionLblNodes[idx].color = cc.Color.RED;

        cc.tween(this.selectionBar)
            .to(0.2, { x: idx * 216 + 108 }, { easing: 'quadInOut' })
            .start();
    }
}
