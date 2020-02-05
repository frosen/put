/*
 * TempLabel.ts
 * 背景色模板
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class TempLabel extends cc.Component {
    onLoad() {
        this.node.color = cc.Color.BLACK;
    }
}
