/*
 * PsgeSelctionBtn.ts
 * 选项段落按钮
 * luleyan
 */

import { CellPsgeSelection } from './CellPsgeSelection';

const { ccclass, property } = cc._decorator;

export enum PSBState {
    normal = 1, // 可点击
    pressed, // 被点击过
    noPressed // 其他的被点击过
}

@ccclass
export class PsgeSelctionBtn extends cc.Component {
    @property(cc.Label)
    lbl: cc.Label = null!;

    @property(cc.Button)
    btn: cc.Button = null!;

    cell!: CellPsgeSelection;
    index!: number;

    onLoad() {
        this.btn.node.on('click', this.onClick.bind(this));
    }

    init(cell: CellPsgeSelection, index: number) {
        this.cell = cell;
        this.index = index;
    }

    setData(str: string, main: boolean, state: PSBState) {
        this.lbl.string = str;
        if (state === PSBState.normal) this.node.resumeSystemEvents(false);
        else this.node.pauseSystemEvents(false);
        this.btn.interactable = state !== PSBState.pressed; // 用来改变显示状态
    }

    onClick() {
        this.cell.onClickBtn(this.index);
    }
}
