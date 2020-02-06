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

const FUNC_BTN_DISTANCE = 108;
const FUNC_BTN_POS_BASE = 481;

class TreeNode {
    name: string = '';
    page: PageBase = null;
    parent: TreeNode = null;
    child: TreeNode = null;
    others: { [key: string]: TreeNode } = {};
}

export enum PageSwitchMethod {
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

    prefabDict: { [key: string]: cc.Prefab } = {};

    pageTree: TreeNode = null;

    onLoad() {
        if (CC_EDITOR) {
            this.setPagePrefabList();
            this.setPagePrefabDict();
            return;
        }

        this.setCorrectRootRect();

        this.touchLayer.getComponent(TouchLayer).init(this);

        this.memory = new Memory();
        this.memory.init();

        let debugTool = new DebugTool();
        debugTool.init();

        this.setPagePrefabDict();
        this.setTabBtns();
        this.setTree();
        this.setNav();
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

    initMemory() {
        this.memory = new Memory();
        this.memory.init();
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
        this.navBed.getChildByName('back').on('click', this.popPage.bind(this));
    }

    start() {
        if (CC_EDITOR) return;
        this.setBackBtnEnabled(false);
        this.setTitle('');
        this.setSubTitle('');
        this.actTBData.btn.node.emit('click', this.actTBData.btn);
    }

    // 页面管理 -----------------------------------------------------------------

    pageChanging: boolean = false;

    pushPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }) {
        if (this.pageChanging) return;
        this.pageChanging = true;

        let nextPageName = this.getPageName(page);
        let curTreeNode = this.getTreeLeaf(this.pageTree);
        let curPageName = curTreeNode.name;

        cc.log(`PUT push from ${curPageName} to ${nextPageName}`);

        let nextTreeNode = new TreeNode();
        nextTreeNode.name = nextPageName;
        nextTreeNode.page = this.createPage(nextPageName);
        nextTreeNode.parent = curTreeNode;
        curTreeNode.child = nextTreeNode;

        let nextPage = nextTreeNode.page;
        let curPage = curTreeNode.page;

        nextPage.node.zIndex = curPage.node.zIndex + 1;

        this.showPage(nextPage);
        this.doPushPageAnim(curPage.node, nextPage.node, () => {
            this.hidePage(curPage);
            this.pageChanging = false;
        });
    }

    doPushPageAnim(curNode: cc.Node, nextNode: cc.Node, callback: () => void) {
        nextNode.x = this.pageBed.width;
        nextNode.y = 0;

        curNode.x = 0;
        curNode.y = 0;

        cc.tween(nextNode)
            .to(0.2, { x: 0 }, { easing: 'sineInOut' })
            .call(callback)
            .start();

        cc.tween(curNode)
            .to(0.2, { x: this.pageBed.width * -0.25 }, { easing: 'sineInOut' })
            .start();
    }

    popPage() {
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

        this.showPage(nextPage);
        this.doPopPageAnim(curPage.node, nextPage.node, () => {
            this.deletePage(curPage);
            this.pageChanging = false;
        });
    }

    doPopPageAnim(curNode: cc.Node, nextNode: cc.Node, callback: () => void) {
        nextNode.x = this.pageBed.width * -0.25;
        nextNode.y = 0;

        curNode.x = 0;
        curNode.y = 0;

        cc.tween(curNode)
            .to(0.2, { x: this.pageBed.width }, { easing: 'sineInOut' })
            .call(callback)
            .start();

        cc.tween(nextNode)
            .to(0.2, { x: 0 }, { easing: 'sineInOut' })
            .start();
    }

    switchCurPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }, method: PageSwitchMethod) {}

    switchRootPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }) {
        if (this.pageChanging) return;

        let pageName = this.getPageName(page);
        cc.log('PUT switch root page to ', pageName);

        let tree = this.pageTree;
        let curTreeNode = null;
        let curChild = null;
        if (tree.child) {
            curTreeNode = this.getTreeLeaf(tree.child);
            curChild = tree.child;
        }

        let nextTreeNode = tree.others[pageName];
        if (!nextTreeNode) {
            nextTreeNode = new TreeNode();
            nextTreeNode.name = pageName;
            nextTreeNode.page = this.createPage(pageName);
            nextTreeNode.parent = tree;
        }

        nextTreeNode.page.node.zIndex = curTreeNode ? curTreeNode.page.node.zIndex : 0;

        if (curTreeNode) this.hidePage(curTreeNode.page);
        this.showPage(nextTreeNode.page);

        if (curChild) tree.others[curChild.name] = curChild;
        tree.child = nextTreeNode;
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

    createPage(pageName: string): PageBase {
        let prefab = this.prefabDict[pageName];
        cc.assert(prefab, `${pageName}并没有加入pagePrefabList中`);

        let newNode = cc.instantiate(prefab);
        let pageComp = newNode.getComponent(PageBase);
        pageComp.init(this);
        newNode.parent = this.pageBed;

        return pageComp;
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
        page.node.active = false;
    }

    showPage(page: PageBase) {
        page.node.active = true;
        page.onPageShow();
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

    setBackBtnEnabled(e: boolean = true) {
        this.backBtnActive = e;
        this.navBed.getChildByName('back').active = e;
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
}
