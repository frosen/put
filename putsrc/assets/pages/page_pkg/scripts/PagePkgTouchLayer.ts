/*
 * PagePkgTouchLayer.ts
 * 左右滑动层
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PagePkg } from './PagePkg';

const MOVE_DIS: number = 200;

@ccclass
export class PagePkgTouchLayer extends cc.Component {
    touchId: number = null;
    lastX: number;
    lastY: number;
    startedX: number;

    ctrlr: PagePkg;
    init(ctrlr: PagePkg) {
        this.ctrlr = ctrlr;
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onGestureStarted.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onGestureMoved.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.onGestureEnd.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onGestureCancel.bind(this));
        // @ts-ignore
        this.node._touchListener.setSwallowTouches(false);
    }

    onGestureStarted(event: cc.Event.EventTouch) {
        this.touchId = event.getID();
        this.lastX = event.getLocationX();
        this.lastY = event.getLocationY();
        this.startedX = this.lastX;
    }

    onGestureMoved(event: cc.Event.EventTouch) {
        if (this.touchId === null || event.getID() !== this.touchId) return;
        let curX = event.getLocationX();
        let curY = event.getLocationY();
        if (Math.abs(curY - this.lastY) > Math.abs(curX - this.lastX)) {
            this.touchId = null;
        }
    }

    onGestureEnd(event: cc.Event.EventTouch) {
        if (this.touchId === null || event.getID() !== this.touchId) return;
        this.touchId = null;

        let curX = event.getLocationX();
        if (curX < this.startedX - MOVE_DIS) {
            this.goRight();
        } else if (this.startedX + MOVE_DIS < curX) {
            this.goLeft();
        }
    }

    onGestureCancel(event: cc.Event.EventTouch) {
        if (this.touchId === null || event.getID() !== this.touchId) return;
        this.touchId = null;
    }

    goLeft() {
        this.ctrlr.moveList(-1);
    }

    goRight() {
        this.ctrlr.moveList(1);
    }
}
