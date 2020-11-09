/*
 * PkgSelectionBar.ts
 * 道具选择条
 * luleyan
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class PkgSelectionBar extends cc.Component {
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;

    @property(cc.Node)
    btnLayer: cc.Node = null;

    @property(cc.Node)
    indicator: cc.Node = null;

    lblNodes: cc.Node[] = [];

    curSelection: number = 0;

    onSelection: (curSelection: number) => void = null;

    onLoad() {
        const btnNodes = this.btnLayer.children;
        for (let index = 0; index < btnNodes.length; index++) {
            const btnNode = btnNodes[index];
            btnNode.on(cc.Node.EventType.TOUCH_START, () => this.onClickStart());
            btnNode.on(cc.Node.EventType.TOUCH_END, () => this.onClickBtn(index));
            this.lblNodes.push(btnNode.getChildByName('lbl'));
        }
    }

    onClickStart() {
        this.indicator.stopAllActions();
        this.scroll.content.stopAllActions();
    }

    canTurn: boolean = true;

    onClickBtn(idx: number) {
        if (!this.canTurn) return;

        this.curSelection = idx;

        for (const lblNode of this.lblNodes) lblNode.color = cc.color(100, 100, 100);
        const curLblNode = this.lblNodes[idx];
        curLblNode.color = cc.color(230, 30, 30);

        const btnNode = curLblNode.parent;
        cc.tween(this.indicator).to(0.3, { x: btnNode.x }, { easing: 'quadInOut' }).start();

        const left = btnNode.x - btnNode.width * 0.5;
        const realLeft = left + this.scroll.content.x;
        if (realLeft < 0) {
            cc.tween(this.scroll.content).by(0.3, { x: -realLeft }, { easing: 'quadInOut' }).start();
        } else {
            const right = btnNode.x + btnNode.width * 0.5;
            const realRight = right + this.scroll.content.x;
            if (realRight > 1080) {
                cc.tween(this.scroll.content)
                    .by(0.3, { x: 1080 - realRight }, { easing: 'quadInOut' })
                    .start();
            }
        }

        this.onSelection(idx);
    }
}
