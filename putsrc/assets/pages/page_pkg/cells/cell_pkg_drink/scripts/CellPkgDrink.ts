/*
 * CellPkgDrink.ts
 * 道具列表中的饮品项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgBase } from 'pages/page_pkg/scripts/CellPkgBase';
import { Drink } from 'scripts/DataSaved';
import { DrinkAimType } from 'scripts/DataModel';
import { drinkModelDict } from 'configs/DrinkModelDict';
import { AmplAttriNames } from 'scripts/DataOther';

@ccclass
export class CellPkgDrink extends CellPkgBase {
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

    @property(cc.Label)
    countLbl: cc.Label = null;

    setData(itemIdx: number, drink: Drink) {
        super.setData(itemIdx, drink);
        let drinkModel = drinkModelDict[drink.id];

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

        this.aimTypeNode.opacity = drinkModel.aim == DrinkAimType.all ? 255 : 0;

        CellPkgDrink.rerenderLbl(this.mainAttri);
        CellPkgDrink.rerenderLbl(this.subAttri);

        this.countLbl.string = 'x ' + String(drink.count);

        for (const layout of this.layouts) layout.updateLayout();
    }
}
