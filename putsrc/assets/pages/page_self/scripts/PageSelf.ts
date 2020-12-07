/*
 * PageSelf.ts
 * 个人页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from '../../../scripts/PageBase';
import { ListView } from '../../../scripts/ListView';
import { PageActPosLVD } from '../../page_act_pos/scripts/PageActPosLVD';
import { PanelSelfInfo } from './PanelSelfInfo';

@ccclass
export class PageSelf extends PageBase {
    navHidden: boolean = true;

    @property(ListView)
    listView: ListView = null;
    lvd: PageActPosLVD = null;

    @property(PanelSelfInfo)
    selfInfo: PanelSelfInfo = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageActPosLVD;
        this.listView.node.on('scrolling', this.onScrolling.bind(this));

        this.selfInfo.ctrlr = this.ctrlr;
    }

    onScrolling() {
        const y = this.listView.content.y;
        this.selfInfo.onScrolling(y);
    }
}
