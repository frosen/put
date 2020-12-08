/*
 * CellSelfBtn.ts
 * 个人列表中的按钮
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { PageSelf } from '../../../scripts/PageSelf';

@ccclass
export class CellSelfBtn extends ListViewCell {
    page: PageSelf;
}
