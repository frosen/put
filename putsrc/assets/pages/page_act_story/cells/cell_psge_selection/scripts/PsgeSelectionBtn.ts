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
        if (state === PSBState.normal) {
            this.btn.interactable = true;
            this.lbl.node.color = cc.color(43, 33, 4);
        } else if (state === PSBState.pressed) {
            this.btn.interactable = false;
            this.btn.disabledSprite = this.btn.pressedSprite;
            this.lbl.node.color = cc.color(120, 120, 120);
        } else {
            this.btn.interactable = false;
            this.btn.disabledSprite = this.btn.normalSprite;
            this.lbl.node.color = cc.color(120, 120, 120);
        }
    }

    onClick() {
        this.cell.onClickBtn(this.index);
    }
}
