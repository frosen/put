/*
 * BuffModelDict.ts
 * 持续效果
 * luleyan
 */

import { EleType, BattleType, Pet } from 'scripts/DataSaved';
import { BuffModel, BuffOutput, BuffType } from 'scripts/DataModel';
import { BattlePet, BattleBuff, Pet2 } from 'scripts/DataOther';
import { BattleController } from 'scripts/BattleController';

function fl1(n: number) {
    return n.toFixed(1);
}

function getSklDmgStr(pet2: Pet2, rate: number) {
    return `${fl1(pet2.sklDmgFrom * 0.1 * rate)}到${fl1(pet2.sklDmgTo * 0.1 * rate)}`;
}

const BuffModelDict: { [key: string]: Partial<BuffModel> } = {
    ZhuoShao: {
        id: 'ZhuoShao',
        cnName: '灼烧',
        brief: '灼',
        buffType: BuffType.debuff,
        eleType: EleType.fire,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            return { hp: BattleController.getSklDmg(buff.caster, thisPet) * 0.7 };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合对目标造成${getSklDmgStr(pet2, 0.7)}(70%)点火系伤害`;
        }
    },
    HanLeng: {
        id: 'HanLeng',
        cnName: '寒冷',
        brief: '寒',
        buffType: BuffType.debuff,
        eleType: EleType.water,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.speed -= 10;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.speed += 10;
        },
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            return { hp: BattleController.getSklDmg(buff.caster, thisPet) * 0.5 };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `减速目标，且每回合对目标造成${getSklDmgStr(pet2, 0.5)}(50%)点水系伤害`;
        }
    },
    ZhongDu: {
        id: 'ZhongDu',
        cnName: '中毒',
        brief: '毒',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            const rate = (1 - thisPet.hp / thisPet.hpMax) * 0.4 + 0.4;
            return { hp: BattleController.getSklDmg(buff.caster, thisPet) * rate };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合对目标造成最低40%最高80%技能攻击力的暗系伤害，血量越低伤害越高`;
        }
    },
    ZhuiLuo: {
        id: 'ZhuiLuo',
        cnName: '坠落',
        brief: '落',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            if (buff.time === 0) return { hp: BattleController.getSklDmg(buff.caster, thisPet) };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `效果结束时对目标造成${getSklDmgStr(pet2, 1)}(100%)点地系伤害`;
        }
    },
    JingJie: {
        id: 'JingJie',
        cnName: '警戒',
        brief: '警',
        buffType: BuffType.buff,
        eleType: EleType.water,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.hitRate += 10;
            thisPet.pet2.critRate += 10;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.hitRate -= 10;
            thisPet.pet2.critRate -= 10;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return '下次攻击必命中，必暴击';
        }
    },
    ReLi: {
        id: 'ReLi',
        cnName: '热力',
        brief: '热',
        buffType: BuffType.buff,
        eleType: EleType.fire,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            const from = caster.pet2.sklDmgFrom * 0.15 + thisPet.pet2.atkDmgFrom * 0.15;
            const to = caster.pet2.sklDmgTo * 0.15 + thisPet.pet2.atkDmgTo * 0.15;
            thisPet.pet2.atkDmgFrom += from;
            thisPet.pet2.atkDmgTo += to;
            return { from, to };
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            const { from, to } = data;
            thisPet.pet2.atkDmgFrom -= from;
            thisPet.pet2.atkDmgTo -= to;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `普攻伤害提高，相当于自身攻击力的15%伤害外加释放者技能攻击力的15%`;
        }
    },
    KongJu: {
        id: 'KongJu',
        cnName: '恐惧',
        brief: '惧',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            const atkRdc = thisPet.pet2.atkDmgFrom * 0.8;
            thisPet.pet2.atkDmgFrom -= atkRdc;
            thisPet.pet2.atkDmgTo -= atkRdc;
            const sklRdc = thisPet.pet2.sklDmgFrom * 0.8;
            thisPet.pet2.sklDmgFrom -= sklRdc;
            thisPet.pet2.sklDmgTo -= sklRdc;
            return { atkRdc, sklRdc };
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            const { atkRdc, sklRdc } = data;
            thisPet.pet2.atkDmgFrom += atkRdc;
            thisPet.pet2.atkDmgTo += atkRdc;
            thisPet.pet2.sklDmgFrom += sklRdc;
            thisPet.pet2.sklDmgTo += sklRdc;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标所有伤害降低80%`;
        }
    },
    ShanYao: {
        id: 'ShanYao',
        cnName: '闪耀',
        brief: '耀',
        buffType: BuffType.buff,
        eleType: EleType.light,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.hitRate += 0.1;
            thisPet.pet2.critRate += 0.1;
            thisPet.pet2.evdRate += 0.1;
            thisPet.pet2.dfsRate += 0.1;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.hitRate -= 0.1;
            thisPet.pet2.critRate -= 0.1;
            thisPet.pet2.evdRate -= 0.1;
            thisPet.pet2.dfsRate -= 0.1;
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
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            return { hp: Math.floor(thisPet.hpMax * 0.05) };
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
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.exBattleTypes.push(BattleType.melee);
            return thisPet.pet2.exBattleTypes.length - 1;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            const idx: number = data;
            thisPet.pet2.exBattleTypes.removeIndex(idx);
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `战斗方式变成近战`;
        }
    },
    FangHu: {
        id: 'FangHu',
        cnName: '防护',
        brief: '防',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.dfsRate += 0.2;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.dfsRate -= 0.2;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `增加20%免伤`;
        }
    },
    DunQiang: {
        id: 'DunQiang',
        cnName: '盾墙',
        brief: '墙',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.dfsRate += 0.8;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.dfsRate -= 0.8;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `增加80%免伤`;
        }
    },
    FeiXing: {
        id: 'FeiXing',
        cnName: '飞行',
        brief: '飞',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.speed += 100;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.speed -= 100;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `速度升至最大值`;
        }
    },
    HuiChun: {
        id: 'HuiChun',
        cnName: '回春',
        brief: '春',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            return { hp: BattleController.getSklDmg(buff.caster, null) * 0.8 * -1 };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合恢复目标${getSklDmgStr(pet2, 0.8)}(80%)点血量`;
        }
    },
    JingZhi: {
        id: 'JingZhi',
        cnName: '静止',
        brief: '止',
        buffType: BuffType.debuff,
        eleType: EleType.air,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.exBattleTypes.push(BattleType.stay);
            return thisPet.pet2.exBattleTypes.length - 1;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.exBattleTypes.removeIndex(data);
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
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.hitRate -= 0.3;
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.hitRate += 0.3;
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
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            const atk = thisPet.pet2.atkDmgTo * 1.5;
            const skl = thisPet.pet2.sklDmgTo * 1.5;
            thisPet.pet2.atkDmgTo += atk;
            thisPet.pet2.sklDmgTo += skl;
            return { atk, skl };
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            const { atk, skl } = data;
            thisPet.pet2.atkDmgTo -= atk;
            thisPet.pet2.sklDmgTo -= skl;
        },
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            const dmg = BattleController.getAtkDmg(thisPet, thisPet) + BattleController.getSklDmg(thisPet, thisPet);
            return { hp: Math.floor(dmg * 0.3) };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `最大伤害提高150%，但每回合都会受到相当于自身全部攻击力30%的暗系伤害`;
        }
    },
    JingJin: {
        id: 'JingJin',
        cnName: '精尽',
        brief: '尽',
        buffType: BuffType.debuff,
        eleType: EleType.fire,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            const mp = 20 + Math.floor(buff.caster.pet.lv / 10);
            if (ctrlr.getTeam(thisPet).mp >= mp) {
                return { mp };
            } else {
                return { mp, hp: BattleController.getSklDmg(buff.caster, thisPet) * 1.2 };
            }
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            const mp = 20 + Math.floor(pet.lv / 10);
            return `每回合燃烧掉目标${mp}点精神，如果精神不足20，则造成${getSklDmgStr(pet2, 1.2)}(120%)点火系伤害`;
        }
    },
    NingJing: {
        id: 'NingJing',
        cnName: '宁静',
        brief: '宁',
        buffType: BuffType.debuff,
        eleType: EleType.water,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            return { rage: 3 };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合减少目标3点斗志`;
        }
    },
    QiangJi: {
        id: 'QiangJi',
        cnName: '强击',
        brief: '强',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            const from = thisPet.pet2.atkDmgFrom * 0.6;
            const to = thisPet.pet2.atkDmgTo * 0.6;
            thisPet.pet2.atkDmgFrom += from;
            thisPet.pet2.atkDmgTo += to;
            return { from, to };
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            const { from, to } = data;
            thisPet.pet2.atkDmgFrom -= from;
            thisPet.pet2.atkDmgTo -= to;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `普攻伤害提高60%`;
        }
    },
    ZhuanZhu: {
        id: 'ZhuanZhu',
        cnName: '专注',
        brief: '专',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            const from = thisPet.pet2.sklDmgFrom * 0.4;
            const to = thisPet.pet2.sklDmgTo * 0.4;
            thisPet.pet2.sklDmgFrom += from;
            thisPet.pet2.sklDmgTo += to;
            return { from, to };
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            const { from, to } = data;
            thisPet.pet2.sklDmgFrom -= from;
            thisPet.pet2.sklDmgTo -= to;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `技能伤害提高40%`;
        }
    },
    ShengMen: {
        id: 'ShengMen',
        cnName: '生门',
        brief: '生',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            const r = ctrlr.ranSd();
            const id = r < 0.2 ? 'ReLi' : r < 0.4 ? 'JingJie' : r < 0.6 ? 'HuiChun' : r < 0.8 ? 'ZhuanZhu' : 'ShanYao';
            return { newBuffs: [{ id, time: 3 }] };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合随机获得增益效果`;
        }
    },
    SiMen: {
        id: 'SiMen',
        cnName: '死门',
        brief: '死',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            const r = ctrlr.ranSd();
            const id = r < 0.2 ? 'ZhuoShao' : r < 0.4 ? 'HanLeng' : r < 0.6 ? 'GeShang' : r < 0.8 ? 'ZhuiLuo' : 'ZhongDu';
            return { newBuffs: [{ id, time: 3 }] };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合随机获得减益效果`;
        }
    },
    LiuSha: {
        id: 'LiuSha',
        cnName: '流沙',
        brief: '沙',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            if (ctrlr.ranSd() < 0.1) return { newBuffs: [{ id: 'JingZhi', time: 1 }] };
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `每回合结束时，10%几率获得静止效果`;
        }
    },
    KongWu: {
        id: 'KongWu',
        cnName: '空舞',
        brief: '舞',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onStarted(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController): any {
            thisPet.pet2.speed += 50;
            thisPet.pet2.hitRate += 0.1;
            thisPet.pet2.evdRate += 0.1;
        },
        onTurnEnd(thisPet: Readonly<BattlePet>, buff: Readonly<BattleBuff>, ctrlr: BattleController): BuffOutput | void {
            if (ctrlr.ranSd() < 0.15) {
                const newPet = ctrlr.getTeam(thisPet).pets.getOne(pet => pet.hp > 0 && pet.pet2.speed < thisPet.pet2.speed);
                if (newPet) return { newBuffs: [{ aim: newPet, id: 'KongWu', time: 3 }] };
            }
        },
        onEnd(thisPet: Readonly<BattlePet>, caster: Readonly<BattlePet>, ctrlr: BattleController, data: any) {
            thisPet.pet2.speed -= 50;
            thisPet.pet2.hitRate -= 0.1;
            thisPet.pet2.evdRate -= 0.1;
        },
        getInfo(pet: Readonly<Pet>, pet2: Readonly<Pet2>): string {
            return `目标命中率，闪躲率提高10%，速度提高50点，每回合有15%的概率带领其他人一起舞蹈`;
        }
    }
};

export const buffModelDict: { [key: string]: BuffModel } = BuffModelDict as { [key: string]: BuffModel };
