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
    equip = 1
}

export class Item {
    id: string;
    itemType: ItemType;
}

export class Equip extends Item {
    skillId: string;
    growth: number;
    selfFeatureLvs: number[];

    affixes: Feature[];
    learnTimes: number;
}

// -----------------------------------------------------------------

export class ActPos {
    id: string;
}

// -----------------------------------------------------------------

export class SelfPetMmr {
    catchIdx: number;
    privity: number;
    eqpTokens: string[];
}

export class EnemyPetMmr {
    id: string;
    lv: number;
    rank: number;
    features: Feature[];
}

export class BattleMmr {
    startTime: number;
    seed: number;
    enemys: EnemyPetMmr[];
    catchPetIdx: number;
}

export class ExplMmr {
    startTime: number;
    curStep: number;
    selfs: SelfPetMmr[];
    curBattle: BattleMmr;
    hiding: boolean;
}

// -----------------------------------------------------------------

export class GameDataSaved {
    profTitleIds: string[];

    pets: Pet[];
    /** 一共抓取过的宠物的总量，用于pet的索引 */
    totalPetCount: number;

    items: Item[];

    curPosId: string;
    posDataDict: { [key: string]: ActPos };

    curExpl: ExplMmr;
}
