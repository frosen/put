/*
 * ListViewCell.ts
 * 列表元素
 * luleyan
 */

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class ListViewCell extends cc.Component {
    onLoad() {
        if (CC_EDITOR) this.check();
    }

    check() {
        cc.assert(this.node._prefab.root == this.node, 'cell脚本需要放在prefab的根节点');

        this.node.name = this.node._prefab.asset.name;

        this.node.anchorX = 0;
        this.node.anchorY = 1;
        this.node.width = 1080;
        if (this.node.height == 0) this.node.height = 200;
        this.node.x = 0;
        this.node.y = 0;
    }
}
