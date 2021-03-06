/*
 * CellLogBase.ts
 * 探索日志基类
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../scripts/ListViewCell';
import { ExplLogData } from '../../../scripts/ExplUpdater';
import { PageActExplLVD } from './PageActExplLVD';

@ccclass
export class CellLogBase extends ListViewCell {
    lvd!: PageActExplLVD;

    init(lvd: PageActExplLVD) {
        this.lvd = lvd;
    }

    setData(data: ExplLogData) {}
}
