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

const TabBtnData = cc.Class({
    name: 'TabBtnData',
    properties: {
        page: {
            type: cc.Prefab,
            default: null,
            displayName: '页面'
        },

        btn: {
            type: cc.Button,
            default: null,
            displayName: '按钮'
        }
    }
});
type TabBtnData = { page: cc.Prefab; btn: cc.Button };

@ccclass
export default class BaseController extends cc.Component {
    @property(TabBtnData)
    actTBData: TabBtnData = null;

    @property(TabBtnData)
    msgTBData: TabBtnData = null;

    @property(TabBtnData)
    petTBData: TabBtnData = null;

    @property(TabBtnData)
    itemTBData: TabBtnData = null;

    @property(TabBtnData)
    selfTBData: TabBtnData = null;

    onLoad() {
        this.setCorrectRootRect();
        this.setTabBtns();
    }

    /**
     * 设置根视图的位置，让出ios的非安全区域
     */
    setCorrectRootRect() {
        let rect = cc.sys.getSafeAreaRect();
        this.node.width = rect.width;
        this.node.height = rect.height;

        let parent = this.node.parent;
        this.node.y = (this.node.height - parent.height) * 0.5 + rect.y;
    }

    setTabBtns() {
        this.setTabBtn(this.actTBData);
    }

    setTabBtn(tBData: TabBtnData) {
        tBData.btn.node.on('click');
    }
}
