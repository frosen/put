/*
 * CellLogRepeat.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellLogBase } from 'pages/page_act_expl/scripts/CellLogBase';
import { ExplLogData } from 'scripts/ExplUpdater';

@ccclass
export class CellLogRepeat extends CellLogBase {
    @property(cc.Sprite)
    logSp: cc.Sprite = null;

    setData(data: ExplLogData) {
        const str = data.data;
        this.lvd.setSpByString(this.logSp, str);
    }
}
