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

        const ctt = this.scroll.content;
        const left = btnNode.x - btnNode.width * 0.5;
        const realLeft = left + ctt.x;
        const right = btnNode.x + btnNode.width * 0.5;
        const realRight = right + ctt.x;

        if (idx === 0 || idx === this.lblNodes.length - 1) {
            if (realLeft < 0) {
                const aim = 0 - realLeft;
                cc.tween(ctt).by(0.3, { x: aim }, { easing: 'quadInOut' }).start();
            } else if (realRight > 1080) {
                const aim = 1080 - realRight;
                cc.tween(ctt).by(0.3, { x: aim }, { easing: 'quadInOut' }).start();
            }
        } else {
            if (realLeft < btnNode.width) {
                const aim = btnNode.width - realLeft;
                cc.tween(ctt).by(0.3, { x: aim }, { easing: 'quadInOut' }).start();
            } else if (realRight > 1080 - btnNode.width) {
                const aim = 1080 - btnNode.width - realRight;
                cc.tween(ctt).by(0.3, { x: aim }, { easing: 'quadInOut' }).start();
            }
        }

        this.onSelection(idx);
    }
}
