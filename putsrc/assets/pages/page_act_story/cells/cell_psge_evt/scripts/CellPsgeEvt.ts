/*
 * CellPsgeEvt.ts
 * 需要某个事件到达一定程度才能继续的段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { EvtModelDict } from '../../../../../configs/EvtModelDict';
import { EvtPsge } from '../../../../../scripts/DataModel';
import { Evt, EvtRztV } from '../../../../../scripts/DataSaved';
import { CellPsgeBase } from '../../../scripts/CellPsgeBase';
import { PSBColor, PSBGray } from '../../cell_psge_selection/scripts/PsgeSelectionBtn';

@ccclass
export class CellPsgeEvt extends CellPsgeBase {
    @property(cc.Label)
    lbl: cc.Label = null!;

    @property(cc.Button)
    btn: cc.Button = null!;

    clickCallback?: (cell: CellPsgeEvt) => void;

    onLoad() {
        if (CC_EDITOR) return;
        this.btn.node.on('click', this.onClick.bind(this));
    }

    setData(evtPsge: EvtPsge, curEvt: Evt) {
        const needEvtId = evtPsge.evtId;
        const model = EvtModelDict[needEvtId];
        this.lbl.string = '需要完成事件：' + model.cnName;

        if (curEvt.rztDict[needEvtId] === EvtRztV.done) {
            this.btn.interactable = false;
            this.lbl.node.color = PSBGray;
        } else {
            this.btn.interactable = true;
            this.lbl.node.color = PSBColor;
        }
    }

    onClick() {
        if (this.clickCallback) this.clickCallback(this);
    }
}
