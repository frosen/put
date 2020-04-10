/*
 * Memory.ts
 * 储存
 * luleyan
 */

import { BattlePet, BattleController, BattleBuff } from 'pages/page_act_expl/scripts/BattleController';
import * as petModelDict from 'configs/PetModelDict';
import actPosModelDict from 'configs/ActPosModelDict';
import featureModelDict from 'configs/FeatureModelDict';

let memoryDirtyToken: number = -1;

const MagicNum = 1654435769 + Math.floor(Math.random() * 1000000000);
function getCheckedNumber(s: number): number {
    return (s * MagicNum) >> 19;
}

function newInsWithChecker<T extends Object>(cls: { new (): T }): T {
    let ins = new cls();
    let checkIns = new cls();
    for (const key in checkIns) {
        if (!checkIns.hasOwnProperty(key)) continue;
        let cNum = checkIns[key];
        if (typeof cNum == 'number') checkIns[key] = getCheckedNumber(cNum) as any;
    }
    return new Proxy(ins, {
        set: function (target, key, value, receiver) {
            if (typeof value == 'number') {
                checkIns[key] = getCheckedNumber(value);
            }
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
            return Reflect.set(target, key, value, receiver);
        },
        get: function (target, key) {
            let v = target[key];
            if (typeof v == 'number') {
                if (getCheckedNumber(v) != checkIns[key]) {
                    throw new Error('number check wrong!');
                }
            }
            return v;
        }
    });
}

function newList(list = null) {
    return new Proxy(list || [], {
        set: function (target, key, value, receiver) {
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
            return Reflect.set(target, key, value, receiver);
        }
    });
}

