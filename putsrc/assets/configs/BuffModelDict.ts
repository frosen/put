/*
 * BuffModelDict.ts
 * 持续效果
 * luleyan
 */

import { EleType, BattleType, Pet } from '../scripts/DataSaved';
import { BuffModel, BuffOutput, BuffType } from '../scripts/DataModel';
import { BattlePet, BattleBuff, Pet2 } from '../scripts/DataOther';
import { BtlCtrlr } from '../scripts/BtlCtrlr';

function fl1(n: number) {
    return n.toFixed(1);
}

function getSklDmgStr(pet2: Pet2, rate: number) {
    return `${fl1(pet2.sklDmgFrom * 0.1 * rate)}到${fl1(pet2.sklDmgTo * 0.1 * rate)}`;
}

const BuffModelDict: { [key: string]: BuffModel } = {
    ZhuoShao: {
        id: 'ZhuoShao',
        cnName: '灼烧',
        brief: '灼',
        buffType: BuffType.debuff,
        eleType: EleType.fire,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) * 0.7 };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合对目标造成${getSklDmgStr(pet2, 0.7)}(70%释放者招式伤害)点火系伤害`;
        }
    },
    HanLeng: {
        id: 'HanLeng',
        cnName: '寒冷',
        brief: '寒',
        buffType: BuffType.debuff,
        eleType: EleType.water,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.speed -= 10;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.speed += 10;
        },
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) * 0.5 };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `减速目标，且每回合对目标造成${getSklDmgStr(pet2, 0.5)}(50%释放者招式伤害)点水系伤害`;
        }
    },
    ZhongDu: {
        id: 'ZhongDu',
        cnName: '中毒',
        brief: '毒',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const rate = (1 - aim.hp / aim.hpMax) * 0.4 + 0.4;
            return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) * rate };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合对目标造成最低40%最高80%释放者招式攻击的暗系伤害，血量越低伤害越高`;
        }
    },
    ZhuiLuo: {
        id: 'ZhuiLuo',
        cnName: '坠落',
        brief: '落',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            if (buff.time === 0) return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `效果结束时对目标造成${getSklDmgStr(pet2, 1)}(100%释放者招式伤害)点地系伤害`;
        }
    },
    JingJie: {
        id: 'JingJie',
        cnName: '警戒',
        brief: '警',
        buffType: BuffType.buff,
        eleType: EleType.water,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.hitRate += 10;
            aim.pet2.critRate += 10;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.hitRate -= 10;
            aim.pet2.critRate -= 10;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return '目标下次攻击必命中，必暴击';
        }
    },
    ReLi: {
        id: 'ReLi',
        cnName: '热力',
        brief: '热',
        buffType: BuffType.buff,
        eleType: EleType.fire,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            const from = caster.pet2.sklDmgFrom * 0.15 + aim.pet2.atkDmgFrom * 0.15;
            const to = caster.pet2.sklDmgTo * 0.15 + aim.pet2.atkDmgTo * 0.15;
            aim.pet2.atkDmgFrom += from;
            aim.pet2.atkDmgTo += to;
            return { from, to };
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            const { from, to } = data;
            aim.pet2.atkDmgFrom -= from;
            aim.pet2.atkDmgTo -= to;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标普攻伤害提高，相当于自身攻击的15%伤害外加释放者招式攻击的15%`;
        }
    },
    KongJu: {
        id: 'KongJu',
        cnName: '恐惧',
        brief: '惧',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            const atkRdc = aim.pet2.atkDmgFrom * 0.8;
            aim.pet2.atkDmgFrom -= atkRdc;
            aim.pet2.atkDmgTo -= atkRdc;
            const sklRdc = aim.pet2.sklDmgFrom * 0.8;
            aim.pet2.sklDmgFrom -= sklRdc;
            aim.pet2.sklDmgTo -= sklRdc;
            return { atkRdc, sklRdc };
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            const { atkRdc, sklRdc } = data;
            aim.pet2.atkDmgFrom += atkRdc;
            aim.pet2.atkDmgTo += atkRdc;
            aim.pet2.sklDmgFrom += sklRdc;
            aim.pet2.sklDmgTo += sklRdc;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标所有攻击降低80%伤害`;
        }
    },
    ShanYao: {
        id: 'ShanYao',
        cnName: '闪耀',
        brief: '耀',
        buffType: BuffType.buff,
        eleType: EleType.light,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.hitRate += 0.1;
            aim.pet2.critRate += 0.1;
            aim.pet2.evdRate += 0.1;
            aim.pet2.dfsRate += 0.1;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.hitRate -= 0.1;
            aim.pet2.critRate -= 0.1;
            aim.pet2.evdRate -= 0.1;
            aim.pet2.dfsRate -= 0.1;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标命中率，闪躲率，暴击率和免伤各增加10%`;
        }
    },
    GeShang: {
        id: 'GeShang',
        cnName: '割伤',
        brief: '割',
        buffType: BuffType.debuff,
        eleType: EleType.air,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { hp: Math.floor(aim.hpMax * 0.05) };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合对目标造成最大血量5%的空系伤害，且无视护甲`;
        }
    },
    ChaoFeng: {
        id: 'ChaoFeng',
        cnName: '嘲讽',
        brief: '嘲',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.exBattleTypes.push(BattleType.melee);
            return aim.pet2.exBattleTypes.length - 1;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            const idx: number = data;
            aim.pet2.exBattleTypes.removeIndex(idx);
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标战斗方式变成近战`;
        }
    },
    FangHu: {
        id: 'FangHu',
        cnName: '防护',
        brief: '防',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.dfsRate += 0.2;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.dfsRate -= 0.2;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标增加20%免伤`;
        }
    },
    DunQiang: {
        id: 'DunQiang',
        cnName: '盾墙',
        brief: '墙',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.dfsRate += 0.8;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.dfsRate -= 0.8;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标增加80%免伤`;
        }
    },
    FeiXing: {
        id: 'FeiXing',
        cnName: '飞行',
        brief: '飞',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.speed += 100;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.speed -= 100;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标速度升至最大值`;
        }
    },
    HuiChun: {
        id: 'HuiChun',
        cnName: '回春',
        brief: '春',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { hp: BtlCtrlr.getSklDmg(buff.caster, null) * 0.8 * -1 };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标每回合恢复目标${getSklDmgStr(pet2, 0.8)}(80%释放者招式伤害)点血量`;
        }
    },
    JingZhi: {
        id: 'JingZhi',
        cnName: '静止',
        brief: '止',
        buffType: BuffType.debuff,
        eleType: EleType.air,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.exBattleTypes.push(BattleType.stay);
            return aim.pet2.exBattleTypes.length - 1;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.exBattleTypes.removeIndex(data);
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标停止一切行动`;
        }
    },
    MangMu: {
        id: 'MangMu',
        cnName: '盲目',
        brief: '盲',
        buffType: BuffType.debuff,
        eleType: EleType.light,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.hitRate -= 0.3;
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.hitRate += 0.3;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标命中率降低30%`;
        }
    },
    XieE: {
        id: 'XieE',
        cnName: '邪恶',
        brief: '恶',
        buffType: BuffType.buff,
        eleType: EleType.dark,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            const atk = aim.pet2.atkDmgTo * 1.5;
            const skl = aim.pet2.sklDmgTo * 1.5;
            aim.pet2.atkDmgTo += atk;
            aim.pet2.sklDmgTo += skl;
            return { atk, skl };
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            const { atk, skl } = data;
            aim.pet2.atkDmgTo -= atk;
            aim.pet2.sklDmgTo -= skl;
        },
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const dmg = BtlCtrlr.getAtkDmg(aim, aim) + BtlCtrlr.getSklDmg(aim, aim);
            return { hp: Math.floor(dmg * 0.3) };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标最大伤害提高150%，但每回合都会受到相当于自身全部攻击30%的暗系伤害`;
        }
    },
    JingJin: {
        id: 'JingJin',
        cnName: '精尽',
        brief: '尽',
        buffType: BuffType.debuff,
        eleType: EleType.fire,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const mp = 20 + Math.floor(buff.caster.pet.lv / 10);
            if (ctrlr.getTeam(aim).mp >= mp) {
                return { mp };
            } else {
                return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) * 1.2 };
            }
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            const mp = 20 + Math.floor(pet.lv / 10);
            const dmg = getSklDmgStr(pet2, 1.2);
            return `目标每回合燃烧掉目标${mp}点灵能，如果灵能不足${mp}点，则造成${dmg}(120%释放者招式伤害)点火系伤害`;
        }
    },
    NingJing: {
        id: 'NingJing',
        cnName: '宁静',
        brief: '宁',
        buffType: BuffType.debuff,
        eleType: EleType.water,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { rage: 3 };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标每回合减少目标3点斗志`;
        }
    },
    QiangJi: {
        id: 'QiangJi',
        cnName: '强击',
        brief: '强',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            const from = aim.pet2.atkDmgFrom * 0.6;
            const to = aim.pet2.atkDmgTo * 0.6;
            aim.pet2.atkDmgFrom += from;
            aim.pet2.atkDmgTo += to;
            return { from, to };
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            const { from, to } = data;
            aim.pet2.atkDmgFrom -= from;
            aim.pet2.atkDmgTo -= to;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标普攻伤害提高60%`;
        }
    },
    ZhuanZhu: {
        id: 'ZhuanZhu',
        cnName: '专注',
        brief: '专',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            const from = aim.pet2.sklDmgFrom * 0.4;
            const to = aim.pet2.sklDmgTo * 0.4;
            aim.pet2.sklDmgFrom += from;
            aim.pet2.sklDmgTo += to;
            return { from, to };
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            const { from, to } = data;
            aim.pet2.sklDmgFrom -= from;
            aim.pet2.sklDmgTo -= to;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标招式伤害提高40%`;
        }
    },
    ShengMen: {
        id: 'ShengMen',
        cnName: '生门',
        brief: '生',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const r = ctrlr.ranSd();
            const id = r < 0.2 ? 'ReLi' : r < 0.4 ? 'JingJie' : r < 0.6 ? 'HuiChun' : r < 0.8 ? 'ZhuanZhu' : 'ShanYao';
            return { newBuffs: [{ id, time: 3 }] };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标每回合随机获得增益效果`;
        }
    },
    SiMen: {
        id: 'SiMen',
        cnName: '死门',
        brief: '死',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const r = ctrlr.ranSd();
            const id = r < 0.2 ? 'ZhuoShao' : r < 0.4 ? 'HanLeng' : r < 0.6 ? 'GeShang' : r < 0.8 ? 'ZhuiLuo' : 'ZhongDu';
            return { newBuffs: [{ id, time: 3 }] };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标每回合随机获得减益效果`;
        }
    },
    LiuSha: {
        id: 'LiuSha',
        cnName: '流沙',
        brief: '沙',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            if (ctrlr.ranSd() < 0.1) return { newBuffs: [{ id: 'JingZhi', time: 1 }] };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合结束时，目标10%几率获得静止效果`;
        }
    },
    KongWu: {
        id: 'KongWu',
        cnName: '空舞',
        brief: '舞',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onStarted(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr): any {
            aim.pet2.speed += 50;
            aim.pet2.hitRate += 0.1;
            aim.pet2.evdRate += 0.1;
        },
        onTurnEnd(aim: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            if (ctrlr.ranSd() < 0.15) {
                const newPet = ctrlr.getTeam(aim).pets.getOne(pet => pet.hp > 0 && pet.pet2.speed < aim.pet2.speed);
                if (newPet) return { newBuffs: [{ aim: newPet, id: 'KongWu', time: 3 }] };
            }
        },
        onEnd(aim: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.speed -= 50;
            aim.pet2.hitRate -= 0.1;
            aim.pet2.evdRate -= 0.1;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标命中率，闪躲率提高10%，速度提高50点，每回合有15%的概率带领其他人一起舞蹈`;
        }
    }
};

export const buffModelDict: { [key: string]: BuffModel } = BuffModelDict as { [key: string]: BuffModel };
