/**
 * RunningImgMgr.ts
 * 运行时切换的图片的管理器
 * luleyan
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class RunningImgMgr extends cc.Component {
    @property(cc.SpriteFrame) detail: cc.SpriteFrame = null;
}
