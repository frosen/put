/*
 * CellProTtl.ts
 * 称号
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ProTtlModel } from '../../../../../scripts/DataModel';
import { ProTtl } from '../../../../../scripts/DataSaved';
import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellProTtl extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null!;

    @property(cc.Label)
    infoLbl: cc.Label = null!;

    setData(proTtl: ProTtl, proTtlModel: ProTtlModel) {
        if (typeof proTtlModel.cnName === 'string') this.nameLbl.string = proTtlModel.cnName;
        else this.nameLbl.string = proTtlModel.cnName(proTtl.data);

        if (typeof proTtlModel.info === 'string') this.infoLbl.string = proTtlModel.info;
        else this.infoLbl.string = proTtlModel.info(proTtl.data);
    }
}
