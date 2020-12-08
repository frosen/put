/*
 * CellProTtl.ts
 * 称号
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ProTtlModel } from '../../../../../scripts/DataModel';
import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellProTtl extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    infoLbl: cc.Label = null;

    setData(proTtlModel: ProTtlModel) {
        this.nameLbl.string = proTtlModel.cnName;
        this.infoLbl.string = proTtlModel.info;
    }
}
