/*
 * DataOther.ts
 * 除了模型数据和需保存的数据以外的其他数据结构
 * luleyan
 */

import { PetDataTool, EquipDataTool } from './Memory';
import { FeatureModel, PetModel, SkillModel, SkillType, EquipModel, SkillDirType, SkillAimtype } from './DataModel';
import { BioType, EleType, BattleType, Pet, EleTypeNames } from './DataSaved';

import { petModelDict } from 'configs/PetModelDict';
import { skillModelDict } from 'configs/SkillModelDict';
import { deepCopy } from './Utils';
import { buffModelDict } from 'configs/BuffModelDict';
import { BattleController } from './BattleController';

/** 运行时游戏数据 */
export class GameDataJIT {
    /** name:attri:data */
    attriGainAmplDict: { [key: string]: { [key: string]: number } } = {};
}

// -----------------------------------------------------------------

const RankToAttriRatio = [0, 1, 1.3, 1.63, 1.95, 2.28, 2.62, 3.02, 3.47, 3.99, 4.59, 5.28];
const BioToFromToRatio = [[], [0.85, 1.15], [0.6, 1.4], [1, 1], [0.85, 1.15], [0.85, 1.15]];

export class Pet2 {
    // 原始值 -----------------------------------------------------------------
    strengthOri: number;
    concentrationOri: number;
    durabilityOri: number;
    agilityOri: number;
    sensitivityOri: number;
    elegantOri: number;

    hpMaxOri: number;
    mpMaxOri: number;

    atkDmgFromOri: number;
    atkDmgToOri: number;

    sklDmgFromOri: number;
    sklDmgToOri: number;

    // 终值 -----------------------------------------------------------------

    strength: number;
    concentration: number;
    durability: number;
    agility: number;
    sensitivity: number;
    elegant: number;

    hpMax: number;
    mpMax: number;

    atkDmgFrom: number;
    atkDmgTo: number;

    sklDmgFrom: number;
    sklDmgTo: number;
    /** 速度 */
    speed: number;

    /** 额外生物类型 */
    exBioTypes: BioType[];
    /** 额外元素类型 */
    exEleTypes: EleType[];
    /** 额外战斗类型 */
    exBattleTypes: BattleType[];

    critRate: number;
    critDmgRate: number;
    evdRate: number;
    hitRate: number;
    dfsRate: number;

    armor: number;

    skillIds: string[];

