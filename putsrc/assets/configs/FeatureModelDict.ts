/*
 * FeatureModelDict.ts
 * 特性
 * luleyan
 */

import { BtlCtrlr } from '../scripts/BtlCtrlr';
import { FeatureModel, FeatureBtlData, SkillType } from '../scripts/DataModel';
import { Pet2, BattlePet, RageMax } from '../scripts/DataOther';
import { EleType, BattleType } from '../scripts/DataSaved';

function rd(n: number): string {
    if (Math.round(n) * 10 === Math.round(n * 10)) return String(Math.round(n));
    else return n.toFixed(1);
}

function rdP(n: number): string {
    return rd(n * 100);
}

function rate(data: number, from: number, range: number): number {
    return (data / (data + 7)) * range + from;
}

export class FtN {
    static strength = 'strength';
    static concentration = 'concentration';
    static durability = 'durability';
    static agility = 'agility';
    static sensitivity = 'sensitivity';
    static elegant = 'elegant';
    static baseStrength = 'baseStrength';
    static baseConcentration = 'baseConcentration';
    static baseDurability = 'baseDurability';
    static baseAgility = 'baseAgility';
    static baseSensitivity = 'baseSensitivity';
    static baseElegant = 'baseElegant';
    static addHpMax = 'addHpMax';
    static addMpMax = 'addMpMax';
    static addAtkDmg = 'addAtkDmg';
    static addSklDmg = 'addSklDmg';
    static addAtkMax = 'addAtkMax';
    static addSklMax = 'addSklMax';
    static addCritRate = 'addCritRate';
    static addCritDmgRate = 'addCritDmgRate';
    static addEvdRate = 'addEvdRate';
    static addHitRate = 'addHitRate';
    static addDfsRate = 'addDfsRate';
    static addDmgRdcHp = 'addDmgRdcHp';
    static addHpRdcMp = 'addHpRdcMp';
    static addByLuck = 'addByLuck';
    static addAtkBySkl = 'addAtkBySkl';
    static hitWithFire = 'hitWithFire';
    static hitWithWater = 'hitWithWater';
    static hitWithAir = 'hitWithAir';
    static hitWithEarth = 'hitWithEarth';
    static hitWithLight = 'hitWithLight';
    static hitWithDark = 'hitWithDark';
    static hitStlHp = 'hitStlHp';
    static hitRdcMp = 'hitRdcMp';
    static hitRdcRg = 'hitRdcRg';
    static hitAddMp = 'hitAddMp';
    static hitAddRg = 'hitAddRg';
    static hitKill = 'hitKill';
    static hitByRage = 'hitByRage';
    static hitByHp = 'hitByHp';
    static castMpDmg = 'castMpDmg';
    static castConDmg = 'castConDmg';
    static castFire = 'castFire';
    static castWater = 'castWater';
    static castAir = 'castAir';
    static castEarth = 'castEarth';
    static castLight = 'castLight';
    static castDark = 'castDark';
    static castEleRein = 'castEleRein';
    static castHurtMe = 'castHurtMe';
    static castUlti = 'castUlti';
    static castByCombo = 'castByCombo';
    static castByPetCount = 'castByPetCount';
    static castFullRage = 'castFullRage';
    static hurtAndHurt = 'hurtAndHurt';
    static hurtGotMp = 'hurtGotMp';
    static hurtGotRage = 'hurtGotRage';
    static hurtRdcMp = 'hurtRdcMp';
    static hurtWithMelee = 'hurtWithMelee';
    static hurtWithShoot = 'hurtWithShoot';
    static hurtWithCharge = 'hurtWithCharge';
    static hurtWithAss = 'hurtWithAss';
    static hurtByHp = 'hurtByHp';
    static hurt = 'hurt';
    static hurtWithAtk = 'hurtWithAtk';
    static hurtWithCast = 'hurtWithCast';
    static hurtFullRage = 'hurtFullRage';
    static hurtOthers = 'hurtOthers';
    static heal = 'heal';
    static healByHp = 'healByHp';
    static healByCombo = 'healByCombo';
    static healAndHurt = 'healAndHurt';
    static beginAddRage = 'beginAddRage';
    static beginReLi = 'beginReLi';
    static killAddHp = 'killAddHp';
    static killAddAllHp = 'killAddAllHp';
    static killAddMp = 'killAddMp';
    static killRdcCD = 'killRdcCD';
    static deadHurt = 'deadHurt';
    static deadFangHu = 'deadFangHu';
    static deadHuiChun = 'deadHuiChun';
}

