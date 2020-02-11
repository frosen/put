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

    ctrlr: BaseController = null;

    init(ctrlr: BaseController) {
        this.ctrlr = ctrlr;
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onGestureStarted.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onGestureMoved.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.onGestureEnd.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onGestureCancel.bind(this));
        // @ts-ignore
        this.node._touchListener.setSwallowTouches(false);

        this.readyX = this.mark.width + BACK_MARK_BUFFER;
    }

    onGestureStarted(event: cc.Event.EventTouch) {
        if (!this.ctrlr.backBtnActive || this.mark.getNumberOfRunningActions() > 0) return;
        this.touchId = event.getID();
        this.touchBeginX = event.getLocationX();
        this.mark.x = 0;
        this.mark.stopAllActions();
    }

    onGestureMoved(event: cc.Event.EventTouch) {
        if (!this.ctrlr.backBtnActive || this.mark.getNumberOfRunningActions() > 0) return;
        if (this.touchId === null || event.getID() != this.touchId) return;
        let curX = event.getLocationX();
        this.mark.x = Math.min(curX - this.touchBeginX, this.readyX);
    }

    onGestureEnd(event: cc.Event.EventTouch) {
        if (!this.ctrlr.backBtnActive || this.mark.getNumberOfRunningActions() > 0) return;
        this.touchId = null;
        if (this.mark.x >= this.readyX - 1) {
            this.gotoPop();
        }
        this.moveBack();
    }

    onGestureCancel(event: cc.Event.EventTouch) {
        if (!this.ctrlr.backBtnActive || this.mark.getNumberOfRunningActions() > 0) return;
        this.touchId = null;
        this.moveBack();
    }

    gotoPop() {
        this.ctrlr.popPage();
    }

    moveBack() {
        if (this.mark.x > 0) {
            cc.tween(this.mark)
                .to(0.25, { x: 0 }, { easing: 'quadOut' })
                .start();
        }
    }
}
