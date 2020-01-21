/*
 * BaseController.ts
 * 基础控制器
 * luleyan
 */

const { ccclass, property } = cc._decorator;

// @ts-ignore
let customEngineInfo = cc.director.customEngineInfo;
if (customEngineInfo) {
    cc.log('Custom engine info: ' + customEngineInfo);
} else {
    cc.error('Need custom engine!!!!!');
}

@ccclass
export default class BaseController extends cc.Component {
    onLoad() {
        let rect = cc.sys.getSafeAreaRect();
        cc.log('STORM cc ^_^ size ', JSON.stringify(rect));
        this.node.width = rect.width;
        this.node.height = rect.height;

        let parent = this.node.parent;
        this.node.y = (this.node.height - parent.height) * 0.5 + rect.y;
    }
}
