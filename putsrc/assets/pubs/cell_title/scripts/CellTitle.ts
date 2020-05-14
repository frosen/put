/*
 * CellTitle.ts
 * 标题项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';

@ccclass
export default class CellTitle extends ListViewCell {
    @property(cc.Label)
    title: cc.Label = null;

    setData(title: string) {
        this.title.string = title;
    }
}
