/*
 * PageSelf.ts
 * 个人页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from '../../../scripts/PageBase';
import { ListView } from '../../../scripts/ListView';
import { PanelSelfInfo } from './PanelSelfInfo';
import { PageSelfLVD } from './PageSelfLVD';

@ccclass
export class PageSelf extends PageBase {
    navHidden: boolean = true;

    @property(ListView)
    listView: ListView = null;
    lvd: PageSelfLVD = null;

    @property(PanelSelfInfo)
    selfInfo: PanelSelfInfo = null;

    dirtyToken: number = 0;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageSelfLVD;
        this.lvd.page = this;

        this.listView.node.on('scrolling', this.onScrolling.bind(this));
        this.selfInfo.ctrlr = this.ctrlr;
    }

    onPageShow() {
        const gameData = this.ctrlr.memory.gameData;

        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.dirtyToken !== curDirtyToken) {
            this.dirtyToken = curDirtyToken;

            this.resetListview();
            this.selfInfo.setData(gameData);
        }
    }

    resetListview() {
        this.lvd.initData();
        this.listView.resetContent(true);
    }

    onScrolling() {
        const y = this.listView.content.y;
        this.selfInfo.onScrolling(y);
    }

    // -----------------------------------------------------------------

    onClickQuest() {}
}
