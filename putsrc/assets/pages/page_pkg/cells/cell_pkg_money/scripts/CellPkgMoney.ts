/*
 * CellPkgMoney.ts
 * 道具列表中的钱项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';
import { Money } from 'scripts/DataSaved';

@ccclass
export class CellPkgMoney extends ListViewCell {
    @property(cc.Label)
    countLbl: cc.Label = null;

    setData(idx: number, money: Money) {
        let count = money.sum;
        let zuan = Math.floor(count / 1000000);
        let zuanStr = zuan > 0 ? String(zuan) + '钻' : '';

        count %= 1000000;
        let jing = Math.floor(count / 1000);
        let jingStr = jing > 0 ? '  ' + String(jing) + '晶' : '';

        let kuai = count % 1000;
        let kuaiStr = kuai > 0 || (zuan == 0 && jing == 0) ? '  ' + String(kuai) + '块' : '';

        this.countLbl.string = zuanStr + jingStr + kuaiStr;
    }
}