    setData(pet: Pet, exEquipTokens: string[] = null, exPrvty: number = null) {
        let petModel: PetModel = petModelDict[pet.id];

        let lv = pet.lv;
        let rank = pet.rank;
        let bioType = petModel.bioType;
        let prvty = exPrvty || pet.prvty;

        let rankRatio = RankToAttriRatio[rank];
        let fromToRatio = BioToFromToRatio[bioType];

        // 一级原始属性
        this.strengthOri = (petModel.baseStrength + petModel.addStrength * lv) * rankRatio;
        this.concentrationOri = (petModel.baseConcentration + petModel.addConcentration * lv) * rankRatio;
        this.durabilityOri = (petModel.baseDurability + petModel.addDurability * lv) * rankRatio;
        this.agilityOri = (petModel.baseAgility + petModel.addAgility * lv) * rankRatio;
        this.sensitivityOri = (petModel.baseSensitivity + petModel.addSensitivity * lv) * rankRatio;
        this.elegantOri = (petModel.baseElegant + petModel.addElegant * lv) * rankRatio;

        // 一级属性
        this.strength = this.strengthOri;
        this.concentration = this.concentrationOri;
        this.durability = this.durabilityOri;
        this.agility = this.agilityOri;
        this.sensitivity = this.sensitivityOri;
        this.elegant = this.elegantOri;

        this.armor = 0;

        // 特性加成
        PetDataTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onBaseSetting')) model.onBaseSetting(this, datas);
        });

        // 装备加成
        for (const equip of pet.equips) {
            if (!equip) continue;
            EquipDataTool.getFinalAttris(equip, this);
        }

        // 二级原始属性
        this.hpMaxOri = this.durability * 25;
        this.mpMaxOri = 100 + Math.floor(this.concentration / 30);
        this.atkDmgFromOri = this.strength * fromToRatio[0] + 5;
        this.atkDmgToOri = this.strength * fromToRatio[1] + 15;
        this.sklDmgFromOri = this.concentration * fromToRatio[0] + 15;
        this.sklDmgToOri = this.concentration * fromToRatio[1] + 30;

        // 二级属性
        this.hpMax = this.hpMaxOri;
        this.mpMax = this.mpMaxOri;
        this.atkDmgFrom = this.atkDmgFromOri;
        this.atkDmgTo = this.atkDmgToOri;
        this.sklDmgFrom = this.sklDmgFromOri;
        this.sklDmgTo = this.sklDmgToOri;
        this.speed = petModel.speed;

        this.exBioTypes = [];
        this.exEleTypes = [];
        this.exBattleTypes = [];

        // 其他属性
        let realPrvty = Math.floor(Math.sqrt(prvty));
        let prvtyPercent = realPrvty * 0.01;
        this.critRate = prvtyPercent * 0.1;
        this.critDmgRate = 0.5 + prvtyPercent * 0.5;
        this.evdRate = 0.05 + prvtyPercent * 0.05;
        this.hitRate = 0.8 + prvtyPercent * 0.2;
        this.dfsRate = 0;

        // 特性加成
        PetDataTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onSetting')) model.onSetting(this, datas);
        });

        // 限制
        this.hpMax = Math.max(this.hpMax, 1);
        this.mpMax = Math.max(this.mpMax, 1);
        this.atkDmgFrom = Math.max(this.atkDmgFrom, 1);
        this.atkDmgTo = Math.max(this.atkDmgTo, 1);
        this.sklDmgFrom = Math.max(this.sklDmgFrom, 1);
        this.sklDmgTo = Math.max(this.sklDmgTo, 1);

        // 技能
        this.skillIds = [];

        // 装备技能
        for (let index = pet.equips.length - 1; index >= 0; index--) {
            let equip = pet.equips[index];
            if (!equip) continue;
            let skillId = equip.skillId;
            if (!skillId) continue;
            this.skillIds.push(skillId);
        }

        // 自带技能
        let selfSkillIds = PetDataTool.getSelfSkillIdByCurLv(pet);
        for (let index = selfSkillIds.length - 1; index >= 0; index--) {
            const skillId = selfSkillIds[index];
            this.skillIds.push(skillId);
        }
    }
}

// battle -----------------------------------------------------------------

export class BattleSkill {
    id: string;
    cd: number = 0;
    mpUsing: number = 0;
}

export class BattleBuff {
    id: string;
    time: number;
    caster: BattlePet;
    data: any;
}

export const RAGE_MAX: number = 150;

export class BattlePet {
    idx: number = 0;

    fromationIdx: number = 0;
    beEnemy: boolean = false;

    last: BattlePet = null;
    next: BattlePet = null;

    pet: Pet = null;
    pet2: Pet2 = null;

    hp: number = 0;
    hpMax: number = 0;

    startingBattleFeatures: StartingBattleFeature[] = [];
    attackingFeatures: AttackingFeature[] = [];
    castingFeatures: CastingFeature[] = [];
    hurtFeatures: HurtFeature[] = [];
    healingFeatures: HealingFeature[] = [];
    enemyDeadFeatures: EnemyDeadFeature[] = [];
    deadFeatures: DeadFeature[] = [];

    skillDatas: BattleSkill[] = [];

    buffDatas: BattleBuff[] = [];

    init(idx: number, fromationIdx: number, pet: Pet, beEnemy: boolean) {
        this.idx = idx;
        this.fromationIdx = fromationIdx;
        this.pet = pet;
        this.pet2 = new Pet2();
        this.pet2.setData(pet);
        this.beEnemy = beEnemy;

        this.hp = this.pet2.hpMax;
        this.hpMax = this.pet2.hpMax;

        // 特性
        this.startingBattleFeatures.length = 0;
        this.attackingFeatures.length = 0;
        this.castingFeatures.length = 0;
        this.hurtFeatures.length = 0;
        this.healingFeatures.length = 0;
        this.enemyDeadFeatures.length = 0;
        this.deadFeatures.length = 0;

        let addFeatureFunc = (attri: string, funcName: string, model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty(funcName)) {
                let list: { func: any; datas: number[]; id: string }[] = this[attri];
                for (const featureInList of list) {
                    if (featureInList.id == model.id) {
                        for (let index = 0; index < featureInList.datas.length; index++) {
                            featureInList.datas[index] += datas[index];
                        }
                        return;
                    }
                }
                list.push({ func: model[funcName], datas, id: model.id });
            }
        };

        PetDataTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            addFeatureFunc('startingBattleFeatures', 'onStartingBattle', model, datas);
            addFeatureFunc('attackingFeatures', 'onAttacking', model, datas);
            addFeatureFunc('castingFeatures', 'onCasting', model, datas);
            addFeatureFunc('hurtFeatures', 'onHurt', model, datas);
            addFeatureFunc('healingFeatures', 'onHealing', model, datas);
            addFeatureFunc('enemyDeadFeatures', 'onEnemyDead', model, datas);
            addFeatureFunc('deadFeatures', 'onDead', model, datas);
        });

        // 技能
        let getSkillMpUsing = (skillId: string) => {
            let skillModel: SkillModel = skillModelDict[skillId];
            if (skillModel.skillType == SkillType.ultimate) return 0;
            let mpUsing = skillModel.mp;
            if (petModelDict[pet.id].eleType == skillModel.eleType) mpUsing -= Math.ceil(mpUsing * 0.1);
            return mpUsing;
        };

        this.skillDatas.length = 0;

        for (const skillId of this.pet2.skillIds) {
            let skill = new BattleSkill();
            skill.id = skillId;
            skill.mpUsing = getSkillMpUsing(skillId);
            this.skillDatas.push(skill);
        }
    }

    clone() {
        let newBPet = new BattlePet();
        newBPet.idx = this.idx;
        newBPet.fromationIdx = this.fromationIdx;
        newBPet.beEnemy = this.beEnemy;

        newBPet.last = this.last; // 暂时指向旧数据，在RealBattle的clone中更新
        newBPet.next = this.next; // 暂时指向旧数据，在RealBattle的clone中更新

        newBPet.pet = this.pet;
        newBPet.pet2 = this.pet2;

        newBPet.hp = this.hp;
        newBPet.hpMax = this.hpMax;

        for (const skill of this.skillDatas) {
            let newSkill = new BattleSkill();
            newSkill.cd = skill.cd;
            newSkill.id = skill.id;
            newBPet.skillDatas.push(newSkill);
        }

        for (const buff of this.buffDatas) {
            let newBuff = new BattleBuff();
            newBuff.id = buff.id;
            newBuff.caster = buff.caster;
            newBuff.time = buff.time;
            newBuff.data = buff.data;
            newBPet.buffDatas.push(newBuff);
        }

        return newBPet;
    }
}

export class BattleTeam {
    pets: BattlePet[] = [];

    mpMax: number = 0;
    mp: number = 0;
    rage: number = 0;
}

export class RealBattle {
    start: boolean = false;

    selfTeam: BattleTeam = null;
    enemyTeam: BattleTeam = null;

    battleRound: number = 0;
    atkRound: number = 0;

    order: BattlePet[] = [];
    curOrderIdx: number = 0;

    lastAim: BattlePet = null;
    combo: number = 1;

    clone() {
        let newRB = new RealBattle();
        newRB.start = this.start;
        newRB.selfTeam = <BattleTeam>deepCopy(this.selfTeam);
        newRB.enemyTeam = <BattleTeam>deepCopy(this.enemyTeam);
        newRB.battleRound = this.battleRound;
        newRB.atkRound = this.atkRound;
        newRB.curOrderIdx = this.curOrderIdx;
        newRB.combo = this.combo;

        for (const bPet of this.order) {
            newRB.order.push(this.copyAim(bPet, newRB));
        }
        newRB.lastAim = this.copyAim(this.lastAim, newRB);

        for (const pet of newRB.selfTeam.pets) {
            pet.last = this.copyAim(pet.last, newRB);
            pet.next = this.copyAim(pet.next, newRB);
        }

        for (const pet of newRB.enemyTeam.pets) {
            pet.last = this.copyAim(pet.last, newRB);
            pet.next = this.copyAim(pet.next, newRB);
        }

        return newRB;
    }

