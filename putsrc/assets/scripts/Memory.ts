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

    // 战斗
    // /** 额外生物类型 */
    // exBiotype: Biotype = Biotype.none;
    // /** 额外元素类型 */
    // exEletype: Eletype = Eletype.none;
    // /** 额外战斗类型 */
    // exBattletype: Battletype = Battletype.none;
    // /** 额外速度 */
    // exSpeed: number = 0;

    get strength(): number {
        return 0;
    }
    get concentration(): number {
        return 0;
    }
    get agility(): number {
        return 0;
    }
    get durability(): number {
        return 0;
    }
    get sensitivity(): number {
        return 0;
    }
    get elegant(): number {
        return 0;
    }

    get hpMax(): number {
        return 100 + this.durability * 25;
    }
    get mpMax(): number {
        return 100;
    }
    get atkDmg(): number {
        return 5;
    }
    get sklDmg(): number {
        return 15;
    }

    /** 随机自带特性 */
    raFeatures: string[] = [];
    /** 学习了的特性 */
    learnedFeatures: string[] = [];
}

export class Item {
    type: number = 0;
}

export class GameData {
    pets: Pet[] = [];
    items: Item[] = [];

    id: number = 0;
}

export class Memory {
    gameData: GameData = newWithChecker(GameData);

    init() {}
}
