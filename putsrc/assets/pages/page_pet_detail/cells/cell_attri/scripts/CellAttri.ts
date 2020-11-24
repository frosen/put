/*
 * CellAttri.ts
 * 属性项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellAttri extends ListViewCell {
    @property(cc.Label)
    key: cc.Label = null;

    @property(cc.Label)
    value: cc.Label = null;

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    setData(key: string, value: string, progress: number = -1) {
        this.key.string = key;
        this.value.string = value;
        if (progress < 0) {
            this.progress.node.active = false;
        } else {
            this.progress.node.active = true;
            this.progress.progress = progress;
        }
    }
}
