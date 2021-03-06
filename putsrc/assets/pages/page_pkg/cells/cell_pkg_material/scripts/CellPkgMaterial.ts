/*
 * CellPkgMaterial.ts
 * 道具列表中的材料项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { Material } from '../../../../../scripts/DataSaved';
import { MaterialModelDict } from '../../../../../configs/MaterialModelDict';
import { CellPkgCnsum } from '../../../scripts/CellPkgCnsum';
import { MaterialModel } from '../../../../../scripts/DataModel';
import { rerenderLbl } from '../../../../../scripts/Utils';

@ccclass
export class CellPkgMaterial extends CellPkgCnsum {
    @property(cc.Label)
    lvLbl: cc.Label = null!;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    setData(itemIdx: number, material: Material) {
        super.setData(itemIdx, material);
        const materialModel = MaterialModelDict[material.id];
        this.setModelData(materialModel);
        this.setCount(material.count);
    }

    setDataByModel(itemIdx: number, materialModel: MaterialModel, count: number) {
        super.setData(itemIdx, null);
        this.setModelData(materialModel);
        this.setCount(count);
    }

    setModelData(materialModel: MaterialModel) {
        this.nameLbl.string = materialModel.cnName;
        this.lvLbl.string = `[MaxL${materialModel.lvMax}]`;

        rerenderLbl(this.nameLbl);
        rerenderLbl(this.lvLbl);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
