/*
 * DataOther.ts
 * 除了模型数据和需保存的数据以外的其他数据结构
 * luleyan
 */

import { PetDataTool } from './Memory';
import { FeatureModel, PetModel, SkillModel, SkillType } from './DataModel';
import { BioType, EleType, BattleType, Pet } from './DataSaved';

import { petModelDict } from 'configs/PetModelDict';
import { skillModelDict } from 'configs/SkillModelDict';
import { deepCopy } from './Utils';

const RankToAttriRatio = [0, 1, 1.3, 1.63, 1.95, 2.28, 2.62, 3.02, 3.47, 3.99, 4.59, 5.28];
const BioToFromToRatio = [[], [0.85, 1.15], [0.6, 1.4], [1, 1], [0.85, 1.15], [0.85, 1.15]];

// @ts-ignore
Array.prototype.removeIndex = function (ridx) {
    this[ridx] = undefined;
    for (let index = this.length - 1; index >= 0; index--) {
        if (this[index] === undefined) continue;
        this.length = index + 1;
        return;
    }
    this.length = 0;
};

// @ts-ignore
Array.prototype.getLast = function () {
    return this.length > 0 ? this[this.length - 1] : null;
};

export class Pet2 {
    // 原始值 -----------------------------------------------------------------
    strengthOri: number = 0;
    concentrationOri: number = 0;
    durabilityOri: number = 0;
    agilityOri: number = 0;
    sensitivityOri: number = 0;
    elegantOri: number = 0;

    hpMaxOri: number = 0;
    mpMaxOri: number = 0;

    atkDmgFromOri: number = 0;
    atkDmgToOri: number = 0;

    sklDmgFromOri: number = 0;
    sklDmgToOri: number = 0;

    // 终值 -----------------------------------------------------------------

    strength: number = 0;
    concentration: number = 0;
    durability: number = 0;
    agility: number = 0;
    sensitivity: number = 0;
    elegant: number = 0;

    hpMax: number = 0;
    mpMax: number = 0;

    atkDmgFrom: number = 0;
    atkDmgTo: number = 0;

    sklDmgFrom: number = 0;
    sklDmgTo: number = 0;
    /** 速度 */
    speed: number = 0;

    /** 额外生物类型 */
    exBioTypes: BioType[] = [];
    /** 额外元素类型 */
    exEleTypes: EleType[] = [];
    /** 额外战斗类型 */
    exBattleTypes: BattleType[] = [];

    critRate: number = 0;
    critDmgRate: number = 0;
    evdRate: number = 0;
    hitRate: number = 0;
    dfsRate: number = 0;

    armor: number = 0;

    load: number = 0;

    setData(pet: Pet, exEquipTokens: string[] = null, exPrivity: number = null) {
        let petModel: PetModel = petModelDict[pet.id];

        let lv = pet.lv;
        let rank = pet.rank;
        let bioType = petModel.bioType;
        let privity = exPrivity || pet.privity;

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

        // 特性加成
        PetDataTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onBaseSetting')) model.onBaseSetting(this, datas);
        });

        // 装备加成

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

        // 其他属性
        let privityPercent = privity * 0.01;
        this.critRate = privityPercent * 0.1;
        this.critDmgRate = 0.5 + privityPercent * 0.5;
        this.evdRate = 0.05 + privityPercent * 0.05;
        this.hitRate = 0.8 + privityPercent * 0.2;
        this.dfsRate = 0;

        this.load = Math.floor(this.durability / 10);

        // 特性加成
        PetDataTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onSetting')) model.onSetting(this, datas);
        });

        // 装备加成

        this.hpMax = Math.max(this.hpMax, 1);
        this.mpMax = Math.max(this.mpMax, 1);
        this.atkDmgFrom = Math.max(this.atkDmgFrom, 1);
        this.atkDmgTo = Math.max(this.atkDmgTo, 1);
        this.sklDmgFrom = Math.max(this.sklDmgFrom, 1);
        this.sklDmgTo = Math.max(this.sklDmgTo, 1);
    }
}

export class GameDataRuntime {
    petLenMax: number = 10;
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
    healedFeatures: HealedFeature[] = [];
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

        let getMpUsing = (skillId: string) => {
            let skillModel: SkillModel = skillModelDict[skillId];
            if (skillModel.skillType == SkillType.ultimate) return 0;
            let mpUsing = skillModel.mp;
            if (petModelDict[pet.id].eleType == skillModel.eleType) mpUsing -= Math.ceil(mpUsing * 0.1);
            return mpUsing;
        };

        // 特性
        this.startingBattleFeatures.length = 0;
        this.attackingFeatures.length = 0;
        this.castingFeatures.length = 0;
        this.hurtFeatures.length = 0;
        this.healedFeatures.length = 0;
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
            addFeatureFunc('healedFeatures', 'onHealed', model, datas);
            addFeatureFunc('enemyDeadFeatures', 'onEnemyDead', model, datas);
            addFeatureFunc('deadFeatures', 'onDead', model, datas);
        });

        // 技能

        this.skillDatas.length = 0;
        for (let index = pet.equips.length - 1; index >= 0; index--) {
            // 装备技能
        }

        for (const skillId of PetDataTool.getSelfSkillByCurLv(pet)) {
            // 自带技能
            let skill = new BattleSkill();
            skill.id = skillId;
            skill.mpUsing = getMpUsing(skillId);
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
