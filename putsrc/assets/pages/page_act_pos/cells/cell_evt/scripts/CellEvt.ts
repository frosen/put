/*
 * CellEvt.ts
 * 位置列表中的事件项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass('EvtUI')
export class EvtUI {
    @property(cc.Button) btn: cc.Button = null;
    @property(cc.Sprite) icon: cc.Sprite = null;

    @property(cc.Label) name: cc.Label = null;
    @property(cc.Label) lv: cc.Label = null;
    @property(cc.Label) info: cc.Label = null;
}

@ccclass
export class CellEvt extends ListViewCell {
    @property(EvtUI) evtUI1: EvtUI = null;
    @property(EvtUI) evtUI2: EvtUI = null;

    clickCallback!: (evtId: string) => void;

    evtId1!: string;
    evtId2?: string;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.evtUI1.btn.node.on('click', this.callback1.bind(this));
        this.evtUI2.btn.node.on('click', this.callback2.bind(this));

        this.evtUI2.btn.node.opacity = 0;
        this.evtUI2.btn.node.scaleX = 0;
    }

    setEvt1(evtId: string) {
        this.evtId1 = evtId;
        this.setEvtUI(this.evtUI1, this.evtId1);
    }

    setEvt2(evtId?: string) {
        if (!evtId) {
            this.evtUI2.btn.node.opacity = 0;
            this.evtUI2.btn.node.scaleX = 0;
            this.evtId2 = undefined;
        } else {
            this.evtUI2.btn.node.opacity = 255;
            this.evtUI2.btn.node.scaleX = 1;
            this.evtId2 = evtId;
            this.setEvtUI(this.evtUI2, this.evtId2);
        }
    }

    setEvtUI(evtUI: EvtUI, evtId: string) {}

    callback1() {
        this.clickCallback(this.evtId1);
    }

    callback2() {
        if (this.evtId2) this.clickCallback(this.evtId2);
    }
}
