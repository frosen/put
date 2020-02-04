/*
 * TouchLayer.ts
 * 触摸控制
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { BaseController } from './BaseController';

const BACK_MARK_BUFFER: number = 50;

@ccclass
export default class TouchLayer extends cc.Component {
    @property(cc.Node)
    mark: cc.Node = null;

    touchId: number = null;
    touchBeginX: number = 0;

    readyX: number = 0;
    popReady: boolean = false;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onGestureStarted.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onGestureMoved.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.onGestureEnd.bind(this));
        // @ts-ignore
        this.node._touchListener.setSwallowTouches(false);

        this.readyX = this.mark.width + BACK_MARK_BUFFER;
    }

    onGestureStarted(event: cc.Event.EventTouch) {
        if (this.mark.getNumberOfRunningActions() > 0) return;
        this.touchId = event.getID();
        this.touchBeginX = event.getLocationX();
        this.mark.x = 0;
        this.mark.stopAllActions();
    }

    onGestureMoved(event: cc.Event.EventTouch) {
        if (this.mark.getNumberOfRunningActions() > 0) return;
        if (this.touchId === null || event.getID() != this.touchId) return;
        let curX = event.getLocationX();
        let curDis = curX - this.touchBeginX;
        this.mark.x = curDis;
        if (curDis >= this.readyX) {
            this.mark.x = this.readyX;
            this.popReady = true;
        }
    }

    onGestureEnd(event: cc.Event.EventTouch) {
        if (this.mark.getNumberOfRunningActions() > 0) return;
        this.touchId = null;
        if (this.popReady) {
            this.popReady = false;
            this.gotoPop();
        }
        if (this.mark.x > 0) {
            cc.tween(this.mark)
                .to(0.25, { x: 0 }, { easing: 'quadOut' })
                .start();
        }
    }

    gotoPop() {
        cc.director
            .getScene()
            .getComponentInChildren(BaseController)
            .popPage();
    }
}
