/*
 * FuncBar.ts
 * 功能条
 * luleyan
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class FuncBar extends cc.Component {
    @property([cc.Node])
    btns: cc.Node[] = [];

    @property([cc.Label])
    lbls: cc.Label[] = [];

    @property([cc.Node])
    baffles: cc.Node[] = [];

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Node)
    arrow: cc.Node = null;

    @property(cc.Node)
    funcBarNode: cc.Node = null;

    funcBarShowIdx: number = -1;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.hideFuncBar, this);
        // @ts-ignore
        this.node._touchListener.setSwallowTouches(false);

        this.funcBarNode.opacity = 0;
        this.funcBarNode.y = 9999;
    }

    setBtns(datas: { str: string; callback: (cellIdx: number) => void }[]) {
        let len = datas.length;
        let begin = this.btns.length - len;
        for (let index = 0; index < this.btns.length; index++) {
            let btn = this.btns[index];
            let lbl = this.lbls[index];
            let baffle = this.baffles[index];
            if (index < begin) {
                btn.scaleX = 0;
                if (baffle) baffle.scaleX = 0;
            } else {
                let dataIdx = index - begin;
                let data = datas[dataIdx];

                btn.scaleX = 1;
                lbl.string = data.str;
                btn.on('click', () => {
                    if (this.funcBarShowIdx < 0) return;
                    data.callback(this.funcBarShowIdx);
                    this.hideFuncBar();
                });
                if (baffle) baffle.scaleX = 1;
            }
        }

        this.bg.width = len * this.btns[0].width + (len - 1) * this.baffles[0].width;
    }

    showFuncBar(cellIdx: number, cellNode: cc.Node) {
        this.funcBarShowIdx = cellIdx;
        let wp = cellNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let realY = cc.v2(this.node.convertToNodeSpaceAR(wp)).y;

        realY -= 85;

        let changeBar = () => {
            this.funcBarNode.y = realY;
            let atBottom = this.funcBarShowIdx < 5;
            this.arrow.scaleY = atBottom ? 1 : -1;
            this.bg.y = atBottom ? -90 : 90;
        };

        this.funcBarNode.stopAllActions();
        if (this.funcBarShowIdx >= 0) {
            cc.tween(this.funcBarNode).to(0.1, { opacity: 0 }).call(changeBar).to(0.1, { opacity: 255 }).start();
        } else {
            changeBar();
            this.funcBarNode.opacity = 0;
            cc.tween(this.funcBarNode).to(0.1, { opacity: 255 }).start();
        }
    }

    hideFuncBar() {
        if (this.funcBarShowIdx >= 0) {
            this.funcBarShowIdx = -1;

            this.funcBarNode.stopAllActions();
            cc.tween(this.funcBarNode).to(0.1, { opacity: 0 }).set({ y: 9999 }).start();
        }
    }
}
