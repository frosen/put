/*
 * CellPkgDrink.ts
 * 道具列表中的装备项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { Drink } from 'scripts/DataSaved';
import { DrinkAimType } from 'scripts/DataModel';
import { drinkModels } from 'configs/DrinkModels';
import { AmplAttriNames } from 'scripts/DataOther';

@ccclass
export class CellPkgDrink extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    mainAttri: cc.Label = null;

    @property(cc.Label)
    subAttri: cc.Label = null;

    @property(cc.Node)
    aimTypeNode: cc.Node = null;

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    @property(cc.Label)
    countLbl: cc.Label = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    curItemIdx: number = -1;

    clickCallback: (cell: CellPkgDrink) => void = null;
    funcBtnCallback: (cell: CellPkgDrink) => void = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(itemIdx: number, drink: Drink) {
        this.curItemIdx = itemIdx;
        let drinkModel = drinkModels[drink.id];

        this.nameLbl.string = drinkModel.cnName;
        this.lvLbl.string = `[MaxL${drinkModel.lv}]`;

        this.mainAttri.string = AmplAttriNames[drinkModel.mainAttri] + String(drinkModel.mainPercent);
        if (drinkModel.subAttri) {
            this.subAttri.string = AmplAttriNames[drinkModel.subAttri] + String(drinkModel.subPercent);
            this.subAttri.node.parent.scaleX = 1;
        } else {
            this.subAttri.node.parent.scaleX = 0;
        }

        this.aimTypeNode.opacity = drinkModel.aim == DrinkAimType.all ? 255 : 0;

        this.countLbl.string = 'x ' + String(drink.count);
    }

    onClick() {
        cc.log('PUT click drink cell: ', this.curCellIdx, this.curItemIdx);
        if (this.clickCallback) this.clickCallback(this);
    }

    onClickFuncBtn() {
        cc.log('PUT show drink cell func: ', this.curCellIdx, this.curItemIdx);
        if (this.funcBtnCallback) this.funcBtnCallback(this);
    }
}
