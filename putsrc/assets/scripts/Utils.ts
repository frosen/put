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
        if (node.uuid == uuid) {
            thisNode = node;
            return true;
        } else return false;
    });
    return thisNode;
}

export function getNodeByDir(dir: string): cc.Node {
    return null;
}
