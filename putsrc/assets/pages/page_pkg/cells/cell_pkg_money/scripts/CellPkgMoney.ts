/*
 * CellPkgMoney.ts
 * 道具列表中的钱项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';
import { Money } from 'scripts/DataSaved';
import { MoneyTool } from 'scripts/Memory';

@ccclass
export class CellPkgMoney extends ListViewCell {
    @property(cc.Label)
    countLbl: cc.Label = null;

    setData(idx: number, money: Money) {
        this.countLbl.string = MoneyTool.getStr(money.sum);
    }
}
