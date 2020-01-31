/*
 * PageBase.ts
 * 页面基类
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;

import BaseController from './BaseController';

@ccclass
@executeInEditMode
export default class PageBase extends cc.Component {
    ctrlr: BaseController = null;

    onLoad() {
        if (CC_EDITOR) this.check();
    }

    check() {
        cc.assert(this.node._prefab.root == this.node, 'Page脚本需要放在prefab的根节点');
    }

    init(ctrlr: BaseController) {
        this.ctrlr = ctrlr;
    }
}
