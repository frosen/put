/*
 * CellTitle.ts
 * 标题项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';

@ccclass
export class CellTitle extends ListViewCell {
    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Node)
    detailBtnNode: cc.Node = null;

    tip: string = '';

    detailCallback: () => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.detailBtnNode.on(cc.Node.EventType.TOUCH_END, this.onClickDetailBtn.bind(this));
    }

    setData(title: string, tip: string = '') {
        this.title.string = title;
        this.tip = tip;
        this.detailBtnNode.opacity = tip ? 255 : 0;
    }

    onClickDetailBtn() {
        if (this.tip) this.ctrlr.popToast(this.tip);
    }
}
