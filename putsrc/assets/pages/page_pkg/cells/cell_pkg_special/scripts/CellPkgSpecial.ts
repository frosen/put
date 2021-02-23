/*
 * CellPkgSpecial.ts
 * 道具列表中的特殊项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { SpcModelDict } from '../../../../../configs/SpcModelDict';
import { SpcModel } from '../../../../../scripts/DataModel';
import { Special } from '../../../../../scripts/DataSaved';
import { CellPkgCnsum } from '../../../scripts/CellPkgCnsum';

@ccclass
export class CellPkgSpecial extends CellPkgCnsum {
    @property(cc.Label)
    detail: cc.Label = null!;

    setData(itemIdx: number, spc: Special) {
        super.setData(itemIdx, spc);

        const spcModel = SpcModelDict[spc.id];
        this.setModelData(spcModel);

        this.setCount(spc.count);
    }

    setDataByModel(itemIdx: number, spcModel: SpcModel, count: number) {
        super.setData(itemIdx, null);
        this.setModelData(spcModel);
        this.setCount(count);
    }

    setModelData(spcModel: SpcModel) {
        this.nameLbl.string = spcModel.cnName;
        this.detail.string = spcModel.tip;
    }
}
