/*
 * CellPsgeOwn.ts
 * 需要拥有某个事物才能继续
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { EvtModelDict } from '../../../../../configs/EvtModelDict';
import { ProTtlModelDict } from '../../../../../configs/ProTtlModelDict';
import { OwnPsge } from '../../../../../scripts/DataModel';
import { Evt, EvtRztV } from '../../../../../scripts/DataSaved';
import { CellPsgeBase } from '../../../scripts/CellPsgeBase';
import { PSBColor, PSBGray } from '../../cell_psge_selection/scripts/PsgeSelectionBtn';

@ccclass
export class CellPsgeOwn extends CellPsgeBase {
    @property(cc.Label)
    lbl: cc.Label = null!;

    @property(cc.Button)
    btn: cc.Button = null!;

    clickCallback?: (cell: CellPsgeOwn) => void;

    onLoad() {
        if (CC_EDITOR) return;
        this.btn.node.on('click', this.onClick.bind(this));
    }

    setData(oPsge: OwnPsge, curEvt: Evt) {
        const needTtlId = oPsge.ttlId;
        const model = ProTtlModelDict[needTtlId];
        this.lbl.string = '需要拥有称号：' + model.cnName;

        if (curEvt.rztDict[needTtlId] === EvtRztV.done) {
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
