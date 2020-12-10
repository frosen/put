/*
 * TempSubLabel.ts
 * 次级文本模板
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { TempBase } from '../scripts/TempBase';

@ccclass
export class TempLabel extends TempBase {
    handleTemp() {
        this.node.color = cc.color(120, 120, 120);
    }
}
