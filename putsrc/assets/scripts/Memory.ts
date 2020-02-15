/*
 * Memory.ts
 * 储存
 * luleyan
 */

const MagicNum = Math.floor(Math.random() * 10000);

let memoryDirtyToken: number = -1;

function newInsWithChecker<T extends Object>(cls: { new (): T }): T {
    let ins = new cls();
    let checkIns = new cls();
    return new Proxy(ins, {
        set: function(target, key, value, receiver) {
            if (typeof value == 'number') {
                checkIns[key] = MagicNum - value;
            }
            memoryDirtyToken *= -1;
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
            memoryDirtyToken *= -1;
            return Reflect.set(target, key, value, receiver);
        }
    });
}

function newDict(dict = null) {
    return new Proxy(dict || {}, {
        set: function(target, key, value, receiver) {
            memoryDirtyToken *= -1;
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

export class Mov {
    id: string = '';
    price: number = 0;
    condition: MovCondition = null;
}

export class ActPosModel {
    id: string = '';
    cnName: string = '-';
    lvFrom: number = 0;
    lvTo: number = 0;
    acts: string[] = [];
    evts: string[] = [];
    movs: Mov[] = [];
    loc: cc.Vec2 = null;
}

export class ActPos {
    id: string = '';

    init(id: string, actPosModel: ActPosModel) {
        this.id = id;
    }
}

// -----------------------------------------------------------------

export class EnemyPet {
    id: string = '';

    /** 等级 */
    level: number = 0;
    /** 品阶 */
    rank: number = 0;
}

export class BattleFieldData {
    seed: number = 0;
    enemy: EnemyPet[] = newList();
}

// -----------------------------------------------------------------

export class Feature {}

export enum BioType {
    none,
    human,
    magic,
    mech,
    nature,
    unknown
}

export enum EleType {
    none,
    fire = 1,
    water,
    air,
    earth,
    light,
    dark
}

export enum BattleType {
    none,
    melee,
    shoot,
    charge,
    assassinate,
    combo,
    stay,
    chaos
}

class PetModel {
    id: string = '';
    cnName: string = '';

    rarity: Rarity = Rarity.none;

    /** 生物类型 */
    bioType: BioType = BioType.none;
    /** 元素类型 */
    eleType: EleType = EleType.none;
    /** 战斗类型 */
    battleType: BattleType = BattleType.none;
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

    setData(pet: Pet, petModel: PetModel) {
        let lv = pet.level;
        let rankRatio = RankToAttriRatio[pet.rank];

        this.strength = (petModel.baseStrength + petModel.addStrength * lv) * rankRatio;
        this.concentration = (petModel.baseConcentration + petModel.addConcentration * lv) * rankRatio;
        this.durability = (petModel.baseDurability + petModel.addDurability * lv) * rankRatio;
        this.agility = (petModel.baseAgility + petModel.addAgility * lv) * rankRatio;
        this.sensitivity = (petModel.baseSensitivity + petModel.addSensitivity * lv) * rankRatio;
        this.elegant = (petModel.baseElegant + petModel.addElegant * lv) * rankRatio;

        this.hpMax = this.durability * 25;
        this.mpMax = 100;

        let fromToRatio = BioToFromToRatio[petModel.bioType];

        this.atkDmgFrom = this.strength * fromToRatio[0] + 5;
        this.atkDmgTo = this.strength * fromToRatio[1] + 15;

        this.sklDmgFrom = this.concentration * fromToRatio[0] + 15;
        this.sklDmgTo = this.concentration * fromToRatio[1] + 30;
    }
}

// -----------------------------------------------------------------

export enum ItemType {
    equip
}

export class Item {
    id: number = 0;
    type: ItemType = ItemType.equip;
}

// -----------------------------------------------------------------

export class GameData {
    curPosId: string = '';
    posDataDict: { [key: string]: ActPos } = newDict();
    curBattle: BattleFieldData = null;
    pets: Pet[] = newList();
    items: Item[] = newList();
}

export class GameData2 {
    pet2s: Pet2[] = [];
}

// -----------------------------------------------------------------

import * as actPosModels from 'configs/ActPosModels';
import * as petModels from 'configs/PetModels';

export class Memory {
    actPosModelDict: { [key: string]: ActPosModel } = {};
    petModelDict: { [key: string]: PetModel } = {};

    gameData: GameData = newInsWithChecker(GameData);
    gameData2: GameData2 = new GameData2();

    set dirtyToken(t: number) {
        memoryDirtyToken = t;
    }
    get dirtyToken() {
        return memoryDirtyToken;
    }

    init() {
        // 读取
        for (const actPosModel of actPosModels) {
            this.actPosModelDict[actPosModel.id] = <any>actPosModel;
        }
        for (const petModel of petModels) {
            this.petModelDict[petModel.id] = <any>petModel;
        }

        this.test();
    }

    test() {
        this.gameData.curPosId = 'yizhuang';
    }

    addActPos(posId: string): ActPos {
        let actPos = newInsWithChecker(ActPos);
        let curActPosModel = this.actPosModelDict[posId];
        actPos.init(posId, curActPosModel);
        this.gameData.posDataDict[posId] = actPos;
        return actPos;
    }

    update() {
        if (memoryDirtyToken < 0) {
            memoryDirtyToken = memoryDirtyToken * -1 + 1;
            this.resetGameData2();
            for (const listener of this.dataListeners) {
                listener.onMemoryDataChange(this);
            }
        }
    }

    resetGameData2() {
        let gd2 = this.gameData2;
        let pet2s = gd2.pet2s;
        pet2s.length = this.gameData.pets.length;
        for (let index = 0; index < this.gameData.pets.length; index++) {
            const pet = this.gameData.pets[index];
            if (!pet2s[index]) pet2s[index] = new Pet2();
            let petModel = this.petModelDict[pet.id];
            pet2s[index].setData(pet, petModel);
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
