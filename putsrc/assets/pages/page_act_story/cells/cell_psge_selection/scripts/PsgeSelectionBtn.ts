/*
 * PsgeSelctionBtn.ts
 * 选项段落按钮
 * luleyan
 */

import { CellPsgeSelection } from './CellPsgeSelection';

const { ccclass, property } = cc._decorator;

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

    setData(str: string, interactable: boolean, selected: boolean) {
        this.lbl.string = str;
        this.btn.interactable = interactable && !selected;
        this.lbl.node.color = interactable ? cc.color(43, 33, 4) : cc.color(120, 120, 120);
        this.btn.disabledSprite = selected ? this.btn.pressedSprite : this.btn.normalSprite;
    }

    onClick() {
        this.cell.onClickBtn(this.index);
    }
}
