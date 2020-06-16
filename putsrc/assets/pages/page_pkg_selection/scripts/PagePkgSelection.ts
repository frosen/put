/*
 * PagePkgSelection.ts
 * 道具选择列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PagePkgBase from 'pages/page_pkg/scripts/PagePkgBase';
import { PagePkgLVD, PagePkgCellType } from 'pages/page_pkg/scripts/PagePkgLVD';
import ListView from 'scripts/ListView';
import { Item } from 'scripts/DataSaved';
import ListViewCell from 'scripts/ListViewCell';

@ccclass
export default class PagePkgSelection extends PagePkgBase {
    @property(ListView)
    list: ListView = null;

    lvd: PagePkgLVD = null;

    @property(cc.SpriteFrame)
    detailBtnSFrame: cc.SpriteFrame = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.list.delegate as PagePkgLVD;
        this.lvd.page = this;
        this.lvd.cellType = PagePkgCellType.selection;
    }

    pageName: string = null;
    curItemIdxs: number[] = [];
    clickCallback: (index: number, itemIdx: number, item: Item) => void = null;

    /**
     * name
     * curItemIdxs
     * callback
     */
    setData(data: any) {
        this.pageName = data.name;
        this.curItemIdxs = data.curItemIdxs;
        this.clickCallback = data.callback;
        cc.assert(this.pageName, 'PUT 物品选择页面必须有名字');
        cc.assert(this.curItemIdxs, 'PUT 物品选择页面必须有物品序号列表');
        cc.assert(this.clickCallback, 'PUT 物品选择页面必须有回调');
    }

    onPageShow() {
        this.ctrlr.setTitle(this.pageName);

        let items = this.ctrlr.memory.gameData.items;
        this.lvd.initListData(items, this.curItemIdxs);
        this.list.resetContent(true);
    }

    // -----------------------------------------------------------------

    onCellClick(cell: ListViewCell) {
        let items = this.ctrlr.memory.gameData.items;
        let cellIdx = cell.curCellIdx;
        let itemIdx = this.curItemIdxs[cellIdx];
        let item = items[itemIdx];
        this.clickCallback(cellIdx, itemIdx, item);
    }

    onCellClickFuncBtn(cell: ListViewCell) {}

    onCellClickDetailBtn(cell: ListViewCell) {}
}
