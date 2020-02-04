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

/** 自定义d.ts */
declare function require(path: string): any;

/** 自定义d.ts */
declare let Editor: {
    Project: any;
    assetdb: any;
    Panel: any;
    Selection: any;
    Utils: any;
    Ipc: any;
    UI: any;
};

/** 自定义d.ts */
declare let _Scene: {
    Undo: any;
};
