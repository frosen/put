/*
 * Memory.ts
 * 储存
 * luleyan
 */

const MagicNum = Math.floor(Math.random() * 10000);

let memoryDirty: boolean = false;

function newInsWithChecker<T extends Object>(cls: { new (): T }): T {
    let ins = new cls();
    let checkIns = new cls();
    return new Proxy(ins, {
        set: function(target, key, value, receiver) {
            if (typeof value == 'number') {
                checkIns[key] = MagicNum - value;
            }
            memoryDirty = true;
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

function newList(list = null) {
    return new Proxy(list || [], {
        set: function(target, key, value, receiver) {
            memoryDirty = true;
            return Reflect.set(target, key, value, receiver);
        }
    });
}

function newDict(dict = null) {
    return new Proxy(dict || {}, {
        set: function(target, key, value, receiver) {
            memoryDirty = true;
            return Reflect.set(target, key, value, receiver);
        }
    });
}

// -----------------------------------------------------------------

export enum Rarity {
    none,
    N,
    R,
    SR
}

// -----------------------------------------------------------------

export class MovCondition {}

export class MovType {
    id: string = '';
    price: number = 0;
    condition: MovCondition = null;
}

export class ActPosType {
    id: string = '';
    cnName: string = '-';
    lvFrom: number = 0;
    lvTo: number = 0;
    acts: string[] = [];
    evts: string[] = [];
    movs: MovType[] = [];
    loc: cc.Vec2 = null;
}

export class ActPos {
    token: string = 'apToken';

    id: string = '';

    init(id: string, actPosType: ActPosType) {
        this.id = id;
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
    combo,
    stay,
    chaos
}

class PetType {
    id: string = '';
    cnName: string = '';

    rarity: Rarity = Rarity.none;

    /** 生物类型 */
    biotype: Biotype = Biotype.none;
    /** 元素类型 */
    eletype: Eletype = Eletype.none;
    /** 战斗类型 */
    battletype: Battletype = Battletype.none;
    /** 速度 */
    speed: number = 0;

    baseStrength: number = 0;
    addStrength: number = 0;

    baseConcentration: number = 0;
    addConcentration: number = 0;

    baseDurability: number = 0;
    addDurability: number = 0;

    baseAgility: number = 0;
    addAgility: number = 0;

    baseSensitivity: number = 0;
    addSensitivity: number = 0;

    baseElegant: number = 0;
    addElegant: number = 0;

    selfFeatures: string[] = [];
}

export class Pet {
    /** 类型 */
    id: string = '';

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

const RankToAttriRatio = [0, 1, 1.15, 1.32, 1.52, 1.75, 2.01, 2.31, 3.06, 3.52, 4.04, 4.65];
const BioToFromToRatio = [[], [0.85, 1.15], [0.6, 1.4], [1, 1], [0.85, 1.15], [0.85, 1.15]];

export class Pet2 {
    /** 力量 */
    strength: number = 0;
    /** 专注 */
    concentration: number = 0;
    /** 耐久 */
    durability: number = 0;
    /** 灵敏 */
    agility: number = 0;
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

    constructor(pet: Pet, petType: PetType) {
        let lv = pet.level;
        let rankRatio = RankToAttriRatio[pet.rank];

        this.strength = (petType.baseStrength + petType.addStrength * lv) * rankRatio;
        this.concentration = (petType.baseConcentration + petType.addConcentration * lv) * rankRatio;
        this.durability = (petType.baseDurability + petType.addDurability * lv) * rankRatio;
        this.agility = (petType.baseAgility + petType.addAgility * lv) * rankRatio;
        this.sensitivity = (petType.baseSensitivity + petType.addSensitivity * lv) * rankRatio;
        this.elegant = (petType.baseElegant + petType.addElegant * lv) * rankRatio;

        this.hpMax = this.durability * 25;
        this.mpMax = 100;

        let fromToRatio = BioToFromToRatio[petType.biotype];

        this.atkDmgFrom = this.strength * fromToRatio[0] + 5;
        this.atkDmgTo = this.strength * fromToRatio[1] + 15;

        this.sklDmgFrom = this.concentration * fromToRatio[0] + 15;
        this.sklDmgTo = this.concentration * fromToRatio[1] + 30;
    }
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

// -----------------------------------------------------------------

export class Item {
    type: number = 0;
}

// -----------------------------------------------------------------

export class GameData {
    curPosId: string = '';
    posDataDict: { [key: string]: ActPos } = newDict();
    pets: Pet[] = newList();
    items: Item[] = newList();
}

export class GameData2 {
    pet2s: Pet2[] = [];
}

// -----------------------------------------------------------------

import * as actPosTypeList from 'configs/ActPosType';
import * as petTypeList from 'configs/PetType';

export class Memory {
    actPosTypeDict: { [key: string]: ActPosType } = {};
    petTypeDict: { [key: string]: PetType } = {};

    gameData: GameData = newInsWithChecker(GameData);
    gameData2: GameData2 = new GameData2();

    init() {
        // 读取
        for (const actPosType of actPosTypeList) {
            this.actPosTypeDict[actPosType.id] = <any>actPosType;
        }
        for (const petType of petTypeList) {
            this.petTypeDict[petType.id] = <any>petType;
        }

        this.test();
    }

    test() {
        this.gameData.curPosId = 'yizhuang';
    }

    addActPos(posId: string): ActPos {
        let actPos = newInsWithChecker(ActPos);
        let curActPosType = this.actPosTypeDict[posId];
        actPos.init(posId, curActPosType);
        actPos.resetToken();
        this.gameData.posDataDict[posId] = actPos;
        return actPos;
    }

    update() {
        if (memoryDirty == true) {
            memoryDirty = false;
            this.resetGameData2();
            for (const listener of this.dataListeners) {
                listener.onMemoryDataChange(this);
            }
        }
    }

    resetGameData2() {
        let gd2 = this.gameData2;
        gd2.pet2s.length = 0;
        for (const pet of this.gameData.pets) {
            let petType = this.petTypeDict[pet.id];
            gd2.pet2s.push(new Pet2(pet, petType));
        }
    }

    dataListeners: any[] = [];

    addDataListener(listener: any) {
        cc.assert(listener.hasOwnProperty('onMemoryDataChange'), 'Memory的观察者必须有onMemoryDataChange这个函数');
        this.dataListeners.push(listener);
    }

    removeDataListener(listener: any) {
        this.dataListeners.length;
        for (let index = 0; index < this.dataListeners.length; index++) {
            const element = this.dataListeners[index];
            if (element == listener) {
                this.dataListeners.splice(index, 1);
            }
        }
    }
}
