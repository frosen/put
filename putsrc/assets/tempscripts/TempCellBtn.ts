/*
 * TempCellBtn.ts
 * 项目按钮样式
 * luleyan
 */

const { ccclass, property, requireComponent } = cc._decorator;

import { TempBase } from '../scripts/TempBase';

@ccclass
@requireComponent(cc.Button)
export class TempCellBtn extends TempBase {
    handleTemp() {
        const btn = this.getComponent(cc.Button);
        btn.transition = cc.Button.Transition.COLOR;
        btn.normalColor = btn.node.color;
        btn.pressedColor = cc.color(225, 225, 225);
        btn.hoverColor = cc.color(210, 210, 210);
        btn.disabledColor = btn.node.color;
        btn.duration = 0.2;
    }
}
