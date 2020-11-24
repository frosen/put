/*
 * CellLogRepeat.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ExplLogData } from '../../../../../scripts/ExplUpdater';
import { CellLogBase } from '../../../scripts/CellLogBase';

@ccclass
export class CellLogRepeat extends CellLogBase {
    @property(cc.Sprite)
    logSp: cc.Sprite = null;

    setData(data: ExplLogData) {
        const str = data.data;
        this.lvd.setSpByString(this.logSp, str);
    }
}
