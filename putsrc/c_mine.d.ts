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

interface Array<T> {
    removeIndex(idx: number);
    getLast(): T;
    getOne(callback: (item: T) => boolean): T;
    getAvg(call: (item: T) => number): number;
    getMax(call: (item: T) => number): number;
    equals(anotherList: T[], call: (a: T, b: T) => boolean): boolean;
}

// -----------------------------------------------------------------

declare interface StartingBattleFeature {
    func: (pet: BattlePet, datas: number[], ctrlr: BattleController) => void;
    datas: number[];
    id: string;
}

declare interface AttackingFeature {
    func: (pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature) => void;
    datas: number[];
    id: string;
}

declare interface CastingFeature {
    func: (pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature) => void;
    datas: number[];
    id: string;
}

declare interface HurtFeature {
    func: (pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature) => void;
    datas: number[];
    id: string;
}

declare interface HealingFeature {
    func: (pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature) => void;
    datas: number[];
    id: string;
}

declare interface EnemyDeadFeature {
    func: (pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController) => void;
    datas: number[];
    id: string;
}

declare interface DeadFeature {
    func: (pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController) => void;
    datas: number[];
    id: string;
}
