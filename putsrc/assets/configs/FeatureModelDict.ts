/*
 * FeatureModelDict.ts
 * 特性
 * luleyan
 */

import { FeatureModel, Pet2, BattleDataForFeature, SkillModel, EleType, SkillType, BattleType } from 'scripts/Memory';
import { BattlePet, BattleController } from 'pages/page_act_exploration/scripts/BattleController';

const FeatureModelDict: { [key: string]: Partial<FeatureModel> } = {
    baseStrength: {
        id: 'baseStrength',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.strength += pet.strengthOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础强壮增加${datas[0] * 100}%`;
        }
    },
    baseConcentration: {
        id: 'baseConcentration',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.concentration += pet.concentrationOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础专注增加${datas[0] * 100}%`;
        }
    },
    baseDurability: {
        id: 'baseDurability',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.durability += pet.durabilityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础耐久增加${datas[0] * 100}%`;
        }
    },
    baseAgility: {
        id: 'baseAgility',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.agility += pet.agilityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础灵敏增加${datas[0] * 100}%`;
        }
    },
    baseSensitivity: {
        id: 'baseSensitivity',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.sensitivity += pet.sensitivityOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础细腻增加${datas[0] * 100}%`;
        }
    },
    baseElegant: {
        id: 'baseElegant',
        dataAreas: [[0.01, 0.01]],
        onBaseSetting(pet: Pet2, datas: number[]): void {
            pet.elegant += pet.elegantOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `基础优雅增加${datas[0] * 100}%`;
        }
    },
    addHpMax: {
        id: 'addHpMax',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.hpMax += pet.hpMaxOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `血量上限增加${datas[0] * 100}%`;
        }
    },
    addMpMax: {
        id: 'addMpMax',
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
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgFrom += pet.atkDmgFromOri * datas[0];
            pet.atkDmgTo += pet.atkDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `攻击伤害增加${datas[0] * 100}%`;
        }
    },
    addSklDmg: {
        id: 'addSklDmg',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.sklDmgFrom += pet.sklDmgFromOri * datas[0];
            pet.sklDmgTo += pet.sklDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `技能伤害增加${datas[0] * 100}%`;
        }
    },
    addAtkMax: {
        id: 'addAtkMax',
        dataAreas: [[0.02, 0.02]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgTo += pet.atkDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `攻击伤害最大值增加${datas[0] * 100}%`;
        }
    },
    addSklMax: {
        id: 'addSklMax',
        dataAreas: [[0.02, 0.02]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.sklDmgTo += pet.sklDmgToOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `技能伤害最大值增加${datas[0] * 100}%`;
        }
    },
    addCritRate: {
        id: 'addCritRate',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.critRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `暴击率增加${datas[0] * 100}%`;
        }
    },
    addCritDmgRate: {
        id: 'addCritDmgRate',
        dataAreas: [[0.1, 0.1]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.critDmgRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `暴击伤害增加${datas[0] * 100}%`;
        }
    },
    addEvdRate: {
        id: 'addEvdRate',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.evdRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `闪躲率增加${datas[0] * 100}%`;
        }
    },
    addHitRate: {
        id: 'addHitRate',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.hitRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `命中率增加${datas[0] * 100}%`;
        }
    },
    addDfsRate: {
        id: 'addDfsRate',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.dfsRate += datas[0];
        },
        getInfo(datas: number[]): string {
            return `免伤增加${datas[0] * 100}%`;
        }
    },
    addDmgRdcHP: {
        id: 'addDmgRdcHP',
        dataAreas: [[0.01, 0.01]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.atkDmgFrom += pet.atkDmgFromOri * datas[0];
            pet.atkDmgTo += pet.atkDmgToOri * datas[0];
            pet.sklDmgFrom += pet.sklDmgFromOri * datas[0];
            pet.sklDmgTo += pet.sklDmgToOri * datas[0];
            pet.hpMax -= pet.hpMaxOri * datas[0];
        },
        getInfo(datas: number[]): string {
            return `伤害提高${datas[0] * 100}%，但血量降低${datas[0] * 100}%`;
        }
    },
    addLoad: {
        id: 'addLoad',
        dataAreas: [[30, 30]],
        onSetting(pet: Pet2, datas: number[]): void {
            pet.load += datas[0];
        },
        getInfo(datas: number[]): string {
            return `负重增加${datas[0]}点`;
        }
    },
    hitWithFire: {
        id: 'hitWithFire',
        dataAreas: [[0.1, 0.1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) aim.hp -= pet.getSklDmg() * datas[0] * bData.ctrlr.getEleDmgRate(EleType.fire, aim);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到${datas[0] * 100}%(技能)火系伤害`;
        }
    },
    hitWithWater: {
        id: 'hitWithWater',
        dataAreas: [[0.1, 0.1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) aim.hp -= pet.getSklDmg() * datas[0] * bData.ctrlr.getEleDmgRate(EleType.water, aim);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到${datas[0] * 100}%(技能)水系伤害`;
        }
    },
    hitWithAir: {
        id: 'hitWithAir',
        dataAreas: [[0.1, 0.1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) aim.hp -= pet.getSklDmg() * datas[0] * bData.ctrlr.getEleDmgRate(EleType.air, aim);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到${datas[0] * 100}%(技能)空系伤害`;
        }
    },
    hitWithEarth: {
        id: 'hitWithEarth',
        dataAreas: [[0.1, 0.1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) aim.hp -= pet.getSklDmg() * datas[0] * bData.ctrlr.getEleDmgRate(EleType.earth, aim);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到${datas[0] * 100}%(技能)地系伤害`;
        }
    },
    hitWithLight: {
        id: 'hitWithLight',
        dataAreas: [[0.1, 0.1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) aim.hp -= pet.getSklDmg() * datas[0] * bData.ctrlr.getEleDmgRate(EleType.light, aim);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到${datas[0] * 100}%(技能)光系伤害`;
        }
    },
    hitWithDark: {
        id: 'hitWithDark',
        dataAreas: [[0.1, 0.1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) aim.hp -= pet.getSklDmg() * datas[0] * bData.ctrlr.getEleDmgRate(EleType.dark, aim);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人受到${datas[0] * 100}%(技能)暗系伤害`;
        }
    },
    hitStlHP: {
        id: 'hitStlHP',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) pet.hp = Math.min(pet.hp + bData[0] * bData.finalDmg, pet.hpMax);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，偷取伤害${datas[0] * 100}%的血量`;
        }
    },
    hitRdcMp: {
        id: 'hitRdcMp',
        dataAreas: [[1, 1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) bData.ctrlr.getTeam(aim).mp = Math.min(bData.ctrlr.getTeam(aim).mp - datas[0], 0);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人减少${datas[0]}点精神`;
        }
    },
    hitRdcRg: {
        id: 'hitRdcRg',
        dataAreas: [[1, 1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) bData.ctrlr.getTeam(aim).rage = Math.min(bData.ctrlr.getTeam(aim).rage - datas[0], 0);
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，敌人减少${datas[0]}点怒气`;
        }
    },
    hitAddMp: {
        id: 'hitAddMp',
        dataAreas: [[1, 1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) {
                let selfTeam = bData.ctrlr.getTeam(pet);
                selfTeam.mp = Math.min(selfTeam.mp + datas[0], selfTeam.mpMax);
            }
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，额外获得${datas[0]}点精神`;
        }
    },
    hitAddRg: {
        id: 'hitAddRg',
        dataAreas: [[1, 1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) {
                let selfTeam = bData.ctrlr.getTeam(pet);
                selfTeam.rage = Math.min(selfTeam.rage + datas[0], 100);
            }
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，额外获得${datas[0]}点怒气`;
        }
    },
    hitStlMp: {
        id: 'hitStlMp',
        dataAreas: [[1, 1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) {
                bData.ctrlr.getTeam(aim).mp = Math.min(bData.ctrlr.getTeam(aim).mp - datas[0], 0);
                let selfTeam = bData.ctrlr.getTeam(pet);
                selfTeam.mp = Math.min(selfTeam.mp + datas[0], selfTeam.mpMax);
            }
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，偷取${datas[0]}点精神`;
        }
    },
    hitStlRg: {
        id: 'hitStlRg',
        dataAreas: [[1, 1]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (!bData.skillModel) {
                bData.ctrlr.getTeam(aim).rage = Math.min(bData.ctrlr.getTeam(aim).rage - datas[0], 0);
                let selfTeam = bData.ctrlr.getTeam(pet);
                selfTeam.rage = Math.min(selfTeam.rage + datas[0], 100);
            }
        },
        getInfo(datas: number[]): string {
            return `普攻击中时，偷取${datas[0]}点怒气`;
        }
    },
    castMpDmg: {
        id: 'castMpDmg',
        dataAreas: [
            [0.8, -0.02],
            [0.01, 0.01]
        ],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.ctrlr.getTeam(pet).mp > bData.ctrlr.getTeam(pet).mpMax * datas[0])
                aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果精神大于总量的${datas[0] * 100}%，则技能伤害提高${datas[1] * 100}%`;
        }
    },
    castConDmg: {
        id: 'castConDmg',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && pet.pet2.concentration > aim.pet2.concentration) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果专注高于敌人，则技能伤害提高${datas[0] * 100}%`;
        }
    },
    castFire: {
        id: 'castFire',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.skillModel.eleType == EleType.fire) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `火系伤害提高${datas[0] * 100}%`;
        }
    },
    castWater: {
        id: 'castWater',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.skillModel.eleType == EleType.water) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `水系伤害提高${datas[0] * 100}%`;
        }
    },
    castAir: {
        id: 'castAir',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.skillModel.eleType == EleType.air) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `空系伤害提高${datas[0] * 100}%`;
        }
    },
    castEarth: {
        id: 'castEarth',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.skillModel.eleType == EleType.earth) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `地系伤害提高${datas[0] * 100}%`;
        }
    },
    castLight: {
        id: 'castLight',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.skillModel.eleType == EleType.light) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `光系伤害提高${datas[0] * 100}%`;
        }
    },
    castDark: {
        id: 'castDark',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.skillModel.eleType == EleType.dark) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `暗系伤害提高${datas[0] * 100}%`;
        }
    },
    castEleRein: {
        id: 'castEleRein',
        dataAreas: [[0.03, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.ctrlr.getEleDmgRate(bData.skillModel.eleType, aim) > 1)
                aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `对被属性克制的敌人伤害提高${datas[0] * 100}%`;
        }
    },
    castHurtMe: {
        id: 'castHurtMe',
        dataAreas: [[0.03, 0.03]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel) {
                aim.hp -= bData.finalDmg * datas[0];
                pet.hp = Math.max(pet.hp - bData.finalDmg * datas[0], 1);
            }
        },
        getInfo(datas: number[]): string {
            return `技能伤害提高${datas[0] * 100}%，但自己也会被反噬（不会致死）`;
        }
    },
    castUlti: {
        id: 'castUlti',
        dataAreas: [[0.02, 0.02]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.skillModel && bData.skillModel.skillType == SkillType.ultimate) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `必杀技伤害提高${datas[0] * 100}%`;
        }
    },
    hitKill: {
        id: 'hitKill',
        dataAreas: [
            [0.2, 0.01],
            [0.05, 0.02]
        ],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (aim.hp < aim.hpMax * datas[0]) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果敌人生命少于${datas[0] * 100}%，则伤害提高${datas[1] * 100}%`;
        }
    },
    hitByRage: {
        id: 'hitByRage',
        dataAreas: [
            [60, -1],
            [0.03, 0.01]
        ],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.ctrlr.getTeam(pet).rage > datas[0]) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果你的怒气大于${datas[0]}点，则伤害提高${datas[1] * 100}%`;
        }
    },
    hitByHp: {
        id: 'hitByHp',
        dataAreas: [
            [0.1, 0.01],
            [0.8, 0.03]
        ],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (pet.hp < pet.hpMax * datas[0]) aim.hp -= bData.finalDmg * datas[1];
        },
        getInfo(datas: number[]): string {
            return `如果你的怒气大于${datas[0]}点，则伤害提高${datas[1] * 100}%`;
        }
    },
    hitByCombo: {
        id: 'hitByCombo',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.ctrlr.realBattle.combo > 1) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `连击伤害提高${datas[0] * 100}%`;
        }
    },
    hitByPetCountDiff: {
        id: 'hitByPetCountDiff',
        dataAreas: [[0.01, 0.01]],
        onAttacking(pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            if (bData.ctrlr.getTeam(pet).pets.length < bData.ctrlr.getTeam(aim).pets.length) aim.hp -= bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `如果战场己方人数小于敌方，则伤害提高${datas[0] * 100}%`;
        }
    },
    hurtAndHurt: {
        id: 'hurtAndHurt',
        dataAreas: [[0.01, 0.01]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            caster.hp = Math.max(caster.hp - bData.finalDmg * datas[0], 1);
        },
        getInfo(datas: number[]): string {
            return `受伤时，敌人受到伤害总量${datas[0] * 100}%的物理伤害（不会致死）`;
        }
    },
    hurtGotMp: {
        id: 'hurtGotMp',
        dataAreas: [[1, 1]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            let team = bData.ctrlr.getTeam(pet);
            team.mp = Math.min(team.mp + datas[0], team.mpMax);
        },
        getInfo(datas: number[]): string {
            return `受伤时，额外获得${datas[0]}点精神`;
        }
    },
    hurtGotRage: {
        id: 'hurtGotRage',
        dataAreas: [[1, 1]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            bData.ctrlr.getTeam(pet).rage = Math.min(bData.ctrlr.getTeam(pet).rage + datas[0], 100);
        },
        getInfo(datas: number[]): string {
            return `受伤时，额外获得${datas[0]}点怒气`;
        }
    },
    hurtRdcMp: {
        id: 'hurtRdcMp',
        dataAreas: [
            [8, 8],
            [0.08, 0.08]
        ],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            let team = bData.ctrlr.getTeam(pet);
            if (team.mp > datas[0]) {
                team.mp -= datas[1];
                pet.hp += bData.finalDmg * datas[0];
            }
        },
        getInfo(datas: number[]): string {
            return `受伤时，如果精神大于${datas[0]}点，则消耗${datas[0]}点精神，伤害减少${datas[1] * 100}%`;
        }
    },
    hurtWithShoot: {
        id: 'hurtWithShoot',
        dataAreas: [[0.02, 0.02]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            let battleType = bData.skillModel.spBattleType || bData.ctrlr.getBattleType(caster);
            if (battleType == BattleType.shoot) pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `射击伤害减少${datas[0] * 100}%`;
        }
    },
    hurtWithAss: {
        id: 'hurtWithAss',
        dataAreas: [[0.02, 0.02]],
        onHurt(pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature): void {
            let battleType = bData.skillModel.spBattleType || bData.ctrlr.getBattleType(caster);
            if (battleType == BattleType.assassinate) pet.hp += bData.finalDmg * datas[0];
        },
        getInfo(datas: number[]): string {
            return `刺杀伤害减少${datas[0] * 100}%`;
        }
    }
};

// 被击中时，如果当前血量大于等于N%，则伤害减少P%
// 被击中时，伤害减少N%
// 被击中时，如果是普攻，则伤害减少N%
// 被击中时，如果是技能，则伤害减少N%
// 被击中时，如果敌人的元素刚好与你相同，则伤害减少N%
// 被击中时，伤害的N%，由其他己方宠物承担
// 被治疗时，治疗效果提高N%
// 被治疗时，如果血量低于N%，则治疗效果提高P%
// 战斗开始时，直接获取N点怒气
// 消灭敌人时，血量增加N%
// 消灭敌人时，所有己方宠物血量提高N%
// 消灭敌人时，精神增加N点
// 消灭敌人时，所有冷却直接减少1回合
// 被消灭时，对敌人造成自己最大生命的N%的暗系伤害
// 被消灭时，对己方其他宠物释放防护罩持续2回合
// 被消灭时，对己方其他宠物释放回春术持续2回合 (n + 156) * 2654435769) >> 19

export default FeatureModelDict;
