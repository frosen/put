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

    setNum(num: number, color: cc.Color = null) {
        let numStr: string; // 超过万需要做特殊处理，保留最多6位长度才能不出格
        if (num < 10000) numStr = String(num);
        else if (num < 100000) numStr = (num / 10000).toFixed(2) + '万';
        else if (num < 1000000) numStr = (num / 10000).toFixed(1) + '万';
        else numStr = (num / 10000).toFixed(0) + '万';

        const childrenCount = this.node.childrenCount;
        const children = this.node.children;
        for (let index = 0; index < numStr.length; index++) {
            const letter = numStr[index];

            let sp: cc.Sprite;
            if (index < childrenCount) {
                sp = children[index].getComponent(cc.Sprite);
            } else {
                const newNode = new cc.Node();
                newNode.parent = this.node;
                newNode.setAnchorPoint(0, 0.5);
                newNode.color = this.node.color;
                sp = newNode.addComponent(cc.Sprite);
            }
            this.lvd.setSpByString(sp, letter, color);
        }

        for (let index = numStr.length; index < childrenCount; index++) {
            const sp = children[index].getComponent(cc.Sprite);
            this.lvd.setSpByString(sp, null, null);
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
