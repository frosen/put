/*
 * BuffModelDict.ts
 * 持续效果
 * luleyan
 */

export class BufN {
    static ZhuoShao = 'ZhuoShao';
    static HanLeng = 'HanLeng';
    static ZhongDu = 'ZhongDu';
    static ZhuiLuo = 'ZhuiLuo';
    static JingJie = 'JingJie';
    static ReLi = 'ReLi';
    static KongJu = 'KongJu';
    static ShanYao = 'ShanYao';
    static GeShang = 'GeShang';
    static ChaoFeng = 'ChaoFeng';
    static FangHu = 'FangHu';
    static DunQiang = 'DunQiang';
    static FeiXing = 'FeiXing';
    static HuiChun = 'HuiChun';
    static JingZhi = 'JingZhi';
    static MangMu = 'MangMu';
    static XieE = 'XieE';
    static JingJin = 'JingJin';
    static NingJing = 'NingJing';
    static QiangJi = 'QiangJi';
    static ZhuanZhu = 'ZhuanZhu';
    static ShengMen = 'ShengMen';
    static SiMen = 'SiMen';
    static LiuSha = 'LiuSha';
    static KongWu = 'KongWu';
}

import { EleType, BtlType } from '../scripts/DataSaved';
import { BuffModel, BuffOutput, BuffType } from '../scripts/DataModel';
import { BtlPet, BtlBuff, Pet2 } from '../scripts/DataOther';
import { BtlCtrlr } from '../scripts/BtlCtrlr';

function fl(n: number) {
    return Math.ceil(n);
}

function getSklDmgStr(pet2: Pet2 | undefined, rate: number): string {
    if (pet2) {
        const from = fl(pet2.sklDmgFrom * 0.1 * rate);
        const to = fl(pet2.sklDmgTo * 0.1 * rate);
        return `<color=#d0d0d0>（${from} - ${to}点）</c>`;
    } else return '';
}

