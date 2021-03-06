/*
 * CellPkgEqpAmplr.ts
 * 道具列表中的装备强化石项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { EqpAmplr } from '../../../../../scripts/DataSaved';
import { EqpAmplrModelDict } from '../../../../../configs/EqpAmplrModelDict';
import { CellPkgCnsum } from '../../../scripts/CellPkgCnsum';
import { EqpAmplrModel } from '../../../../../scripts/DataModel';
import { rerenderLbl } from '../../../../../scripts/Utils';

@ccclass
export class CellPkgEqpAmplr extends CellPkgCnsum {
    @property(cc.Label)
    lvLbl: cc.Label = null!;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    setData(itemIdx: number, eqpAmplr: EqpAmplr) {
        super.setData(itemIdx, eqpAmplr);
        const eqpAmplrModel = EqpAmplrModelDict[eqpAmplr.id];
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

        rerenderLbl(this.nameLbl);
        rerenderLbl(this.lvLbl);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
