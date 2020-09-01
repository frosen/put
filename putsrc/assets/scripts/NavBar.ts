/*
 * NavBar.ts
 * 导航栏
 * luleyan
 */

import { BaseController } from './BaseController';

const { ccclass, property } = cc._decorator;

const FUNC_BTN_DISTANCE = 108;
const FUNC_BTN_POS_BASE = 481;

@ccclass
export class NavBar extends cc.Component {
    @property(cc.Node)
    backBtnNode: cc.Node = null;

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    subTitle: cc.Label = null;

    ctrlr: BaseController = null;

    setTitle(title: string) {
        this.title.string = title;
        // @ts-ignore
        this.title._assembler.updateRenderData(this.title);
        this.subTitle.node.x = 540 + this.title.node.width * 0.5 + 20;
    }

    setSubTitle(title: string) {
        this.subTitle.string = title;
    }

    backBtnActive: boolean = false;
    backBtnCallback: () => boolean = null;

    setBackBtnEnabled(e: boolean, callback: () => boolean = null) {
        this.backBtnActive = e;
        this.backBtnNode.active = e;
        this.backBtnCallback = e ? callback : null;
    }

    onClickBack() {
        if (this.backBtnCallback) {
            let rzt = this.backBtnCallback();
            if (rzt) this.ctrlr.popPage();
        } else {
            this.ctrlr.popPage();
        }
    }

    @property(cc.Prefab)
    funcBtnPrefab: cc.Prefab = null;

    btnX: number = FUNC_BTN_POS_BASE;

    addFuncBtn(name: string, frames: cc.SpriteFrame[], callback: (btn: cc.Button) => void): cc.Button {
        let node = cc.instantiate(this.funcBtnPrefab);
        node.name = 'fb_' + name;
        node.parent = this.node;
        node.x = this.btnX;

        let btn = node.getComponent(cc.Button);
        if (frames && frames.length > 0) {
            btn.normalSprite = frames[0] || null;
            btn.pressedSprite = frames[1] || null;
            btn.hoverSprite = frames[2] || null;
        }

        node.on('click', callback);

        this.btnX -= FUNC_BTN_DISTANCE;

        return btn;
    }
}
