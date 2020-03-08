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

export class SelfPetMmr {
    catchIdx: number = 0;
    eqpTokens: string[] = [];
    privity: number = 0;
}

export class EnemyPetMmr {
    id: string = '';
    lv: number = 0;
    rank: number = 0;
}

export class BattleMmr {
    startTime: number = 0;
    seed: number = 0;
    enemys: EnemyPetMmr[] = newList();
}

export class ExplorationMmr {
    startTime: number = 0;
    curStep: number = 0;
    selfs: SelfPetMmr[] = newList();
    curBattle: BattleMmr = null;
}

// -----------------------------------------------------------------

export class BuffOutput {
    hp?: number;
    mp?: number;
    rage?: number;
}

export enum BuffType {
    none,
    buff,
    debuff
}

export abstract class BuffModel {
    abstract id: string;
    abstract cnName: string;
    abstract brief: string;
    abstract buffType: BuffType;
    abstract eleType: EleType;
    abstract onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any;
    abstract onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any): void;
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

export class SkillModel {
    id: string;
    cnName: string;
    skillType: SkillType;
    dirType: SkillDirType;
    aimType: SkillAimtype;
    eleType: EleType;
    spBattleType: BattleType;

    mainDmg: number;
    mainBuffId: string;
    mainBuffTime: number;

    subDmg: number;
    subBuffId: string;
    subBuffTime: number;

    cd: number;
    mp: number;
    rage: number;

    hpLimit: number;
}

export abstract class Feature {
    abstract id: string;
    abstract cnName: string;
    abstract onSetting(pet: Readonly<Pet2>): void;
    abstract onStartedBattle(pet: Readonly<Pet2>): void;
    abstract onAttacked(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any): void;
    abstract onHurt(thisPet: BattlePet, caster: BattlePet): BuffOutput | void;
    abstract getInfo(caster: Readonly<BattlePet>): string;
}

export enum BioType {
    none,
    human,
    magic,
    mech,
    nature,
    unknown
}

export const BioTypeNames = ['', '人形生物', '魔法生物', '机械生物', '自然生物', '未知生物'];

export enum EleType {
    none,
    fire = 1,
    water,
    air,
    earth,
    light,
    dark
}

export const EleTypeNames = ['', '火系', '水系', '空系', '地系', '光系', '暗系'];

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

export const BattleTypeNames = ['', '近战', '射击', '冲锋', '刺杀', '连段', '停止', '混乱'];

export class PetModel {
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

export const PetStateNames = ['休息中', '备战中'];

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

// @ts-ignore
Array.prototype.removeIndex = function(ridx) {
    this[ridx] = undefined;
    for (let index = this.length - 1; index >= 0; index--) {
        if (this[index] === undefined) continue;
        this.length = index + 1;
        return;
    }
    this.length = 0;
};

// @ts-ignore
Array.prototype.getLast = function() {
    return this.length > 0 ? this[this.length - 1] : null;
};

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
    exBioTypes: BioType[] = [];
    /** 额外元素类型 */
    exEleTypes: EleType[] = [];
    /** 额外战斗类型 */
    exBattleTypes: BattleType[] = [];
    /** 额外速度 */
    exSpeed: number = 0;

    critRate: number = 0;
    critDmgRate: number = 0;
    evdRate: number = 0;
    hitRate: number = 0;
    dfsRate: number = 0;

    setData(pet: Pet, exEquipTokens: string[] = null, exPrivity: number = null) {
        let petModel: PetModel = petModelDict[pet.id];

        let lv = pet.lv;
        let rank = pet.rank;
        let bioType = petModel.bioType;
        let privity = exPrivity || pet.privity;

        // 一级属性
        let rankRatio = RankToAttriRatio[rank];
        this.strength = (petModel.baseStrength + petModel.addStrength * lv) * rankRatio;
        this.concentration = (petModel.baseConcentration + petModel.addConcentration * lv) * rankRatio;
        this.durability = (petModel.baseDurability + petModel.addDurability * lv) * rankRatio;
        this.agility = (petModel.baseAgility + petModel.addAgility * lv) * rankRatio;
        this.sensitivity = (petModel.baseSensitivity + petModel.addSensitivity * lv) * rankRatio;
        this.elegant = (petModel.baseElegant + petModel.addElegant * lv) * rankRatio;

        // 二级属性
        this.hpMax = this.durability * 25;
        this.mpMax = 100;

        let fromToRatio = BioToFromToRatio[bioType];

        this.atkDmgFrom = this.strength * fromToRatio[0] + 5;
        this.atkDmgTo = this.strength * fromToRatio[1] + 15;

        this.sklDmgFrom = this.concentration * fromToRatio[0] + 15;
        this.sklDmgTo = this.concentration * fromToRatio[1] + 30;

        // 其他属性
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

    getToken(): string {
        return '';
    }
}

// -----------------------------------------------------------------

export class GameData {
    curPosId: string = '';

    posDataDict: { [key: string]: ActPos } = newDict();
    curExploration: ExplorationMmr = null;

    pets: Pet[] = newList();
    /** 一共抓取过的宠物的总量，用于pet的索引 */
    totalPetCount: number = 0;

    items: Item[] = newList();
}

// -----------------------------------------------------------------

export class Memory {
    gameData: GameData = newInsWithChecker(GameData);

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
            for (const listener of this.dataListeners) {
                listener.onMemoryDataChanged();
            }
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
        let exploration = newInsWithChecker(ExplorationMmr);
        exploration.startTime = new Date().getTime();
        for (const pet of this.gameData.pets) {
            if (pet.state != PetState.ready) break; // 备战的pet一定在最上切不会超过5个
            let selfPetMmr = newInsWithChecker(SelfPetMmr);
            selfPetMmr.catchIdx = pet.catchIdx;
            selfPetMmr.privity = pet.privity;
            for (const equip of pet.equips) {
                selfPetMmr.eqpTokens.push(equip.getToken());
            }
            exploration.selfs.push(selfPetMmr);
        }

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
        if (curExploration.curBattle) return;
        let battle = newInsWithChecker(BattleMmr);
        battle.startTime = new Date().getTime();
        battle.seed = seed;

        curExploration.curBattle = battle;
    }

    createEnemyPet(id: string, lv: number, rank: number) {
        let p = newInsWithChecker(EnemyPetMmr);
        p.id = id;
        p.lv = lv;
        p.rank = rank;

        this.gameData.curExploration.curBattle.enemys.push(p);
    }

    deleteBattle() {
        cc.assert(this.gameData.curExploration, '删除battle前必有Exploration');
        this.gameData.curExploration.curBattle = null;
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
        pet.id = 'YaHuHanJuRen';
        pet.state = PetState.ready;

        pet.catchTime = new Date().getTime();
        pet.catchIdx = 2;
        pet.catchLv = 1;
        pet.catchRank = 1;

        pet.lv = 1;
        pet.rank = 2;

        pet.privity = 0;
        pet.privityChangedTime = new Date().getTime();

        this.gameData.pets.push(pet);

        pet = newInsWithChecker(Pet);
        pet.id = 'BaiLanYuYan';
        pet.state = PetState.ready;

        pet.catchTime = new Date().getTime();
        pet.catchIdx = 3;
        pet.catchLv = 1;
        pet.catchRank = 1;

        pet.lv = 1;
        pet.rank = 2;

        pet.privity = 0;
        pet.privityChangedTime = new Date().getTime();

        this.gameData.pets.push(pet);
    }
}
