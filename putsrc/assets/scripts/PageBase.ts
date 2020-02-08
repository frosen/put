/*
 * PageBase.ts
 * 页面基类
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;

import { BaseController } from './BaseController';

@ccclass
@executeInEditMode
export default class PageBase extends cc.Component {
    ctrlr: BaseController = null;

    init(ctrlr: BaseController) {
        this.ctrlr = ctrlr;
        this.node.height = ctrlr.pageBed.height;

        let widgets = this.getComponentsInChildren(cc.Widget);
        for (const widget of widgets) widget.updateAlignment();

        this.onInit();
    }

    onInit() {}

    onLoad() {
        if (CC_EDITOR) {
            this.check();
            return;
        }
        cc.log('PUT page onLoad: ', this.name);
    }

    check() {
        cc.assert(this.node._prefab.root == this.node, 'Page脚本需要放在prefab的根节点');

        this.node.name = this.node._prefab.asset.name;
        let clsName = cc.js.getClassName(this.__proto__.constructor);
        cc.assert(this.node.name == clsName, 'Page的prefab要和class名称一致');

        this.node.anchorX = 0;
        this.node.anchorY = 1;
        this.node.width = 1080;
        this.node.height = 1920;
        this.node.x = 0;
        this.node.y = 0;

        let root = this.node.getChildByName('root');
        if (!root) {
            root = new cc.Node('root');
            root.parent = this.node;
            let widegt = root.addComponent(cc.Widget);
            widegt.isAlignTop = true;
            widegt.isAlignBottom = true;
            widegt.isAlignLeft = true;
            widegt.isAlignRight = true;
            widegt.top = 0;
            widegt.bottom = 0;
            widegt.left = 0;
            widegt.right = 0;
        }

        let bake = this.node.getChildByName('bake');
        if (!bake) {
            bake = new cc.Node('bake');
            bake.parent = this.node;
            let widegt = bake.addComponent(cc.Widget);
            widegt.isAlignTop = true;
            widegt.isAlignBottom = true;
            widegt.isAlignLeft = true;
            widegt.isAlignRight = true;
            widegt.top = 0;
            widegt.bottom = 0;
            widegt.left = 0;
            widegt.right = 0;
        }

        for (const child of this.node.children) {
            if (child != root && child != bake) {
                cc.error('Page根节点下只能有root和bake');
            }
        }
    }

    /**
     * show和hide不一定谁在前
     */
    onPageShow() {}

    onPageHide() {}
}
