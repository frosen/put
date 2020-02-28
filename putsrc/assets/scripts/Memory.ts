/*
 * Memory.ts
 * 储存
 * luleyan
 */

import * as petModelDict from 'configs/PetModelDict';
import actPosModelDict from 'configs/ActPosModelDict';
import { BattlePet } from 'pages/page_act_exploration/scripts/BattleController';

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
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
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
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
            return Reflect.set(target, key, value, receiver);
        }
    });
}

function newDict(dict = null) {
    return new Proxy(dict || {}, {
        set: function(target, key, value, receiver) {
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
            return Reflect.set(target, key, value, receiver);
        }
    });
}

// -----------------------------------------------------------------

export class WorkModel {
    stepModels: StepModel[] = [];
}

export class StepModel {
    petIds: string[] = [];
}

export class ExplorationModel {
    stepModels: StepModel[] = [];
}

type AllActType = WorkModel | ExplorationModel;

export class MovCondition {}

export class Mov {
    id: string = '';
    price: number = 0;
    condition: MovCondition = null;
}

export class ActPosModel {
    id: string = '';
    cnName: string = '-';
    lv: number = 0;
    acts: string[] = [];
    actDict: { [key: string]: AllActType } = {};
    evts: string[] = [];
    movs: Mov[] = [];
    loc: Partial<cc.Vec2> = null;
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
    lv: number = 0;
    rank: number = 0;
}

export class BattleField {
    startTime: number = 0;
    seed: number = 0;
    enemys: EnemyPet[] = newList();
}

export class Exploration {
    startTime: number = 0;
    curStep: number = 0;
    curBattleField: BattleField = null;
}

// -----------------------------------------------------------------

export class BuffOutput {
    hp?: number;
    eleType?: EleType;
    mp?: number;
    rage?: number;
}

export abstract class Buff {
    abstract id: string;
    abstract cnName: string;
    abstract brief: string;
    abstract onSetting(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>);
    abstract onTurnEnd(thisPet: BattlePet, caster: BattlePet): BuffOutput | void;
    abstract getInfo(caster: Readonly<BattlePet>): string;
}

export enum SkillType {
    none,
    normal = 1,
    fast,
    ultimate
}

export enum SkillDirType {
    none,
    enemy,
    self
}

export enum SkillAimtype {
    none,
    one,
    oneAndNext,
    oneAndOthers
}

export class Skill {
    id: string;
    cnName: string;
    skillType: SkillType;
    dirType: SkillDirType;
    aimType: SkillAimtype;
    eleType: EleType;

    mainDmg: number;
    mainBuffId: string;
    mainBuffTime: number;

    subDmg: number;
    subBuffId: string;
    subBuffTime: number;

    cd: number;
    mp: number;
    rage: number;
}

export class Feature {}

export enum BioType {
    none,
    human,
    magic,
    mech,
    nature,
    unknown
}

export const BioTypeName = ['', '人形生物', '魔法生物', '机械生物', '自然生物', '未知生物'];

export enum EleType {
    none,
    fire = 1,
    water,
    air,
    earth,
    light,
    dark
}

export const EleTypeName = ['', '火', '水', '空', '地', '光', '暗'];

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

export const BattleTypeName = ['', '近战', '射击', '冲锋', '刺杀', '连段', '停止', '混乱'];

class PetModel {
    id: string = '';
    cnName: string = '';

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

    selfFeatureIds: string[] = [];

    selfSkillIds: string[] = [];
}

export enum PetState {
    rest,
    ready
}

export const PetRankNames = ['?', 'D', 'C', 'B', 'B+', 'A', 'A+', 'S', 'SS', 'N', 'T', 'Z'];

export class Pet {
    /** 类型 */
    id: string = '';

    master: string = '';

    catchTime: number = 0;
    catchIdx: number = 0;
    catchLv: number = 0;
    catchRank: number = 0;

    state: PetState = PetState.rest;

    /** 等级 */
    lv: number = 0;
    /** 品阶 */
    rank: number = 0;

    /** 默契值 */
    privity: number = 0;
    privityChangedTime: number = 0;

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
    equips: Item[] = [];

    addExp(exp: number) {}
}

