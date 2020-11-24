/*
 * TempLvLabel.ts
 * 次级文本模板
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { TempBase } from '../scripts/TempBase';

@ccclass
export class TempLvLabel extends TempBase {
    handleTemp() {
        this.node.color = cc.color(255, 185, 0);
    }
}
