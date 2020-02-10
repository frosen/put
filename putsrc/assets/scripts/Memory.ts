/*
 * Memory.ts
 * 储存
 * luleyan
 */

const MagicNum = Math.floor(Math.random() * 10000);

function newWithChecker<T extends Object>(cls: { new (): T }): T {
    let ins = new cls();
    let checkIns = new cls();
    return new Proxy(ins, {
        set: function(target, key, value, receiver) {
            checkIns[key] = MagicNum - value;
            return Reflect.set(target, key, value, receiver);
        },
        get: function(target, key) {
            let v = target[key];
            if (typeof v == 'number') {
                if (MagicNum - v != checkIns[key] && v != checkIns[key]) {
                    throw new Error('number check wrong!');
                }
            }
            return v;
        }
    });
}

// -----------------------------------------------------------------

import * as actPosTypeDict from 'configs/ActPosType';

export class ActPosType {
    cnName: string = '-';
    lvFrom: number = 0;
    lvTo: number = 0;
    acts: string[] = [];
    evts: string[] = [];
    movs: string[] = [];
    loc: cc.Vec2 = null;
}

export class ActPos {
    token: string = 'apToken';

    key: string = '';

    init(key: string, actPosType: ActPosType) {
        this.key = key;
    }

    resetToken() {
        this.token = 'T' + String(new Date().getTime());
    }
}

// -----------------------------------------------------------------

export class Feature {}

export enum Biotype {
    none,
    human,
    magic,
    mech,
    nature,
    unknown
}

export enum Eletype {
    none,
    fire = 1,
    water,
    air,
    earth,
    light,
    dark
}

export enum Battletype {
    none,
    melee,
    shoot,
    charge,
    assassinate,
    stay,
    chaos
}

class PetType {
    name: string = '';

    /** 额外生物类型 */
    biotype: Biotype = Biotype.none;
    /** 额外元素类型 */
    eletype: Eletype = Eletype.none;
    /** 额外战斗类型 */
    battletype: Battletype = Battletype.none;
    /** 额外速度 */
    speed: number = 0;

    baseStrength: number = 0;
    addStrength: number = 0;

    baseConcentration: number = 0;
    addConcentration: number = 0;

    baseAgility: number = 0;
    addAgility: number = 0;

    baseDurability: number = 0;
    addDurability: number = 0;

    baseSensitivity: number = 0;
    addSensitivity: number = 0;

    baseElegant: number = 0;
    addElegant: number = 0;

    selfFeatures: string[] = [];
}

export class Pet {
    /** 类型 */
    type: string = '';
    master: string = '';
    state: string = '';

    /** 等级 */
    level: number = 0;
    /** 品阶 */
    rank: number = 0;

    /** 默契值 */
    privity: number = 0;
    /** 学习类型 */
    learningType: string = '';
    /** 学习值 */
    learingValue: number = 0;

    /** 当前经验 */
    exp: number = 0;

    /** 随机自带特性 */
    raFeatures: string[] = [];
    /** 学习了的特性 */
    learnedFeatures: string[] = [];

    /** 装备 */
    equips: string[] = [];
}

export class Pet2 {
    /** 力量 */
    strength: number = 0;
    /** 专注 */
    concentration: number = 0;
    /** 灵敏 */
    agility: number = 0;
    /** 耐久 */
    durability: number = 0;
    /** 细腻 */
    sensitivity: number = 0;
    /** 优雅 */
    elegant: number = 0;

    hpMax: number = 0;
    mpMax: number = 0;

    atkDmgFrom: number = 0;
    atkDmgTo: number = 0;

    sklDmgFrom: number = 0;
    sklDmgTo: number = 0;
}

export class PetBattle {
    hp: number = 0;

    /** 额外生物类型 */
    exBiotype: Biotype = Biotype.none;
    /** 额外元素类型 */
    exEletype: Eletype = Eletype.none;
    /** 额外战斗类型 */
    exBattletype: Battletype = Battletype.none;
    /** 额外速度 */
    exSpeed: number = 0;
}

export class Item {
    type: number = 0;
}

export class GameData {
    curPosKey: string = '';
    posDataDict: { [key: string]: ActPos } = {};
    pets: Pet[] = [];
    items: Item[] = [];
}

export class GameData2 {
    pets: Pet2[] = [];
}

export class Memory {
    actPosTypeDict: { [key: string]: ActPosType } = {};

    gameData: GameData = newWithChecker(GameData);
    gameData2: GameData2 = new GameData2();

    init() {
        // 读取
        this.actPosTypeDict = <any>actPosTypeDict;

        this.test();
    }

    test() {
        this.gameData.curPosKey = 'yizhuang';
    }

    addActPos(posKey: string): ActPos {
        let actPos = newWithChecker(ActPos);
        let curActPosType = this.actPosTypeDict[posKey];
        actPos.init(posKey, curActPosType);
        actPos.resetToken();
        this.gameData.posDataDict[posKey] = actPos;
        return actPos;
    }
}
