/**
 * RunningImgMgr.ts
 * 运行时切换的图片的管理器
 * luleyan
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class RunningImgMgr extends cc.Component {
    @property(cc.SpriteFrame) detail: cc.SpriteFrame = null;

    // pet -----------------------------------------------------------------

    @property(cc.SpriteFrame) humanPet: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) magicPet: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) mechPet: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) naturePet: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) unknownPet: cc.SpriteFrame = null;

    // item -----------------------------------------------------------------

    // pos -----------------------------------------------------------------

    // quester -----------------------------------------------------------------
}
