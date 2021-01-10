/*
 * PageStory.ts
 * 故事页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { StoryModel } from '../../../scripts/DataModel';
import { Evt } from '../../../scripts/DataSaved';
import { ListView } from '../../../scripts/ListView';
import { PageBase } from '../../../scripts/PageBase';
import { PageStoryLVD } from './PageStoryLVD';

@ccclass
export class PageStory extends PageBase {
    @property(ListView)
    listView: ListView = null!;
    lvd!: PageStoryLVD;

    evtId!: string;
    storyModel!: StoryModel;
    evt!: Evt;

    dirtyToken: number = 0;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageStoryLVD;
        this.lvd.page = this;
    }

    setData(data: { evtId: string }) {
        cc.assert(data && data.evtId, 'PUT Story必有evtId');
        this.evtId = data.evtId;
        this.storyModel = StoryModel[this.evtId];
        this.evt = this.ctrlr.memory.gameData.evtDict[this.evtId];
    }

    onPageShow() {
        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.dirtyToken !== curDirtyToken) {
            this.dirtyToken = curDirtyToken;
            this.resetListview();
        }
    }

    resetListview() {
        this.lvd.initData();
        this.listView.resetContent(true);
    }
}
