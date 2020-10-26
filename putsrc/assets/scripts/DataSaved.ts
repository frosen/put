/*
 * DataSaved.ts
 * 用于保存的数据结构
 * luleyan
 */

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
export const EleColor = [
    null,
    cc.Color.RED,
    cc.Color.BLUE,
    cc.color(40, 170, 150),
    cc.color(128, 64, 0),
    cc.Color.ORANGE,
    cc.Color.BLACK
];

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

export enum PetState {
    ready = 1,
    rest
}

export const PetStateNames = ['', '备战中', '休息中'];

export class Feature {
    id: string;
    lv: number;
}

export const PetEquipCountMax: number = 3;
export const PrvtyMax: number = 1000000;

export class Merge {
    petId: string;
    featureId: string;
    num: number;
}

export class Pet {
    /** 类型 */
    id: string;

    nickname: string;
    master: string;

    catchTime: number;
    catchIdx: number;
    catchLv: number;

    state: PetState;

    /** 等级 */
    lv: number;

    /** 默契值 */
    prvty: number;
    prvtyTime: number;

    /** 当前食物 */
    drink: Drink;
    drinkTime: number;

    /** 当前经验 */
    exp: number;

    /** 专精特性id */
    exFeatureIds: string[];
    /** 天赋特性 */
    inbFeatures: Feature[];
    /** 习得特性 */
    lndFeatures: Feature[];

    /** 装备 */
    equips: Equip[];

    /** 融合 */
    merges: Merge[];
}

// -----------------------------------------------------------------

export enum ItemType {
    money = 1,
    cnsum = 9, // 消耗品
    equip = 18,
    caughtPet = 27
}

export class Item {
    id: string;
    itemType: ItemType;
}

export const ZUAN = '钻';
export const JIN = '金';
export const KUAI = '块';

export class Money extends Item {
    itemType: ItemType = ItemType.money;
    id: string = 'money';
    sum: number;
}

export enum CnsumType {
    drink = 1,
    catcher = 2,
    eqpAmplr = 3,
    material = 4
}

export class Cnsum extends Item {
    itemType: ItemType = ItemType.cnsum;
    count: number;
    cnsumType: CnsumType;
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

export class Material extends Cnsum {
    cnsumType: CnsumType = CnsumType.material;
}

export class Equip extends Item {
    itemType: ItemType = ItemType.equip;

    skillId: string;
    growth: number;
    selfFeatureLvs: number[];

    affixes: Feature[];
    learnTimes: number;

    catchIdx: number;
}

export class CaughtPet extends Item {
    itemType: ItemType = ItemType.caughtPet;
    petId: string;
    lv: number;
    exFeatureIds: string[];
    features: Feature[];
}

// -----------------------------------------------------------------

export abstract class PADBase {}

export class PADExpl extends PADBase {
    doneStep: number;
}

export class PADEqpMkt extends PADBase {
    updateTime: number;
    refreshCnt: number;
    eqps: Equip[];
}

export class PADPetMkt extends PADBase {
    updateTime: number;
    refreshCnt: number;
    pets: CaughtPet[];
}

export enum QuestDLineType {
    in3h = 1,
    in6h
}

export const QuestDLines = [0, 3 * 60 * 60 * 1000, 6 * 60 * 60 * 1000];
export const QuestDLineAwardRates = [1, 1.2, 1.5];

export enum QuestAmplType {
    ampl = 1,
    double
}

export const QuestAmplRates = [1, 1.5, 2];
export const QuestAmplAwardRates = [1, 1.2, 1.5];

export class Quest {
    id: string;
    startTime: number;
    progress: number;
    dLine: QuestDLineType;
    ampl: QuestAmplType;
}

export class PADQuester extends PADBase {
    updateTime: number;
    quests: Quest[];
    doneTimeDict: { [key: string]: number };
}

export class PADACntr extends PADBase {
    soldoutList: boolean[];
}

export class PosData {
    id: string;
    reput: number;
    actDict: { [key: string]: PADBase };
}

// -----------------------------------------------------------------

export class SPetMmr {
    catchIdx: number; // 战斗开始后，可能会变化的只有如下几项
    prvty: number;
    eqpTokens: string[];
}

export class EPetMmr {
    id: string;
    lv: number;
    exFeatureIds: string[];
    features: Feature[];
}

export class BattleMmr {
    startUpdCnt: number;
    seed: number;
    selfs: SPetMmr[];
    enemys: EPetMmr[];
    spcBtlId: number; // 特殊战斗的id
}

export const NeedUpdCntByStep = [1600, 4800, 14400];

export class ExplMmr {
    curPosId: string;
    startTime: number;
    startStep: number;
    stepEnterTime: number;
    curStep: number;
    chngUpdCnt: number;
    curBattle: BattleMmr;
    hiding: boolean;
    catcherId: string;
}

// -----------------------------------------------------------------

export class AcceQuestInfo {
    posId: string;
    questId: string;
}

// -----------------------------------------------------------------

export class GameData {
    profTitleIds: string[];

    pets: Pet[];
    totalPetCount: number; // 一共抓取过的精灵的总量，用于pet的索引

    items: Item[];
    weight: number;
    totalEquipCount: number; // 一共获得过的装备的总量，用于装备的索引

    curPosId: string;
    posDataDict: { [key: string]: PosData };

    curExpl: ExplMmr;

    acceQuestInfos: AcceQuestInfo[]; // 已经接受了的quest
}
