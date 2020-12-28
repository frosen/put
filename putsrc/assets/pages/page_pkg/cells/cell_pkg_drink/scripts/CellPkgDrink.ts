/*
 * CellPkgDrink.ts
 * 道具列表中的饮品项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { Drink } from '../../../../../scripts/DataSaved';
import { AmplAttriNames, DrinkModel } from '../../../../../scripts/DataModel';
import { DrinkModelDict } from '../../../../../configs/DrinkModelDict';
import { CellPkgCnsum } from '../../../scripts/CellPkgCnsum';
import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellPkgDrink extends CellPkgCnsum {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    mainAttri: cc.Label = null;

    @property(cc.Label)
    subAttri: cc.Label = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    setData(itemIdx: number, drink: Drink) {
        super.setData(itemIdx, drink);
        const drinkModel = DrinkModelDict[drink.id];
        this.setModelData(drinkModel);

        this.setCount(drink.count);
    }

    setDataByModel(itemIdx: number, drinkModel: DrinkModel, count: number) {
        super.setData(itemIdx, null);
        this.setModelData(drinkModel);
        this.setCount(count);
    }

    setModelData(drinkModel: DrinkModel) {
        this.nameLbl.string = drinkModel.cnName;
        this.lvLbl.string = `[MaxL${drinkModel.lvMax}]`;

        ListViewCell.rerenderLbl(this.nameLbl);
        ListViewCell.rerenderLbl(this.lvLbl);

        this.mainAttri.string = `${AmplAttriNames[drinkModel.mainAttri]}+${drinkModel.mainPercent}%`;
        if (drinkModel.subAttri) {
            this.subAttri.string = `${AmplAttriNames[drinkModel.subAttri]}+${drinkModel.subPercent}%`;
            this.subAttri.node.parent.scaleX = 1;
        } else {
            this.subAttri.node.parent.scaleX = 0;
        }

        ListViewCell.rerenderLbl(this.mainAttri);
        ListViewCell.rerenderLbl(this.subAttri);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
