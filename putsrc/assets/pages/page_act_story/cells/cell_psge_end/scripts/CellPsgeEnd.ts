/*
 * CellPsgeEnd.ts
 * 结尾
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPsgeBase } from '../../../scripts/CellPsgeBase';
import { EndPsge } from '../../../../../scripts/DataModel';
import { EvtModelDict } from '../../../../../configs/EvtModelDict';

@ccclass
export class CellPsgeEnd extends CellPsgeBase {
    @property(cc.Label)
    lbl: cc.Label = null!;

    curEvtName!: string;
    tip?: string;

    clickCallback?: (cell: CellPsgeEnd) => void;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    setEvtName(name: string) {
        this.curEvtName = name;
    }

    setData(endPsge: EndPsge) {
        if (endPsge.evtId) {
            const model = EvtModelDict[endPsge.evtId];
            this.lbl.string = `${this.curEvtName} 完成\n请前往下一事件：${model.cnName}`;
        } else {
            this.lbl.string = `${this.curEvtName} 完成`;
        }

        this.tip = endPsge.tip;
    }

    onClick() {
        if (this.clickCallback) this.clickCallback(this);
    }
}
