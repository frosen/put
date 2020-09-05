/*
 * BaseController.ts
 * 基础控制器
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;
import { PageBase } from './PageBase';
import { Memory } from './Memory';
import { DebugTool } from './DebugTool';
import { TouchLayer } from './TouchLayer';
import { checkConfigs } from './ConfigsChecker';
import { NavBar } from './NavBar';

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

    @property(cc.Prefab)
    navPrefab: cc.Prefab = null;

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
                Editor.assetdb.queryAssets(editorDir, null, function (err, results) {
                    for (const res of results) {
                        if (res.type === 'prefab') {
                            cc.loader.load(
                                { type: 'uuid', uuid: res.uuid },
                                () => {},
                                function (err, asset) {
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

        this.willHidePage(curPage);
        this.showPage(nextPage);
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

        this.willHidePage(curPage, true);
        this.showPage(nextPage);
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
        cc.tween(curNode).to(0.2, { x: this.pageBed.width }, { easing: 'sineInOut' }).start();

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

        let nextZ: number;
        if (curTreeNode) {
            if (anim === PageSwitchAnim.fromTop) nextZ = curTreeNode.page.node.zIndex + 1;
            else if (anim === PageSwitchAnim.fromBottom) nextZ = curTreeNode.page.node.zIndex - 1;
            else nextZ = curTreeNode.page.node.zIndex;
        } else nextZ = 0;
        nextDisTreeNode.page.node.zIndex = nextZ;

        cc.log(`PUT switch page to ${nextTreeNode.name}[display:${nextDisTreeNode.name}]`);

        if (curTreeNode) parentTreeNode.others[curTreeNode.name] = curTreeNode;
        parentTreeNode.child = nextTreeNode;

        if (curDisTreeNode) this.willHidePage(curDisTreeNode.page);
        this.showPage(nextDisTreeNode.page);
        this.doSwitchPageAnim(curDisTreeNode ? curDisTreeNode.page.node : null, nextDisTreeNode.page.node, anim, () => {
            if (curDisTreeNode) this.hidePage(curDisTreeNode.page);
            this.pageChanging = false;
            this.didShowPage(nextDisTreeNode.page);
        });
    }

    doSwitchPageAnim(curNode: cc.Node, nextNode: cc.Node, anim: PageSwitchAnim, callback: () => void) {
        if (!curNode || anim === PageSwitchAnim.none) {
            nextNode.x = 0;
            nextNode.y = 0;
            return callback();
        } else if (anim === PageSwitchAnim.fromLeft || anim === PageSwitchAnim.fromRight) {
            curNode.x = 0;
            curNode.y = 0;
            let curToX = anim === PageSwitchAnim.fromLeft ? this.pageBed.width : -this.pageBed.width;
            let curToY = 0;
            cc.tween(curNode).to(0.2, { x: curToX, y: curToY }, { easing: 'sineInOut' }).start();

            nextNode.x = anim === PageSwitchAnim.fromLeft ? -this.pageBed.width : this.pageBed.width;
            nextNode.y = 0;
            cc.tween(nextNode)
                .to(0.2, { x: 0, y: 0 }, { easing: 'sineInOut' })
                .call(() => {
                    setTimeout(() => {
                        callback();
                    });
                })
                .start();
        } else if (anim === PageSwitchAnim.fromTop) {
            curNode.x = 0;
            curNode.y = 0;
            cc.tween(curNode).to(0.35, { x: 0, y: -900 }, { easing: 'sineIn' }).start();

            nextNode.x = 0;
            nextNode.y = this.pageBed.height + this.navBed.height * 2;
            cc.tween(nextNode)
                .to(0.35, { x: 0, y: 0 }, { easing: 'sineOut' })
                .call(() => {
                    setTimeout(() => {
                        callback();
                    });
                })
                .start();
        } else {
            curNode.x = 0;
            curNode.y = 0;
            let curToX = 0;
            let curToY = this.pageBed.height + this.navBed.height * 2;
            cc.tween(curNode)
                .to(0.35, { x: curToX, y: curToY }, { easing: 'sineIn' })
                .call(() => {
                    setTimeout(() => {
                        callback();
                    });
                })
                .start();

            nextNode.x = 0;
            nextNode.y = -900;
            cc.tween(nextNode).to(0.35, { x: 0, y: 0 }, { easing: 'sineOut' }).start();
        }
    }

    getPageName<T extends PageBase>(page: cc.Prefab | string | { new (): T }) {
        if (typeof page === 'string') {
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

        let pageNode = cc.instantiate(prefab);
        pageNode.parent = this.pageBed;
        let pageComp = pageNode.getComponent(PageBase);
        pageComp.init();
        pageComp.setData(data);

        if (!pageComp.navHidden) {
            let navNode = cc.instantiate(this.navPrefab);
            navNode.zIndex = cc.macro.MAX_ZINDEX;
            navNode.parent = pageNode;
            let navBar = navNode.getComponent(NavBar);
            navBar.ctrlr = this;
            pageComp.navBar = navBar;
            pageComp.onLoadNavBar(navBar);
        }

        return pageComp;
    }

    deleteTreeNode(treeNode: TreeNode) {
        let child = treeNode.child;
        let others = treeNode.others;
        if (child) this.deleteTreeNode(child);
        for (const key in others) {
            if (!others.hasOwnProperty(key)) continue;
            const otherTreeNode = others[key];
            this.deleteTreeNode(otherTreeNode);
        }
        this.deletePage(treeNode.page);
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

    willHidePage(page: PageBase, willDestroy: boolean = false) {
        page.beforePageHideAnim(willDestroy);
    }

    didShowPage(page: PageBase) {
        page.afterPageShowAnim();
    }

    getCurPage(): PageBase {
        return this.getTreeLeaf(this.pageTree).page;
    }

    // pop -----------------------------------------------------------------

    @property(cc.Node)
    toastNode: cc.Node = null;

    @property(cc.Node)
    alertNode: cc.Node = null;
    alertLbl: cc.Label = null;
    alertBtn1Node: cc.Node = null;
    alertBtn2Node: cc.Node = null;
    alertBtn3Node: cc.Node = null;
    alertBtn4Node: cc.Node = null;
    alertBtnCancelNode: cc.Node = null;

    @property(cc.Node)
    maskNode: cc.Node = null;

    alertCallback: (key: number) => void = null;

    initPops() {
        this.toastNode.opacity = 0;

        this.alertLbl = this.alertNode.getChildByName('text_bg').getChildByName('text').getComponent(cc.Label);
        this.alertBtn1Node = this.alertNode.getChildByName('btn1');
        this.alertBtn2Node = this.alertNode.getChildByName('btn2');
        this.alertBtn3Node = this.alertNode.getChildByName('btn3');
        this.alertBtn4Node = this.alertNode.getChildByName('btn4');
        this.alertBtnCancelNode = this.alertNode.getChildByName('btn_cancel');

        this.alertBtn1Node.on('click', () => {
            this.closeAlert();
            if (this.alertCallback) this.alertCallback(1);
        });
        this.alertBtn2Node.on('click', () => {
            this.closeAlert();
            if (this.alertCallback) this.alertCallback(2);
        });
        this.alertBtn3Node.on('click', () => {
            this.closeAlert();
            if (this.alertCallback) this.alertCallback(3);
        });
        this.alertBtn4Node.on('click', () => {
            this.closeAlert();
            if (this.alertCallback) this.alertCallback(4);
        });
        this.alertBtnCancelNode.on('click', () => {
            this.closeAlert();
            if (this.alertCallback) this.alertCallback(0);
        });

        this.maskNode.scale = 0;
        this.maskNode.opacity = 0;

        this.maskNode.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.maskNode.opacity >= 100) {
                this.closeAlert();
                if (this.alertCallback) this.alertCallback(0);
            }
        });
    }

    popToast(str: string) {
        this.toastNode.getComponentInChildren(cc.Label).string = str;
        this.toastNode.stopAllActions();
        cc.tween(this.toastNode).to(0.3, { opacity: 255 }).delay(3).to(0.3, { opacity: 0 }).start();
    }

    popAlert(
        txt: string,
        callback: (key: number) => void,
        btn1: string = '确定',
        btn2: string = null,
        btn3: string = null,
        btn4: string = null,
        btnCancel: string = '取消'
    ) {
        this.alertLbl.string = txt;
        this.alertCallback = callback;

        this.alertBtn1Node.getComponentInChildren(cc.Label).string = btn1;
        if (btn2) {
            this.alertBtn2Node.getComponentInChildren(cc.Label).string = btn2;
            this.alertBtn2Node.scaleY = 1;
        } else {
            this.alertBtn2Node.scaleY = 0;
        }
        if (btn3) {
            this.alertBtn3Node.getComponentInChildren(cc.Label).string = btn3;
            this.alertBtn3Node.scaleY = 1;
        } else {
            this.alertBtn3Node.scaleY = 0;
        }
        if (btn4) {
            this.alertBtn4Node.getComponentInChildren(cc.Label).string = btn4;
            this.alertBtn4Node.scaleY = 1;
        } else {
            this.alertBtn4Node.scaleY = 0;
        }

        this.alertBtnCancelNode.getComponentInChildren(cc.Label).string = btnCancel;

        // @ts-ignore
        this.alertLbl._assembler.updateRenderData(this.alertLbl);
        this.alertLbl.node.parent.getComponent(cc.Layout).updateLayout();
        this.alertNode.getComponent(cc.Layout).updateLayout();

        this.alertNode.y = -10;
        this.alertNode.stopAllActions();
        cc.tween(this.alertNode).to(0.3, { y: this.alertNode.height }, { easing: cc.easing.quadOut }).start();

        this.popMask();
    }

    closeAlert() {
        this.alertNode.stopAllActions();
        cc.tween(this.alertNode).to(0.3, { y: -10 }, { easing: cc.easing.quadIn }).start();

        this.closeMask();
    }

    popMask() {
        this.maskNode.scale = 1;
        this.maskNode.stopAllActions();
        cc.tween(this.maskNode).to(0.3, { opacity: 101 }).start();
    }

    closeMask() {
        this.maskNode.stopAllActions();
        cc.tween(this.maskNode)
            .to(0.3, { opacity: 0 })
            .call(() => {
                setTimeout(() => {
                    this.maskNode.scale = 0;
                });
            })
            .start();
    }
}
