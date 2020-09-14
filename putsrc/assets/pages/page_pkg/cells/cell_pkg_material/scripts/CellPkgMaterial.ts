/*
 * CellPkgMaterial.ts
 * 道具列表中的材料项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgBase } from 'pages/page_pkg/scripts/CellPkgBase';
import { Material } from 'scripts/DataSaved';
import { materialModelDict } from 'configs/MaterialModelDict';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { MaterialModel } from 'scripts/DataModel';

@ccclass
export class CellPkgMaterial extends CellPkgCnsum {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    setData(itemIdx: number, material: Material) {
        super.setData(itemIdx, material);
        const materialModel = materialModelDict[material.id];
        this.setModelData(materialModel);
        this.setCount(material.count);
    }

    setDataByModel(itemIdx: number, materialModel: MaterialModel) {
        super.setData(itemIdx, null);
        this.setModelData(materialModel);
        this.setCount(-1);
    }

    setModelData(materialModel: MaterialModel) {
        this.nameLbl.string = materialModel.cnName;
        this.lvLbl.string = `[MaxL${materialModel.lvMax}]`;

        CellPkgBase.rerenderLbl(this.nameLbl);
        CellPkgBase.rerenderLbl(this.lvLbl);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
