/*
 * CellPkgDrink.ts
 * 道具列表中的饮品项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { Drink } from 'scripts/DataSaved';
import { DrinkAimType, DrinkModel } from 'scripts/DataModel';
import { drinkModelDict } from 'configs/DrinkModelDict';
import { AmplAttriNames } from 'scripts/DataOther';
import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';

@ccclass
export class CellPkgDrink extends CellPkgCnsum {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    mainAttri: cc.Label = null;

    @property(cc.Label)
    subAttri: cc.Label = null;

    @property(cc.Node)
    aimTypeNode: cc.Node = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    setData(itemIdx: number, drink: Drink) {
        super.setData(itemIdx, drink);
        let drinkModel = drinkModelDict[drink.id];
        this.setModelData(drinkModel);

        this.setCount(drink.count);
    }

    setDataByModel(itemIdx: number, drinkModel: DrinkModel) {
        super.setData(itemIdx, null);
        this.setModelData(drinkModel);
        this.setCount(-1);
    }

    setModelData(drinkModel: DrinkModel) {
        this.nameLbl.string = drinkModel.cnName;
        this.lvLbl.string = `[MaxL${drinkModel.lvMax}]`;

        CellPkgDrink.rerenderLbl(this.nameLbl);
        CellPkgDrink.rerenderLbl(this.lvLbl);

        this.mainAttri.string = `${AmplAttriNames[drinkModel.mainAttri]}+${drinkModel.mainPercent}%`;
        if (drinkModel.subAttri) {
            this.subAttri.string = `${AmplAttriNames[drinkModel.subAttri]}+${drinkModel.subPercent}%`;
            this.subAttri.node.parent.scaleX = 1;
        } else {
            this.subAttri.node.parent.scaleX = 0;
        }

        this.aimTypeNode.opacity = drinkModel.aim === DrinkAimType.all ? 255 : 0;

        CellPkgDrink.rerenderLbl(this.mainAttri);
        CellPkgDrink.rerenderLbl(this.subAttri);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
