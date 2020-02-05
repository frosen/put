/*
 * CellAttri2.ts
 * 属性项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';

@ccclass
export default class CellAttri2 extends ListViewCell {
    @property(cc.Label)
    key1: cc.Label = null;

    @property(cc.Label)
    key2: cc.Label = null;

    @property(cc.Label)
    value1: cc.Label = null;

    @property(cc.Label)
    value2: cc.Label = null;

    setData1(key: string, value: string) {
        this.key1.string = key;
        this.value1.string = value;
    }

    setData2(key: string, value: string) {
        this.key2.string = key;
        this.value2.string = value;
    }
}
