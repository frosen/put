/*
 * LabelButton.ts
 * 文本按钮
 * luleyan
 */

const { ccclass, property, executeInEditMode, requireComponent } = cc._decorator;

const State = cc.Enum({
    NORMAL: 0,
    HOVER: 1,
    PRESSED: 2,
    DISABLED: 3
});

@ccclass
@executeInEditMode
@requireComponent(cc.Button)
export default class LabelButton extends cc.Component {
    @property(cc.Label)
    lbl: cc.Label = null;

    @property(cc.Color)
    normalColor: cc.Color = cc.Color.BLACK;

    @property(cc.Color)
    hoverColor: cc.Color = cc.color(60, 60, 60);

    @property(cc.Color)
    pressedColor: cc.Color = cc.Color.BLACK;

    @property(cc.Color)
    disabledColor: cc.Color = cc.color(200, 120, 50);

    _fromColor: cc.Color = null;
    _toColor: cc.Color = null;
    time: number = 0;
    _transitionFinished: boolean = true;

    onLoad() {
        if (CC_EDITOR) {
            if (this.lbl == null) {
                this.lbl = this.getComponentInChildren(cc.Label);
            }
            return;
        }

        let btn = this.getComponent(cc.Button);
        let lblBtn = this;
        // @ts-ignore
        let oldUpdateState = btn._applyTransition;
        // @ts-ignore
        btn._applyTransition = function(state) {
            oldUpdateState.call(this, state);
            lblBtn.updateLbl(state);
        };
    }

    updateLbl(state: number) {
        let color = this.getStateColor(state);
        if (CC_EDITOR || state === State.DISABLED) {
            this.setLabelColor(color);
            this._transitionFinished = true;
        } else {
            this._fromColor = this.lbl.node.color.clone();
            this._toColor = color;
            this.time = 0;
            this._transitionFinished = false;
        }
    }

    getStateColor(state: number): cc.Color {
        switch (state) {
            case State.NORMAL:
                return this.normalColor;
            case State.HOVER:
                return this.hoverColor;
            case State.PRESSED:
                return this.pressedColor;
            case State.DISABLED:
                return this.disabledColor;
        }
    }

    setLabelColor(color: cc.Color) {
        this.lbl.node.color = color;
        this.lbl.node.opacity = color.getA();
    }

    update(dt: number) {
        if (CC_EDITOR) return;
        if (this._transitionFinished) return;
        this.time += dt;
        let ratio = 1.0;
        let btn = this.getComponent(cc.Button);
        if (btn.duration > 0) {
            ratio = this.time / btn.duration;
        }

        // clamp ratio
        if (ratio >= 1) {
            ratio = 1;
        }

        let color = this._fromColor.lerp(this._toColor, ratio);
        this.setLabelColor(color);

        if (ratio == 1) {
            this._transitionFinished = true;
        }
    }
}
