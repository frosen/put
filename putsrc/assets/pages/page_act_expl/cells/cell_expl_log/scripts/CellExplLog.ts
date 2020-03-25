/*
 * CellExplLog.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';

@ccclass
export default class CellExplLog extends ListViewCell {
    @property(cc.RichText)
    logLbl: cc.RichText = null;

    setData(str: string) {
        this.logLbl.string = str;
    }
}