export const BuffModelDict: { [key: string]: BuffModel } = {
    [BufN.ZhuoShao]: {
        id: BufN.ZhuoShao,
        cnName: '灼烧',
        brief: '灼',
        buffType: BuffType.debuff,
        eleType: EleType.fire,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) * 0.7 };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `每回合对目标造成施放者<color=#ffcb32>70%招式强度</c>${getSklDmgStr(pet2, 0.7)}的火系伤害`;
        }
    },
    [BufN.HanLeng]: {
        id: BufN.HanLeng,
        cnName: '寒冷',
        brief: '寒',
        buffType: BuffType.debuff,
        eleType: EleType.water,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.speed -= 10;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.speed += 10;
        },
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) * 0.5 };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `减速目标，且每回合对目标造成施放者<color=#ffcb32>50%招式强度</c>${getSklDmgStr(pet2, 0.5)}的水系伤害`;
        }
    },
    [BufN.ZhongDu]: {
        id: BufN.ZhongDu,
        cnName: '中毒',
        brief: '毒',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const rate = (1 - aim.hp / aim.hpMax) * 0.4 + 0.4;
            return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) * rate };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `每回合对目标造成施放者<color=#ffcb32>40%-80%招式强度</c>的暗系伤害，血量越低伤害越高`;
        }
    },
    [BufN.ZhuiLuo]: {
        id: BufN.ZhuiLuo,
        cnName: '坠落',
        brief: '落',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            if (buff.time === 0) return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `效果结束时对目标造成施放者<color=#ffcb32>100%招式强度</c>${getSklDmgStr(pet2, 1)}的地系伤害`;
        }
    },
    [BufN.JingJie]: {
        id: BufN.JingJie,
        cnName: '警戒',
        brief: '警',
        buffType: BuffType.buff,
        eleType: EleType.water,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.hitRate += 10;
            aim.pet2.critRate += 10;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.hitRate -= 10;
            aim.pet2.critRate -= 10;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标下次攻击必命中，必暴击';
        }
    },
    [BufN.ReLi]: {
        id: BufN.ReLi,
        cnName: '热力',
        brief: '热',
        buffType: BuffType.buff,
        eleType: EleType.fire,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            const from = caster.pet2.sklDmgFrom * 0.15 + aim.pet2.atkDmgFrom * 0.15;
            const to = caster.pet2.sklDmgTo * 0.15 + aim.pet2.atkDmgTo * 0.15;
            aim.pet2.atkDmgFrom += from;
            aim.pet2.atkDmgTo += to;
            return { from, to };
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            const { from, to } = data;
            aim.pet2.atkDmgFrom -= from;
            aim.pet2.atkDmgTo -= to;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `目标普攻伤害提高，相当于自身攻击强度的<color=#ffcb32>15%</c>外加施放者招式强度的<color=#ffcb32>15%</c>`;
        }
    },
    [BufN.KongJu]: {
        id: BufN.KongJu,
        cnName: '恐惧',
        brief: '惧',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            const atkRdc = aim.pet2.atkDmgFrom * 0.8;
            aim.pet2.atkDmgFrom -= atkRdc;
            aim.pet2.atkDmgTo -= atkRdc;
            const sklRdc = aim.pet2.sklDmgFrom * 0.8;
            aim.pet2.sklDmgFrom -= sklRdc;
            aim.pet2.sklDmgTo -= sklRdc;
            return { atkRdc, sklRdc };
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            const { atkRdc, sklRdc } = data;
            aim.pet2.atkDmgFrom += atkRdc;
            aim.pet2.atkDmgTo += atkRdc;
            aim.pet2.sklDmgFrom += sklRdc;
            aim.pet2.sklDmgTo += sklRdc;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `目标所有强度降低<color=#ffcb32>80%</c>`;
        }
    },
    [BufN.ShanYao]: {
        id: BufN.ShanYao,
        cnName: '闪耀',
        brief: '耀',
        buffType: BuffType.buff,
        eleType: EleType.light,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.hitRate += 0.1;
            aim.pet2.critRate += 0.1;
            aim.pet2.evdRate += 0.1;
            aim.pet2.dfsRate += 0.1;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.hitRate -= 0.1;
            aim.pet2.critRate -= 0.1;
            aim.pet2.evdRate -= 0.1;
            aim.pet2.dfsRate -= 0.1;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `目标命中率，闪躲率，暴击率和免伤各增加<color=#ffcb32>10%</c>`;
        }
    },
    [BufN.GeShang]: {
        id: BufN.GeShang,
        cnName: '割伤',
        brief: '割',
        buffType: BuffType.debuff,
        eleType: EleType.air,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { hp: Math.floor(aim.hpMax * 0.05) };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `每回合对目标造成最大血量<color=#ffcb32>5%</c>的空系伤害，且无视护甲`;
        }
    },
    [BufN.ChaoFeng]: {
        id: BufN.ChaoFeng,
        cnName: '嘲讽',
        brief: '嘲',
        buffType: BuffType.debuff,
        eleType: EleType.dark,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.exBtlTypes.push(BtlType.melee);
            return aim.pet2.exBtlTypes.length - 1;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            const idx: number = data;
            aim.pet2.exBtlTypes.removeIndex(idx);
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `目标战斗方式变成近战`;
        }
    },
    [BufN.FangHu]: {
        id: BufN.FangHu,
        cnName: '防护',
        brief: '防',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.dfsRate += 0.2;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.dfsRate -= 0.2;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `目标增加<color=#ffcb32>20%</c>免伤`;
        }
    },
    [BufN.DunQiang]: {
        id: BufN.DunQiang,
        cnName: '盾墙',
        brief: '墙',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.dfsRate += 0.8;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.dfsRate -= 0.8;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `目标增加<color=#ffcb32>80%</c>免伤`;
        }
    },
    [BufN.FeiXing]: {
        id: BufN.FeiXing,
        cnName: '飞行',
        brief: '飞',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.speed += 100;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.speed -= 100;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `目标反应速度升至最大值`;
        }
    },
    [BufN.HuiChun]: {
        id: BufN.HuiChun,
        cnName: '回春',
        brief: '春',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { hp: BtlCtrlr.getSklDmg(buff.caster) * 0.8 * -1 };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return `目标每回合恢复目标相当于施放者<color=#ffcb32>80%招式强度</c>${getSklDmgStr(pet2, 0.8)}的血量`;
        }
    },
    [BufN.JingZhi]: {
        id: BufN.JingZhi,
        cnName: '静止',
        brief: '止',
        buffType: BuffType.debuff,
        eleType: EleType.air,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.exBtlTypes.push(BtlType.stay);
            return aim.pet2.exBtlTypes.length - 1;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.exBtlTypes.removeIndex(data);
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标停止一切行动';
        }
    },
    [BufN.MangMu]: {
        id: BufN.MangMu,
        cnName: '盲目',
        brief: '盲',
        buffType: BuffType.debuff,
        eleType: EleType.light,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.hitRate -= 0.3;
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.hitRate += 0.3;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标命中率降低<color=#ffcb32>30%</c>';
        }
    },
    [BufN.XieE]: {
        id: BufN.XieE,
        cnName: '邪恶',
        brief: '恶',
        buffType: BuffType.buff,
        eleType: EleType.dark,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            const atk = aim.pet2.atkDmgTo * 1.5;
            const skl = aim.pet2.sklDmgTo * 1.5;
            aim.pet2.atkDmgTo += atk;
            aim.pet2.sklDmgTo += skl;
            return { atk, skl };
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            const { atk, skl } = data;
            aim.pet2.atkDmgTo -= atk;
            aim.pet2.sklDmgTo -= skl;
        },
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const dmg = BtlCtrlr.getAtkDmg(aim, aim) + BtlCtrlr.getSklDmg(aim, aim);
            return { hp: Math.floor(dmg * 0.3) };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标强度上限增加<color=#ffcb32>150%</c>，但每回合都会受到相当于自身所有强度<color=#ffcb32>30%</c>的暗系伤害';
        }
    },
    [BufN.JingJin]: {
        id: BufN.JingJin,
        cnName: '精尽',
        brief: '尽',
        buffType: BuffType.debuff,
        eleType: EleType.fire,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const mp = 20 + Math.floor(buff.caster.pet.lv / 10);
            if (ctrlr.getTeam(aim).mp >= mp) {
                return { mp };
            } else {
                return { hp: BtlCtrlr.getSklDmg(buff.caster, aim) * 1.2 };
            }
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            const dmg = getSklDmgStr(pet2, 1.2);
            return `目标每回合燃烧掉灵能(20+lv/10)，如果灵能不足，则造成施放者<color=#ffcb32>120%招式强度</c>${dmg}的火系伤害`;
        }
    },
    [BufN.NingJing]: {
        id: BufN.NingJing,
        cnName: '宁静',
        brief: '宁',
        buffType: BuffType.debuff,
        eleType: EleType.water,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            return { rage: 3 };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标每回合减少目标<color=#ffcb32>3点</c>斗志';
        }
    },
    [BufN.QiangJi]: {
        id: BufN.QiangJi,
        cnName: '强击',
        brief: '强',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            const from = aim.pet2.atkDmgFrom * 0.6;
            const to = aim.pet2.atkDmgTo * 0.6;
            aim.pet2.atkDmgFrom += from;
            aim.pet2.atkDmgTo += to;
            return { from, to };
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            const { from, to } = data;
            aim.pet2.atkDmgFrom -= from;
            aim.pet2.atkDmgTo -= to;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标攻击强度提高<color=#ffcb32>60%</c>';
        }
    },
    [BufN.ZhuanZhu]: {
        id: BufN.ZhuanZhu,
        cnName: '专注',
        brief: '专',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            const from = aim.pet2.sklDmgFrom * 0.4;
            const to = aim.pet2.sklDmgTo * 0.4;
            aim.pet2.sklDmgFrom += from;
            aim.pet2.sklDmgTo += to;
            return { from, to };
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            const { from, to } = data;
            aim.pet2.sklDmgFrom -= from;
            aim.pet2.sklDmgTo -= to;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标招式强度提高<color=#ffcb32>40%</c>';
        }
    },
    [BufN.ShengMen]: {
        id: BufN.ShengMen,
        cnName: '生门',
        brief: '生',
        buffType: BuffType.buff,
        eleType: EleType.earth,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const r = ctrlr.ranSd();
            let id!: string;
            if (r < 0.2) id = BufN.ReLi;
            else if (r < 0.4) id = BufN.JingJie;
            else if (r < 0.6) id = BufN.HuiChun;
            else if (r < 0.8) id = BufN.ZhuanZhu;
            else id = BufN.ShanYao;
            return { newBuffs: [{ id, time: 3 }] };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标每回合随机获得增益效果';
        }
    },
    [BufN.SiMen]: {
        id: BufN.SiMen,
        cnName: '死门',
        brief: '死',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            const r = ctrlr.ranSd();
            let id!: string;
            if (r < 0.2) id = BufN.ZhuoShao;
            else if (r < 0.4) id = BufN.HanLeng;
            else if (r < 0.6) id = BufN.GeShang;
            else if (r < 0.8) id = BufN.ZhuiLuo;
            else id = BufN.ZhongDu;
            return { newBuffs: [{ id, time: 3 }] };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '目标每回合随机获得减益效果';
        }
    },
    [BufN.LiuSha]: {
        id: BufN.LiuSha,
        cnName: '流沙',
        brief: '沙',
        buffType: BuffType.debuff,
        eleType: EleType.earth,
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            if (ctrlr.ranSd() < 0.1) return { newBuffs: [{ id: 'JingZhi', time: 1 }] };
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return '每回合结束时，目标<color=#ffcb32>10%</c>几率获得静止效果';
        }
    },
    [BufN.KongWu]: {
        id: BufN.KongWu,
        cnName: '空舞',
        brief: '舞',
        buffType: BuffType.buff,
        eleType: EleType.air,
        onStarted(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr): any {
            aim.pet2.speed += 50;
            aim.pet2.hitRate += 0.1;
            aim.pet2.evdRate += 0.1;
        },
        onTurnEnd(aim: Readonly<BtlPet>, buff: Readonly<BtlBuff>, ctrlr: BtlCtrlr): BuffOutput | void {
            if (ctrlr.ranSd() < 0.15) {
                const newPet = ctrlr.getTeam(aim).pets.getOne(pet => pet.hp > 0 && pet.pet2.speed < aim.pet2.speed);
                if (newPet) return { newBuffs: [{ aim: newPet, id: BufN.KongWu, time: 3 }] };
            }
        },
        onEnd(aim: Readonly<BtlPet>, caster: Readonly<BtlPet>, ctrlr: BtlCtrlr, data: any) {
            aim.pet2.speed -= 50;
            aim.pet2.hitRate -= 0.1;
            aim.pet2.evdRate -= 0.1;
        },
        getInfo(pet2?: Readonly<Pet2>): string {
            return (
                '目标命中率，闪躲率提高<color=#ffcb32>10%</c>，反应速度提高<color=#ffcb32>50点</c>，' +
                '每回合有<color=#ffcb32>15%</c>的概率带领其他人一起舞蹈'
            );
        }
    }
};
