/*
 * LogNumSprite.ts
 * 数字精灵
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageActExplLVD } from './PageActExplLVD';

@ccclass
export class LogNumSprite extends cc.Component {
    lvd: PageActExplLVD = null;

    init(lvd: PageActExplLVD) {
        this.lvd = lvd;
    }

    setNum(num: number) {
        let numStr = String(num);
        let childrenCount = this.node.childrenCount;
        let children = this.node.children;
        for (let index = 0; index < numStr.length; index++) {
            const letter = numStr[index];

            let sp: cc.Sprite;
            if (index < childrenCount) {
                sp = children[index].getComponent(cc.Sprite);
            } else {
                let newNode = new cc.Node();
                newNode.parent = this.node;
                newNode.setAnchorPoint(0, 0.5);
                sp = newNode.addComponent(cc.Sprite);
            }
            this.lvd.setSpByString(sp, letter);
        }

        for (let index = numStr.length; index < childrenCount; index++) {
            let sp = children[index].getComponent(cc.Sprite);
            this.lvd.setSpByString(sp, null);
        }

        let curX = 0;
        for (let index = 0; index < this.node.children.length; index++) {
            const node = this.node.children[index];
            node.x = curX;
            curX += node.width;
        }
        this.node.width = curX;
    }
}
