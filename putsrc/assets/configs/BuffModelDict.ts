/*
 * BuffModelDict.ts
 * 持续效果
 * luleyan
 */

import { BuffModel, BuffOutput, EleType, BattleType, BuffType } from 'scripts/Memory';
import { BattlePet } from 'pages/page_act_expl/scripts/BattleController';

const BuffModelDict: { [key: string]: Partial<BuffModel> } = {
    RanShao: {
        id: 'RanShao',
        cnName: '燃烧',
        brief: '燃',
        buffType: BuffType.debuff,
        eleType: EleType.fire,
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {
            return { hp: caster.getSklDmg() * 0.7 };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `每回合对目标造成${Math.floor(caster.getSklDmg() * 0.7)}(70%)点火系伤害`;
        }
    },
    JingJie: {
        id: 'JingJie',
        cnName: '警戒',
        brief: '警',
        buffType: BuffType.buff,
        eleType: EleType.water,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.hitRate += 10;
            thisPet.pet2.critRate += 10;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            thisPet.pet2.hitRate -= 10;
            thisPet.pet2.critRate -= 10;
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return '下次攻击必命中，必暴击';
        }
    },
    ReLi: {
        id: 'ReLi',
        cnName: '热力',
        brief: '热',
        buffType: BuffType.buff,
        eleType: EleType.fire,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            let from = caster.pet2.sklDmgFrom * 0.15 + thisPet.pet2.atkDmgFrom * 0.15;
            let to = caster.pet2.sklDmgTo * 0.15 + thisPet.pet2.atkDmgTo * 0.15;
            thisPet.pet2.atkDmgFrom += from;
            thisPet.pet2.atkDmgTo += to;
            return { from, to };
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            let { from, to } = data;
            thisPet.pet2.atkDmgFrom += from;
            thisPet.pet2.atkDmgTo += to;
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `普攻提高${Math.floor(caster.getSklDmg() * 0.15)}(15%)点外加自身15%伤害`;
        }
    },
    GeShang: {
        id: 'GeShang',
        cnName: '割伤',
        brief: '割',
        buffType: BuffType.debuff,
        eleType: EleType.air,
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {
            return { hp: Math.floor(thisPet.hpMax * 0.05) };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `每回合对目标造成最大生命5%的空系伤害`;
        }
    },
    ChaoFeng: {
        id: 'ChaoFeng',
        cnName: '嘲讽',
        brief: '嘲',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.exBattleTypes.push(BattleType.melee);
            return thisPet.pet2.exBattleTypes.length - 1;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            let idx: number = data;
            thisPet.pet2.exBattleTypes.removeIndex(idx);
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `战斗方式变成近战`;
        }
    },
    FangHu: {
        id: 'FangHu',
        cnName: '防护',
        brief: '防',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.dfsRate += 0.2;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            thisPet.pet2.dfsRate -= 0.2;
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `增加20%免伤`;
        }
    },
    HuiChun: {
        id: 'HuiChun',
        cnName: '回春',
        brief: '春',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {
            return { hp: caster.getSklDmg() * 0.8 * -1 };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `每回合恢复目标${Math.floor(caster.getSklDmg() * 0.8)}(80%)点血量`;
        }
    },
    JingZhi: {
        id: 'JingZhi',
        cnName: '静止',
        brief: '止',
        buffType: BuffType.debuff,
        eleType: EleType.air,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.exBattleTypes.push(BattleType.stay);
            return thisPet.pet2.exBattleTypes.length - 1;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            thisPet.pet2.exBattleTypes.removeIndex(data);
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `目标停止一切行动`;
        }
    },
    MangMu: {
        id: 'MangMu',
        cnName: '盲目',
        brief: '盲',
        buffType: BuffType.debuff,
        eleType: EleType.light,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.hitRate -= 0.3;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            thisPet.pet2.hitRate += 0.3;
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `目标命中率降低30%`;
        }
    }
};

export default <{ [key: string]: BuffModel }>BuffModelDict;
