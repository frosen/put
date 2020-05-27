/*
 * DataModel.ts
 * 模型的数据结构
 * luleyan
 */

import { BattleController } from './BattleController';
import { EleType, BattleType, BioType } from './DataSaved';
import { Pet2, BattlePet, BattleBuff } from './DataOther';

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

export class WorkModel {
    stepModels: StepModel[];
}

export class StepModel {
    petIds: string[];
}

export class ExplModel {
    stepModels: StepModel[];
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
}

// -----------------------------------------------------------------

export class ProfTitleModel {
    id: string;
    cnName: string;
}