    copyAim(aim: BattlePet, to: RealBattle) {
        if (!aim) return null;
        let team = aim.beEnemy ? to.enemyTeam : to.selfTeam;
        return team.pets[aim.idx];
    }
}

// -----------------------------------------------------------------

export class SkillInfo {
    static infoDict: { [key: string]: string } = {};
    static get(id: string): string {
        if (this.infoDict[id]) return this.infoDict[id];

        let skl: SkillModel = skillModelDict[id];
        let info = '';
        let aim: string;
        if (skl.dirType == SkillDirType.enemy) {
            switch (skl.spBattleType) {
                case BattleType.none:
                    aim = '敌方单体目标';
                    break;
                case BattleType.melee:
                    aim = '敌方最近单体目标';
                    break;
                case BattleType.shoot:
                    aim = '敌方随机单体目标';
                    break;
                case BattleType.charge:
                    aim = '敌方排头目标';
                    break;
                case BattleType.assassinate:
                    aim = '敌方血量最少目标';
                    break;
                default:
                    break;
            }
        } else {
            switch (skl.spBattleType) {
                case BattleType.none:
                    aim = '己方单体目标';
                    break;
                case BattleType.melee:
                    aim = '自己';
                    break;
                case BattleType.shoot:
                    aim = '己方随机单体目标';
                    break;
                case BattleType.charge:
                    aim = '己方排头目标';
                    break;
                case BattleType.assassinate:
                    aim = '己方血量最少目标';
                    break;
                default:
                    break;
            }
        }

        info += '使' + aim;
        info += this.getDmg(skl.mainDmg, skl.eleType);
        info += this.getBuff(skl.mainDmg, skl.mainBuffId, skl.mainBuffTime);

        if (skl.hpLimit) {
            info += `(目标血量须低于${skl.hpLimit}%才可发动)`;
        }

        if (skl.aimType != SkillAimtype.one) {
            let subAim: string;
            switch (skl.aimType) {
                case SkillAimtype.oneAndNext:
                    subAim = '下方相邻目标';
                    break;
                case SkillAimtype.oneAndOthers:
                    subAim = (skl.dirType == SkillDirType.enemy ? '敌方' : '己方') + '其他目标';
                    break;
                case SkillAimtype.oneAndSelf:
                    subAim = '自己';
                default:
                    break;
            }

            if (skl.subDmg || skl.subBuffId) {
                info += '；' + subAim;
                info += this.getDmg(skl.subDmg, skl.eleType, true);
                info += this.getBuff(skl.subDmg, skl.subBuffId, skl.subBuffTime);
            }
        }

        this.infoDict[id] = info;
        return info;
    }

    static getDmg(dmg: number, eleType: EleType, sub: boolean = false) {
        let info = '';
        if (dmg) {
            if (dmg > 0) {
                info += `受到##点(${dmg}%技能+100%攻击伤害)${EleTypeNames[eleType]}伤害`;
            } else {
                info += `恢复血量##点(${-dmg}%技能伤害)`;
            }
        }
        if (sub) info = info.replace('##', '^^');

        return info;
    }

    static getBuff(dmg: number, buffId: string, buffTime: number) {
        let info = '';
        if (buffId) {
            if (dmg) info += '并';
            info += `获得${buffTime}回合${buffModelDict[buffId].cnName}效果`;
        }

        return info;
    }

    static getSklDmgStr(pet2: Pet2, rate: number) {
        let from = BattleController.getCastRealDmg(pet2.sklDmgFrom, rate, pet2.atkDmgFrom) * 0.1;
        let to = BattleController.getCastRealDmg(pet2.sklDmgTo, rate, pet2.atkDmgTo) * 0.1;
        return `${from.toFixed(1)}到${to.toFixed(1)}`;
    }

    static getRealSklStr(skillId: string, pet2: Pet2) {
        let info = this.get(skillId);
        let skl: SkillModel = skillModelDict[skillId];
        let mainDmgStr = this.getSklDmgStr(pet2, skl.mainDmg * 0.01);
        let subDmgStr = this.getSklDmgStr(pet2, skl.subDmg * 0.01);
        info = info.replace('##', mainDmgStr).replace('^^', subDmgStr);
    }
}
