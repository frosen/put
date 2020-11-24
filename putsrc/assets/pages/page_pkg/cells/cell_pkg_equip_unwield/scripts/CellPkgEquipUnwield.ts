/*
 * CellPkgEquipUnwield.ts
 * 卸下装备
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellPkgEquipUnwield extends ListViewCell {
    clickCallback: (cell: CellPkgEquipUnwield) => void = null;
    onClick() {
        if (this.clickCallback) this.clickCallback(this);
    }
}
