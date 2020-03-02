/*
 * BuffModelDict.ts
 * 持续效果
 * luleyan
 */

import { BuffModel, BuffOutput, EleType, BattleType } from 'scripts/Memory';
import { BattlePet } from 'pages/page_act_exploration/scripts/BattleController';

const BuffModelDict: { [key: string]: BuffModel } = {
    RanShao: {
        id: 'RanShao',
        cnName: '燃烧',
        brief: '燃',
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {},
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {},
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {
            return { hp: -Math.floor(caster.getSklDmg() * 0.7), eleType: EleType.fire };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `每回合对目标造成${Math.floor(caster.getSklDmg() * 0.7)}(70%)点火系伤害`;
        }
    },
    JingJie: {
        id: 'JingJie',
        cnName: '警戒',
        brief: '警',
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.hitRate += 10;
            thisPet.pet2.critRate += 10;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            thisPet.pet2.hitRate -= 10;
            thisPet.pet2.critRate -= 10;
        },
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {},
        getInfo(caster: Readonly<BattlePet>): string {
            return '下次攻击必命中，必暴击';
        }
    },
    ReLi: {
        id: 'ReLi',
        cnName: '热力',
        brief: '热',
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
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {},
        getInfo(caster: Readonly<BattlePet>): string {
            return `普攻提高${Math.floor(caster.getSklDmg() * 0.15)}(15%)点外加自身15%伤害`;
        }
    },
    GeShang: {
        id: 'GeShang',
        cnName: '割伤',
        brief: '割',
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {},
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {},
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {
            return { hp: Math.floor(thisPet.hpMax * 0.05), eleType: EleType.air };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `每回合对目标造成最大生命5%的空系伤害`;
        }
    },
    ChaoFeng: {
        id: 'ChaoFeng',
        cnName: '嘲讽',
        brief: '嘲',
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.exBattleTypes.push(BattleType.melee);
            return thisPet.pet2.exBattleTypes.length - 1;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            let idx: number = data;
            thisPet.pet2.exBattleTypes.removeIndex(idx);
        },
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {},
        getInfo(caster: Readonly<BattlePet>): string {
            return `战斗方式变成近战`;
        }
    },
    FangHu: {
        id: 'FangHu',
        cnName: '防护',
        brief: '防',
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.dfsRate += 0.2;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            thisPet.pet2.dfsRate -= 0.2;
        },
        onTurnEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): BuffOutput | void {},
        getInfo(caster: Readonly<BattlePet>): string {
            return `增加20%免伤`;
        }
    }
};

export default BuffModelDict;
