/*
 * DataSaved.ts
 * 用于保存的数据结构
 * luleyan
 */

export class UserData {
    id!: string;
    phone?: number;
}

export class ProTtl {
    gainTime!: number;
    data?: number | string; // 不能是object，因此这个值没有withChecker化
}

/** 成就状态 */
export enum AchvSt {
    /** 未获得 */
    none,
    /** 获得第一个 */
    gain1,
    /** 获得第二个 */
    gain2,
    /** 获得第一个和第二个 */
    gain1And2
}

// -----------------------------------------------------------------

export enum BioType {
    none,
    human,
    magic,
    mech,
    nature,
    unknown
}

export const BioTypeNames = ['', '人形生物', '魔法精灵', '机械精灵', '自然精灵', '未知精灵'];
export const BioColors = [
    undefined!,
    cc.color(240, 180, 60),
    cc.color(50, 50, 200),
    cc.color(120, 90, 70),
    cc.color(50, 170, 50),
    cc.color(100, 100, 100)
];

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
export const SimpleEleTypeNames = ['', '火', '水', '空', '地', '光', '暗'];
export const EleColors = [
    undefined!,
    cc.color(200, 50, 50),
    cc.color(50, 50, 200),
    cc.color(50, 200, 50),
    cc.color(190, 100, 30),
    cc.color(239, 170, 50),
    cc.color(185, 78, 255)
];
export const EleDarkColors = [
    undefined!,
    cc.color(150, 30, 30),
    cc.color(30, 30, 150),
    cc.color(30, 150, 30),
    cc.color(128, 64, 0),
    cc.color(200, 140, 0),
    cc.color(125, 25, 195)
];

export enum BtlType {
    none,
    melee,
    shoot,
    charge,
    assassinate,
    combo,
    stay,
    chaos
}

export const BtlTypeNames = ['', '近战', '射击', '冲锋', '刺杀', '连段', '停止', '混乱'];
export const BtlTypeColors = [
    undefined!,
    cc.color(200, 50, 50),
    cc.color(50, 50, 200),
    cc.color(240, 180, 60),
    cc.color(125, 25, 195),
    cc.color(100, 100, 100),
    cc.color(125, 0, 50)
];

export enum PetState {
    ready = 1,
    rest
}

export const PetStateNames = ['', '备战中', '休息中'];

export class Feature {
    id!: string;
    lv!: number;
}

export const PetEquipCountMax: number = 3;
export const PrvtyMax: number = 1000000;

export class Merge {
    oPetLv!: number;
    petId!: string;
    featureId!: string;
    featureLv!: number;
}

export class Pet {
    /** 类型 */
    id!: string;

    nickname!: string;
    master!: string;

    catchTime!: number;
    catchIdx!: number;
    catchLv!: number;

    state!: PetState;

    /** 等级 */
    lv!: number;

    /** 默契值 */
    prvty!: number;
    prvtyTime!: number;

    /** 当前食物 */
    drinkId!: string;
    drinkTime!: number;

    /** 当前经验 */
    exp!: number;

    /** 专精特性id */
    exFeatureIds!: string[];
    /** 天赋特性 */
    inbFeatures!: Feature[];
    /** 习得特性 */
    lndFeatures!: Feature[];

    /** 装备 */
    equips!: (Equip | undefined)[];

    /** 融合 */
    merges!: Merge[];

    /** 解绑次数 */
    unbindCnt!: number;
}

// -----------------------------------------------------------------

export enum ItemType {
    money = 1,
    cnsum = 9, // 消耗品
    equip = 18,
    caughtPet = 27
}

export class Item {
    id!: string;
    itemType!: ItemType;
}

export const ZUAN = '钻';
export const JIN = '金';
export const KUAI = '块';

export class Money extends Item {
    itemType: ItemType = ItemType.money;
    id: string = 'money';
    sum!: number;
}

export enum CnsumType {
    drink = 1,
    catcher = 2,
    eqpAmplr = 3,
    book = 4,
    special = 5,
    material = 6
}

export class Cnsum extends Item {
    itemType: ItemType = ItemType.cnsum;
    count!: number;
    cnsumType!: CnsumType;
}

export class Drink extends Cnsum {
    cnsumType: CnsumType = CnsumType.drink;
}

export class Catcher extends Cnsum {
    cnsumType: CnsumType = CnsumType.catcher;
}

export class EqpAmplr extends Cnsum {
    cnsumType: CnsumType = CnsumType.eqpAmplr;
}

export class Book extends Cnsum {
    cnsumType: CnsumType = CnsumType.book;
}

export class Special extends Cnsum {
    cnsumType: CnsumType = CnsumType.special;
}

export class Material extends Cnsum {
    cnsumType: CnsumType = CnsumType.material;
}

export class Equip extends Item {
    itemType: ItemType = ItemType.equip;

    skillId!: string;
    growth!: number;
    selfFeatureLvs!: number[];

