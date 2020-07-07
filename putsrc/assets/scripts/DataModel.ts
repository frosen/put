/*
 * DataModel.ts
 * 模型的数据结构
 * luleyan
 */

import { BattleController } from './BattleController';
import { EleType, BattleType, BioType, Pet } from './DataSaved';
import { Pet2, BattlePet, BattleBuff, AmplAttriType } from './DataOther';

// -----------------------------------------------------------------

export class BuffOutput {
    hp?: number;
    mp?: number;
    rage?: number;
    newBuffs?: { aim?: BattlePet; id: string; time: number }[];
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
    abstract onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any;
    abstract onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any): void;
    abstract onTurnEnd(thisPet: BattlePet, buff: BattleBuff, ctrlr: BattleController): BuffOutput | void;
    abstract getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string;
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
    oneAndOthers,
    oneAndSelf
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
    abstract onCasting(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onHealing(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onEnemyDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController): void;
    abstract onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController): void;
    abstract getInfo(datas: number[]): string;
}

export class PetModel {
    id: string;
    cnName: string;

    /** 生物类型 */
    bioType: BioType;
    /** 元素类型 */
    eleType: EleType;
    /** 战斗类型 */
    battleType: BattleType;
    /** 速度 */
    speed: number;

    baseStrength: number;
    addStrength: number;

    baseConcentration: number;
    addConcentration: number;

    baseDurability: number;
    addDurability: number;

    baseAgility: number;
    addAgility: number;

    baseSensitivity: number;
    addSensitivity: number;

    baseElegant: number;
    addElegant: number;

    selfFeatureIds: string[];

    selfSkillIds: string[];
}

// -----------------------------------------------------------------

export enum DrinkAimType {
    none,
    one,
    all
}

export class DrinkModel {
    id: string;
    cnName: string;
    lvMax: number;
    rank: number;
    mainAttri: AmplAttriType;
    mainPercent: number;
    subAttri: AmplAttriType;
    subPercent: number;
    aim: DrinkAimType;
    dura: number;
}

export class CatcherModel {
    id: string;
    cnName: string;
    lvMin: number;
    lvMax: number;
    rankMin: number;
    rankMax: number;
    bioType: BioType;
    eleType: EleType;
    battleType: BattleType;
    rate: number;
}

export class EqpAmplrModel {
    id: string;
    cnName: string;
    lvMax: number;
}

export enum EquipPosType {
    none,
    weapon = 1,
    defense,
    ornaments
}

export enum EquipAttriType {
    none,
    attack,
    skill,
    composition
}

export class EquipModel {
    id: string;
    cnName: string;
    featureIds: string[];
    rank: number;
    lv: number;
    equipPosType: EquipPosType;
    bioType: BioType;
    attriType: EquipAttriType;
    eleType: EleType;
    strength: number;
    concentration: number;
    durability: number;
    agility: number;
    sensitivity: number;
    elegant: number;
    armor: number;
}

// -----------------------------------------------------------------

export class WorkModel {}

export enum ExplStepType {
    outer = 1,
    passway,
    deep,
    center,
    secret
}

export const ExplStepNames = ['', '外围', '走廊', '深处', '中心', '秘境'];

export const RatesByStepType = [
    [],
    [1, 0, 0, 0],
    [0.87, 0.96, 0.99, 1], // 后一项是当前稀有度和前面稀有度之和，为了random方便写成这样
    [0.73, 0.92, 0.98, 1],
    [0.6, 0.87, 0.96, 1],
    [0.44, 0.8, 0.92, 1]
];

export const StepTypesByMax = [
    [],
    [ExplStepType.center],
    [ExplStepType.outer, ExplStepType.center],
    [ExplStepType.outer, ExplStepType.deep, ExplStepType.center],
    [ExplStepType.outer, ExplStepType.passway, ExplStepType.deep, ExplStepType.center]
];

export const UpdCntByStepType = [0, 1600, 4800, 14400];

export class ExplModel {
    stepMax: number;
}

type AllActType = WorkModel | ExplModel;

export class MovConditionModel {}

export class MovModel {
    id: string = '';
    price: number = 0;
    condition: MovConditionModel = null;
}

export class ActPosModel {
    id: string;
    cnName: string;
    lv: number;
    acts: string[];
    actDict: { [key: string]: AllActType };
    evts: string[];
    movs: MovModel[];
    loc: Partial<cc.Vec2>;
    petIdLists: string[][]; // 不同稀有度: 宠物列表
}

// -----------------------------------------------------------------

export class ProfTitleModel {
    id: string;
    cnName: string;
}