function newDict(dict = null) {
    return new Proxy(dict || {}, {
        set: function (target, key, value, receiver) {
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

export class ExplModel {
    stepModels: StepModel[] = [];
}

type AllActType = WorkModel | ExplModel;

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
    features: Feature[] = [];
}

export class BattleMmr {
    startTime: number = 0;
    seed: number = 0;
    enemys: EnemyPetMmr[] = newList();
    catchPetIdx: number = -1;
}

export class ExplMmr {
    startTime: number = 0;
    curStep: number = 0;
    selfs: SelfPetMmr[] = newList();
    curBattle: BattleMmr = null;
    hiding: boolean = false;
}

// -----------------------------------------------------------------

export class ProfTitleModel {
    id: string;
    cnName: string;
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
    abstract onTurnEnd(thisPet: BattlePet, buff: BattleBuff): BuffOutput | void;
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

export type BattleDataForFeature = { ctrlr: BattleController; finalDmg: number; skillModel: SkillModel };

export abstract class FeatureModel {
    abstract id: string;
    abstract cnBrief: string;
    abstract dataAreas: number[][];
    abstract onBaseSetting(pet: Pet2, datas: number[]): void;
    abstract onSetting(pet: Pet2, datas: number[]): void;
    abstract onStartingBattle(pet: BattlePet, datas: number[], ctrlr: BattleController): void;
    abstract onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onHealed(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onKillingEnemy(pet: BattlePet, aim: BattlePet, datas: number[], ctrlr: BattleController): void;
    abstract onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController): void;
    abstract onTurnEnd(pet: BattlePet, datas: number[], ctrlr: BattleController): void;
    abstract getInfo(datas: number[]): string;
}

export class Feature {
    id: string;
    datas: number[];

    setDatas(lv: number) {
        let featureModel = featureModelDict[this.id];
        let datas = newList();
        for (const dataArea of featureModel.dataAreas) {
            let data = dataArea[0] + (lv - 1) * dataArea[1];
            datas.push(data);
        }
        this.datas = datas;
    }

    clone(): Feature {
        let feature = newInsWithChecker(Feature);
        feature.id = this.id;
        feature.datas = newList();
        for (const data of this.datas) {
            feature.datas.push(data);
        }
        return feature;
    }
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

    selfFeatures: Feature[] = [];

    selfSkillIds: string[] = [];
}

export enum PetState {
    ready = 1,
    rest
}

export const PetStateNames = ['', '备战中', '休息中'];

export const PetRankNames = ['?', 'D', 'C', 'B', 'B+', 'A', 'A+', 'S', 'SS', 'N', 'T', 'Z'];
export const PetRankToFeatureCount = [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 6];

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

    /** 天赋特性 */
    inbornFeatures: Feature[] = [];
    /** 学习了的特性 */
    learnedFeatures: Feature[] = [];

    /** 装备 */
    equips: Item[] = [];

    eachFeatures(callback: (featureModel: FeatureModel, datas: number[]) => void) {
        for (const feature of this.inbornFeatures) callback(featureModelDict[feature.id], feature.datas);
        let selfFeatures = petModelDict[this.id].selfFeatures.slice(0, PetRankToFeatureCount[this.rank]);
        for (const feature of selfFeatures) callback(featureModelDict[feature.id], feature.datas);
        for (const feature of this.learnedFeatures) callback(featureModelDict[feature.id], feature.datas);
    }
}

const RankToAttriRatio = [0, 1, 1.3, 1.63, 1.95, 2.28, 2.62, 3.02, 3.47, 3.99, 4.59, 5.28];
const BioToFromToRatio = [[], [0.85, 1.15], [0.6, 1.4], [1, 1], [0.85, 1.15], [0.85, 1.15]];

// @ts-ignore
Array.prototype.removeIndex = function (ridx) {
    this[ridx] = undefined;
    for (let index = this.length - 1; index >= 0; index--) {
        if (this[index] === undefined) continue;
        this.length = index + 1;
        return;
    }
    this.length = 0;
};

// @ts-ignore
Array.prototype.getLast = function () {
    return this.length > 0 ? this[this.length - 1] : null;
};

export class Pet2 {
    // 原始值 -----------------------------------------------------------------
    strengthOri: number = 0;
    concentrationOri: number = 0;
    durabilityOri: number = 0;
    agilityOri: number = 0;
    sensitivityOri: number = 0;
    elegantOri: number = 0;

    hpMaxOri: number = 0;
    mpMaxOri: number = 0;

    atkDmgFromOri: number = 0;
    atkDmgToOri: number = 0;

    sklDmgFromOri: number = 0;
    sklDmgToOri: number = 0;

    // 终值 -----------------------------------------------------------------

    strength: number = 0;
    concentration: number = 0;
    durability: number = 0;
    agility: number = 0;
    sensitivity: number = 0;
    elegant: number = 0;

    hpMax: number = 0;
    mpMax: number = 0;

    atkDmgFrom: number = 0;
    atkDmgTo: number = 0;

    sklDmgFrom: number = 0;
    sklDmgTo: number = 0;
    /** 速度 */
    speed: number = 0;

    /** 额外生物类型 */
    exBioTypes: BioType[] = [];
    /** 额外元素类型 */
    exEleTypes: EleType[] = [];
    /** 额外战斗类型 */
    exBattleTypes: BattleType[] = [];

    critRate: number = 0;
    critDmgRate: number = 0;
    evdRate: number = 0;
    hitRate: number = 0;
    dfsRate: number = 0;

    armor: number = 0;

    load: number = 0;

    setData(pet: Pet, exEquipTokens: string[] = null, exPrivity: number = null) {
        let petModel: PetModel = petModelDict[pet.id];

        let lv = pet.lv;
        let rank = pet.rank;
        let bioType = petModel.bioType;
        let privity = exPrivity || pet.privity;

        let rankRatio = RankToAttriRatio[rank];
        let fromToRatio = BioToFromToRatio[bioType];

        // 一级原始属性
        this.strengthOri = (petModel.baseStrength + petModel.addStrength * lv) * rankRatio;
        this.concentrationOri = (petModel.baseConcentration + petModel.addConcentration * lv) * rankRatio;
        this.durabilityOri = (petModel.baseDurability + petModel.addDurability * lv) * rankRatio;
        this.agilityOri = (petModel.baseAgility + petModel.addAgility * lv) * rankRatio;
        this.sensitivityOri = (petModel.baseSensitivity + petModel.addSensitivity * lv) * rankRatio;
        this.elegantOri = (petModel.baseElegant + petModel.addElegant * lv) * rankRatio;

        // 一级属性
        this.strength = this.strengthOri;
        this.concentration = this.concentrationOri;
        this.durability = this.durabilityOri;
        this.agility = this.agilityOri;
        this.sensitivity = this.sensitivityOri;
        this.elegant = this.elegantOri;

        // 特性加成
        pet.eachFeatures((model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onBaseSetting')) model.onBaseSetting(this, datas);
        });

        // 装备加成

        // 二级原始属性
        this.hpMaxOri = this.durability * 25;
        this.mpMaxOri = 100 + Math.floor(this.concentration / 30);
        this.atkDmgFromOri = this.strength * fromToRatio[0] + 5;
        this.atkDmgToOri = this.strength * fromToRatio[1] + 15;
        this.sklDmgFromOri = this.concentration * fromToRatio[0] + 15;
        this.sklDmgToOri = this.concentration * fromToRatio[1] + 30;

        // 二级属性
        this.hpMax = this.hpMaxOri;
        this.mpMax = this.mpMaxOri;
        this.atkDmgFrom = this.atkDmgFromOri;
        this.atkDmgTo = this.atkDmgToOri;
        this.sklDmgFrom = this.sklDmgFromOri;
        this.sklDmgTo = this.sklDmgToOri;
        this.speed = petModel.speed;

        // 其他属性
        let privityPercent = privity * 0.01;
        this.critRate = privityPercent * 0.1;
        this.critDmgRate = 0.5 + privityPercent * 0.5;
        this.evdRate = 0.05 + privityPercent * 0.05;
        this.hitRate = 0.8 + privityPercent * 0.2;
        this.dfsRate = 0;

        this.load = Math.floor(this.durability / 10);

        // 特性加成
        pet.eachFeatures((model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onSetting')) model.onSetting(this, datas);
        });

        // 装备加成

        this.hpMax = Math.max(this.hpMax, 1);
        this.mpMax = Math.max(this.mpMax, 1);
        this.atkDmgFrom = Math.max(this.atkDmgFrom, 1);
        this.atkDmgTo = Math.max(this.atkDmgTo, 1);
        this.sklDmgFrom = Math.max(this.sklDmgFrom, 1);
        this.sklDmgTo = Math.max(this.sklDmgTo, 1);
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

    curExpl: ExplMmr = null;

    profTitleIds: string[] = [];

    pets: Pet[] = newList();
    /** 一共抓取过的宠物的总量，用于pet的索引 */
    totalPetCount: number = 0;

    items: Item[] = newList();
}

export class GameData2 {
    petLenMax: number = 10;
}

// -----------------------------------------------------------------

export class Memory {
    gameData: GameData = newInsWithChecker(GameData);
    gameData2: GameData2 = new GameData2();

    saveToken: boolean = false;
    saveInterval: number = 0;

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

    update(dt: number) {
        if (memoryDirtyToken < 0) {
            memoryDirtyToken = memoryDirtyToken * -1 + 1;
            for (const listener of this.dataListeners) {
                listener.onMemoryDataChanged();
            }

            this.saveToken = true;
        }

        if (this.saveInterval > 0) {
            this.saveInterval -= dt;
        } else if (this.saveToken) {
            this.saveToken = false;
            this.saveInterval = 2.5;
            this.saveMemory();
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

    saveMemory() {
        cc.log('STORM cc ^_^ 保存 ');
    }

    // -----------------------------------------------------------------

    createExpl() {
        if (this.gameData.curExpl) return;
        let expl = newInsWithChecker(ExplMmr);
        expl.startTime = new Date().getTime();
        for (const pet of this.gameData.pets) {
            if (pet.state != PetState.ready) break; // 备战的pet一定在最上切不会超过5个
            let selfPetMmr = newInsWithChecker(SelfPetMmr);
            selfPetMmr.catchIdx = pet.catchIdx;
            selfPetMmr.privity = pet.privity;
            for (const equip of pet.equips) {
                selfPetMmr.eqpTokens.push(equip.getToken());
            }
            expl.selfs.push(selfPetMmr);
        }

        this.gameData.curExpl = expl;
    }

    deleteExpl() {
        if (this.gameData.curExpl) {
            this.gameData.curExpl = null;
        }
    }

    createBattle(seed: number, pets: Pet[]) {
        cc.assert(this.gameData.curExpl, '创建battle前必有Expl');
        let curExpl = this.gameData.curExpl;
        if (curExpl.curBattle) return;
        let battle = newInsWithChecker(BattleMmr);
        battle.startTime = new Date().getTime();
        battle.seed = seed;

        curExpl.curBattle = battle;

        for (const pet of pets) {
            this.createEnemyPet(pet.id, pet.lv, pet.rank, pet.inbornFeatures);
        }
    }

    createEnemyPet(id: string, lv: number, rank: number, features: Feature[]) {
        let p = newInsWithChecker(EnemyPetMmr);
        p.id = id;
        p.lv = lv;
        p.rank = rank;
        p.features = newList();
        for (const feature of features) p.features.push(feature.clone());

        this.gameData.curExpl.curBattle.enemys.push(p);
    }

    deleteBattle() {
        cc.assert(this.gameData.curExpl, '删除battle前必有Expl');
        this.gameData.curExpl.curBattle = null;
    }

    // -----------------------------------------------------------------

    addPet(id: string, lv: number, rank: number, features: Feature[]) {
        this.gameData.totalPetCount++;

        let pet = newInsWithChecker(Pet);
        pet.id = id;
        pet.state = PetState.rest;

        pet.catchTime = new Date().getTime();
        pet.catchIdx = this.gameData.totalPetCount;
        pet.catchLv = lv;
        pet.catchRank = rank;

        pet.lv = lv;
        pet.rank = rank;

        pet.privity = 0;
        pet.privityChangedTime = pet.catchTime;

        pet.inbornFeatures = newList();
        for (const feature of features) pet.inbornFeatures.push(feature.clone());

        this.gameData.pets.push(pet);

        this.sortPetsByState();
    }

    sortPetsByState() {
        this.gameData.pets.sort((a: Pet, b: Pet): number => {
            return a.state - b.state;
        });
    }

    moveUpPetInList(index: number) {
        if (index == 0) return;
        let pet = this.gameData.pets[index];
        this.gameData.pets.splice(index, 1);
        this.gameData.pets.splice(index - 1, 0, pet);
    }

    moveDownPetInList(index: number) {
        if (index == this.gameData.pets.length - 1) return;
        let pet = this.gameData.pets[index];
        cc.log('^_^!', this.gameData.pets);
        this.gameData.pets.splice(index, 1);
        this.gameData.pets.splice(index + 1, 0, pet);

        cc.log('^_^! end ', this.gameData.pets);
    }

    deletePet(index: number) {
        this.gameData.pets.splice(index, 1);
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
