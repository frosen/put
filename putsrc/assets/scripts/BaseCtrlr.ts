/*
 * BaseCtrlr.ts
 * 基础控制器
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;
import { PageBase } from './PageBase';
import { Memory } from './Memory';
import { DebugTool } from './DebugTool';
import { TouchLayerForBack } from './TouchLayerForBack';
import { TouchLayerForToast } from './TouchLayerForToast';
import { checkConfigs } from './ConfigsChecker';
import { NavBar } from './NavBar';
import { RunningImgMgr } from './RunningImgMgr';
import { rerenderLbl } from './Utils';

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
    name!: string;
    page!: PageBase;
    parent!: TreeNode;
    child?: TreeNode;
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
export class BaseCtrlr extends cc.Component {
    @property(cc.Node)
    pageBed: cc.Node = null!;

    @property(cc.Node)
    touchLayerForBack: cc.Node = null!;

    @property(cc.Node)
    touchLayerForToast: cc.Node = null!;

    @property(cc.Node)
    navBed: cc.Node = null!;

    @property(cc.Prefab)
    navPrefab: cc.Prefab = null!;

    @property(cc.Node)
    tabBed: cc.Node = null!;

    @property(cc.Node)
    tabBar: cc.Node = null!;

    @property({
        displayName: '[操作]刷新页面列表'
    })
    toRefreshPageList: boolean = false;

    @property([cc.Prefab])
    pagePrefabList: cc.Prefab[] = [];

    @property(TabBtnData)
    actTBData: TabBtnData = null!;

    @property(TabBtnData)
    msgTBData: TabBtnData = null!;

    @property(TabBtnData)
    petTBData: TabBtnData = null!;

    @property(TabBtnData)
    pkgTBData: TabBtnData = null!;

    @property(TabBtnData)
    selfTBData: TabBtnData = null!;

    @property(RunningImgMgr)
    runningImgMgr: RunningImgMgr = null!;

    memory!: Memory;

    debugTool!: DebugTool;

    prefabDict: { [key: string]: cc.Prefab } = {};

    pageTree!: TreeNode;

    onLoad() {
        if (CC_EDITOR) {
            this.setPagePrefabDict();
            checkConfigs();
            return;
        }

        // @ts-ignore
        window.baseCtrlr = this;
        this.setCorrectRootRect();

        this.touchLayerForBack.getComponent(TouchLayerForBack).init(this);
        this.touchLayerForToast.getComponent(TouchLayerForToast).init(this);

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
        const rect = cc.sys.getSafeAreaRect();
        this.node.width = rect.width;
        this.node.height = rect.height;

        const parent = this.node.parent;
        this.node.y = (this.node.height - parent.height) * 0.5 + rect.y;

        const navH = this.navBed.height;
        const tabH = this.tabBed.height;
        const pageH = this.node.height - navH - tabH;

        this.pageBed.height = pageH;
        this.pageBed.y = this.node.height * 0.5 - navH;
    }

    setPagePrefabList() {
        this.pagePrefabList = [];
        const baseCtrlr = this;
        const pageDir = Editor.Project.path + '/assets/pages';
        const Fs = require('fs');
        const files = Fs.readdirSync(pageDir);
        for (const file of files) {
            if (Fs.statSync(pageDir + '/' + file).isDirectory()) {
                const editorDir = 'db://assets/pages/' + file + '/*';
                Editor.assetdb.queryAssets(editorDir, null, function (err: any, results: any[]) {
                    for (const res of results) {
                        if (res.type === 'prefab') {
                            cc.assetManager.loadAny(
                                { uuid: res.uuid },
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
            const name = prefab.name;
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
        this.pageTree.name = 'pageTree';
    }

    start() {
        if (CC_EDITOR) return;
        this.actTBData.btn.node.emit('click', this.actTBData.btn);

        this.startLabelCharAtlasMonitor();
    }

    update(dt: number) {
        if (CC_EDITOR) {
            if (this.toRefreshPageList) {
                this.toRefreshPageList = false;
                this.setPagePrefabList();
                this.setPagePrefabDict();
            }
            return;
        }
        this.memory.update(dt);
    }

    // 页面管理 -----------------------------------------------------------------

    pageChanging: boolean = false;

    pushPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }, data: any = null, withAnim: boolean = true) {
        if (this.pageChanging) return;
        this.pageChanging = true;

        const nextPageName = this.getPageName(page);
        const curTreeNode = this.getTreeLeaf(this.pageTree);
        const curPageName = curTreeNode.name;

        cc.log(`PUT push from ${curPageName} to ${nextPageName}`);

        const nextTreeNode = new TreeNode();
        nextTreeNode.name = nextPageName;
        nextTreeNode.page = this.createPage(nextPageName, data);
        nextTreeNode.parent = curTreeNode;
        curTreeNode.child = nextTreeNode;

        const nextPage = nextTreeNode.page;
        const curPage = curTreeNode.page;

        nextPage.node.zIndex = curPage.node.zIndex + 1;

        this.willHidePage(curPage);
        this.showPage(nextPage);
        const afterAnim = () => {
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
        setTimeout(() => {
            cc.tween(curNode)
                .to(0.2, { x: this.pageBed.width * -0.25 }, { easing: cc.easing.sineInOut })
                .start();
        });

        nextNode.x = this.pageBed.width;
        nextNode.y = 0;
        setTimeout(() => {
            cc.tween(nextNode)
                .to(0.2, { x: 0 }, { easing: cc.easing.sineInOut })
                .call(() => {
                    setTimeout(() => {
                        callback();
                    });
                })
                .start();
        });
    }

    popPage(withAnim: boolean = true) {
        if (this.pageChanging) return;
        this.pageChanging = true;

        const curTreeNode = this.getTreeLeaf(this.pageTree);
        const nextTreeNode = curTreeNode.parent;
        if (!nextTreeNode) {
            this.pageChanging = false;
            return;
        }

        const nextPageName = nextTreeNode.name;
        const curPageName = curTreeNode.name;

        cc.log(`PUT push from ${curPageName} to ${nextPageName}`);

        nextTreeNode.child = undefined;
        curTreeNode.parent = undefined!;

        const nextPage = nextTreeNode.page;
        const curPage = curTreeNode.page;

        this.willHidePage(curPage, true);
        this.showPage(nextPage);
        const afterAnim = () => {
            this.deconsteTreeNode(curTreeNode);
            this.pageChanging = false;
            this.didShowPage(nextPage);
        };
        if (withAnim) this.doPopPageAnim(curPage.node, nextPage.node, afterAnim);
        else afterAnim();
    }

    doPopPageAnim(curNode: cc.Node, nextNode: cc.Node, callback: () => void) {
        curNode.x = 0;
        curNode.y = 0;
        setTimeout(() => {
            cc.tween(curNode).to(0.2, { x: this.pageBed.width }, { easing: cc.easing.sineInOut }).start();
        });

        nextNode.x = this.pageBed.width * -0.25;
        nextNode.y = 0;
        setTimeout(() => {
            cc.tween(nextNode)
                .to(0.2, { x: 0 }, { easing: cc.easing.sineInOut })
                .call(() => {
                    setTimeout(() => {
                        callback();
                    });
                })
                .start();
        });
    }

    switchCurPage<T extends PageBase>(
        page: cc.Prefab | string | { new (): T },
        data: any = null,
        anim: PageSwitchAnim = PageSwitchAnim.none
    ) {
        const nextPageName = this.getPageName(page);
        this.switchPage(nextPageName, this.getTreeLeaf(this.pageTree).parent, data, anim);
    }

    switchRootPage<T extends PageBase>(
        page: cc.Prefab | string | { new (): T },
        data: any = null,
        anim: PageSwitchAnim = PageSwitchAnim.none
    ) {
        const nextPageName = this.getPageName(page);
        this.switchPage(nextPageName, this.pageTree, data, anim);
    }

    switchPage(nextPageName: string, parentTreeNode: TreeNode, data: any, anim: PageSwitchAnim) {
        if (this.pageChanging) return;
        this.pageChanging = true;
        let curTreeNode: TreeNode | undefined;
        let curDisTreeNode: TreeNode | undefined;
        if (parentTreeNode.child) {
            curTreeNode = parentTreeNode.child;
            curDisTreeNode = this.getTreeLeaf(parentTreeNode.child);
            cc.log(`PUT switch page from ${curTreeNode.name}[display:${curDisTreeNode.name}]`);
        }

        let nextTreeNode = parentTreeNode.others[nextPageName];
        let nextDisTreeNode: TreeNode;
        if (nextTreeNode) {
            nextDisTreeNode = this.getTreeLeaf(nextTreeNode);

            const page = nextDisTreeNode.page;
            page.setData(data);
            if (!page.navHidden) {
                page.navBar.clearAllFuncBtn();
                page.onLoadNavBar(page.navBar);
            }
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
        this.doSwitchPageAnim(curDisTreeNode ? curDisTreeNode.page.node : undefined, nextDisTreeNode.page.node, anim, () => {
            if (curDisTreeNode) this.hidePage(curDisTreeNode.page);
            this.pageChanging = false;
            this.didShowPage(nextDisTreeNode.page);
        });
    }

    doSwitchPageAnim(curNode: cc.Node | undefined, nextNode: cc.Node, anim: PageSwitchAnim, callback: () => void) {
        if (!curNode || anim === PageSwitchAnim.none) {
            nextNode.x = 0;
            nextNode.y = 0;
            return callback();
        } else if (anim === PageSwitchAnim.fromLeft || anim === PageSwitchAnim.fromRight) {
            curNode.x = 0;
            curNode.y = 0;
            const curToX = anim === PageSwitchAnim.fromLeft ? this.pageBed.width : -this.pageBed.width;
            const curToY = 0;
            setTimeout(() => {
                cc.tween(curNode).to(0.2, { x: curToX, y: curToY }, { easing: cc.easing.sineInOut }).start();
            });

            nextNode.x = anim === PageSwitchAnim.fromLeft ? -this.pageBed.width : this.pageBed.width;
            nextNode.y = 0;
            setTimeout(() => {
                cc.tween(nextNode)
                    .to(0.2, { x: 0, y: 0 }, { easing: cc.easing.sineInOut })
                    .call(() => {
                        setTimeout(() => {
                            callback();
                        });
                    })
                    .start();
            });
        } else if (anim === PageSwitchAnim.fromTop) {
            curNode.x = 0;
            curNode.y = 0;
            setTimeout(() => {
                cc.tween(curNode).to(0.35, { x: 0, y: -900 }, { easing: cc.easing.sineIn }).start();
            });

            nextNode.x = 0;
            nextNode.y = this.pageBed.height + this.navBed.height * 2;
            setTimeout(() => {
                cc.tween(nextNode)
                    .to(0.35, { x: 0, y: 0 }, { easing: cc.easing.sineOut })
                    .call(() => {
                        setTimeout(() => {
                            callback();
                        });
                    })
                    .start();
            });
        } else {
            curNode.x = 0;
            curNode.y = 0;
            const curToX = 0;
            const curToY = this.pageBed.height + this.navBed.height * 2;
            setTimeout(() => {
                cc.tween(curNode)
                    .to(0.35, { x: curToX, y: curToY }, { easing: cc.easing.sineIn })
                    .call(() => {
                        setTimeout(() => {
                            callback();
                        });
                    })
                    .start();
            });

            nextNode.x = 0;
            nextNode.y = -900;
            setTimeout(() => {
                cc.tween(nextNode).to(0.35, { x: 0, y: 0 }, { easing: cc.easing.sineOut }).start();
            });
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
        const prefab = this.prefabDict[pageName];
        cc.assert(prefab, `${pageName}并没有加入pagePrefabList中`);

        const pageNode = cc.instantiate(prefab);
        pageNode.parent = this.pageBed;
        const pageComp = pageNode.getComponent(PageBase);
        pageComp.init();
        pageComp.setData(data);

        if (!pageComp.navHidden) {
            const navNode = cc.instantiate(this.navPrefab);
            navNode.zIndex = cc.macro.MAX_ZINDEX;
            navNode.parent = pageNode;
            const navBar = navNode.getComponent(NavBar);
            navBar.ctrlr = this;
            pageComp.navBar = navBar;
            pageComp.onLoadNavBar(navBar);
        }

        return pageComp;
    }

    deconsteTreeNode(treeNode: TreeNode) {
        const child = treeNode.child;
        const others = treeNode.others;
        if (child) this.deconsteTreeNode(child);
        for (const key in others) {
            if (!others.hasOwnProperty(key)) continue;
            const otherTreeNode = others[key];
            this.deconsteTreeNode(otherTreeNode);
        }
        this.deconstePage(treeNode.page);
    }

    deconstePage(page: PageBase) {
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

    // char -----------------------------------------------------------------

    monitored: boolean = false;
    labelCharCacheFull: boolean = false;

    startLabelCharAtlasMonitor() {
        if (this.monitored) return;
        // @ts-ignore
        const shareAtlas = cc.Label._shareAtlas;
        if (shareAtlas) {
            this.monitored = true;
            const oldFunc = shareAtlas.getLetterDefinitionForChar;
            shareAtlas.getLetterDefinitionForChar = function (char: any, labelInfo: any) {
                const letter = oldFunc.call(this, char, labelInfo);
                if (!letter) this.labelCharError = true;
                return letter;
            };
        }
    }

    clearLabelCharCache() {
        cc.Label.clearCharCache();
        this.labelCharCacheFull = false;
    }

    // pop -----------------------------------------------------------------

    @property(cc.Node)
    toastNode: cc.Node = null!;
    toastLblNode!: cc.Node;
    toastLbl!: cc.RichText;

    @property(cc.Node)
    alertNode: cc.Node = null!;
    alertLbl!: cc.Label;
    alertBtn1Node!: cc.Node;
    alertBtn2Node!: cc.Node;
    alertBtn3Node!: cc.Node;
    alertBtn4Node!: cc.Node;
    alertBtnCancelNode!: cc.Node;

    @property(cc.Node)
    maskNode: cc.Node = null!;

    alertCallback?: (key: number) => void;

    initPops() {
        this.toastNode.opacity = 0;
        this.toastLblNode = this.toastNode.getChildByName('lbl_node');
        this.toastLbl = this.toastLblNode.getComponentInChildren(cc.RichText);

        this.alertNode.opacity = 0;
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

    toastEndFlag: number = 0;

    popToast(str: string) {
        this.toastLbl.string = str;
        if (this.labelCharCacheFull) {
            this.clearLabelCharCache();
            this.toastLbl.string = str;
        }

        // @ts-ignore
        const context = cc.Label._canvasPool.get().context;
        const fontDesc = this.toastLbl.fontSize.toString() + 'px ' + this.toastLbl.fontFamily;
        let strWidth = 0;
        let strWidthMax = 0;
        for (let index = 0; index < str.length; index++) {
            const char = str[index];
            if (char !== '\n') {
                // @ts-ignore
                strWidth += cc.textUtils.safeMeasureText(context, char, fontDesc);
            } else {
                if (strWidth > strWidthMax) strWidthMax = strWidth;
                strWidth = 0;
            }
        }
        if (strWidth > strWidthMax) strWidthMax = strWidth;

        this.toastLblNode.width = Math.min(strWidthMax, this.toastLbl.maxWidth);
        this.toastLblNode.height = this.toastLbl.node.height;

        this.toastNode.stopAllActions();
        this.toastEndFlag = 0;
        cc.tween(this.toastNode)
            .to(0.3, { opacity: 255 })
            .delay(1)
            .call(() => {
                this.toastEndFlag |= 0b1;
                this.closeToast();
            })
            .start();
    }

    closeToast() {
        if (this.toastEndFlag === 0b11) {
            this.toastEndFlag = 0;
            this.toastNode.stopAllActions();
            cc.tween(this.toastNode).to(0.3, { opacity: 0 }).start();
        }
    }

    goReadyToEndToast() {
        this.toastEndFlag |= 0b10;
        this.closeToast();
    }

    popAlert(
        txt: string,
        callback: (key: number) => void,
        btn1: string = '确定',
        btn2?: string,
        btn3?: string,
        btn4?: string,
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

        rerenderLbl(this.alertLbl);
        this.alertLbl.node.parent.getComponent(cc.Layout).updateLayout();
        this.alertNode.getComponent(cc.Layout).updateLayout();

        this.alertNode.stopAllActions();
        this.alertNode.opacity = 255;
        this.alertNode.y = -10;
        cc.tween(this.alertNode).to(0.3, { y: this.alertNode.height }, { easing: cc.easing.quadOut }).start();

        this.popMask();
    }

    closeAlert() {
        this.alertNode.stopAllActions();
        cc.tween(this.alertNode)
            .to(0.3, { y: -10 }, { easing: cc.easing.quadIn })
            .call(() => (this.alertNode.opacity = 0))
            .start();

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

    tabBarHiding: boolean = false;

    hideTabBar(b: boolean) {
        if (this.tabBarHiding === b) return;
        this.tabBarHiding = b;
        this.executeHideTabBar(b);
    }

    executeHideTabBar(b: boolean) {
        if (this.tabBar.getNumberOfRunningActions() > 0) return;
        const y = b ? -141 : 0;

        cc.tween(this.tabBar)
            .to(0.3, { y }, { easing: cc.easing.sineInOut })
            .call(() => {
                if (b !== this.tabBarHiding) setTimeout(() => this.executeHideTabBar(this.tabBarHiding));
            })
            .start();
    }
}
