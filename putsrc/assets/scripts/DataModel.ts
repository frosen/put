/*
 * DataModel.ts
 * 模型的数据结构
 * luleyan
 */

import { BtlCtrlr } from './BtlCtrlr';
import { EleType, BattleType, BioType, Pet, Feature } from './DataSaved';
import { Pet2, BattlePet, BattleBuff } from './DataOther';

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

export class BuffModel {
    id!: string;
    cnName!: string;
    brief!: string;
    buffType!: BuffType;
    eleType!: EleType;
    onStarted?: (thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr) => any;
    onEnd?: (thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) => void;
    onTurnEnd?: (thisPet: BattlePet, buff: BattleBuff, ctrlr: BtlCtrlr) => BuffOutput | void;
    getInfo!: (pet: Readonly<Pet>, pet2: Readonly<Pet2>) => string;
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
    id!: string;
    cnName!: string;
    skillType!: SkillType;
    dirType!: SkillDirType;
    aimType!: SkillAimtype;
    eleType!: EleType;
    spBattleType!: BattleType;

    mainDmg!: number;
    mainBuffId!: string;
    mainBuffTime!: number;

    subDmg!: number;
    subBuffId!: string;
    subBuffTime!: number;

    cd!: number;
    mp!: number;
    rage!: number;

    hpLimit!: number;
}

export class FeatureBtlData {
    ctrlr!: BtlCtrlr;
    finalDmg!: number;
    skillModel?: SkillModel;
}

export class FeatureModel {
    id!: string;
    cnBrief!: string;
    dataAreas!: number[][];
    onBaseSetting?: (pet: Pet2, datas: number[]) => void;
    onSetting?: (pet: Pet2, datas: number[]) => void;
    onBtlStart?: (pet: BattlePet, datas: number[], ctrlr: BtlCtrlr) => void;
    onAtk?: (pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData) => void;
    onCast?: (pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData) => void;
    onHurt?: (pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData) => void;
    onHeal?: (pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData) => void;
    onBuff?: (pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData) => void;
    onEDead?: (pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr) => void;
    onDead?: (pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr) => void;
    onTurn?: (pet: BattlePet, datas: number[], ctrlr: BtlCtrlr) => void;
    getInfo!: (datas: number[]) => string;
}

export class PetModel {
    id!: string;
    cnName!: string;

    /** 生物类型 */
    bioType!: BioType;
    /** 元素类型 */
    eleType!: EleType;
    /** 战斗类型 */
    battleType!: BattleType;
    /** 速度 */
    speed!: number;

    baseStrength!: number;
    addStrength!: number;

    baseConcentration!: number;
    addConcentration!: number;

    baseDurability!: number;
    addDurability!: number;

    baseAgility!: number;
    addAgility!: number;

    baseSensitivity!: number;
    addSensitivity!: number;

    baseElegant!: number;
    addElegant!: number;

    selfFeatureIds!: string[];

    selfSkillIds!: string[];
}

export enum BossType {
    main = 1,
    sub,
    normal
}

export class SpcBtlPet {
    id!: string;
    lv!: number;
    ampl!: number;
    features!: Feature[];
    bossName!: string;
    bossType!: BossType; // 类型以给boss名字加颜色
}

export class SpcBtlModel {
    id!: string;
    pets!: SpcBtlPet[];
}

// -----------------------------------------------------------------
// -----------------------------------------------------------------

export class CnsumModel {
    id: string;
    cnName: string;
    price: number;
}

export enum AmplAttriType {
    exp = 1,
    expl,
    work,
    prvty,
    reput,

    strength,
    concentration,
    durability
}

export const AmplAttriNames = ['', '经验', '探索受益', '工作受益', '默契', '声望', '力量', '专注', '耐久'];

export class DrinkModel extends CnsumModel {
    lvMax: number;
    rank: number;
    mainAttri: AmplAttriType;
    mainPercent: number;
    subAttri: AmplAttriType;
    subPercent: number;
    dura: number;
}

export class CatcherModel extends CnsumModel {
    lvMin: number;
    lvMax: number;
    bioType: BioType;
    eleType: EleType;
    battleType: BattleType;
    rate: number;
}

export class EqpAmplrModel extends CnsumModel {
    lvMax: number;
}

export class BookModel extends CnsumModel {}

export class SpcModel extends CnsumModel {}

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

export class UseCond {
    evtId: string;
    progress: number;
}

export class EvtModel {
    id: string;
    useCond?: UseCond;
}

// -----------------------------------------------------------------

export abstract class PAModel {
    useCond?: UseCond;
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
    goodsIdList: string[];
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
    gather,
    search
}

export abstract class QuestNeed {
    count: number;
}

export class SupportQuestNeed extends QuestNeed {
    itemId: string;
}

export class FightQuestNeed extends QuestNeed {
    petIds: string[];
    name: string;
}

export class GatherQuestNeed extends QuestNeed {
    posId: string;
    step: number;
    name: string;
}

export class SearchQuestNeed extends QuestNeed {
    posId: string;
    step: number;
    name: string;
}

type AllQuestNeed = SupportQuestNeed | FightQuestNeed | GatherQuestNeed | SearchQuestNeed;

export class QuestModel {
    id: string;
    type: QuestType;
    cnName: string;
    descs: string[];
    need: AllQuestNeed;
    awardReput: number;
    awardMoney: number;
    awardItemIds: string[];
}

export class QuesterModel extends PAModel {
    questIdList: string[];
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
    useCond?: UseCond;
}

// -----------------------------------------------------------------

export enum ActPosType {
    town = 1,
    wild
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

export enum ProTtlType {
    kind = 1,
    purchase,
    pet,
    function,
    story
}

export class ProTtlModel {
    id: string;
    cnName: string | ((d: any) => string);
    info: string | ((d: any) => string);
    proTtlType: ProTtlType;
    order?: number;
    sbstId?: string; // 替代另一个ProTtl
}
