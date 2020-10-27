/*
 * FeatureModelDict.ts
 * 特性
 * luleyan
 */

import { BtlCtrlr } from 'scripts/BtlCtrlr';
import { FeatureModel, FeatureBtlData, SkillType } from 'scripts/DataModel';
import { Pet2, BattlePet, RageMax } from 'scripts/DataOther';
import { EleType, BattleType } from 'scripts/DataSaved';

function rd(n: number) {
    if (Math.round(n) * 10 === Math.round(n * 10)) return String(Math.round(n));
    else return n.toFixed(1);
}

function rate(data: number, from: number, range: number): number {
    return (data / (data + 7)) * range + from;
}

const FeatureModelDict: { [key: string]: Partial<FeatureModel> } = {
    strength: {
        id: 'strength',
        cnBrief: '壮',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.strength += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础力量增加${datas[0]}点`;
        }
    },
    concentration: {
        id: 'concentration',
        cnBrief: '智',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.concentration += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础专注增加${datas[0]}点`;
        }
    },
    durability: {
        id: 'durability',
        cnBrief: '体',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.durability += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础耐久增加${datas[0]}点`;
        }
    },
    agility: {
        id: 'agility',
        cnBrief: '捷',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.agility += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础灵敏增加${datas[0]}点`;
        }
    },
    sensitivity: {
        id: 'sensitivity',
        cnBrief: '细',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.sensitivity += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础感知增加${datas[0]}点`;
        }
    },
    elegant: {
        id: 'elegant',
        cnBrief: '魅',
        dataAreas: [[1, 1]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.elegant += datas[0] * 10;
        },
        getInfo(datas: number[]): string {
            return `基础优雅增加${datas[0]}点`;
        }
    },
    baseStrength: {
        id: 'baseStrength',
        cnBrief: '力',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.strength += pet.strengthOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础力量增加${rd(datas[0] * 100)}%`;
        }
    },
    baseConcentration: {
        id: 'baseConcentration',
        cnBrief: '专',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.concentration += pet.concentrationOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础专注增加${rd(datas[0] * 100)}%`;
        }
    },
    baseDurability: {
        id: 'baseDurability',
        cnBrief: '耐',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.durability += pet.durabilityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础耐久增加${rd(datas[0] * 100)}%`;
        }
    },
    baseAgility: {
        id: 'baseAgility',
        cnBrief: '敏',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.agility += pet.agilityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础灵敏增加${rd(datas[0] * 100)}%`;
        }
    },
    baseSensitivity: {
        id: 'baseSensitivity',
        cnBrief: '感',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.sensitivity += pet.sensitivityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础感知增加${rd(datas[0] * 100)}%`;
        }
    },
    baseElegant: {
        id: 'baseElegant',
        cnBrief: '雅',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.elegant += pet.elegantOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础优雅增加${rd(datas[0] * 100)}%`;
        }
    },
    addHpMax: {
        id: 'addHpMax',
        cnBrief: '坚',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.hpMax += pet.hpMaxOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `血量上限增加${rd(datas[0] * 100)}%`;
        }
    },
    addMpMax: {
        id: 'addMpMax',
        cnBrief: '思',
        dataAreas: [[10, 10]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.mpMax += datas[0];
        },
        getInfo(datas: number[]): string {
            return `精神上限增加${datas[0]}点`;
        }
    },
    addAtkDmg: {
        id: 'addAtkDmg',
        cnBrief: '武',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgFrom += pet.atkDmgFromOri * datas[0];
            pet.atkDmgTo += pet.atkDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `攻击伤害增加${rd(datas[0] * 100)}%`;
        }
    },
    addSklDmg: {
        id: 'addSklDmg',
        cnBrief: '技',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.sklDmgFrom += pet.sklDmgFromOri * datas[0];
            pet.sklDmgTo += pet.sklDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `技能伤害增加${rd(datas[0] * 100)}%`;
        }
    },
    addAtkMax: {
        id: 'addAtkMax',
        cnBrief: '极',
        dataAreas: [[0.02, 0.02]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgTo += pet.atkDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `攻击伤害最大值增加${rd(datas[0] * 100)}%`;
        }
    },
    addSklMax: {
        id: 'addSklMax',
        cnBrief: '超',
        dataAreas: [[0.02, 0.02]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.sklDmgTo += pet.sklDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `技能伤害最大值增加${rd(datas[0] * 100)}%`;
        }
    },
    addCritRate: {
        id: 'addCritRate',
        cnBrief: '暴',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.critRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `暴击率增加${rd(datas[0] * 100)}%`;
        }
    },
    addCritDmgRate: {
        id: 'addCritDmgRate',
        cnBrief: '伤',
        dataAreas: [[0.1, 0.1]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.critDmgRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `暴击伤害增加${rd(datas[0] * 100)}%`;
        }
    },
    addEvdRate: {
        id: 'addEvdRate',
        cnBrief: '闪',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.evdRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `闪躲率增加${rd(datas[0] * 100)}%`;
        }
    },
    addHitRate: {
        id: 'addHitRate',
        cnBrief: '锐',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.hitRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `命中率增加${rd(datas[0] * 100)}%`;
        }
    },
    addDfsRate: {
        id: 'addDfsRate',
        cnBrief: '硬',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.dfsRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `免伤增加${rd(datas[0] * 100)}%`;
        }
    },
    addDmgRdcHp: {
        id: 'addDmgRdcHp',
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
            return `所有伤害提高${rd(datas[0] * 100)}%，但血量上限降低${rd(datas[1] * 100)}%`;
        }
    },
    addHpRdcMp: {
        id: 'addHpRdcMp',
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
            return `血量上限提高${rd(datas[0] * 100)}%，但精神上限降低${datas[1]}点`;
        }
    },
    addByLuck: {
        id: 'addByLuck',
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
            return `任意基础属性如果为3的倍数，则提高${rd(datas[0] * 100)}%`;
        }
    },
    addAtkBySkl: {
        id: 'addAtkBySkl',
        cnBrief: '晓',
        dataAreas: [[0.02, 0.02]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgFrom += pet.sklDmgFromOri * datas[0];
            pet.atkDmgTo += pet.sklDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `普攻伤害增加，数值等于技能伤害的${rd(datas[0] * 100)}%`;
        }
    },
    hitWithFire: {
        id: 'hitWithFire',
        cnBrief: '焰',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.fire, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到相当于${rd(datas[0] * 100)}%技能攻击的火系伤害`;
        }
    },
    hitWithWater: {
        id: 'hitWithWater',
        cnBrief: '海',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.water, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到相当于${rd(datas[0] * 100)}%技能攻击的水系伤害`;
        }
    },
    hitWithAir: {
        id: 'hitWithAir',
        cnBrief: '穹',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.air, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到相当于${rd(datas[0] * 100)}%技能攻击的空系伤害`;
        }
    },
    hitWithEarth: {
        id: 'hitWithEarth',
        cnBrief: '渊',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.earth, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到相当于${rd(datas[0] * 100)}%技能攻击的地系伤害`;
        }
    },
    hitWithLight: {
        id: 'hitWithLight',
        cnBrief: '烁',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.light, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到相当于${rd(datas[0] * 100)}%技能攻击的光系伤害`;
        }
    },
    hitWithDark: {
        id: 'hitWithDark',
        cnBrief: '影',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= BtlCtrlr.getSklDmg(pet, aim) * datas[0] * BtlCtrlr.getEleDmgRate(EleType.dark, aim, pet);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到相当于${rd(datas[0] * 100)}%技能攻击的暗系伤害`;
        }
    },
    hitStlHp: {
        id: 'hitStlHp',
        cnBrief: '蝠',
        dataAreas: [[0.01, 0.01]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            pet.hp = Math.min(pet.hp + bData[0] * bData.finalDmg, pet.hpMax);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，偷取伤害${rd(datas[0] * 100)}%的血量`;
        }
    },
    hitRdcMp: {
        id: 'hitRdcMp',
        cnBrief: '鬼',
        dataAreas: [[1, 1]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            bData.ctrlr.getTeam(aim).mp = Math.max(bData.ctrlr.getTeam(aim).mp - datas[0], 0);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人减少${datas[0]}点精神`;
        }
    },
    hitRdcRg: {
        id: 'hitRdcRg',
        cnBrief: '雕',
        dataAreas: [[1, 1]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.ranSd() < rate(datas[0], 0.5, 0.5)) {
                bData.ctrlr.getTeam(aim).rage = Math.max(bData.ctrlr.getTeam(aim).rage - 1, 0);
            }
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人${rd(rate(datas[0], 0.5, 0.5) * 100)}%概率减少1点斗志`;
        }
    },
    hitAddMp: {
        id: 'hitAddMp',
        cnBrief: '灵',
        dataAreas: [[1, 1]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const sTeam = bData.ctrlr.getTeam(pet);
            sTeam.mp = Math.min(sTeam.mp + datas[0], sTeam.mpMax);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，额外获得${datas[0]}点精神`;
        }
    },
    hitAddRg: {
        id: 'hitAddRg',
        cnBrief: '猿',
        dataAreas: [[1, 1]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.ranSd() < rate(datas[0], 0.5, 0.5)) {
                bData.ctrlr.getTeam(pet).rage = Math.min(bData.ctrlr.getTeam(pet).rage + 1, RageMax);
            }
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，${rd(rate(datas[0], 0.5, 0.5) * 100)}%概率额外获得1点斗志`;
        }
    },
    hitKill: {
        id: 'hitKill',
        cnBrief: '灭',
        dataAreas: [[0.05, 0.03]],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (aim.hp < aim.hpMax * 0.2) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果敌人血量少于20%，则普攻伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    hitByRage: {
        id: 'hitByRage',
        cnBrief: '狂',
        dataAreas: [
            [70, -1],
            [0.03, 0.015]
        ],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).rage > Math.max(datas[0], 50)) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果斗志大于${Math.max(datas[0], 50)}点，则普攻伤害提高${rd(datas[1] * 100)}%`;
        }
    },
    hitByHp: {
        id: 'hitByHp',
        cnBrief: '末',
        dataAreas: [
            [0.1, 0.01],
            [0.08, 0.03]
        ],
        onAtk(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (pet.hp < pet.hpMax * Math.min(datas[0], 0.3)) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果血量小于${rd(Math.min(datas[0], 0.3) * 100)}%，则普攻伤害提高${rd(datas[1] * 100)}%`;
        }
    },
    castMpDmg: {
        id: 'castMpDmg',
        cnBrief: '信',
        dataAreas: [
            [0.8, -0.01],
            [0.02, 0.015]
        ],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).mp > bData.ctrlr.getTeam(pet).mpMax * datas[0]) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果精神大于总量的${rd(datas[0] * 100)}%，则技能伤害提高${rd(datas[1] * 100)}%`;
        }
    },
    castConDmg: {
        id: 'castConDmg',
        cnBrief: '慧',
        dataAreas: [[0.02, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (pet.pet2.concentration > aim.pet2.concentration) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果专注高于敌人，则技能伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castFire: {
        id: 'castFire',
        cnBrief: '焚',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.fire) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `火系伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castWater: {
        id: 'castWater',
        cnBrief: '寒',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.water) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `水系伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castAir: {
        id: 'castAir',
        cnBrief: '苍',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.air) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `空系伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castEarth: {
        id: 'castEarth',
        cnBrief: '势',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.earth) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `地系伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castLight: {
        id: 'castLight',
        cnBrief: '耀',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.light) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `光系伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castDark: {
        id: 'castDark',
        cnBrief: '邪',
        dataAreas: [[0.01, 0.01]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.eleType === EleType.dark) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `暗系伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castEleRein: {
        id: 'castEleRein',
        cnBrief: '猎',
        dataAreas: [[0.02, 0.02]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (BtlCtrlr.getEleDmgRate(bData.skillModel.eleType, aim, null) > 1) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `对被属性克制的敌人伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castHurtMe: {
        id: 'castHurtMe',
        cnBrief: '命',
        dataAreas: [[0.03, 0.03]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp -= bData.finalDmg * datas[0];
            pet.hp = Math.max(pet.hp - bData.finalDmg * datas[0], 1);
        },
        getInfo(datas: number[]): string {
            return `技能伤害提高${rd(datas[0] * 100)}%，但自己也会受到等量伤害（不会致死）`;
        }
    },
    castUlti: {
        id: 'castUlti',
        cnBrief: '绝',
        dataAreas: [[0.08, 0.08]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel.skillType === SkillType.ultimate) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `必杀技伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castByCombo: {
        id: 'castByCombo',
        cnBrief: '狼',
        dataAreas: [[0.02, 0.02]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const combo = bData.ctrlr.realBattle.combo - 1;
            if (combo > 0) aim.hp -= bData.finalDmg * datas[0] * combo;
        },
        getInfo(datas: number[]): string {
            return `技能的连击伤害提高${rd(datas[0] * 100)}%乘以连击次数`;
        }
    },
    castByPetCount: {
        id: 'castByPetCount',
        cnBrief: '孤',
        dataAreas: [[0.02, 0.015]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).pets.length < bData.ctrlr.getTeam(aim).pets.length) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果战场己方人数小于敌方，则技能伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    castFullRage: {
        id: 'castFullRage',
        cnBrief: '皇',
        dataAreas: [[0.08, 0.08]],
        onCast(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).rage > 100) {
                aim.hp -= bData.finalDmg * datas[0];
                bData.ctrlr.getTeam(pet).rage -= 10;
            }
        },
        getInfo(datas: number[]): string {
            return `当斗志大于100时，消耗10点斗志，技能伤害提高${rd(datas[0] * 100)}%`;
        }
    },
    hurtAndHurt: {
        id: 'hurtAndHurt',
        cnBrief: '荆',
        dataAreas: [[0.01, 0.01]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            caster.hp = Math.max(caster.hp - bData.finalDmg * datas[0], 1);
        },
        getInfo(datas: number[]): string {
            return `受伤时，敌人受到伤害总量${rd(datas[0] * 100)}%的物理伤害（不会致死）`;
        }
    },
    hurtGotMp: {
        id: 'hurtGotMp',
        cnBrief: '妖',
        dataAreas: [[1, 1]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const sTeam = bData.ctrlr.getTeam(pet);
            sTeam.mp = Math.min(sTeam.mp + datas[0], sTeam.mpMax);
        },
        getInfo(datas: number[]): string {
            return `受伤时，额外获得${datas[0]}点精神`;
        }
    },
    hurtGotRage: {
        id: 'hurtGotRage',
        cnBrief: '熊',
        dataAreas: [[1, 1]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.ranSd() < rate(datas[0], 0.5, 0.5)) {
                bData.ctrlr.getTeam(pet).rage = Math.min(bData.ctrlr.getTeam(pet).rage + 1, RageMax);
            }
        },
        getInfo(datas: number[]): string {
            return `受伤时，${rd(rate(datas[0], 0.05, 0.9) * 100)}%概率额外获得1点斗志`;
        }
    },
    hurtRdcMp: {
        id: 'hurtRdcMp',
        cnBrief: '橡',
        dataAreas: [[0.1, 0.09]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const sTeam = bData.ctrlr.getTeam(pet);
            const dmg = bData.finalDmg * datas[0];
            const rdcMp = dmg / (2 * pet.pet.lv);
            if (sTeam.mp >= rdcMp) {
                sTeam.mp -= rdcMp;
                pet.hp += dmg;
            }
        },
        getInfo(datas: number[]): string {
            return `受伤时，如果有足够的精神，则${rd(datas[0] * 100)}%伤害由消耗精神抵消（1MP=2HP*lv）`;
        }
    },
    hurtWithMelee: {
        id: 'hurtWithMelee',
        cnBrief: '云',
        dataAreas: [[0.02, 0.02]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const battleType = BtlCtrlr.getBattleType(caster, bData.skillModel);
            if (battleType === BattleType.melee) pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `近战伤害减少${rd(datas[0] * 100)}%`;
        }
    },
    hurtWithShoot: {
        id: 'hurtWithShoot',
        cnBrief: '雀',
        dataAreas: [[0.02, 0.02]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const battleType = BtlCtrlr.getBattleType(caster, bData.skillModel);
            if (battleType === BattleType.shoot) pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `射击伤害减少${rd(datas[0] * 100)}%`;
        }
    },
    hurtWithCharge: {
        id: 'hurtWithCharge',
        cnBrief: '山',
        dataAreas: [[0.02, 0.02]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const battleType = BtlCtrlr.getBattleType(caster, bData.skillModel);
            if (battleType === BattleType.charge) pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `冲锋减少${rd(datas[0] * 100)}%`;
        }
    },
    hurtWithAss: {
        id: 'hurtWithAss',
        cnBrief: '松',
        dataAreas: [[0.02, 0.02]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const battleType = BtlCtrlr.getBattleType(caster, bData.skillModel);
            if (battleType === BattleType.assassinate) pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `刺杀伤害减少${rd(datas[0] * 100)}%`;
        }
    },
    hurtByHp: {
        id: 'hurtByHp',
        cnBrief: '慑',
        dataAreas: [
            [0.8, -0.02],
            [0.02, 0.02]
        ],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (pet.hp > pet.hpMax * Math.max(datas[0], 0.5)) pet.hp += bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果当前血量大于等于${rd(Math.max(datas[0], 0.5) * 100)}%，则伤害减少${rd(datas[1] * 100)}%`;
        }
    },
    hurt: {
        id: 'hurt',
        cnBrief: '盾',
        dataAreas: [[0.01, 0.01]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `伤害减少${rd(datas[0] * 100)}%`;
        }
    },
    hurtWithAtk: {
        id: 'hurtWithAtk',
        cnBrief: '障',
        dataAreas: [[0.02, 0.02]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (!bData.skillModel) pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `普攻伤害减少${rd(datas[0] * 100)}%`;
        }
    },
    hurtWithCast: {
        id: 'hurtWithCast',
        cnBrief: '屏',
        dataAreas: [[0.02, 0.02]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.skillModel) pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `技能伤害减少${rd(datas[0] * 100)}%`;
        }
    },
    hurtFullRage: {
        id: 'hurtFullRage',
        cnBrief: '羽',
        dataAreas: [[0.05, 0.05]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (bData.ctrlr.getTeam(pet).rage > 100) {
                pet.hp += bData.finalDmg * datas[0];
                bData.ctrlr.getTeam(pet).rage -= 5;
            }
        },
        getInfo(datas: number[]): string {
            return `当斗志大于100时，消耗5点斗志，抵消${rd(datas[0] * 100)}%伤害`;
        }
    },
    hurtOthers: {
        id: 'hurtOthers',
        cnBrief: '链',
        dataAreas: [[0.1, 0.05]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const petsAlive = bData.ctrlr.getTeam(pet).pets.filter((value: BattlePet) => value.hp > 0 && value !== pet);
            if (petsAlive.length > 0) {
                let dmg = bData.finalDmg * Math.min(datas[0], 1);
                pet.hp += dmg;

                dmg /= petsAlive.length;
                for (const petAlive of petsAlive) petAlive.hp = Math.max(petAlive.hp - dmg, 1);
            }
        },
        getInfo(datas: number[]): string {
            return `伤害的${rd(Math.min(datas[0], 1) * 100)}%由其他己方精灵承担`;
        }
    },
    heal: {
        id: 'heal',
        cnBrief: '医',
        dataAreas: [[0.02, 0.02]],
        onHeal(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp += Math.abs(bData.finalDmg) * datas[0];
        },
        getInfo(datas: number[]): string {
            return `治疗效果提高${rd(datas[0] * 100)}%`;
        }
    },
    healByHp: {
        id: 'healByHp',
        cnBrief: '恩',
        dataAreas: [[0.1, 0.1]],
        onHeal(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            if (aim.hp < aim.hpMax * 0.25) aim.hp += Math.abs(bData.finalDmg) * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果血量低于25%，治疗效果提高${rd(datas[0] * 100)}%`;
        }
    },
    healByCombo: {
        id: 'healByCombo',
        cnBrief: '鹿',
        dataAreas: [[0.04, 0.04]],
        onHeal(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            const combo = bData.ctrlr.realBattle.combo - 1;
            if (combo > 0) aim.hp += Math.abs(bData.finalDmg) * datas[0] * combo;
        },
        getInfo(datas: number[]): string {
            return `连击时，治疗效果提高${rd(datas[0] * 100)}%乘以连击次数`;
        }
    },
    healAndHurt: {
        id: 'healAndHurt',
        cnBrief: '血',
        dataAreas: [
            [0.05, 0.05],
            [0.03, 0.03]
        ],
        onHeal(pet: BattlePet, aim: BattlePet, datas: number[], bData: FeatureBtlData): void {
            aim.hp += Math.abs(bData.finalDmg) * datas[0];
            pet.hp = Math.max(pet.hp - bData.finalDmg * datas[1], 1);
        },
        getInfo(datas: number[]): string {
            return `治疗效果提高${rd(datas[0] * 100)}%，但施法者会受到${rd(datas[1] * 100)}%的伤害（不会致死）`;
        }
    },
    beginAddRage: {
        id: 'beginAddRage',
        cnBrief: '阳',
        dataAreas: [[5, 2]],
        onBtlStart(pet: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const rage = Math.min(datas[0], 20);
            ctrlr.getTeam(pet).rage += rage; // 因为是在btlstart，最多执行5次，每次最高20的话，不会超过Max
        },
        getInfo(datas: number[]): string {
            return `战斗开始时，直接获取${Math.min(datas[0], 20)}点斗志`;
        }
    },
    beginReLi: {
        id: 'beginReLi',
        cnBrief: '热',
        dataAreas: [[1, 1]],
        onBtlStart(pet: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            if (ctrlr.ranSd() < rate(datas[0], 0.05, 0.9)) ctrlr.addBuff(pet, pet, 'ReLi', 3);
        },
        getInfo(datas: number[]): string {
            return `战斗开始时，${rd(rate(datas[0], 0.05, 0.9) * 100)}%概率获得热力，持续3回合`;
        }
    },
    killAddHp: {
        id: 'killAddHp',
        cnBrief: '恶',
        dataAreas: [[0.02, 0.015]],
        onEDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            pet.hp = Math.min(pet.hp + aim.hpMax * datas[0], pet.hpMax);
        },
        getInfo(datas: number[]): string {
            return `敌人被击杀时，血量恢复目标最大血量的${rd(datas[0] * 100)}%`;
        }
    },
    killAddAllHp: {
        id: 'killAddAllHp',
        cnBrief: '噬',
        dataAreas: [[0.03, 0.02]],
        onEDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            if (pet === caster) {
                const petsAlive = ctrlr.getTeam(pet).pets.filter((value: BattlePet) => value.hp > 0);
                for (const petA of petsAlive) petA.hp = Math.min(petA.hp + aim.hpMax * datas[0], petA.hpMax);
            }
        },
        getInfo(datas: number[]): string {
            return `自己击杀敌人后，所有己方血量恢复目标最大血量的${rd(datas[0] * 100)}%`;
        }
    },
    killAddMp: {
        id: 'killAddMp',
        cnBrief: '神',
        dataAreas: [[8, 8]],
        onEDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const sTeam = ctrlr.getTeam(pet);
            sTeam.mp = Math.min(sTeam.mp + datas[0], sTeam.mpMax);
        },
        getInfo(datas: number[]): string {
            return `敌人被击杀时，精神恢复${datas[0]}点`;
        }
    },
    killRdcCD: {
        id: 'killRdcCD',
        cnBrief: '梦',
        dataAreas: [[1, 1]],
        onEDead(pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const cd = ctrlr.ranSd() < rate(datas[0], 0.2, 0.6) ? 2 : 1;
            for (const skilllData of pet.skillDatas) skilllData.cd = Math.max(skilllData.cd - cd, 0);
        },
        getInfo(datas: number[]): string {
            return `敌人被击杀时，所有冷却直接减少1回合，${rd(rate(datas[0], 0.2, 0.6) * 100)}%概率减少2回合`;
        }
    },
    deadHurt: {
        id: 'deadHurt',
        cnBrief: '尽',
        dataAreas: [[0.1, 0.05]],
        onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const hp = pet.hpMax * rate(datas[0], 0.1, 0.4);
            caster.hp = Math.max(caster.hp - hp, 1);
        },
        getInfo(datas: number[]): string {
            return `被击杀时，对敌人造成自己最大血量${rd(rate(datas[0], 0.1, 0.4) * 100)}%的伤害（不会致死）`;
        }
    },
    deadFangHu: {
        id: 'deadFangHu',
        cnBrief: '防',
        dataAreas: [[1, 1]],
        onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const cd = ctrlr.ranSd() < rate(datas[0], 0.2, 0.6) ? 4 : 2;
            const petsAlive = ctrlr.getTeam(pet).pets.filter((value: BattlePet) => value.hp > 0 && value !== pet);
            for (const petAlive of petsAlive) ctrlr.addBuff(petAlive, pet, 'FangHu', cd);
        },
        getInfo(datas: number[]): string {
            return `被击杀时，对己方其他精灵释放防护罩持续2回合，${rd(rate(datas[0], 0.2, 0.6) * 100)}%概率持续4回合`;
        }
    },
    deadHuiChun: {
        id: 'deadHuiChun',
        cnBrief: '春',
        dataAreas: [[1, 1]],
        onDead(pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BtlCtrlr): void {
            const cd = ctrlr.ranSd() < rate(datas[0], 0.2, 0.6) ? 4 : 2;
            const petsAlive = ctrlr.getTeam(pet).pets.filter((value: BattlePet) => value.hp > 0 && value !== pet);
            for (const petAlive of petsAlive) ctrlr.addBuff(petAlive, pet, 'HuiChun', cd);
        },
        getInfo(datas: number[]): string {
            return `被击杀时，对己方其他精灵释放回春术持续2回合，${rd(rate(datas[0], 0.2, 0.6) * 100)}%概率持续4回合`;
        }
    }
};

export const featureModelDict = FeatureModelDict as { [key: string]: FeatureModel };