export class BFtN {}

export const NormalFeatureModelDict: { [key: string]: FeatureModel } = {
    [FtN.strength]: {
        id: FtN.strength,
        cnBrief: '壮',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.strength += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础力量增加${datas[0]}点`;
        }
    },
    [FtN.concentration]: {
        id: FtN.concentration,
        cnBrief: '智',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.concentration += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础专注增加${datas[0]}点`;
        }
    },
    [FtN.durability]: {
        id: FtN.durability,
        cnBrief: '体',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.durability += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础耐久增加${datas[0]}点`;
        }
    },
    [FtN.agility]: {
        id: FtN.agility,
        cnBrief: '捷',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.agility += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础灵敏增加${datas[0]}点`;
        }
    },
    [FtN.sensitivity]: {
        id: FtN.sensitivity,
        cnBrief: '细',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.sensitivity += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础感知增加${datas[0]}点`;
        }
    },
    [FtN.elegant]: {
        id: FtN.elegant,
        cnBrief: '魅',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.elegant += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础优雅增加${datas[0]}点`;
        }
    },
    [FtN.baseStrength]: {
        id: FtN.baseStrength,
        cnBrief: '力',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.strength += pet.strengthOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础力量增加${rdP(datas[0])}%`;
        }
    },
    [FtN.baseConcentration]: {
        id: FtN.baseConcentration,
        cnBrief: '专',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.concentration += pet.concentrationOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础专注增加${rdP(datas[0])}%`;
        }
    },
    [FtN.baseDurability]: {
        id: FtN.baseDurability,
        cnBrief: '耐',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.durability += pet.durabilityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础耐久增加${rdP(datas[0])}%`;
        }
    },
    [FtN.baseAgility]: {
        id: FtN.baseAgility,
        cnBrief: '敏',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.agility += pet.agilityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础灵敏增加${rdP(datas[0])}%`;
        }
    },
    [FtN.baseSensitivity]: {
        id: FtN.baseSensitivity,
        cnBrief: '感',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.sensitivity += pet.sensitivityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础感知增加${rdP(datas[0])}%`;
        }
    },
    [FtN.baseElegant]: {
        id: FtN.baseElegant,
        cnBrief: '雅',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.elegant += pet.elegantOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础优雅增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addHpMax]: {
        id: FtN.addHpMax,
        cnBrief: '坚',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.hpMax += pet.hpMaxOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `血量上限增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addMpMax]: {
        id: FtN.addMpMax,
        cnBrief: '思',
        dataAreas: [[10, 10]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.mpMax += datas[0];
        },
        getInfo(datas: number[]): string {
            return `灵能上限增加${datas[0]}点`;
        }
    },
    [FtN.addAtkDmg]: {
        id: FtN.addAtkDmg,
        cnBrief: '武',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgFrom += pet.atkDmgFromOri * datas[0];
            pet.atkDmgTo += pet.atkDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `攻击伤害增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addSklDmg]: {
        id: FtN.addSklDmg,
        cnBrief: '能',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.sklDmgFrom += pet.sklDmgFromOri * datas[0];
            pet.sklDmgTo += pet.sklDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `招式伤害增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addAtkMax]: {
        id: FtN.addAtkMax,
        cnBrief: '极',
        dataAreas: [[0.02, 0.02]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgTo += pet.atkDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `攻击伤害最大值增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addSklMax]: {
        id: FtN.addSklMax,
        cnBrief: '超',
        dataAreas: [[0.02, 0.02]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.sklDmgTo += pet.sklDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `招式伤害最大值增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addCritRate]: {
        id: FtN.addCritRate,
        cnBrief: '暴',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.critRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `暴击率增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addCritDmgRate]: {
        id: FtN.addCritDmgRate,
        cnBrief: '伤',
        dataAreas: [[0.1, 0.1]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.critDmgRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `暴击伤害增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addEvdRate]: {
        id: FtN.addEvdRate,
        cnBrief: '闪',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.evdRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `闪躲率增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addHitRate]: {
        id: FtN.addHitRate,
        cnBrief: '锐',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.hitRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `命中率增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addDfsRate]: {
        id: FtN.addDfsRate,
        cnBrief: '硬',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.dfsRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `免伤增加${rdP(datas[0])}%`;
        }
    },
    [FtN.addDmgRdcHp]: {
        id: FtN.addDmgRdcHp,
        cnBrief: '蛛',
        dataAreas: [
            [0.02, 0.02],
            [0.01, 0.01]
        ],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgFrom += pet.atkDmgFromOri * datas[0];
            pet.atkDmgTo += pet.atkDmgToOri * datas[0];
            pet.sklDmgFrom += pet.sklDmgFromOri * datas[0];
            pet.sklDmgTo += pet.sklDmgToOri * datas[0];
            pet.hpMax = Math.max(pet.hpMax - pet.hpMaxOri * datas[1], 1);
        },
        getInfo(datas: number[]): string {
            return `所有伤害提高${rdP(datas[0])}%，但血量上限降低${rdP(datas[1])}%`;
        }
    },
    [FtN.addHpRdcMp]: {
        id: FtN.addHpRdcMp,
        cnBrief: '蛹',
        dataAreas: [
            [0.02, 0.02],
            [10, 10]
        ],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.hpMax += pet.hpMaxOri * datas[0];
            pet.mpMax = Math.max(pet.mpMax - datas[1], 0);
        },
        getInfo(datas: number[]): string {
            return `血量上限提高${rdP(datas[0])}%，但灵能上限降低${datas[1]}点`;
        }
    },
    [FtN.addByLuck]: {
        id: FtN.addByLuck,
        cnBrief: '吉',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            if (pet.strengthOri % 3 === 0) pet.strength += pet.strengthOri * datas[0];
            if (pet.concentrationOri % 3 === 0) pet.concentration += pet.concentrationOri * datas[0];
            if (pet.durabilityOri % 3 === 0) pet.durability += pet.durabilityOri * datas[0];
            if (pet.agilityOri % 3 === 0) pet.agility += pet.agilityOri * datas[0];
            if (pet.sensitivityOri % 3 === 0) pet.sensitivity += pet.sensitivityOri * datas[0];
            if (pet.elegantOri % 3 === 0) pet.elegant += pet.elegantOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `任意基础属性如果为3的倍数，则提高${rdP(datas[0])}%`;
        }
    },
    [FtN.addAtkBySkl]: {
        id: FtN.addAtkBySkl,
        cnBrief: '晓',
        dataAreas: [[0.02, 0.02]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgFrom += pet.sklDmgFromOri * datas[0];
            pet.atkDmgTo += pet.sklDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `普攻伤害增加，数值相当于招式伤害的${rdP(datas[0])}%`;
        }
    },
    [FtN.hitWithFire]: {
        id: FtN.hitWithFire,
        cnBrief: '焰',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.fire, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人额外受到相当于${rdP(datas[0])}%招式攻击的火系伤害`;
        }
    },
    [FtN.hitWithWater]: {
        id: FtN.hitWithWater,
        cnBrief: '海',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.water, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人额外受到相当于${rdP(datas[0])}%招式攻击的水系伤害`;
        }
    },
    [FtN.hitWithAir]: {
        id: FtN.hitWithAir,
        cnBrief: '穹',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.air, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人额外受到相当于${rdP(datas[0])}%招式攻击的空系伤害`;
        }
    },
    [FtN.hitWithEarth]: {
        id: FtN.hitWithEarth,
        cnBrief: '渊',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.earth, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人额外受到相当于${rdP(datas[0])}%招式攻击的地系伤害`;
        }
    },
    [FtN.hitWithLight]: {
        id: FtN.hitWithLight,
        cnBrief: '烁',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.light, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人额外受到相当于${rdP(datas[0])}%招式攻击的光系伤害`;
        }
    },
    [FtN.hitWithDark]: {
        id: FtN.hitWithDark,
        cnBrief: '影',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.dark, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人额外受到相当于${rdP(datas[0])}%招式攻击的暗系伤害`;
        }
    },
    [FtN.hitStlHp]: {
        id: FtN.hitStlHp,
        cnBrief: '蝠',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            pet.hp = Math.min(pet.hp + datas[0] * bData.finalDmg, pet.hpMax);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时偷取血量，数值相当于伤害的${rdP(datas[0])}%`;
        }
    },
    [FtN.hitRdcMp]: {
        id: FtN.hitRdcMp,
        cnBrief: '鬼',
        dataAreas: [[1, 1]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            bData.ctrlr.getTeam(aim).mp = Math.max(bData.ctrlr.getTeam(aim).mp - datas[0], 0);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人减少${datas[0]}点灵能`;
        }
    },
    [FtN.hitRdcRg]: {
        id: FtN.hitRdcRg,
        cnBrief: '雕',
        dataAreas: [[1, 1]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const eTeam = bData.ctrlr.getTeam(aim);
            const rage = bData.ctrlr.ranSd() < rate(datas[0], 0.05, 0.9) ? 2 : 1;
            eTeam.rage = Math.max(eTeam.rage - rage, 0);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人减少1点斗志，${rdP(rate(datas[0], 0.05, 0.9))}%概率减少2点`;
        }
    },
    [FtN.hitAddMp]: {
        id: FtN.hitAddMp,
        cnBrief: '灵',
        dataAreas: [[1, 1]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const sTeam = bData.ctrlr.getTeam(pet);
            sTeam.mp = Math.min(sTeam.mp + datas[0], sTeam.mpMax);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，额外获得${datas[0]}点灵能`;
        }
    },
    [FtN.hitAddRg]: {
        id: FtN.hitAddRg,
        cnBrief: '猿',
        dataAreas: [[1, 1]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const sTeam = bData.ctrlr.getTeam(pet);
            const rage = bData.ctrlr.ranSd() < rate(datas[0], 0.05, 0.9) ? 2 : 1;
            sTeam.rage = Math.min(sTeam.rage + rage, RageMax);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，额外获得1点斗志，${rdP(rate(datas[0], 0.05, 0.9))}%概率获得2点`;
        }
    },
    [FtN.hitKill]: {
        id: FtN.hitKill,
        cnBrief: '灭',
        dataAreas: [[0.05, 0.03]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (aim.hp < aim.hpMax * 0.2) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果敌人血量少于20%，则普攻伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.hitByRage]: {
        id: FtN.hitByRage,
        cnBrief: '狂',
        dataAreas: [
            [70, -1],
            [0.03, 0.015]
        ],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).rage > Math.max(datas[0], 50)) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果斗志大于${Math.max(datas[0], 50)}点，则普攻伤害提高${rdP(datas[1])}%`;
        }
    },
    [FtN.hitByHp]: {
        id: FtN.hitByHp,
        cnBrief: '末',
        dataAreas: [
            [0.1, 0.01],
            [0.08, 0.03]
        ],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (pet.hp < pet.hpMax * Math.min(datas[0], 0.3)) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果血量小于${rdP(Math.min(datas[0], 0.3))}%，则普攻伤害提高${rdP(datas[1])}%`;
        }
    },
    [FtN.castMpDmg]: {
        id: FtN.castMpDmg,
        cnBrief: '信',
        dataAreas: [
            [0.8, -0.01],
            [0.02, 0.015]
        ],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).mp > bData.ctrlr.getTeam(pet).mpMax * datas[0]) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果灵能大于总量的${rdP(datas[0])}%，则招式伤害提高${rdP(datas[1])}%`;
        }
    },
    [FtN.castConDmg]: {
        id: FtN.castConDmg,
        cnBrief: '慧',
        dataAreas: [[0.02, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (pet.pet2.concentration > aim.pet2.concentration) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果专注高于敌人，则招式伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castFire]: {
        id: FtN.castFire,
        cnBrief: '焚',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.fire) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `火系伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castWater]: {
        id: FtN.castWater,
        cnBrief: '寒',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.water) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `水系伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castAir]: {
        id: FtN.castAir,
        cnBrief: '苍',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.air) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `空系伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castEarth]: {
        id: FtN.castEarth,
        cnBrief: '势',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.earth) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `地系伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castLight]: {
        id: FtN.castLight,
        cnBrief: '耀',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.light) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `光系伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castDark]: {
        id: FtN.castDark,
        cnBrief: '邪',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.dark) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `暗系伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castEleRein]: {
        id: FtN.castEleRein,
        cnBrief: '猎',
        dataAreas: [[0.02, 0.02]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (BtlCtrlr.getEleDmgRate(bData.skillModel.eleType, aim) > 1) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `对被属性克制的敌人伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castHurtMe]: {
        id: FtN.castHurtMe,
        cnBrief: '命',
        dataAreas: [[0.03, 0.03]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= bData.finalDmg * datas[0];
            pet.hp = Math.max(pet.hp - Math.floor(bData.finalDmg * datas[0]), 1);
        },
        getInfo(datas: number[]): string {
            return `招式伤害提高${rdP(datas[0])}%，但自己也会受到等量伤害（不会致死）`;
        }
    },
    [FtN.castUlti]: {
        id: FtN.castUlti,
        cnBrief: '绝',
        dataAreas: [[0.08, 0.08]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.skillType === SkillType.ultimate) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `绝杀技伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castByCombo]: {
        id: FtN.castByCombo,
        cnBrief: '狼',
        dataAreas: [[0.02, 0.02]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const combo = bData.ctrlr.realBattle.combo - 1;
            if (combo > 0) aim.hp -= bData.finalDmg * datas[0] * combo;
        },
        getInfo(datas: number[]): string {
            return `招式的连击伤害提高${rdP(datas[0])}%乘以连击次数`;
        }
    },
    [FtN.castByPetCount]: {
        id: FtN.castByPetCount,
        cnBrief: '孤',
        dataAreas: [[0.02, 0.015]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).pets.length < bData.ctrlr.getTeam(aim).pets.length) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果战场己方人数小于敌方，则招式伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.castFullRage]: {
        id: FtN.castFullRage,
        cnBrief: '皇',
        dataAreas: [[0.08, 0.08]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).rage > 100) {
                aim.hp -= bData.finalDmg * datas[0];
                bData.ctrlr.getTeam(pet).rage -= 10;
            }
        },
        getInfo(datas: number[]): string {
            return `当斗志大于100时，消耗10点斗志，招式伤害提高${rdP(datas[0])}%`;
        }
    },
    [FtN.hurtAndHurt]: {
        id: FtN.hurtAndHurt,
        cnBrief: '荆',
        dataAreas: [[0.01, 0.01]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            caster.hp = Math.max(caster.hp - Math.floor(bData.finalDmg * datas[0]), 1);
        },
        getInfo(datas: number[]): string {
            return `受伤时，敌人受到伤害总量${rdP(datas[0])}%的物理伤害（不会致死）`;
        }
    },
    [FtN.hurtGotMp]: {
        id: FtN.hurtGotMp,
        cnBrief: '妖',
        dataAreas: [[1, 1]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const sTeam = bData.ctrlr.getTeam(aim);
            sTeam.mp = Math.min(sTeam.mp + datas[0], sTeam.mpMax);
        },
        getInfo(datas: number[]): string {
            return `受伤时，额外获得${datas[0]}点灵能`;
        }
    },
    [FtN.hurtGotRage]: {
        id: FtN.hurtGotRage,
        cnBrief: '熊',
        dataAreas: [[1, 1]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const sTeam = bData.ctrlr.getTeam(aim);
            const rage = bData.ctrlr.ranSd() < rate(datas[0], 0.05, 0.9) ? 2 : 1;
            sTeam.rage = Math.min(sTeam.rage + rage, RageMax);
        },
        getInfo(datas: number[]): string {
            return `受伤时，额外获得1点斗志，${rdP(rate(datas[0], 0.05, 0.9))}%概率获得2点`;
        }
    },
    [FtN.hurtRdcMp]: {
        id: FtN.hurtRdcMp,
        cnBrief: '橡',
        dataAreas: [[0.1, 0.09]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const sTeam = bData.ctrlr.getTeam(aim);
            const dmg = bData.finalDmg * datas[0];
            const rdcMp = Math.ceil(dmg / (20 * aim.pet.lv));
            if (sTeam.mp >= rdcMp) {
                sTeam.mp -= rdcMp;
                aim.hp += dmg;
            }
        },
        getInfo(datas: number[]): string {
            return `受伤时，如果有足够的灵能，则${rdP(datas[0])}%伤害由消耗灵能抵消（1MP=2HP*lv）`;
        }
    },
    [FtN.hurtWithMelee]: {
        id: FtN.hurtWithMelee,
        cnBrief: '云',
        dataAreas: [[0.02, 0.02]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const battleType = BtlCtrlr.getBattleType(caster, bData.skillModel);
            if (battleType === BattleType.melee) aim.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `近战伤害减少${rdP(datas[0])}%`;
        }
    },
    [FtN.hurtWithShoot]: {
        id: FtN.hurtWithShoot,
        cnBrief: '雀',
        dataAreas: [[0.02, 0.02]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const battleType = BtlCtrlr.getBattleType(caster, bData.skillModel);
            if (battleType === BattleType.shoot) aim.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `射击伤害减少${rdP(datas[0])}%`;
        }
    },
    [FtN.hurtWithCharge]: {
        id: FtN.hurtWithCharge,
        cnBrief: '山',
        dataAreas: [[0.02, 0.02]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const battleType = BtlCtrlr.getBattleType(caster, bData.skillModel);
            if (battleType === BattleType.charge) aim.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `冲锋减少${rdP(datas[0])}%`;
        }
    },
    [FtN.hurtWithAss]: {
        id: FtN.hurtWithAss,
        cnBrief: '松',
        dataAreas: [[0.02, 0.02]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const battleType = BtlCtrlr.getBattleType(caster, bData.skillModel);
            if (battleType === BattleType.assassinate) aim.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `刺杀伤害减少${rdP(datas[0])}%`;
        }
    },
    [FtN.hurtByHp]: {
        id: FtN.hurtByHp,
        cnBrief: '慑',
        dataAreas: [
            [0.8, -0.02],
            [0.02, 0.02]
        ],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (aim.hp > aim.hpMax * Math.max(datas[0], 0.5)) aim.hp += bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果当前血量大于等于${rdP(Math.max(datas[0], 0.5))}%，则伤害减少${rdP(datas[1])}%`;
        }
    },
    [FtN.hurt]: {
        id: FtN.hurt,
        cnBrief: '盾',
        dataAreas: [[0.01, 0.01]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `伤害减少${rdP(datas[0])}%`;
        }
    },
    [FtN.hurtWithAtk]: {
        id: FtN.hurtWithAtk,
        cnBrief: '障',
        dataAreas: [[0.02, 0.02]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (!bData.skillModel) aim.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `普攻伤害减少${rdP(datas[0])}%`;
        }
    },
    [FtN.hurtWithCast]: {
        id: FtN.hurtWithCast,
        cnBrief: '屏',
        dataAreas: [[0.02, 0.02]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel) aim.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `招式伤害减少${rdP(datas[0])}%`;
        }
    },
    [FtN.hurtFullRage]: {
        id: FtN.hurtFullRage,
        cnBrief: '羽',
        dataAreas: [[0.05, 0.05]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(aim).rage > 100) {
                aim.hp += bData.finalDmg * datas[0];
                bData.ctrlr.getTeam(aim).rage -= 5;
            }
        },
        getInfo(datas: number[]): string {
            return `当斗志大于100时，消耗5点斗志，抵消${rdP(datas[0])}%伤害`;
        }
    },
    [FtN.hurtOthers]: {
        id: FtN.hurtOthers,
        cnBrief: '链',
        dataAreas: [[0.1, 0.05]],
        onHurt(aim: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const petsAlive = bData.ctrlr.getTeam(aim).pets.filter((value: BattlePet) => value !== aim && value.hp > 0);
            if (petsAlive.length > 0) {
                const dmg = bData.finalDmg * Math.min(datas[0], 1);
                aim.hp += dmg;

                const eachDmg = Math.floor(dmg / petsAlive.length);
                for (const petAlive of petsAlive) petAlive.hp = Math.max(petAlive.hp - eachDmg, 1);
            }
        },
        getInfo(datas: number[]): string {
            return `伤害的${rdP(Math.min(datas[0], 1))}%由其他己方精灵承担`;
        }
    },
    [FtN.heal]: {
        id: FtN.heal,
        cnBrief: '医',
        dataAreas: [[0.02, 0.02]],
        onHeal(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp += Math.abs(bData.finalDmg) * datas[0];
        },
        getInfo(datas: number[]): string {
            return `治疗效果提高${rdP(datas[0])}%`;
        }
    },
    [FtN.healByHp]: {
        id: FtN.healByHp,
        cnBrief: '恩',
        dataAreas: [[0.1, 0.1]],
        onHeal(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (aim.hp < aim.hpMax * 0.25) aim.hp += Math.abs(bData.finalDmg) * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果血量低于25%，治疗效果提高${rdP(datas[0])}%`;
        }
    },
    [FtN.healByCombo]: {
        id: FtN.healByCombo,
        cnBrief: '鹿',
        dataAreas: [[0.04, 0.04]],
        onHeal(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const combo = bData.ctrlr.realBattle.combo - 1;
            if (combo > 0) aim.hp += Math.abs(bData.finalDmg) * datas[0] * combo;
        },
        getInfo(datas: number[]): string {
            return `连击时，治疗效果提高${rdP(datas[0])}%乘以连击次数`;
        }
    },
    [FtN.healAndHurt]: {
        id: FtN.healAndHurt,
        cnBrief: '血',
        dataAreas: [
            [0.05, 0.05],
            [0.03, 0.03]
        ],
        onHeal(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const pDmg = Math.abs(bData.finalDmg);
            aim.hp += pDmg * datas[0];
            pet.hp = Math.max(pet.hp - Math.floor(pDmg * datas[1]), 1);
        },
        getInfo(datas: number[]): string {
            return `治疗效果提高${rdP(datas[0])}%，但自己会受到${rdP(datas[1])}%的伤害（不会致死）`;
        }
    },
    [FtN.beginAddRage]: {
        id: FtN.beginAddRage,
        cnBrief: '阳',
        dataAreas: [[5, 2]],
        onBtlStart(pet: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            ctrlr.getTeam(pet).rage = Math.min(ctrlr.getTeam(pet).rage + datas[0], RageMax);
        },
        getInfo(datas: number[]): string {
            return `战斗开始时，直接获取${Math.min(datas[0], RageMax)}点斗志`;
        }
    },
    [FtN.beginReLi]: {
        id: FtN.beginReLi,
        cnBrief: '热',
        dataAreas: [[1, 1]],
        onBtlStart(pet: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            if (ctrlr.ranSd() < rate(datas[0], 0.05, 0.9)) ctrlr.addBuff(pet, pet, 'ReLi', 3);
        },
        getInfo(datas: number[]): string {
            return `战斗开始时，${rdP(rate(datas[0], 0.05, 0.9))}%概率获得热力，持续3回合`;
        }
    },
    [FtN.killAddHp]: {
        id: FtN.killAddHp,
        cnBrief: '恶',
        dataAreas: [[0.02, 0.015]],
        onEDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            pet.hp = Math.min(pet.hp + Math.floor(aim.hpMax * datas[0]), pet.hpMax);
        },
        getInfo(datas: number[]): string {
            return `敌人被击败时恢复血量，数值相当于敌人最大血量的${rdP(datas[0])}%`;
        }
    },
    [FtN.killAddAllHp]: {
        id: FtN.killAddAllHp,
        cnBrief: '噬',
        dataAreas: [[0.03, 0.02]],
        onEDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            if (pet === caster) {
                const hpAdd = Math.floor(aim.hpMax * datas[0]);
                for (const petIn of ctrlr.getTeam(pet).pets) {
                    if (petIn.hp > 0) petIn.hp = Math.min(petIn.hp + hpAdd, petIn.hpMax);
                }
            }
        },
        getInfo(datas: number[]): string {
            return `自己击败敌人时所有己方恢复血量，数值相当于敌人最大血量的${rdP(datas[0])}%`;
        }
    },
    [FtN.killAddMp]: {
        id: FtN.killAddMp,
        cnBrief: '神',
        dataAreas: [[8, 8]],
        onEDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const sTeam = ctrlr.getTeam(pet);
            sTeam.mp = Math.min(sTeam.mp + datas[0], sTeam.mpMax);
        },
        getInfo(datas: number[]): string {
            return `敌人被击败时，灵能恢复${datas[0]}点`;
        }
    },
    [FtN.killRdcCD]: {
        id: FtN.killRdcCD,
        cnBrief: '梦',
        dataAreas: [[1, 1]],
        onEDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const cd = ctrlr.ranSd() < rate(datas[0], 0.2, 0.6) ? 2 : 1;
            for (const skilllData of pet.skillDatas) skilllData.cd = Math.max(skilllData.cd - cd, 0);
        },
        getInfo(datas: number[]): string {
            return `敌人被击败时，所有冷却直接减少1回合，${rdP(rate(datas[0], 0.2, 0.6))}%概率减少2回合`;
        }
    },
    [FtN.deadHurt]: {
        id: FtN.deadHurt,
        cnBrief: '尽',
        dataAreas: [[0.02, 0.01]],
        onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const hpRdc = Math.floor(pet.hpMax * Math.min(datas[0], 0.2));
            for (const ePet of ctrlr.getTeam(caster).pets) if (ePet.hp > 0) ePet.hp = Math.max(ePet.hp - hpRdc, 1);
        },
        getInfo(datas: number[]): string {
            return `被击败时，对全体敌人造成自己最大血量${rdP(datas[0])}%的伤害（不会致死）`;
        }
    },
    [FtN.deadFangHu]: {
        id: FtN.deadFangHu,
        cnBrief: '防',
        dataAreas: [[1, 1]],
        onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const cd = ctrlr.ranSd() < rate(datas[0], 0.2, 0.6) ? 4 : 2;
            for (const petIn of ctrlr.getTeam(pet).pets) {
                if (petIn !== pet && petIn.hp > 0) ctrlr.addBuff(petIn, pet, 'FangHu', cd);
            }
        },
        getInfo(datas: number[]): string {
            return `被击败时，对己方其他精灵释放防护罩持续2回合，${rdP(rate(datas[0], 0.2, 0.6))}%概率持续4回合`;
        }
    },
    [FtN.deadHuiChun]: {
        id: FtN.deadHuiChun,
        cnBrief: '春',
        dataAreas: [[1, 1]],
        onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const cd = ctrlr.ranSd() < rate(datas[0], 0.2, 0.6) ? 4 : 2;
            for (const petIn of ctrlr.getTeam(pet).pets) {
                if (petIn !== pet && petIn.hp > 0) ctrlr.addBuff(petIn, pet, 'HuiChun', cd);
            }
        },
        getInfo(datas: number[]): string {
            return `被击败时，对己方其他精灵释放回春术持续2回合，${rdP(rate(datas[0], 0.2, 0.6))}%概率持续4回合`;
        }
    }
};

export const BossFeatureModelDict: { [key: string]: FeatureModel } = {};

export const FeatureModelDict: { [key: string]: FeatureModel } = Object.assign({}, NormalFeatureModelDict, BossFeatureModelDict);
