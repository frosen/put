/*
 * NavBar.ts
 * 导航栏
 * luleyan
 */

import { BaseCtrlr } from './BaseCtrlr';
import { rerenderLbl } from './Utils';

const { ccclass, property } = cc._decorator;

const FUNC_BTN_DISTANCE = 108;

@ccclass
export class NavBar extends cc.Component {
    @property(cc.Node)
    base: cc.Node = null!;

    @property(cc.Node)
    backBtnNode: cc.Node = null!;

    @property(cc.Label)
    title: cc.Label = null!;

    @property(cc.Label)
    subTitle: cc.Label = null!;

    @property(cc.Node)
    btnBase: cc.Node = null!;

    ctrlr: BaseCtrlr = null!;

    setTitle(title: string) {
        this.title.string = title;
        rerenderLbl(this.title);
    }

    setSubTitle(title: string) {
        this.subTitle.string = title;
        this.subTitle.node.x = 540 + this.title.node.width * 0.5 + 20;
    }

    backBtnActive: boolean = false;
    backBtnCallback?: () => boolean;

    setBackBtnEnabled(e: boolean, callback?: () => boolean) {
        this.backBtnActive = e;
        this.backBtnNode.active = e;
        this.backBtnCallback = e ? callback : undefined;
    }

    onClickBack() {
        if (this.backBtnCallback) {
            const rzt = this.backBtnCallback();
            if (rzt) this.ctrlr.popPage();
        } else {
            this.ctrlr.popPage();
        }
    }

    @property(cc.Prefab)
    funcBtnPrefab: cc.Prefab = null!;

    btnX: number = 0;

    addFuncBtn(name: string, frames: cc.SpriteFrame[], callback: (btn: cc.Button) => void): cc.Button {
        const node = cc.instantiate(this.funcBtnPrefab);
        node.name = 'fb_' + name;
        node.parent = this.btnBase;
        node.x = this.btnX;

        const btn = node.getComponent(cc.Button);
        if (frames && frames.length > 0) {
            btn.normalSprite = frames[0] || null;
            btn.pressedSprite = frames[1] || null;
            btn.hoverSprite = frames[2] || null;
        }

        node.on('click', callback);

        this.btnX -= FUNC_BTN_DISTANCE;

        return btn;
    }

    clearAllFuncBtn() {
        this.btnX = 0;
        for (let index = this.btnBase.children.length - 1; index >= 0; index--) {
            const btnNode = this.btnBase.children[index];
            btnNode.removeFromParent();
            btnNode.destroy();
        }
    }

    hiding: boolean = false;

    hide(b: boolean) {
        if (this.hiding === b) return;
        this.hiding = b;
        this.executeHide(b);
    }

    executeHide(b: boolean) {
        if (this.base.getNumberOfRunningActions() > 0) return;
        const y = b ? 126 : 0;

        cc.tween(this.base)
            .to(0.3, { y }, { easing: cc.easing.sineInOut })
            .call(() => {
                if (b !== this.hiding) setTimeout(() => this.executeHide(this.hiding));
            })
            .start();
    }
}
