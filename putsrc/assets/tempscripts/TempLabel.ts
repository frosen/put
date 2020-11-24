/*
 * TempLabel.ts
 * 文本模板
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { TempBase } from '../scripts/TempBase';

@ccclass
export class TempLabel extends TempBase {
    handleTemp() {
        this.node.color = cc.Color.BLACK;
    }
}