    affixes!: Feature[];
    /** 锻造次数，锻造增加affixes，但次数有限 */
    forgeCnt!: number;

    catchIdx!: number;

    /** 解绑次数 */
    unbindCnt!: number;
}

export class CaughtPet extends Item {
    itemType: ItemType = ItemType.caughtPet;
    petId!: string;
    lv!: number;
    exFeatureIds!: string[];
    features!: Feature[];
}

// -----------------------------------------------------------------

export abstract class PADBase {}

export class PADExpl extends PADBase {
    doneStep!: number;
}

export class PADEqpMkt extends PADBase {
    updateTime!: number;
    refreshCnt!: number;
    eqps!: Equip[];
}

export class PADPetMkt extends PADBase {
    updateTime!: number;
    refreshCnt!: number;
    pets!: CaughtPet[];
}

/** 时间限制 */
export enum QuestDLineType {
    none,
    in3h,
    in6h
}

export const QuestDLines = [0, 3 * 60 * 60 * 1000, 6 * 60 * 60 * 1000];
export const QuestDLineAwardRates = [1, 1.2, 1.5];

/** 任务奖励倍率 */
export enum QuestAmplType {
    none,
    ampl, // 小范围增幅
    double
}

export const QuestAmplRates = [1, 1.5, 2];
export const QuestAmplAwardRates = [1, 1.2, 1.5];

export class Quest {
    id!: string;
    startTime!: number;
    prog!: number;
    dLine!: QuestDLineType;
    ampl!: QuestAmplType;
}

export class PADQuester extends PADBase {
    updateTime!: number;
    quests!: Quest[];
    doneTimeDict!: { [key: string]: number };
}

export class PADACntr extends PADBase {
    soldoutList!: boolean[];
}

export class PosData {
    id!: string;
    reput!: number;
    actDict!: { [key: string]: PADBase };
}

// -----------------------------------------------------------------

export class AcceQuestInfo {
    questId!: string;
    posId?: string;
    evtId?: string;
}

export class EvtRztKey {
    static start = 'start';
    static done = 'done';
}

export class EvtRztV {
    static had = 1;
    static done = 2;
}

export class Evt {
    id!: string;
    posId!: string;
    /**
     * 代表事件已经到达的文章段落，这个值对应psge的idx
     */
    sProg!: number;
    /**
     * 选择结果：number从个位开始表示每一次选择的选项索引值，索引值从1开始对应option的0号，如果值为0表示到选择位置但未选择
     * 任务/事件结果：1代表到达，2代表完成
     * 标记结果：1为到达
     * start：1为开始
     * done：1为完成
     */
    rztDict!: { [key: string]: number };
    /** 当前依赖任务 */
    curQuest?: Quest;
}

export enum StoryGainType {
    cnsum = 1,
    equip,
    pet,
    proTtl
}

export class StoryGain {
    gType!: StoryGainType;
    id!: string;
    cnt?: number;
}

export class StoryJIT {
    startSProg!: number;
    startLProg!: number;
    gainDataList!: { gains: StoryGain[]; lProg: number }[];
    finished!: boolean;
}

// -----------------------------------------------------------------

export class SPetMmr {
    catchIdx!: number; // 战斗开始后，可能会变化的只有如下几项
    prvty!: number;
    drinkId!: string;
    eqpTokens!: string[];
}

export class EPetMmr {
    id!: string;
    lv!: number;
    exFeatureIds!: string[];
    features!: Feature[];
}

export class BtlMmr {
    startUpdCnt!: number;
    seed!: number;
    selfs!: SPetMmr[];
    enemys!: EPetMmr[];
    spcBtlId!: string; // 特殊战斗的id
    hiding!: boolean;
}

export const NeedUpdCntByStep = [1600, 4800, 14400];
export const RdcUpdCntForFailByStep = [-200, -400, -800];

export class ExplMmr {
    curPosId!: string;
    startTime!: number;
    startStep!: number;
    stepEnterTime!: number;
    curStep!: number;
    chngUpdCnt!: number;
    btl?: BtlMmr;
    hiding!: boolean;
    catcherId?: string;
    afb!: boolean; // away from battle
}

// -----------------------------------------------------------------

export class GameData {
    roleName!: string;
    userData?: UserData;

    proTtlDict!: { [key: string]: ProTtl };

    achvSts!: AchvSt[];

    pets!: Pet[];
    totalPetCount!: number; // 一共抓取过的精灵的总量，用于pet的索引

    items!: Item[];
    weight!: number;
    totalEquipCount!: number; // 一共获得过的装备的总量，用于装备的索引

    curPosId!: string;
    posDataDict!: { [key: string]: PosData };

    acceQuestInfos!: AcceQuestInfo[]; // 已经接受了的quest

    evtDict!: { [key: string]: Evt };
    curEvtId?: string;
    storyJIT?: StoryJIT;
    ongoingEvtIds!: string[];
    finishedEvtIds!: string[];

    expl?: ExplMmr;
}
