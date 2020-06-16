/*
 * TempBG.ts
 * 背景色模板
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { TempBase } from 'scripts/TempBase';

enum BGType {
    cell = 1,
    page
}

@ccclass
export class TempBG extends TempBase {
    @property({
        type: cc.Enum(BGType)
    })
    type: BGType = BGType.cell;

    handleTemp() {
        this.node.color = this.type == BGType.cell ? cc.Color.WHITE : cc.color(240, 240, 240);
    }
}
