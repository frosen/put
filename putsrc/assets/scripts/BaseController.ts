/*
 * BaseController.ts
 * 基础控制器
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;
import PageBase from './PageBase';

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

class TreeNode {
    name: string = '';
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

    prefabDict: { [key: string]: cc.Prefab } = {};

    pageNodeDict: { [key: string]: cc.Node } = {};

    pageTree: TreeNode = null;

    onLoad() {
        if (CC_EDITOR) {
            this.setPagePrefabDict();
            return;
        }
        this.setCorrectRootRect();
        this.setPagePrefabDict();
        this.setTabBtns();
        this.setTree();
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
        this.actTBData.btn.node.emit('click', this.actTBData.btn);
    }

    // 页面管理 ========================================================

    pushPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }) {
        let pageName = this.getPageName(page);
        let curTreeNode = this.getTreeLeaf(this.pageTree);
    }

    popPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }) {}

    switchCurPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }, method: PageSwitchMethod) {}

    switchRootPage<T extends PageBase>(page: cc.Prefab | string | { new (): T }) {
        let pageName = this.getPageName(page);
        cc.log('PUT switch root page to ', pageName);

        let tree = this.pageTree;
        let lastTreeNode = null;
        let curChild = null;
        if (tree.child) {
            lastTreeNode = this.getTreeLeaf(tree.child);
            curChild = tree.child;
        }

        let newTreeNode = tree.others[pageName];
        if (!newTreeNode) {
            newTreeNode = new TreeNode();
            newTreeNode.name = pageName;
            newTreeNode.parent = tree;
        }

        if (lastTreeNode) this.hideTreeNode(lastTreeNode);
        this.showTreeNode(newTreeNode);

        if (curChild) tree.others[curChild.name] = curChild;
        tree.child = newTreeNode;
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

    getPageNode(pageName: string) {
        if (this.pageNodeDict.hasOwnProperty(pageName)) {
            return this.pageNodeDict[pageName];
        }

        let prefab = this.prefabDict[pageName];
        cc.assert(prefab, `${pageName}并没有加入pagePrefabList中`);

        let newNode = cc.instantiate(prefab);

        this.pageNodeDict[pageName] = newNode;

        let pageComp = newNode.getComponent(PageBase);
        pageComp.init(this);

        newNode.parent = this.pageBed;
        return newNode;
    }

    getTreeLeaf(treeNode: TreeNode) {
        return treeNode.child ? this.getTreeLeaf(treeNode.child) : treeNode;
    }

    hideTreeNode(treeNode: TreeNode) {
        let pageName = treeNode.name;
        let node = this.getPageNode(pageName);
        node.active = false;
    }

    showTreeNode(treeNode: TreeNode) {
        let pageName = treeNode.name;
        let node = this.getPageNode(pageName);
        node.active = true;
    }
}