const RankToAttriRatio = [0, 1, 1.3, 1.63, 1.95, 2.28, 2.62, 3.02, 3.47, 3.99, 4.59, 5.28];
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

    /** 额外生物类型 */
    exBioType: BioType = BioType.none;
    /** 额外元素类型 */
    exEleType: EleType = EleType.none;
    /** 额外战斗类型 */
    exBattleType: BattleType = BattleType.none;
    /** 额外速度 */
    exSpeed: number = 0;

    critRate: number = 0;
    critDmgRate: number = 0;
    evdRate: number = 0;
    hitRate: number = 0;
    dfsRate: number = 0;

    setData(pet: Pet, petModel: PetModel) {
        this.setData1(pet.lv, pet.rank, petModel);
        this.setData2();
        this.setData3(petModel.bioType);
        this.setData4(pet.privity);
    }

    setData1(lv: number, rank: number, petModel: PetModel) {
        let rankRatio = RankToAttriRatio[rank];

        this.strength = (petModel.baseStrength + petModel.addStrength * lv) * rankRatio;
        this.concentration = (petModel.baseConcentration + petModel.addConcentration * lv) * rankRatio;
        this.durability = (petModel.baseDurability + petModel.addDurability * lv) * rankRatio;
        this.agility = (petModel.baseAgility + petModel.addAgility * lv) * rankRatio;
        this.sensitivity = (petModel.baseSensitivity + petModel.addSensitivity * lv) * rankRatio;
        this.elegant = (petModel.baseElegant + petModel.addElegant * lv) * rankRatio;
    }

    setData2() {
        this.hpMax = this.durability * 25;
        this.mpMax = 100;
    }

    setData3(bioType: BioType) {
        let fromToRatio = BioToFromToRatio[bioType];

        this.atkDmgFrom = this.strength * fromToRatio[0] + 5;
        this.atkDmgTo = this.strength * fromToRatio[1] + 15;

        this.sklDmgFrom = this.concentration * fromToRatio[0] + 15;
        this.sklDmgTo = this.concentration * fromToRatio[1] + 30;
    }

    setData4(privity: number) {
        let privityPercent = privity * 0.01;
        this.critRate = privityPercent * 0.1;
        this.critDmgRate = 0.5 + privityPercent * 0.5;
        this.evdRate = 0.05 + privityPercent * 0.05;
        this.hitRate = 0.8 + privityPercent * 0.2;
        this.dfsRate = 0;
    }
}

// -----------------------------------------------------------------

export class Item {
    id: string = '';
    extras: string[] = newList();
}

// -----------------------------------------------------------------

export class GameData {
    curPosId: string = '';

    posDataDict: { [key: string]: ActPos } = newDict();
    curExploration: Exploration = null;

    pets: Pet[] = newList();
    /** 一共抓取过的宠物的总量，用于pet的索引 */
    totalPetCount: number = 0;

    items: Item[] = newList();
}

export class GameData2 {
    pet2s: Pet2[] = [];
}

// -----------------------------------------------------------------

export class Memory {
    gameData: GameData = newInsWithChecker(GameData);
    gameData2: GameData2 = new GameData2();

    set dirtyToken(t: number) {
        memoryDirtyToken = t;
    }
    get dirtyToken() {
        return memoryDirtyToken;
    }

    init() {
        this.test();
    }

    addActPos(posId: string): ActPos {
        let actPos = newInsWithChecker(ActPos);
        let curActPosModel: ActPosModel = actPosModelDict[posId];
        actPos.init(posId, curActPosModel);
        this.gameData.posDataDict[posId] = actPos;
        return actPos;
    }

    update() {
        if (memoryDirtyToken < 0) {
            memoryDirtyToken = memoryDirtyToken * -1 + 1;
            this.resetGameData2();
            for (const listener of this.dataListeners) {
                listener.onMemoryDataChanged();
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
            let petModel: PetModel = petModelDict[pet.id];
            pet2s[index].setData(pet, petModel);
        }
    }

    dataListeners: any[] = [];

    addDataListener(listener: any) {
        cc.assert('onMemoryDataChanged' in listener, 'Memory的观察者必须有onMemoryDataChanged这个函数');
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

    createExploration() {
        if (this.gameData.curExploration) return;
        let exploration = newInsWithChecker(Exploration);
        exploration.startTime = new Date().getTime();
        this.gameData.curExploration = exploration;
    }

    deleteExploration() {
        if (this.gameData.curExploration) {
            this.gameData.curExploration = null;
        }
    }

    createBattle(seed: number) {
        cc.assert(this.gameData.curExploration, '创建battle前必有Exploration');
        let curExploration = this.gameData.curExploration;
        if (curExploration.curBattleField) return;
        let battle = newInsWithChecker(BattleField);
        battle.startTime = new Date().getTime();
        battle.seed = seed;

        curExploration.curBattleField = battle;
    }

    createEnemyPet(id: string, lv: number, rank: number) {
        let p = newInsWithChecker(EnemyPet);
        p.id = id;
        p.lv = lv;
        p.rank = rank;

        this.gameData.curExploration.curBattleField.enemys.push(p);
    }

    deleteBattle() {
        cc.assert(this.gameData.curExploration, '删除battle前必有Exploration');
        this.gameData.curExploration.curBattleField = null;
    }

    // -----------------------------------------------------------------

    test() {
        this.gameData.curPosId = 'YiZhuang';

        let pet = newInsWithChecker(Pet);
        pet.id = 'FaTiaoWa';
        pet.state = PetState.ready;

        pet.catchTime = new Date().getTime();
        pet.catchIdx = 1;
        pet.catchLv = 1;
        pet.catchRank = 1;

        pet.lv = 1;
        pet.rank = 4;

        pet.privity = 100;
        pet.privityChangedTime = new Date().getTime();

        this.gameData.pets.push(pet);

        pet = newInsWithChecker(Pet);
        pet.id = 'FangShengJiXieBi';
        pet.state = PetState.ready;

        pet.catchTime = new Date().getTime();
        pet.catchIdx = 1;
        pet.catchLv = 1;
        pet.catchRank = 1;

        pet.lv = 1;
        pet.rank = 1;

        pet.privity = 0;
        pet.privityChangedTime = new Date().getTime();

        this.gameData.pets.push(pet);
    }
}
