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
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this));
    }

    check() {
        cc.assert(this.node._prefab.root == this.node, 'cell脚本需要放在prefab的根节点');

        this.node.name = this.node._prefab.asset.name;
        let clsName = cc.js.getClassName(this.__proto__.constructor);
        cc.assert(this.node.name == clsName, 'cell的prefab要和class名称一致');

        this.node.anchorX = 0;
        this.node.anchorY = 1;
        this.node.width = 1080;
        if (this.node.height == 0) this.node.height = 200;
        this.node.x = 0;
        this.node.y = 0;

        let root = this.node.getChildByName('root');
        if (!root) {
            root = new cc.Node('root');
            root.parent = this.node;
            let widegt = root.addComponent(cc.Widget);
            widegt.isAlignTop = true;
            widegt.isAlignBottom = true;
            widegt.isAlignLeft = true;
            widegt.isAlignRight = true;
            widegt.top = 0;
            widegt.bottom = 0;
            widegt.left = 0;
            widegt.right = 0;
        }

        let bake = this.node.getChildByName('bake');
        if (!bake) {
            bake = new cc.Node('bake');
            bake.parent = this.node;
            let widegt = bake.addComponent(cc.Widget);
            widegt.isAlignTop = true;
            widegt.isAlignBottom = true;
            widegt.isAlignLeft = true;
            widegt.isAlignRight = true;
            widegt.top = 0;
            widegt.bottom = 0;
            widegt.left = 0;
            widegt.right = 0;
        }

        for (const child of this.node.children) {
            if (child != root && child != bake) {
                cc.error('cell根节点下只能有root和bake');
            }
        }
    }

    // 触摸事件 -----------------------------------------------------------------

    touchTime: number = 0;

    onTouchStart() {
        this.touchTime = 0;
    }

    onTouchEnd() {
        this.touchTime = -10;
        this.onClick();
    }

    update(dt: number) {
        if (this.touchTime < -1) return;
        this.touchTime += dt;
        if (this.touchTime > 0.5) {
            this.touchTime = -10;
            this.onLongPressed();
        }
    }

    onClick() {}
    onLongPressed() {}
}
