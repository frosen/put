/*
 * TouchLayer.ts
 * 触摸控制
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { BaseCtrlr } from './BaseCtrlr';

const BACK_MARK_BUFFER: number = 50;

@ccclass
export class TouchLayer extends cc.Component {
    @property(cc.Node)
    mark: cc.Node = null;

    touchId: number = null;
    lastX: number;
    lastY: number;
    startedX: number;

    readyX: number;

    ctrlr: BaseCtrlr = null;

    init(ctrlr: BaseCtrlr) {
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
        const navBar = this.ctrlr.getCurPage().navBar;
        if (!navBar || !navBar.backBtnActive || this.mark.getNumberOfRunningActions() > 0) {
            this.touchId = null;
            return;
        }
        this.touchId = event.getID();
        this.lastX = event.getLocationX();
        this.lastY = event.getLocationY();
        this.startedX = this.lastX;
        this.mark.x = 0;
        this.mark.stopAllActions();
    }

    onGestureMoved(event: cc.Event.EventTouch) {
        if (this.touchId === null || event.getID() !== this.touchId) return;
        const curX = event.getLocationX();
        const curY = event.getLocationY();
        if (Math.abs(curY - this.lastY) > Math.abs(curX - this.lastX)) {
            this.touchId = null;
            return;
        }
        this.mark.x = Math.min(curX - this.startedX, this.readyX);
    }

    onGestureEnd(event: cc.Event.EventTouch) {
        if (this.touchId === null || event.getID() !== this.touchId) return;
        this.touchId = null;
        if (this.mark.x >= this.readyX - 1) this.goBack();
        this.moveBack();
    }

    onGestureCancel(event: cc.Event.EventTouch) {
        if (this.touchId === null || event.getID() !== this.touchId) return;
        this.touchId = null;
        this.moveBack();
    }

    goBack() {
        const navBar = this.ctrlr.getCurPage().navBar;
        navBar.onClickBack();
    }

    moveBack() {
        if (this.mark.x > 0) {
            cc.tween(this.mark).to(0.25, { x: 0 }, { easing: 'quadOut' }).start();
        }
    }
}
