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

    using: boolean = false;

    setName(str: string) {
        this.nameLbl.string = str;
        // @ts-ignore
        this.nameLbl._assembler.updateRenderData(this.nameLbl);
        this.bar.getComponent(cc.Layout).updateLayout();
    }

    setForbid(b: boolean) {
        this.forbidMark.opacity = b ? 255 : 0;
    }

    startX: number = 0;
    startY: number = 0;

    show(startX: number, startY: number, x: number, y: number) {
        this.startX = startX;
        this.startY = startY;
        this.node.setPosition(startX, startY);

        this.node.stopAllActions();
        cc.tween(this.node).by(0.3, { x, y }, { easing: cc.easing.quadOut }).start();
        cc.tween(this.node)
            .to(0.3, { opacity: 255 })
            .call(() => {
                this.using = true;
            })
            .start();
    }

    hide() {
        this.using = false;
        this.node.stopAllActions();
        if (this.node.opacity > 0) {
            cc.tween(this.node).to(0.3, { x: this.startX, y: this.startY }, { easing: cc.easing.quadIn }).start();
            cc.tween(this.node).to(0.3, { opacity: 0 }).start();
        }
    }

    getRect(): cc.Rect {
        return cc.rect(this.node.x + this.bar.height * 0.5, this.node.y, this.bar.width, this.bar.height);
    }
}
