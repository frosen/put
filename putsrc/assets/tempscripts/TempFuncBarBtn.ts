/*
 * TempFuncBarBtn.ts
 * 空能条按钮样式
 * luleyan
 */

const { ccclass, property, requireComponent } = cc._decorator;

import { TempBase } from 'scripts/TempBase';

@ccclass
@requireComponent(cc.Button)
export class TempFuncBarBtn extends TempBase {
    handleTemp() {
        let btn = this.getComponent(cc.Button);
        btn.transition = cc.Button.Transition.COLOR;
        btn.normalColor = cc.Color.WHITE;
        btn.pressedColor = cc.color(243, 188, 71);
        btn.hoverColor = cc.color(210, 210, 210);
        btn.disabledColor = cc.color(150, 150, 150);
        btn.duration = 0.2;

        btn.target = this.getComponentInChildren(cc.Label).node;
        btn.target.name = 'label';
    }
}
