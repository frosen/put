/*
 * PagePet.ts
 * 宠物列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';

@ccclass
export default class PagePet extends PageBase {
    dirtyToken: number = 0;

    onPageShow() {
        this.ctrlr.setTitle('宠物');

        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.dirtyToken != curDirtyToken) {
            this.dirtyToken = curDirtyToken;
            this.getComponentInChildren(ListView).resetContent(true);
        }
    }
}
