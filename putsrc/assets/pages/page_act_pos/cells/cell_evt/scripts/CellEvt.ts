/*
 * CellEvt.ts
 * 位置列表中的事件项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { EvtModel } from '../../../../../scripts/DataModel';
import { Evt } from '../../../../../scripts/DataSaved';

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

    clickCallback: (evt: Evt, evtModel: EvtModel) => void = null;

    evtData1: { evt: Evt; evtModel: EvtModel } = null;
    evtData2: { evt: Evt; evtModel: EvtModel } = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.evtUI1.btn.node.on('click', this.callback1.bind(this));
        this.evtUI2.btn.node.on('click', this.callback2.bind(this));

        this.evtUI2.btn.node.opacity = 0;
        this.evtUI2.btn.node.scaleX = 0;
    }

    setEvt1(evt: Evt, evtModel: EvtModel) {
        this.evtData1 = { evt, evtModel };
    }

    setEvt2(evt: Evt, evtModel: EvtModel) {
        if (!evt) {
            this.evtUI2.btn.node.opacity = 0;
            this.evtUI2.btn.node.scaleX = 0;
            this.evtData2 = null;
        } else {
            this.evtUI2.btn.node.opacity = 255;
            this.evtUI2.btn.node.scaleX = 1;
            this.evtData2 = { evt, evtModel };
        }
    }

    callback1() {
        if (this.evtData1) this.clickCallback(this.evtData1.evt, this.evtData1.evtModel);
    }

    callback2() {
        if (this.evtData2) this.clickCallback(this.evtData2.evt, this.evtData2.evtModel);
    }
}
