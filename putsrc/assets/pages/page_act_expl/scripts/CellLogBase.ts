/*
 * CellLogBase.ts
 * 探索日志基类
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';
import { PageActExplLVD } from './PageActExplLVD';
import { ExplLogData } from 'scripts/ExplUpdater';

@ccclass
export class CellLogBase extends ListViewCell {
    checkBake() {}

    lvd: PageActExplLVD = null;

    init(lvd: PageActExplLVD) {
        this.lvd = lvd;
    }

    setData(data: ExplLogData) {}
}