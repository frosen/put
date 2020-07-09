/*
 * ToggleButtonGroup.ts
 * 切换按钮组
 * luleyan
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class ToggleButtonGroup extends cc.Component {
    btns: cc.Button[] = [];

    onLoad() {
        for (const child of this.node.children) {
            let btn = child.getComponent(cc.Button);
            cc.assert(btn, 'ToggleButtonGroup的child需要cc.Button');

            this.btns.push(btn);
            this.setBtn(btn);
            child.on('click', this.onClick, this);
        }
    }

    setBtn(btn: cc.Button) {}

    onClick(btn: cc.Button) {
        for (const eachBtn of this.btns) {
            if (eachBtn === btn) this.setCheck(eachBtn);
            else this.setUncheck(eachBtn);
        }
    }

    setCheck(btn: cc.Button) {
        btn.interactable = false;
    }

    setUncheck(btn: cc.Button) {
        btn.interactable = true;
    }
}
