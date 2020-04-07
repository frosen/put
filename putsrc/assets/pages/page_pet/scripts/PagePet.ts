/*
 * PagePet.ts
 * 宠物列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PagePetLVD from './PagePetLVD';

@ccclass
export default class PagePet extends PageBase {
    dirtyToken: number = 0;

    @property(cc.Node)
    funcBarNode: cc.Node = null;

    @property(cc.Node)
    touchLayer: cc.Node = null;

    funcBarShowIdx: number = -1;

    onInit() {
        this.getComponent(PagePetLVD).page = this;

        this.funcBarNode.opacity = 0;
        this.funcBarNode.y = 9999;

        this.touchLayer.on(cc.Node.EventType.TOUCH_START, this.onClickTouchLayer, this);

        // @ts-ignore
        this.touchLayer._touchListener.setSwallowTouches(false);
    }

    onPageShow() {
        this.ctrlr.setTitle('宠物');

        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.dirtyToken != curDirtyToken) {
            this.dirtyToken = curDirtyToken;
            this.getComponentInChildren(ListView).resetContent(true);
        }
    }

    showFuncBar(cellIdx: number, cellNode: cc.Node) {
        this.funcBarShowIdx = cellIdx;
        let wp = cellNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let realY = cc.v2(this.node.convertToNodeSpaceAR(wp)).y;

        realY -= 85;

        let changeBar = () => {
            this.funcBarNode.y = realY;
        };

        this.funcBarNode.stopAllActions();
        if (this.funcBarShowIdx >= 0) {
            cc.tween(this.funcBarNode)
                .to(0.1, { opacity: 0 })
                .call(changeBar)
                .to(0.1, { opacity: 255 })
                .start();
        } else {
            changeBar();
            this.funcBarNode.opacity = 0;
            cc.tween(this.funcBarNode)
                .to(0.1, { opacity: 255 })
                .start();
        }
    }

    onClickTouchLayer() {
        if (this.funcBarShowIdx >= 0) {
            this.funcBarShowIdx = -1;

            this.funcBarNode.stopAllActions();
            cc.tween(this.funcBarNode)
                .to(0.1, { opacity: 0 })
                .set({ y: 9999 })
                .start();
        }
    }
}
