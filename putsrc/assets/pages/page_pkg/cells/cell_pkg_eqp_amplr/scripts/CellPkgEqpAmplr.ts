/*
 * CellPkgEqpAmplr.ts
 * 道具列表中的装备强化石项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgBase } from 'pages/page_pkg/scripts/CellPkgBase';
import { EqpAmplr } from 'scripts/DataSaved';
import { eqpAmplrModelDict } from 'configs/EqpAmplrModelDict';

@ccclass
export class CellPkgEqpAmplr extends CellPkgBase {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    @property(cc.Label)
    countLbl: cc.Label = null;

    setData(itemIdx: number, eqpAmplr: EqpAmplr) {
        super.setData(itemIdx, eqpAmplr);
        let eqpAmplrModel = eqpAmplrModelDict[eqpAmplr.id];

        this.nameLbl.string = eqpAmplrModel.cnName;
        this.lvLbl.string = `[MaxL${eqpAmplrModel.lvMax}]`;

        CellPkgBase.rerenderLbl(this.nameLbl);
        CellPkgBase.rerenderLbl(this.lvLbl);

        this.countLbl.string = 'x ' + String(eqpAmplr.count);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
