/*
 * CellPkgEqpAmplr.ts
 * 道具列表中的装备强化石项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { EqpAmplr } from '../../../../../scripts/DataSaved';
import { eqpAmplrModelDict } from '../../../../../configs/EqpAmplrModelDict';
import { CellPkgCnsum } from '../../../scripts/CellPkgCnsum';
import { EqpAmplrModel } from '../../../../../scripts/DataModel';
import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellPkgEqpAmplr extends CellPkgCnsum {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    setData(itemIdx: number, eqpAmplr: EqpAmplr) {
        super.setData(itemIdx, eqpAmplr);
        const eqpAmplrModel = eqpAmplrModelDict[eqpAmplr.id];
        this.setModelData(eqpAmplrModel);

        this.setCount(eqpAmplr.count);
    }

    setDataByModel(itemIdx: number, eqpAmplrModel: EqpAmplrModel, count: number) {
        super.setData(itemIdx, null);
        this.setModelData(eqpAmplrModel);
        this.setCount(count);
    }

    setModelData(eqpAmplrModel: EqpAmplrModel) {
        this.nameLbl.string = eqpAmplrModel.cnName;
        this.lvLbl.string = `[MaxL${eqpAmplrModel.lvMax}]`;

        ListViewCell.rerenderLbl(this.nameLbl);
        ListViewCell.rerenderLbl(this.lvLbl);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
