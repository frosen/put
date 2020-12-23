/*
 * SklForbidBtnLayer.ts
 * 招式禁止按钮
 * luleyan
 */

const { ccclass, property } = cc._decorator;

export enum SklForbidBtnState {
    unuse,
    open,
    forbid
}

const btnColorsForState = [cc.color(162, 162, 162), cc.color(0, 210, 0), cc.color(210, 0, 0)];

@ccclass('SklForbidBtn')
export class SklForbidBtn {
    @property(cc.Node)
    bar: cc.Node = null;

    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Node)
    icon: cc.Node = null;

    state: SklForbidBtnState = SklForbidBtnState.unuse;
}

@ccclass
export class SklForbidBtnLayer extends cc.Component {
    @property([SklForbidBtn])
    btns: SklForbidBtn[] = [];

    using: boolean = false;

    setData(idx: number, name: string, state: SklForbidBtnState) {
        const btn = this.btns[idx];
        btn.nameLbl.string = name;
        btn.state = state;
        btn.icon.color = btnColorsForState[state];
    }

    getRect(idx: number): cc.Rect {
        const bar = this.btns[idx].bar;
        return cc.rect(this.node.x + bar.x, this.node.y + bar.y - bar.height * 0.5, bar.width, bar.height);
    }
}
