/*
 * CellPsgeSelection.ts
 * 选项段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPsgeBase } from '../../../scripts/CellPsgeBase';
import { PSBState, PsgeSelctionBtn } from './PsgeSelectionBtn';

const SideH = 15;
const BtnH = 150;

@ccclass
export class CellPsgeSelection extends CellPsgeBase {
    @property(cc.Node)
    baseNode: cc.Node = null!;

    @property(cc.Prefab)
    btnPrefab: cc.Prefab = null!;

    clickOptionCallback?: (cell: CellPsgeSelection, index: number) => void;

    btns: PsgeSelctionBtn[] = [];

    activeBtnLen: number = 0;

    setData(datas: { str: string; main: boolean }[], slc: number) {
        let index = 0;
        for (const data of datas) {
            let btn: PsgeSelctionBtn;
            if (index < this.btns.length) {
                btn = this.btns[index];
            } else {
                const btnNode = cc.instantiate(this.btnPrefab);
                btnNode.parent = this.baseNode;
                btnNode.y = -SideH - (BtnH + SideH) * index;
                btn = btnNode.getComponent(PsgeSelctionBtn);
                this.btns.push(btn);
            }

            let state: PSBState;
            if (slc === -1) state = PSBState.normal;
            else if (slc === index) state = PSBState.pressed;
            else state = PSBState.noPressed;
            btn.setData(data.str, data.main, state);

            const node = btn.node;
            node.opacity = 255;
            node.scaleX = 1;

            index++;
        }

        for (; index < this.btns.length; index++) {
            const node = this.btns[index].node;
            node.opacity = 0;
            node.scaleX = 0;
        }

        this.node.height = CellPsgeSelection.getHeight(datas.length);
    }

    static getHeight(btnLen: number) {
        return SideH + (BtnH + SideH) * btnLen;
    }

    onClickBtn(index: number) {
        if (this.clickOptionCallback) this.clickOptionCallback(this, index);
    }
}
