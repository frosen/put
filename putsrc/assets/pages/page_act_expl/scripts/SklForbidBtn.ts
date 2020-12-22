/*
 * SklForbidBtn.ts
 * 招式禁止按钮
 * luleyan
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class SklForbidBtn extends cc.Component {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Node)
    bar: cc.Node = null;

    @property(cc.Node)
    forbidMark: cc.Node = null;

    setName(str: string) {
        this.nameLbl.string = str;
    }

    setForbid(b: boolean) {
        this.forbidMark.opacity = b ? 255 : 0;
    }
}
