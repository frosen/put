/*
 * CellPosInfo.ts
 * 位置列表中的信息项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';

@ccclass
export default class CellPosInfo extends ListViewCell {
    @property(cc.Label)
    posName: cc.Label = null;

    setData(posName: string) {
        this.posName.string = posName;
    }
}
