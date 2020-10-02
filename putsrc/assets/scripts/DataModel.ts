/*
 * DataModel.ts
 * 模型的数据结构
 * luleyan
 */

import { BattleController } from './BattleController';
import { EleType, BattleType, BioType, Pet, GameData, Item } from './DataSaved';
import { Pet2, BattlePet, BattleBuff, AmplAttriType } from './DataOther';

// -----------------------------------------------------------------
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
// -----------------------------------------------------------------

export class CnsumModel {
    id: string;
    cnName: string;
    price: number;
}

export enum DrinkAimType {
    none,
    one,
    all
}

export class DrinkModel extends CnsumModel {
    lvMax: number;
    rank: number;
    mainAttri: AmplAttriType;
    mainPercent: number;
    subAttri: AmplAttriType;
    subPercent: number;
    aim: DrinkAimType;
    dura: number;
}

export class CatcherModel extends CnsumModel {
    lvMin: number;
    lvMax: number;
    rankMin: number;
    rankMax: number;
    bioType: BioType;
    eleType: EleType;
    battleType: BattleType;
    rate: number;
}

export class EqpAmplrModel extends CnsumModel {
    lvMax: number;
}

export class MaterialModel extends CnsumModel {
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
// -----------------------------------------------------------------

type CondFunc = (gd: GameData) => boolean;

export class EvtModel {
    id: string;
    condFunc?: CondFunc;
}

// -----------------------------------------------------------------

export class PAKey {
    static expl = 'exploration';
    static shop = 'shop';
    static eqpMkt = 'equipMarket';
    static petMkt = 'petMarket';
    static work = 'work';
    static quester = 'quester';
    static aCntr = 'awardsCenter';
    static rcclr = 'recycler';
}

export abstract class PAModel {
    condFunc?: CondFunc;
}

// -----------------------------------------------------------------

export enum ExplStepType {
    outer = 1,
    passway,
    deep,
    center
}

export const ExplStepNames = ['', '外围', '走廊', '深处', '中心'];

export const StepTypesByMax = [
    [],
    [ExplStepType.center],
    [ExplStepType.outer, ExplStepType.center],
    [ExplStepType.outer, ExplStepType.deep, ExplStepType.center],
    [ExplStepType.outer, ExplStepType.passway, ExplStepType.deep, ExplStepType.center]
];

export class ExplModel extends PAModel {
    stepMax: number;
    petIdLists: string[][]; // 不同stepType对应的精灵列表
    itemIdLists: string[][];
    eqpIdLists: string[][];
}

// -----------------------------------------------------------------

export class ShopModel extends PAModel {
    goodsList: string[];
}

// -----------------------------------------------------------------

export class EqpMktModel extends PAModel {
    eqpIdLists: string[][]; // 不同稀有度对应的装备列表
}

// -----------------------------------------------------------------

export class PetMktModel extends PAModel {
    petIdLists: string[][]; // 不同稀有度对应的精灵列表
}

// -----------------------------------------------------------------

export class WorkModel extends PAModel {}

// -----------------------------------------------------------------

export enum QuestType {
    support = 1,
    fight,
    fightRandom,
    gather,
    search
}

export abstract class QuestNeed {}

export class SupportQuestNeed extends QuestNeed {
    itemId: string;
    count: number;
}

export class FightQuestNeed extends QuestNeed {
    petIds: string[];
    name: string;
    count: number;
}

export class GatherQuestNeed extends QuestNeed {
    posId: string;
    step: number;
    name: string;
    count: number;
}

export class SearchQuestNeed extends QuestNeed {
    posId: string;
    step: number;
    name: string;
    time: number;
}

export class QuestModel {
    id: string;
    type: QuestType;
    cnName: string;
    desc: string;
    posId: string;
    evtId: string;
    need: QuestNeed;
    awardReput: number;
    awardMoney: number;
    awardItem: string;
}

export class QuesterModel extends PAModel {
    questDict: { [key: string]: QuestModel };
}

// -----------------------------------------------------------------

export enum ReputRank {
    ignoring = 1,
    renown,
    respect,
    veneration,
    worship
}

export const ReputNames = ['', '无视', '闻名', '尊敬', '崇敬', '崇拜'];

export class ReputAwardModel {
    need: ReputRank;
    price: number;
    fullId: string;
}

export class ACntrModel extends PAModel {
    awardList: ReputAwardModel[];
}

type AllPAModel = ExplModel | ShopModel | EqpMktModel | PetMktModel | WorkModel | QuesterModel | ACntrModel;

// -----------------------------------------------------------------

export class MovModel {
    id: string;
    price: number;
    condFunc?: CondFunc;
}

// -----------------------------------------------------------------

export enum ActPosType {
    town = 1,
    wild,
    NoGA // 无政府管辖区
}

export class ActPosModel {
    id: string;
    cnName: string;
    lv: number;
    type: ActPosType;
    evts: EvtModel[];
    actMDict: { [key: string]: AllPAModel };
    movs: MovModel[];
    loc: Partial<cc.Vec2>;
}

// -----------------------------------------------------------------
// -----------------------------------------------------------------

export class ProfTitleModel {
    id: string;
    cnName: string;
}
