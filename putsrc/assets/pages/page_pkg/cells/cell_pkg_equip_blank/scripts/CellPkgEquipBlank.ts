/*
 * CellPkgEquipBlank.ts
 * 无装备的占位cell
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellPkgEquipBlank extends ListViewCell {
    clickCallback: (cell: CellPkgEquipBlank) => void = null;
    onClick() {
        if (this.clickCallback) this.clickCallback(this);
    }
}
