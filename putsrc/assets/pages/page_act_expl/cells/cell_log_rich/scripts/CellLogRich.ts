/*
 * CellLogRich.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ExplLogData } from '../../../../../scripts/ExplUpdater';
import { CellLogBase } from '../../../scripts/CellLogBase';

@ccclass
export class CellLogRich extends CellLogBase {
    @property(cc.RichText)
    logLbl: cc.RichText = null;

    setData(data: ExplLogData) {
        const str = data.data;
        this.logLbl.string = str;
    }
}
