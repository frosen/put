/*
 * Utils.ts
 * 各种工具
 * luleyan
 */

/** 深拷贝 */
export function deepCopy(o: object): object {
    if (o instanceof Array) {
        //先判断Array
        let n = [];
        for (let i = 0; i < o.length; ++i) n[i] = deepCopy(o[i]);
        return n;
    } else if (o instanceof Object) {
        if ('clone' in o) {
            // @ts-ignore
            return o.clone();
        } else {
            let n = {};
            for (let i in o) n[i] = deepCopy(o[i]);
            return n;
        }
    } else {
        return o;
    }
}

export function eachChild(node: cc.Node, func: (node: cc.Node) => boolean): boolean {
    for (const child of node.children) {
        if (func(child)) return true;
        if (eachChild(child, func)) return true;
    }
}

export function getNodeByUuid(uuid: string): cc.Node {
    let scene = cc.director.getScene();
    let thisNode = null;
    eachChild(scene, (node: cc.Node): boolean => {
        if (node.uuid === uuid) {
            thisNode = node;
            return true;
        } else return false;
    });
    return thisNode;
}

export function getNodeByDir(dir: string): cc.Node {
    return null;
}

// -----------------------------------------------------------------

// @ts-ignore
Array.prototype.removeIndex = function (ridx) {
    this[ridx] = undefined;
    for (let index = this.length - 1; index >= 0; index--) {
        if (typeof this[index] === 'undefined') continue;
        this.length = index + 1;
        return;
    }
    this.length = 0;
};

// @ts-ignore
Array.prototype.getLast = function () {
    return this.length > 0 ? this[this.length - 1] : null;
};

// @ts-ignore
Array.prototype.getOne = function (callback) {
    for (let index = 0; index < this.length; index++) {
        let curItem = this[index];
        if (callback(curItem)) return curItem;
    }
    return null;
};

// @ts-ignore
Array.prototype.getAvg = function (call: (a: any) => number) {
    let total: number = 0;
    for (const one of this) total += call(one);
    total /= this.length;
    return total;
};

// @ts-ignore
Array.prototype.getMax = function (call: (a: any) => number) {
    let max: number = -99999999;
    for (const one of this) max = Math.max(max, call(one));
    return max;
};
