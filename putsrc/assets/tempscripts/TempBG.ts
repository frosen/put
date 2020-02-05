/*
 * TempBG.ts
 * 背景色模板
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class TempBG extends cc.Component {
    onLoad() {
        this.node.color = cc.Color.WHITE;
    }
}
