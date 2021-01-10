/*
 * PageStoryLVD.ts
 * 故事页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { Psge } from '../../../scripts/DataModel';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { PageStory } from './PageStory';

@ccclass
export class PageStoryLVD extends ListViewDelegate {
    page!: PageStory;

    @property(cc.Prefab)
    normalPsgePrefab: cc.Prefab = null!;

    lblForCalcHeight!: cc.Label;

    psges: Psge[] = [];

    onLoad() {
        const nodeForCalcHeight = cc.instantiate(this.normalPsgePrefab);
        nodeForCalcHeight.parent = this.node;
        nodeForCalcHeight.opacity = 0;

        this.lblForCalcHeight = nodeForCalcHeight.getComponentInChildren(cc.Label);
    }

    initData() {}

    numberOfRows(listView: ListView): number {
        return 0;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'msg';
    }

    createCellForRow(listView: ListView, rowIdx: number): ListViewCell {
        return null;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: any) {}
}
