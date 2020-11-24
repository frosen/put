/*
 * CellPkgCnsum.ts
 * 道具列表中的饮品项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgBase } from './CellPkgBase';
import { CnsumModel } from '../../../scripts/DataModel';

@ccclass
export class CellPkgCnsum extends CellPkgBase {
    @property(cc.Label)
    countLbl: cc.Label = null;

    setDataByModel(itemIdx: number, model: CnsumModel, count: number) {}

    setCount(count: number) {
        if (count >= 0) this.countLbl.string = 'x ' + String(count);
        else this.countLbl.string = 'x MAX';
    }
}
