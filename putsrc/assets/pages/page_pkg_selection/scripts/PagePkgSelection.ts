/*
 * PagePkgSelection.ts
 * 道具选择列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PagePkgBase } from '../../page_pkg/scripts/PagePkgBase';
import { PagePkgLVD, PagePkgCellType } from '../../page_pkg/scripts/PagePkgLVD';
import { ListView } from '../../../scripts/ListView';
import { Item } from '../../../scripts/DataSaved';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { NavBar } from '../../../scripts/NavBar';

@ccclass
export class PagePkgSelection extends PagePkgBase {
    @property(ListView)
    list: ListView = null;

    lvd: PagePkgLVD = null;

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
    setData(pageData: any) {
        this.pageName = pageData.name;
        this.curItemIdxs = pageData.curItemIdxs;
        this.clickCallback = pageData.callback;
        cc.assert(this.pageName, 'PUT 物品选择页面必须有名字');
        cc.assert(this.curItemIdxs, 'PUT 物品选择页面必须有物品序号列表');
        cc.assert(this.clickCallback, 'PUT 物品选择页面必须有回调');
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true);
        navBar.setTitle(this.pageName);
    }

    onPageShow() {
        const items = this.ctrlr.memory.gameData.items;
        this.lvd.initListData(items, this.curItemIdxs);
        this.list.resetContent(true);
    }

    // -----------------------------------------------------------------

    onCellClick(cell: ListViewCell) {
        const items = this.ctrlr.memory.gameData.items;
        const cellIdx = cell.curCellIdx;
        const itemIdx = this.curItemIdxs[cellIdx];
        const item = items[itemIdx];
        this.clickCallback(cellIdx, itemIdx, item);
    }

    onCellClickFuncBtn(cell: ListViewCell) {}

    onCellClickDetailBtn(cell: ListViewCell) {}
}
