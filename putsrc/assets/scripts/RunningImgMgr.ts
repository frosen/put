/**
 * RunningImgMgr.ts
 * 运行时切换的图片的管理器
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass('PosImgData')
export class PosImgData {
    @property(cc.SpriteFrame) icon: cc.SpriteFrame = null!;
    @property(cc.SpriteFrame) bg: cc.SpriteFrame = null!;
}

@ccclass
@executeInEditMode
export class RunningImgMgr extends cc.Component {
    @property(cc.SpriteFrame) detail: cc.SpriteFrame = null!;

    // nav -----------------------------------------------------------------

    @property(cc.SpriteFrame) navUndo: cc.SpriteFrame = null!;

    // icon range -----------------------------------------------------------------

    @property(cc.SpriteFrame) iconBG0: cc.SpriteFrame = null!;
    @property(cc.SpriteFrame) iconBG4: cc.SpriteFrame = null!;
    @property(cc.SpriteFrame) iconBG6: cc.SpriteFrame = null!;

    // pet -----------------------------------------------------------------

    @property(cc.SpriteFrame) humanPet: cc.SpriteFrame = null!;
    @property(cc.SpriteFrame) magicPet: cc.SpriteFrame = null!;
    @property(cc.SpriteFrame) mechPet: cc.SpriteFrame = null!;
    @property(cc.SpriteFrame) naturePet: cc.SpriteFrame = null!;
    @property(cc.SpriteFrame) unknownPet: cc.SpriteFrame = null!;

    // item -----------------------------------------------------------------

    // pos -----------------------------------------------------------------

    @property(PosImgData) YiShanJiDi: PosImgData = null!;
    @property(PosImgData) KeChuangXiaoJing: PosImgData = null!;
    @property(PosImgData) GuangJiDianGongChang: PosImgData = null!;

    // quester -----------------------------------------------------------------

    // 方法 -----------------------------------------------------------------

    get(str: string): cc.SpriteFrame & PosImgData {
        return this[str as keyof RunningImgMgr];
    }

    update() {
        if (CC_EDITOR) this.check();
    }

    check() {
        // llytodo
    }
}
