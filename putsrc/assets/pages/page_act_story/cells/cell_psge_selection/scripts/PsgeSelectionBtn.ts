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

export const PSBGray = cc.color(150, 150, 150);
export const PSBColor = cc.color(43, 33, 4);

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

    setData(str: string, state: PSBState, selected: boolean) {
        this.lbl.string = str;

        if (state === PSBState.normal) {
            this.btn.disabledSprite = this.btn.pressedSprite;
            if (selected) {
                this.btn.interactable = false;
                this.lbl.node.color = PSBGray;
            } else {
                this.btn.interactable = !selected;
                this.lbl.node.color = PSBColor;
            }
        } else {
            this.btn.interactable = false;
            this.lbl.node.color = state === PSBState.pressed ? cc.color(90, 90, 90) : PSBGray;
            this.btn.disabledSprite = selected ? this.btn.pressedSprite : this.btn.normalSprite;
        }
    }

    onClick() {
        this.cell.onClickBtn(this.index);
    }
}
