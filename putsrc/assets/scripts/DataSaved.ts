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

export const PetRankNames = ['?', 'D', 'C', 'B', 'B+', 'A', 'A+', 'S', 'SS', 'N', 'T', 'Z'];

export class Feature {
    id: string;
    lv: number;
}

export class Pet {
    /** 类型 */
    id: string;

    master: string;

    catchTime: number;
    catchIdx: number;
    catchLv: number;
    catchRank: number;

    state: PetState;

    /** 等级 */
    lv: number;
    /** 品阶 */
    rank: number;

    /** 默契值 */
    privity: number;
    privityChangedTime: number;

    /** 学习类型 */
    learningType: string;
    /** 学习值 */
    learingValue: number;

    /** 当前经验 */
    exp: number;

    /** 天赋特性 */
    inbornFeatures: Feature[];
    /** 学习了的特性 */
    learnedFeatures: Feature[];

    /** 装备 */
    equips: Equip[];
}

// -----------------------------------------------------------------

export enum ItemType {
    money = 1,
    cnsum = 9, // 消耗品
    equip = 18
}

export class Item {
    id: string;
    itemType: ItemType;
}

export class Money extends Item {
    count: number;
}

export class Cnsum extends Item {
    count: number;
}

export class Equip extends Item {
    skillId: string;
    growth: number;
    selfFeatureLvs: number[];

    affixes: Feature[];
    learnTimes: number;

    catchIdx: number;
}

// -----------------------------------------------------------------

export class PetMmr {
    id: string;
    lv: number;
    rank: number;
    features: Feature[];
}

export class ActPos {
    id: string;
}

// -----------------------------------------------------------------

export class SelfPetMmr {
    catchIdx: number;
    privity: number;
    eqpTokens: string[];
}

export class BattleMmr {
    startTime: number;
    seed: number;
    enemys: PetMmr[];
    catchPetIdx: number;
    spcBtlId: number; // 特殊战斗的id
}

export class ExplMmr {
    startTime: number;
    curStep: number;
    selfs: SelfPetMmr[];
    curBattle: BattleMmr;
    hiding: boolean;
}

// -----------------------------------------------------------------

export class GameData {
    profTitleIds: string[];

    pets: Pet[];
    totalPetCount: number; // 一共抓取过的宠物的总量，用于pet的索引

    items: Item[];
    weight: number;
    totalEquipCount: number; // 一共获得过的装备的总量，用于装备的索引

    curPosId: string;
    posDataDict: { [key: string]: ActPos };

    curExpl: ExplMmr;
}
