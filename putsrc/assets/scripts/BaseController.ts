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
    // onLoad () {}

    start() {}

    // update (dt) {}
}
