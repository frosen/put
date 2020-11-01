/*
 * TouchLayerForToast.ts
 * 触摸控制，toast只有点击过屏幕后，才会消失
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { BaseCtrlr } from './BaseCtrlr';

@ccclass
export class TouchLayerForToast extends cc.Component {
    ctrlr: BaseCtrlr = null;

    init(ctrlr: BaseCtrlr) {
        this.ctrlr = ctrlr;
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onGestureStarted.bind(this));
        // @ts-ignore
        this.node._touchListener.setSwallowTouches(false);
    }

    onGestureStarted(event: cc.Event.EventTouch) {
        this.ctrlr.goReadyToEndToast();
    }
}
