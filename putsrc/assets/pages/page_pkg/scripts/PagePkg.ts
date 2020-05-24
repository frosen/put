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
import { PagePkgEquip } from 'pages/page_pkg_equip/scripts/PagePkgEquip';
import ListViewCell from 'scripts/ListViewCell';

const LIST_NAMES = ['全部', '装备'];
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

    @property(cc.Node)
    funcBarNode: cc.Node = null;

    @property(cc.Node)
    touchLayer: cc.Node = null;

    useBtnLbl: cc.Label = null;

    funcBarShowIdx: number = -1;

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

        this.funcBarNode.opacity = 0;
        this.funcBarNode.y = 9999;

        this.useBtnLbl = this.funcBarNode
            .getChildByName('func_bar')
            .getChildByName('use_button')
            .children[0].getComponent(cc.Label);

        this.touchLayer.on(cc.Node.EventType.TOUCH_START, this.hideFuncBar, this);
        // @ts-ignore
        this.touchLayer._touchListener.setSwallowTouches(false);
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
        if (listIdx == 0) {
            let idxs: number[] = [];
            for (let index = 0; index < items.length; index++) idxs.push(index);
            return idxs;
        } else if (listIdx == 1) {
            let idxs: number[] = [];
            for (let index = 0; index < items.length; index++) if (items[index].itemType == ItemType.equip) idxs.push(index);
            return idxs;
        }
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
            .to(0.2, { x: idx * 216 + 108 }, { easing: 'quadInOut' })
            .start();
    }

    // -----------------------------------------------------------------

    onCellClick(cell: ListViewCell) {}

    onCellClickFuncBtn(cell: ListViewCell) {
        this.showFuncBar(cell.curCellIdx, cell.node);
    }

    // -----------------------------------------------------------------

    showFuncBar(cellIdx: number, cellNode: cc.Node) {
        this.funcBarShowIdx = cellIdx;
        let wp = cellNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let realY = cc.v2(this.node.convertToNodeSpaceAR(wp)).y;

        realY -= 78;

        let changeBar = () => {
            this.funcBarNode.y = realY;
            let atBottom = this.funcBarShowIdx < 5;
            this.funcBarNode.getChildByName('arrow_node').scaleY = atBottom ? 1 : -1;
            this.funcBarNode.getChildByName('func_bar').y = atBottom ? -90 : 90;

            let item = this.ctrlr.memory.gameData.items[cellIdx];
            let btnStr = item.itemType == ItemType.equip ? '装配' : '使用';
            this.useBtnLbl.string = btnStr;
        };

        this.funcBarNode.stopAllActions();
        if (this.funcBarShowIdx >= 0) {
            cc.tween(this.funcBarNode).to(0.1, { opacity: 0 }).call(changeBar).to(0.1, { opacity: 255 }).start();
        } else {
            changeBar();
            this.funcBarNode.opacity = 0;
            cc.tween(this.funcBarNode).to(0.1, { opacity: 255 }).start();
        }
    }

    hideFuncBar() {
        if (this.funcBarShowIdx >= 0) {
            this.funcBarShowIdx = -1;

            this.funcBarNode.stopAllActions();
            cc.tween(this.funcBarNode).to(0.1, { opacity: 0 }).set({ y: 9999 }).start();
        }
    }

    onMoveUpCell() {
        if (this.funcBarShowIdx < 0) return;
        let rzt = GameDataTool.moveItemInList(this.ctrlr.memory.gameData, this.funcBarShowIdx, this.funcBarShowIdx - 1);
        if (rzt == GameDataTool.SUC) this.resetCurList();
        else this.ctrlr.popToast(rzt);
        this.hideFuncBar();
    }

    onMoveDownCell() {
        if (this.funcBarShowIdx < 0) return;
        let rzt = GameDataTool.moveItemInList(this.ctrlr.memory.gameData, this.funcBarShowIdx, this.funcBarShowIdx + 1);
        if (rzt == GameDataTool.SUC) this.resetCurList();
        else if (rzt) this.ctrlr.popToast(rzt);
        this.hideFuncBar();
    }

    onRemoveCell() {
        if (this.funcBarShowIdx < 0) return;
        let idx = this.funcBarShowIdx;
        let str = `确定将该道具丢弃吗？ ` + '\n注意：丢弃后将无法找回哦！';
        this.ctrlr.popAlert(str, (key: number) => {
            if (key == 1) {
                let rzt = GameDataTool.deleteItem(this.ctrlr.memory.gameData, idx);
                if (rzt == GameDataTool.SUC) this.resetCurList();
                else this.ctrlr.popToast(rzt);
            }
        });
        this.hideFuncBar();
    }

    onUseCell() {
        if (this.funcBarShowIdx < 0) return;
        let idx = this.funcBarShowIdx;
        let item = this.ctrlr.memory.gameData.items[idx];
        cc.log('PUT 使用道具：', item.id);

        // llytodo
        if (item.itemType == ItemType.equip) {
            this.ctrlr.pushPage(PagePkgEquip, { idx });
        }

        this.hideFuncBar();
    }
}
