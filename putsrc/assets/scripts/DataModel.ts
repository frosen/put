/*
 * DataModel.ts
 * 模型的数据结构
 * luleyan
 */

import { BattleController } from 'pages/page_act_expl/scripts/BattleController';
import { Pet2, BattlePet, BattleBuff } from './DataOther';
import { EleType, BattleType, BioType } from './DataSaved';

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

export class MovConditionModel {}

export class MovModel {
    id: string = '';
    price: number = 0;
    condition: MovConditionModel = null;
}

export class ActPosModel {
    id: string = '';
    cnName: string = '-';
    lv: number = 0;
    acts: string[] = [];
    actDict: { [key: string]: AllActType } = {};
    evts: string[] = [];
    movs: MovModel[] = [];
    loc: Partial<cc.Vec2> = null;
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
    abstract onCasting(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onHealed(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void;
    abstract onEnemyDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController): void;
    abstract onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController): void;
    abstract getInfo(datas: number[]): string;
}

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

// -----------------------------------------------------------------

export class ProfTitleModel {
    id: string;
    cnName: string;
}
