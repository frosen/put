/*
 * c_mine.d.ts
 * 自定义补全
 * luleyan
 */

declare module cc {
    /** 补全于c_mine */
    export function assert(condition: any, log: string): void;

    export interface Node {
        /** 自定义d.ts */
        _prefab: {
            root: cc.Node;
            asset: cc.Asset;
        };
    }

    export interface Component {
        /** 自定义d.ts */
        __proto__: any;
    }
}
