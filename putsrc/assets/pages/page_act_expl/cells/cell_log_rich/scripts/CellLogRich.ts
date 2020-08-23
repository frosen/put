/*
 * CellLogRich.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellLogBase } from 'pages/page_act_expl/scripts/CellLogBase';
import { ExplLogData } from 'scripts/ExplUpdater';

@ccclass
export class CellLogRich extends CellLogBase {
    @property(cc.RichText)
    logLbl: cc.RichText = null;

    setData(data: ExplLogData) {
        let str = data.data;
        this.logLbl.string = str;
    }
}
