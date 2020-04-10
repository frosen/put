/*
 * BuffModelDict.ts
 * 持续效果
 * luleyan
 */

import { BuffModel, BuffOutput, EleType, BattleType, BuffType } from 'scripts/Memory';
import { BattlePet, BattleBuff } from 'pages/page_act_expl/scripts/BattleController';

const BuffModelDict: { [key: string]: Partial<BuffModel> } = {
    RanShao: {
        id: 'RanShao',
        cnName: '燃烧',
        brief: '燃',
        buffType: BuffType.debuff,
        eleType: EleType.fire,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>): BuffOutput | void {
            return { hp: buff.caster.getSklDmg() * 0.7 };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `每回合对目标造成${Math.floor(caster.getSklDmg() * 0.7)}(70%)点火系伤害`;
        }
    },
    HanLeng: {
        id: 'HanLeng',
        cnName: '寒冷',
        brief: '寒',
        buffType: BuffType.debuff,
        eleType: EleType.water,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.speed -= 10;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            thisPet.pet2.speed += 10;
        },
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>): BuffOutput | void {
            return { hp: buff.caster.getSklDmg() * 0.5 };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `减速目标，且每回合对目标造成${Math.floor(caster.getSklDmg() * 0.5)}(50%)点水系伤害`;
        }
    },
    ZhongDu: {
        id: 'ZhongDu',
        cnName: '中毒',
        brief: '毒',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>): BuffOutput | void {
            let rate = (1 - thisPet.hp / thisPet.hpMax) * 0.4 + 0.4;
            return { hp: buff.caster.getSklDmg() * rate };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            let dmg = caster.getSklDmg();
            return `每回合对目标造成${Math.floor(dmg * 0.4)}(40%)至${Math.floor(dmg * 0.8)}(80%)点暗系伤害，血量越低伤害越高`;
        }
    },
    ZhuiLuo: {
        id: 'ZhuiLuo',
        cnName: '坠落',
        brief: '落',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>): BuffOutput | void {
            if (buff.time == 0) return { hp: buff.caster.getSklDmg() };
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `效果结束时对目标造成${Math.floor(caster.getSklDmg())}(100%)点地系伤害`;
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
    KongJu: {
        id: 'KongJu',
        cnName: '恐惧',
        brief: '惧',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            let atkRdc = thisPet.pet2.atkDmgFrom * 0.8;
            thisPet.pet2.atkDmgFrom -= atkRdc;
            thisPet.pet2.atkDmgTo -= atkRdc;
            let sklRdc = thisPet.pet2.sklDmgFrom * 0.8;
            thisPet.pet2.sklDmgFrom -= sklRdc;
            thisPet.pet2.sklDmgTo -= sklRdc;
            return { atkRdc, sklRdc };
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            let { atkRdc, sklRdc } = data;
            thisPet.pet2.atkDmgFrom += atkRdc;
            thisPet.pet2.atkDmgTo += atkRdc;
            thisPet.pet2.sklDmgFrom += sklRdc;
            thisPet.pet2.sklDmgTo += sklRdc;
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `目标所有伤害降低80%`;
        }
    },
    ShanYao: {
        id: 'ShanYao',
        cnName: '闪耀',
        brief: '耀',
        buffType: BuffType.buff,
        eleType: EleType.light,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>): any {
            thisPet.pet2.hitRate += 0.1;
            thisPet.pet2.critRate += 0.1;
            thisPet.pet2.evdRate += 0.1;
            thisPet.pet2.dfsRate += 0.1;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, data: any) {
            thisPet.pet2.hitRate -= 0.1;
            thisPet.pet2.critRate -= 0.1;
            thisPet.pet2.evdRate -= 0.1;
            thisPet.pet2.dfsRate -= 0.1;
        },
        getInfo(caster: Readonly<BattlePet>): string {
            return `目标命中率，闪躲率，暴击率和免伤各增加10%`;
        }
    },
    GeShang: {
        id: 'GeShang',
        cnName: '割伤',
        brief: '割',
        buffType: BuffType.debuff,
        eleType: EleType.air,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>): BuffOutput | void {
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
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>): BuffOutput | void {
            return { hp: buff.caster.getSklDmg() * 0.8 * -1 };
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
