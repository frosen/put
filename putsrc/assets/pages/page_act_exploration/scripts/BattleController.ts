/*
 * BattleController.ts
 * 战斗处理类
 * luleyan
 */

import { BioType, EleType, BattleType } from 'scripts/Memory';

export class PetBattle {
    hp: number = 0;

    /** 额外生物类型 */
    exBioType: BioType = BioType.none;
    /** 额外元素类型 */
    exEleType: EleType = EleType.none;
    /** 额外战斗类型 */
    exBattleType: BattleType = BattleType.none;
    /** 额外速度 */
    exSpeed: number = 0;
}

export default class BattleController {
    init() {}
}
