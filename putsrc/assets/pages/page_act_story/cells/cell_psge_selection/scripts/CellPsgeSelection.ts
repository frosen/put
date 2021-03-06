/*
 * CellPsgeSelection.ts
 * 选项段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { SelectionPsge } from '../../../../../scripts/DataModel';
import { CellPsgeBase } from '../../../scripts/CellPsgeBase';
import { PsgeSelctionBtn, PSBState } from './PsgeSelectionBtn';

const HeadH = 30;
const EndH = 30;
const SideH = 50;
const BtnH = 120;

@ccclass
export class CellPsgeSelection extends CellPsgeBase {
    @property(cc.Node)
    baseNode: cc.Node = null!;

    @property(cc.Prefab)
    btnPrefab: cc.Prefab = null!;

    clickOptionCallback?: (cell: CellPsgeSelection, index: number) => void;

    btns: PsgeSelctionBtn[] = [];

    activeBtnLen: number = 0;

    setData(psge: SelectionPsge, used: number | undefined, slcNum: number) {
        const optNums = CellPsgeSelection.getOptNums(slcNum);
        let index = 0;
        for (; index < psge.options.length; index++) {
            const option = psge.options[index];

            let btn: PsgeSelctionBtn;
            if (index < this.btns.length) {
                btn = this.btns[index];
            } else {
                const btnNode = cc.instantiate(this.btnPrefab);
                btnNode.parent = this.baseNode;
                btnNode.y = -HeadH - SideH - (BtnH + SideH) * index;
                btn = btnNode.getComponent(PsgeSelctionBtn);
                btn.init(this, index);
                this.btns.push(btn);
            }

            let state: PSBState;
            if (used === undefined) state = PSBState.normal;
            else if (used === index) state = PSBState.pressed;
            else state = PSBState.noPressed;
            btn.setData(option.str, state, optNums.includes(index));

            const node = btn.node;
            node.opacity = 255;
            node.scaleX = 1;
        }

        for (; index < this.btns.length; index++) {
            const node = this.btns[index].node;
            node.opacity = 0;
            node.scaleX = 0;
        }

        this.node.height = CellPsgeSelection.getHeight(psge.options.length);
        this.baseNode.height = this.node.height;
    }

    static getOptNums(slcNum: number): number[] {
        const list = [];
        let curNum = slcNum;
        while (true) {
            if (curNum <= 0) break;
            const n = curNum % 10;
            list.push(n - 1);
            curNum = Math.floor((curNum - n) / 10);
        }
        return list;
    }

    static getHeight(btnLen: number) {
        return HeadH + SideH + (BtnH + SideH) * btnLen + EndH;
    }

    onClickBtn(index: number) {
        if (this.clickOptionCallback) this.clickOptionCallback(this, index);
    }
}
