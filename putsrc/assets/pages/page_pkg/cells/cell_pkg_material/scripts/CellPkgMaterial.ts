/*
 * CellPkgMaterial.ts
 * 道具列表中的材料项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgBase } from 'pages/page_pkg/scripts/CellPkgBase';
import { Material } from 'scripts/DataSaved';
import { materialModelDict } from 'configs/MaterialModelDict';

@ccclass
export class CellPkgMaterial extends CellPkgBase {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    @property(cc.Label)
    countLbl: cc.Label = null;

    setData(itemIdx: number, material: Material) {
        super.setData(itemIdx, material);
        let eqpAmplrModel = materialModelDict[material.id];

        this.nameLbl.string = eqpAmplrModel.cnName;
        this.lvLbl.string = `[MaxL${eqpAmplrModel.lvMax}]`;

        CellPkgBase.rerenderLbl(this.nameLbl);
        CellPkgBase.rerenderLbl(this.lvLbl);

        this.countLbl.string = 'x ' + String(material.count);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
