/*
 * TempBase.ts
 * 模板基类
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export class TempBase extends cc.Component {
    onLoad() {
        this.handleTemp();
    }

    update() {
        if (CC_EDITOR) this.handleTemp();
    }

    handleTemp() {}
}
