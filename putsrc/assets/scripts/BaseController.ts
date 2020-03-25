/*
 * BaseController.ts
 * 基础控制器
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;
import PageBase from './PageBase';
import { Memory } from './Memory';
import DebugTool from './DebugTool';
import TouchLayer from './TouchLayer';
import checkConfigs from './ConfigsChecker';

// @ts-ignore
let customEngineInfo = cc.director.customEngineInfo;
if (customEngineInfo) {
    cc.log('PUT Custom engine info: ' + customEngineInfo);
} else {
    cc.error('PUT Need custom engine!!!!!');
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

const FUNC_BTN_DISTANCE = 108;
const FUNC_BTN_POS_BASE = 481;

class TreeNode {
    name: string = '';
    page: PageBase = null;
    parent: TreeNode = null;
    child: TreeNode = null;
    others: { [key: string]: TreeNode } = {};
}

export enum PageSwitchAnim {
    none,
    fromTop,
    fromBottom,
    fromLeft,
    fromRight
}

@ccclass
@executeInEditMode
export class BaseController extends cc.Component {
    @property(cc.Node)
    pageBed: cc.Node = null;

    @property(cc.Node)
    touchLayer: cc.Node = null;

    @property(cc.Node)
    navBed: cc.Node = null;

    @property(cc.Node)
    tabBed: cc.Node = null;

    @property([cc.Prefab])
    pagePrefabList: cc.Prefab[] = [];

    @property(TabBtnData)
    actTBData: TabBtnData = null;

    @property(TabBtnData)
    msgTBData: TabBtnData = null;

    @property(TabBtnData)
    petTBData: TabBtnData = null;

    @property(TabBtnData)
    pkgTBData: TabBtnData = null;

    @property(TabBtnData)
    selfTBData: TabBtnData = null;

    memory: Memory = null;

    debugTool: DebugTool = null;

    prefabDict: { [key: string]: cc.Prefab } = {};

    pageTree: TreeNode = null;

    onLoad() {
        if (CC_EDITOR) {
            this.setPagePrefabList();
            this.setPagePrefabDict();
            checkConfigs();
            return;
        }

        // @ts-ignore
        window.baseCtrlr = this;
        this.setCorrectRootRect();

        this.touchLayer.getComponent(TouchLayer).init(this);

        this.memory = new Memory();
        this.memory.init();

        this.debugTool = new DebugTool();
        this.debugTool.init();

        this.setPagePrefabDict();
        this.setTabBtns();
        this.setTree();
        this.setNav();
        this.initPops();
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

        let navH = this.navBed.height;
        let tabH = this.tabBed.height;
        let pageH = this.node.height - navH - tabH;

        this.pageBed.height = pageH;
        this.pageBed.y = this.node.height * 0.5 - navH;
    }

    setPagePrefabList() {
        this.pagePrefabList = [];
        let baseCtrlr = this;
        let pageDir = Editor.Project.path + '/assets/pages';
        let Fs = require('fs');
        let files = Fs.readdirSync(pageDir);
        for (const file of files) {
            if (Fs.statSync(pageDir + '/' + file).isDirectory()) {
                let editorDir = 'db://assets/pages/' + file + '/*';
                Editor.assetdb.queryAssets(editorDir, null, function(err, results) {
                    for (const res of results) {
                        if (res.type == 'prefab') {
                            cc.loader.load(
                                { type: 'uuid', uuid: res.uuid },
                                () => {},
                                function(err, asset) {
                                    if (err || !asset) return;
                                    baseCtrlr.pagePrefabList.push(asset);
                                }
                            );
                        }
                    }
                });
            }
        }
    }

    setPagePrefabDict() {
        if (CC_EDITOR) this.prefabDict = {};
        for (const prefab of this.pagePrefabList) {
            let name = prefab.name;
            cc.assert(!this.prefabDict.hasOwnProperty(name), `prefab list中有重复：${name}`);
            this.prefabDict[name] = prefab;
        }
    }

    setTabBtns() {
        this.setTabBtn(this.actTBData);
        this.setTabBtn(this.msgTBData);
        this.setTabBtn(this.petTBData);
        this.setTabBtn(this.pkgTBData);
        this.setTabBtn(this.selfTBData);
    }

    setTabBtn(tBData: TabBtnData) {
        tBData.btn.node.on('click', () => {
            this.switchRootPage(tBData.page);
        });
    }

    setTree() {
        this.pageTree = new TreeNode();
    }

    setNav() {
        this.navBed.getChildByName('back').on('click', this.onClickBack.bind(this));
    }

    start() {
        if (CC_EDITOR) return;
        this.actTBData.btn.node.emit('click', this.actTBData.btn);
    }

    update(dt: number) {
        if (CC_EDITOR) return;
        this.memory.update(dt);
    }

    // 页面管理 -----------------------------------------------------------------

    pageChanging: boolean = false;

    pushPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }, data: any = null, withAnim: boolean = true) {
        if (this.pageChanging) return;
        this.pageChanging = true;

        let nextPageName = this.getPageName(page);
        let curTreeNode = this.getTreeLeaf(this.pageTree);
        let curPageName = curTreeNode.name;

        cc.log(`PUT push from ${curPageName} to ${nextPageName}`);

        let nextTreeNode = new TreeNode();
        nextTreeNode.name = nextPageName;
        nextTreeNode.page = this.createPage(nextPageName, data);
        nextTreeNode.parent = curTreeNode;
        curTreeNode.child = nextTreeNode;

        let nextPage = nextTreeNode.page;
        let curPage = curTreeNode.page;

        nextPage.node.zIndex = curPage.node.zIndex + 1;

        this.clearNavBar();
        this.showPage(nextPage);
        this.willHidePage(curPage);
        let afterAnim = () => {
            this.hidePage(curPage);
            this.pageChanging = false;
            this.didShowPage(nextPage);
        };
        if (withAnim) this.doPushPageAnim(curPage.node, nextPage.node, afterAnim);
        else afterAnim();
    }

    doPushPageAnim(curNode: cc.Node, nextNode: cc.Node, callback: () => void) {
        curNode.x = 0;
        curNode.y = 0;
        cc.tween(curNode)
            .to(0.2, { x: this.pageBed.width * -0.25 }, { easing: 'sineInOut' })
            .start();

        nextNode.x = this.pageBed.width;
        nextNode.y = 0;
        cc.tween(nextNode)
            .to(0.2, { x: 0 }, { easing: 'sineInOut' })
            .call(() => {
                setTimeout(() => {
                    callback();
                });
            })
            .start();
    }

    popPage(withAnim: boolean = true) {
        if (this.pageChanging) return;
        this.pageChanging = true;

        let curTreeNode = this.getTreeLeaf(this.pageTree);
        let nextTreeNode = curTreeNode.parent;
        if (!nextTreeNode) {
            this.pageChanging = false;
            return;
        }

        let nextPageName = nextTreeNode.name;
        let curPageName = curTreeNode.name;

        cc.log(`PUT push from ${curPageName} to ${nextPageName}`);

        nextTreeNode.child = null;
        curTreeNode.parent = null;

        let nextPage = nextTreeNode.page;
        let curPage = curTreeNode.page;

        this.clearNavBar();
        this.showPage(nextPage);
        this.willHidePage(curPage);
        let afterAnim = () => {
            this.deleteTreeNode(curTreeNode);
            this.pageChanging = false;
            this.didShowPage(nextPage);
        };
        if (withAnim) this.doPopPageAnim(curPage.node, nextPage.node, afterAnim);
        else afterAnim();
    }

    doPopPageAnim(curNode: cc.Node, nextNode: cc.Node, callback: () => void) {
        curNode.x = 0;
        curNode.y = 0;
        cc.tween(curNode)
            .to(0.2, { x: this.pageBed.width }, { easing: 'sineInOut' })
            .start();

        nextNode.x = this.pageBed.width * -0.25;
        nextNode.y = 0;
        cc.tween(nextNode)
            .to(0.2, { x: 0 }, { easing: 'sineInOut' })
            .call(() => {
                setTimeout(() => {
                    callback();
                });
            })
            .start();
    }

    switchCurPage<T extends PageBase>(
        page: cc.Prefab | string | { new (): T },
        data: any = null,
        anim: PageSwitchAnim = PageSwitchAnim.none
    ) {
        let nextPageName = this.getPageName(page);
        this.switchPage(nextPageName, this.getTreeLeaf(this.pageTree).parent, data, anim);
    }

    switchRootPage<T extends PageBase>(
        page: cc.Prefab | string | { new (): T },
        data: any = null,
        anim: PageSwitchAnim = PageSwitchAnim.none
    ) {
        let nextPageName = this.getPageName(page);
        this.switchPage(nextPageName, this.pageTree, data, anim);
    }

    switchPage(nextPageName: string, parentTreeNode: TreeNode, data: any, anim: PageSwitchAnim) {
        if (this.pageChanging) return;
        this.pageChanging = true;
        let curTreeNode: TreeNode = null;
        let curDisTreeNode: TreeNode = null;
        if (parentTreeNode.child) {
            curTreeNode = parentTreeNode.child;
            curDisTreeNode = this.getTreeLeaf(parentTreeNode.child);
            cc.log(`PUT switch page from ${curTreeNode.name}[display:${curDisTreeNode.name}]`);
        }

        let nextTreeNode = parentTreeNode.others[nextPageName];
        let nextDisTreeNode: TreeNode = null;
        if (nextTreeNode) {
            nextDisTreeNode = this.getTreeLeaf(nextTreeNode);
        } else {
            nextTreeNode = new TreeNode();
            nextTreeNode.name = nextPageName;
            nextTreeNode.page = this.createPage(nextPageName, data);
            nextTreeNode.page.node.zIndex = curTreeNode ? curTreeNode.page.node.zIndex : 0;
            nextTreeNode.parent = parentTreeNode;
            nextDisTreeNode = nextTreeNode;
        }

        cc.log(`PUT switch page to ${nextTreeNode.name}[display:${nextDisTreeNode.name}]`);

        if (curTreeNode) parentTreeNode.others[curTreeNode.name] = curTreeNode;
        parentTreeNode.child = nextTreeNode;

        this.clearNavBar();
        this.showPage(nextDisTreeNode.page);
        if (curDisTreeNode) this.willHidePage(curDisTreeNode.page);
        this.doSwitchPageAnim(curDisTreeNode ? curDisTreeNode.page.node : null, nextDisTreeNode.page.node, anim, () => {
            if (curDisTreeNode) this.hidePage(curDisTreeNode.page);
            this.pageChanging = false;
            this.didShowPage(nextDisTreeNode.page);
        });
    }

    doSwitchPageAnim(curNode: cc.Node, nextNode: cc.Node, anim: PageSwitchAnim, callback: () => void) {
        if (anim == PageSwitchAnim.none) {
            return callback();
        }

        if (curNode) {
            curNode.x = 0;
            curNode.y = 0;

            let curToX = 0;
            let curToY = 0;
            switch (anim) {
                case PageSwitchAnim.fromTop:
                    curToY = -this.pageBed.height;
                    break;
                case PageSwitchAnim.fromBottom:
                    curToY = this.pageBed.height;
                    break;
                case PageSwitchAnim.fromLeft:
                    curToX = this.pageBed.width;
                    break;
                case PageSwitchAnim.fromRight:
                    curToX = -this.pageBed.width;
                    break;
                default:
                    break;
            }

            cc.tween(curNode)
                .to(0.2, { x: curToX, y: curToY }, { easing: 'sineInOut' })
                .start();
        }

        let nextToX = 0;
        let nextToY = 0;
        switch (anim) {
            case PageSwitchAnim.fromTop:
                nextToY = this.pageBed.height;
                break;
            case PageSwitchAnim.fromBottom:
                nextToY = -this.pageBed.height;
                break;
            case PageSwitchAnim.fromLeft:
                nextToX = -this.pageBed.width;
                break;
            case PageSwitchAnim.fromRight:
                nextToX = this.pageBed.width;
                break;
            default:
                break;
        }

        nextNode.x = nextToX;
        nextNode.y = nextToY;
        cc.tween(nextNode)
            .to(0.2, { x: 0, y: 0 }, { easing: 'sineInOut' })
            .call(() => {
                setTimeout(() => {
                    callback();
                });
            })
            .start();
    }

    getPageName<T extends PageBase>(page: cc.Prefab | string | { new (): T }) {
        if (typeof page == 'string') {
            return page;
        } else if (page instanceof cc.Prefab) {
            return page.name;
        } else {
            return cc.js.getClassName(page);
        }
    }

    createPage(pageName: string, data: any): PageBase {
        let prefab = this.prefabDict[pageName];
        cc.assert(prefab, `${pageName}并没有加入pagePrefabList中`);

        let newNode = cc.instantiate(prefab);
        let pageComp = newNode.getComponent(PageBase);
        pageComp.init();
        pageComp.setData(data);
        newNode.parent = this.pageBed;

        return pageComp;
    }

    deleteTreeNode(treeNode: TreeNode) {
        let child = treeNode.child;
        let others = treeNode.others;
        this.deletePage(treeNode.page);
        if (child) this.deleteTreeNode(child);
        for (const key in others) {
            if (others.hasOwnProperty(key)) {
                const otherTreeNode = others[key];
                this.deleteTreeNode(otherTreeNode);
            }
        }
    }

    deletePage(page: PageBase) {
        page.node.removeFromParent();
        page.node.destroy();
    }

    getTreeLeaf(treeNode: TreeNode): TreeNode {
        return treeNode.child ? this.getTreeLeaf(treeNode.child) : treeNode;
    }

    hidePage(page: PageBase) {
        page.onPageHide();
        page.node.opacity = 0;
        page.node.scale = 0;
    }

    showPage(page: PageBase) {
        page.node.opacity = 255;
        page.node.scale = 1;
        page.onPageShow();
    }

    willHidePage(page: PageBase) {
        page.beforePageHideAnim();
    }

    didShowPage(page: PageBase) {
        page.afterPageShowAnim();
    }

    // 导航栏控制 -----------------------------------------------------------------

    setTitle(title: string) {
        let lbl = this.navBed.getChildByName('title').getComponent(cc.Label);
        lbl.string = title;
        let subLbl = this.navBed.getChildByName('sub_title').getComponent(cc.Label);
        // @ts-ignore
        lbl._assembler.updateRenderData(lbl);
        subLbl.node.x = lbl.node.width * 0.5 + 20;
    }

    setSubTitle(title: string) {
        let subLbl = this.navBed.getChildByName('sub_title').getComponent(cc.Label);
        subLbl.string = title;
    }

    backBtnActive: boolean = true;
    backBtnCallback: () => boolean = null;

    setBackBtnEnabled(e: boolean, callback: () => boolean = null) {
        this.backBtnActive = e;
        this.navBed.getChildByName('back').active = e;
        this.backBtnCallback = e ? callback : null;
    }

    onClickBack() {
        if (this.backBtnCallback) {
            let rzt = this.backBtnCallback();
            if (rzt) this.popPage();
        } else {
            this.popPage();
        }
    }

    @property(cc.Prefab)
    funcBtnPrefab: cc.Prefab = null;

    btnX: number = FUNC_BTN_POS_BASE;

    addFuncBtn(name: string, frames: cc.SpriteFrame[], callback: (btn: cc.Button) => void): cc.Button {
        let node = cc.instantiate(this.funcBtnPrefab);
        node.name = 'fb_' + name;
        node.parent = this.navBed;
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

    clearFuncBtns() {
        for (const child of this.navBed.children) {
            if (/^fb_[\s\S].*$/.test(child.name)) {
                child.removeFromParent();
                child.destroy();
            }
        }
        this.btnX = FUNC_BTN_POS_BASE;
    }

    clearNavBar() {
        this.setBackBtnEnabled(false);
        this.setTitle('');
        this.setSubTitle('');
        this.clearFuncBtns();
    }

    // pop -----------------------------------------------------------------

    @property(cc.Node)
    toastNode: cc.Node = null;

    @property(cc.Node)
    alertNode: cc.Node = null;

    @property(cc.Node)
    maskNode: cc.Node = null;

    alertCallback: (key: number) => void = null;

    initPops() {
        this.toastNode.opacity = 0;

        let btns = this.alertNode.getChildByName('btns');
        btns.getChildByName('btn1').on('click', () => {
            if (this.alertCallback) this.alertCallback(1);
            this.closeAlert();
        });
        btns.getChildByName('btn2').on('click', () => {
            if (this.alertCallback) this.alertCallback(2);
            this.closeAlert();
        });
        this.alertNode.opacity = 0;
        this.alertNode.scale = 0;

        this.maskNode.scale = 0;
    }

    popToast(str: string) {
        this.toastNode.getComponentInChildren(cc.Label).string = str;
        this.toastNode.stopAllActions();
        cc.tween(this.toastNode)
            .to(0.3, { opacity: 255 })
            .delay(3)
            .to(0.3, { opacity: 0 })
            .start();
    }

    popAlert(txt: string, callback: (key: number) => void, btn1: string = '确认', btn2: string = '取消') {
        this.alertNode.getChildByName('text').getComponent(cc.Label).string = txt;
        this.alertCallback = callback;

        let btns = this.alertNode.getChildByName('btns');
        btns.getChildByName('btn1').getComponentInChildren(cc.Label).string = btn1;
        btns.getChildByName('btn2').getComponentInChildren(cc.Label).string = btn2;

        this.alertNode.opacity = 0;
        this.alertNode.y = 0;
        this.alertNode.scale = 0.7;

        this.alertNode.stopAllActions();
        cc.tween(this.alertNode)
            .to(0.1, { opacity: 255, scale: 1 })
            .start();

        this.popMask();
    }

    closeAlert() {
        this.alertNode.stopAllActions();
        cc.tween(this.alertNode)
            .to(0.1, { opacity: 0, scale: 0.7 })
            .call(() => {
                setTimeout(() => {
                    this.alertNode.scale = 0;
                });
            })
            .start();

        this.closeMask();
    }

    popMask() {
        this.maskNode.scale = 1;
        this.maskNode.stopAllActions();
        cc.tween(this.maskNode)
            .to(0.1, { opacity: 100 })
            .start();
    }

    closeMask() {
        this.maskNode.stopAllActions();
        cc.tween(this.maskNode)
            .to(0.1, { opacity: 0 })
            .call(() => {
                setTimeout(() => {
                    this.maskNode.scale = 0;
                });
            })
            .start();
    }
}
