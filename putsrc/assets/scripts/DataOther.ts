/*
 * DataOther.ts
 * 除了模型数据和需保存的数据以外的其他数据结构
 * luleyan
 */

import { PetTool, EquipTool, GameDataTool } from './Memory';
import {
    FeatureModel,
    PetModel,
    SkillModel,
    SkillType,
    SkillDirType,
    SkillAimtype,
    DrinkModel,
    ExplModel,
    ActPosModel,
    PAKey
} from './DataModel';
import { BioType, EleType, BattleType, Pet, EleTypeNames, ExplMmr, EPetMmr, Equip, GameData, Item, ItemType } from './DataSaved';

import { petModelDict } from 'configs/PetModelDict';
import { skillModelDict } from 'configs/SkillModelDict';
import { deepCopy } from './Utils';
import { buffModelDict } from 'configs/BuffModelDict';
import { BtlCtrlr } from './BtlCtrlr';
import { randomRate, getRandomOneInList, normalRandom } from './Random';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { expModels } from 'configs/ExpModels';

export enum AmplAttriType {
    none,
    exp,
    expl,
    work,
    prvty,
    reput,

    strength,
    concentration,
    durability
}

export const AmplAttriNames = ['', '经验', '探索受益', '工作受益', '默契', '声望', '力量', '专注', '耐久'];

const NotNeedPetType = [AmplAttriType.expl, AmplAttriType.reput];

/** 运行时游戏数据 */
export class GameJITDataTool {
    /** petid:key:attri:data */
    static attriGainAmplDict: { [key: string]: { [key: string]: { [key: number]: number } } };

    static init() {
        this.attriGainAmplDict = {};
    }

    static addAmplByDrink(pet: Pet, drinkModel: DrinkModel) {
        const data = {};
        data[drinkModel.mainAttri] = drinkModel.mainPercent;
        if (drinkModel.subAttri) data[drinkModel.subAttri] = drinkModel.subPercent;

        this.addAmpl(pet, drinkModel.id, data);
    }

    static addAmpl(pet: Pet, drinkId: string, data: { [key: number]: number }) {
        const petId = String(pet.catchIdx);
        if (!this.attriGainAmplDict[petId]) this.attriGainAmplDict[petId] = {};
        this.attriGainAmplDict[petId][drinkId] = data;
    }

    static removeAmpl(pet: Pet, drinkId: string) {
        const petId = String(pet.catchIdx);
        if (this.attriGainAmplDict[petId]) {
            delete this.attriGainAmplDict[petId][drinkId];
        }
    }

    static getAmplRate(pet: Pet, attri: AmplAttriType) {
        if (NotNeedPetType.includes(attri)) cc.assert(!pet, 'PUT need no pet');
        else cc.assert(pet, 'PUT need pet');

        let ampl = 1;
        let cnt = 0;
        if (pet) {
            const petDataDict = this.attriGainAmplDict[String(pet.catchIdx)];
            if (petDataDict) {
                for (const drinkId in petDataDict) {
                    if (!petDataDict.hasOwnProperty(drinkId)) continue;
                    const petData = petDataDict[drinkId];
                    if (petData.hasOwnProperty(attri)) {
                        ampl += petData[attri] * 0.01 * Math.pow(0.5, cnt);
                        cnt++;
                    }
                }
            }
        } else {
            for (const petId in this.attriGainAmplDict) {
                if (!this.attriGainAmplDict.hasOwnProperty(petId)) continue;
                const petDataDict = this.attriGainAmplDict[petId];
                for (const drinkId in petDataDict) {
                    const petData = petDataDict[drinkId];
                    if (petData.hasOwnProperty(attri)) {
                        ampl += petData[attri] * 0.01 * Math.pow(0.5, cnt);
                        cnt++;
                    }
                }
            }
        }

        return ampl;
    }
}

// -----------------------------------------------------------------

const DmgRangeByBio = [[], [0.85, 1.15], [0.6, 1.4], [1, 1], [0.85, 1.15], [0.85, 1.15]];

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

    setData(pet: Pet, exPrvty: number = null, exEquips: Equip[] = null) {
        const petModel: PetModel = petModelDict[pet.id];

        const lv = pet.lv;
        const bioType = petModel.bioType;

        const dmgRange = DmgRangeByBio[bioType];

        // 一级原始属性
        this.strengthOri = petModel.baseStrength + petModel.addStrength * lv;
        this.concentrationOri = petModel.baseConcentration + petModel.addConcentration * lv;
        this.durabilityOri = petModel.baseDurability + petModel.addDurability * lv;
        this.agilityOri = petModel.baseAgility + petModel.addAgility * lv;
        this.sensitivityOri = petModel.baseSensitivity + petModel.addSensitivity * lv;
        this.elegantOri = petModel.baseElegant + petModel.addElegant * lv;

        // 一级属性
        this.strength = this.strengthOri;
        this.concentration = this.concentrationOri;
        this.durability = this.durabilityOri;
        this.agility = this.agilityOri;
        this.sensitivity = this.sensitivityOri;
        this.elegant = this.elegantOri;

        this.armor = 0;

        // 特性加成
        PetTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onBaseSetting')) model.onBaseSetting(this, datas);
        });

        // 装备加成
        const equips = exEquips || pet.equips;
        for (const equip of equips) {
            if (!equip) continue;
            EquipTool.getFinalAttris(equip, this);
        }

        // 饮品加成
        if (pet.drink) {
            this.strength *= GameJITDataTool.getAmplRate(pet, AmplAttriType.strength);
            this.concentration *= GameJITDataTool.getAmplRate(pet, AmplAttriType.concentration);
            this.durability *= GameJITDataTool.getAmplRate(pet, AmplAttriType.durability);
        }

        // 二级原始属性
        this.hpMaxOri = this.durability * 25;
        this.mpMaxOri = 100 + Math.floor(this.concentration / 30);
        this.atkDmgFromOri = this.strength * dmgRange[0] + 10;
        this.atkDmgToOri = this.strength * dmgRange[1] + 150;
        this.sklDmgFromOri = this.concentration * dmgRange[0] + 10;
        this.sklDmgToOri = this.concentration * dmgRange[1] + 50;

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
        const realPrvty = PetTool.getRealPrvty(pet, exPrvty);
        const prvtyPercent = realPrvty * 0.01;
        this.critRate = prvtyPercent * 0.1;
        this.critDmgRate = 0.5 + prvtyPercent * 0.5;
        this.evdRate = 0.05 + prvtyPercent * 0.05;
        this.hitRate = 0.8 + prvtyPercent * 0.2;
        this.dfsRate = 0;

        // 特性加成
        PetTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
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
        if (!this.skillIds) this.skillIds = [];
        let skillIdx = 0;
        for (let index = equips.length - 1; index >= 0; index--) {
            const equip = equips[index]; // 装备技能
            if (!equip) continue;
            const skillId = equip.skillId;
            if (!skillId) continue;
            this.skillIds[skillIdx] = skillId;
            skillIdx++;
        }
        const selfSkillIds = PetTool.getSelfSkillIdByCurLv(pet); // 自带技能
        for (let index = selfSkillIds.length - 1; index >= 0; index--) {
            const skillId = selfSkillIds[index];
            this.skillIds[skillIdx] = skillId;
            skillIdx++;
        }
        this.skillIds.length = skillIdx;
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

export const RageMax: number = 150;
export const BattlePetLenMax: number = 5;

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

    static addFeatureFunc(bPet: BattlePet, attri: string, funcName: string, model: FeatureModel, datas: number[]) {
        if (!model.hasOwnProperty(funcName)) return;
        const list: { func: any; datas: number[]; id: string }[] = bPet[attri];
        for (const featureInList of list) {
            if (featureInList.id !== model.id) continue;
            for (let index = 0; index < featureInList.datas.length; index++) {
                featureInList.datas[index] += datas[index];
            }
            return;
        }
        list.push({ func: model[funcName], datas, id: model.id });
    }

    static getSkillMpUsing(skillId: string, pet: Pet) {
        const skillModel: SkillModel = skillModelDict[skillId];
        if (skillModel.skillType === SkillType.ultimate) return 0;
        let mpUsing = skillModel.mp;
        if (petModelDict[pet.id].eleType === skillModel.eleType) mpUsing -= Math.ceil(mpUsing * 0.1);
        return mpUsing;
    }

    initPosition(idx: number, fromationIdx: number, beEnemy: boolean) {
        this.idx = idx;
        this.fromationIdx = fromationIdx;
        this.beEnemy = beEnemy;
    }

    init(pet: Pet, exPrvty: number, exEquips: Equip[]) {
        this.pet = pet;
        if (!this.pet2) this.pet2 = new Pet2();
        this.pet2.setData(pet, exPrvty, exEquips);

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

        PetTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            BattlePet.addFeatureFunc(this, 'startingBattleFeatures', 'onStartingBattle', model, datas);
            BattlePet.addFeatureFunc(this, 'attackingFeatures', 'onAttacking', model, datas);
            BattlePet.addFeatureFunc(this, 'castingFeatures', 'onCasting', model, datas);
            BattlePet.addFeatureFunc(this, 'hurtFeatures', 'onHurt', model, datas);
            BattlePet.addFeatureFunc(this, 'healingFeatures', 'onHealing', model, datas);
            BattlePet.addFeatureFunc(this, 'enemyDeadFeatures', 'onEnemyDead', model, datas);
            BattlePet.addFeatureFunc(this, 'deadFeatures', 'onDead', model, datas);
        });

        // 技能
        this.skillDatas.length = this.pet2.skillIds.length;
        for (let index = 0; index < this.pet2.skillIds.length; index++) {
            const skillId = this.pet2.skillIds[index];
            const skill = this.skillDatas[index] || new BattleSkill();
            skill.id = skillId;
            skill.mpUsing = BattlePet.getSkillMpUsing(skillId, pet);
            this.skillDatas[index] = skill;
        }
    }

    clone() {
        const newBPet = new BattlePet();
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
            const newSkill = new BattleSkill();
            newSkill.cd = skill.cd;
            newSkill.id = skill.id;
            newBPet.skillDatas.push(newSkill);
        }

        for (const buff of this.buffDatas) {
            const newBuff = new BattleBuff();
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

    reset(len: number, beEnemy: boolean, call: (bPet: BattlePet, petIdx: number) => void) {
        this.pets.length = len;
        let mpMax = 0;
        let last = null;
        for (let petIdx = 0; petIdx < len; petIdx++) {
            const battlePet = this.pets[petIdx] || new BattlePet();
            const fIdx = BattlePetLenMax - len + petIdx;
            battlePet.initPosition(petIdx, fIdx, beEnemy);
            call(battlePet, petIdx);
            if (last) {
                battlePet.last = last;
                battlePet.next = null;
                last.next = battlePet;
            } else battlePet.last = null;
            last = battlePet;

            this.pets[petIdx] = battlePet;

            mpMax += battlePet.pet2.mpMax;
        }

        this.mpMax = mpMax;
        this.mp = mpMax;
        this.rage = 0;
    }
}

export class RealBattle {
    start: boolean = false;

    selfTeam: BattleTeam = null;
    enemyTeam: BattleTeam = null;

    battleRound: number = 0;
    atkRound: number = 0;

    order: BattlePet[] = [];
    curOrderIdx: number = 0;
    sequnence: number[] = null;
    curSequenceIdx: number = 0;

    lastAim: BattlePet = null;
    combo: number = 1;

    resetSelf(gameData: GameData, byMmr: boolean) {
        if (!this.selfTeam) this.selfTeam = new BattleTeam();

        let sPets: Pet[];
        const exPrvtys: number[] = [];
        const exEquips: Equip[][] = [];
        if (byMmr) {
            sPets = [];
            const sPetMmrs = gameData.curExpl.curBattle.selfs;

            const checkEquipToken = (token: string, items: Item[], equipsOutput: Equip[]): boolean => {
                for (const item of items) {
                    if (!item) continue;
                    if (item.itemType !== ItemType.equip) continue;
                    const equip = item as Equip;
                    if (EquipTool.getToken(equip) === token) {
                        equipsOutput.push(equip);
                        return true;
                    }
                }
                return false;
            };

            for (let petIdx = 0; petIdx < sPetMmrs.length; petIdx++) {
                const selfPetMmr = sPetMmrs[petIdx];
                let curPet: Pet;
                for (const petInAll of gameData.pets) {
                    if (petInAll.catchIdx === selfPetMmr.catchIdx) {
                        curPet = petInAll;
                        break;
                    }
                }
                sPets.push(curPet);

                exPrvtys.push(selfPetMmr.prvty);

                const equips = [];
                for (const token of selfPetMmr.eqpTokens) {
                    if (checkEquipToken(token, curPet.equips, equips)) continue;
                    if (checkEquipToken(token, gameData.items, equips)) continue;
                    for (const petInAll of gameData.pets) {
                        if (checkEquipToken(token, petInAll.equips, equips)) {
                            break;
                        }
                    }
                }
                exEquips.push(equips);
            }
        } else sPets = GameDataTool.getReadyPets(gameData);

        this.selfTeam.reset(sPets.length, false, (bPet: BattlePet, petIdx: number) => {
            bPet.init(sPets[petIdx], exPrvtys[petIdx], exEquips[petIdx]);
        });
    }

    resetBattle(ePetMmrs: EPetMmr[], spcBtlId: number, createData: { curExpl: ExplMmr; petCount: number }) {
        if (!this.enemyTeam) this.enemyTeam = new BattleTeam();

        if (ePetMmrs) {
            this.enemyTeam.reset(ePetMmrs.length, true, (bPet: BattlePet, petIdx: number) => {
                const ePetMmr = ePetMmrs[petIdx];
                const petData = PetTool.create(ePetMmr.id, ePetMmr.lv, ePetMmr.exFeatureIds, ePetMmr.features);
                if (spcBtlId > 0) petData.master = 'spcBtl'; // llytodo master不配拥有名称吗
                bPet.init(petData, null, null);
            });
        } else if (spcBtlId > 0) {
            // llytodo
        } else {
            const ePetsData = RealBattle.createRandomPetData(createData.curExpl, createData.petCount);
            this.enemyTeam.reset(ePetsData.length, true, (bPet: BattlePet, petIdx: number) => {
                const ePetData = ePetsData[petIdx];
                const ePet = PetTool.createWithRandomFeature(ePetData.id, ePetData.lv);
                if (spcBtlId > 0) ePet.master = 'spcBtl';
                bPet.init(ePet, null, null);
            });
        }

        // 按照HP排序
        if (randomRate(0.5)) {
            const ePets = this.enemyTeam.pets;
            ePets.sort((a, b) => b.hpMax - a.hpMax);
            // 重置索引
            for (let index = 0; index < ePets.length; index++) {
                const pet = ePets[index];
                pet.idx = index;
                pet.fromationIdx = 5 - ePets.length + index;
            }
        }

        this.battleRound = 0;
        this.atkRound = 0;

        this.order.length = 0;
        for (const pet of this.selfTeam.pets) this.order.push(pet);
        for (const pet of this.enemyTeam.pets) this.order.push(pet);

        this.start = true;
    }

    static createRandomPetData(curExpl: ExplMmr, count: number): { id: string; lv: number }[] {
        const posId = curExpl.curPosId;
        const curPosModel = actPosModelDict[posId];
        const explModel: ExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;

        const petCount = randomRate(0.5) ? count : count - 1;
        const curStep = curExpl.curStep;
        const petIdLists = explModel.petIdLists;
        if (!petIdLists || petIdLists.length === 0) cc.error(`${curPosModel.cnName}没有精灵列表petIdLists，无法战斗`);
        const petIds = petIdLists[curStep];

        const enmeyPetType1 = getRandomOneInList(petIds);
        const enmeyPetType2 = getRandomOneInList(petIds);

        const { base: lvBase, range: lvRange } = this.calcLvArea(curPosModel, curStep);

        const petDatas: { id: string; lv: number }[] = [];
        for (let index = 0; index < petCount; index++) {
            const id = randomRate(0.5) ? enmeyPetType1 : enmeyPetType2;
            let lv = lvBase - lvRange + normalRandom(lvRange * 2);
            lv = Math.min(Math.max(1, lv), expModels.length);
            petDatas.push({ id, lv });
        }
        return petDatas;
    }

    static calcLvArea(posModel: ActPosModel, step: number): { base: number; range: number } {
        return { base: posModel.lv + step * 2, range: 2 };
    }

    clone() {
        const newRB = new RealBattle();
        newRB.start = this.start;
        newRB.selfTeam = deepCopy(this.selfTeam) as BattleTeam;
        newRB.enemyTeam = deepCopy(this.enemyTeam) as BattleTeam;
        newRB.battleRound = this.battleRound;
        newRB.atkRound = this.atkRound;
        for (const bPet of this.order) {
            newRB.order.push(this.copyAim(bPet, newRB));
        }
        newRB.curOrderIdx = this.curOrderIdx;
        newRB.sequnence = deepCopy(this.sequnence) as number[];
        newRB.curSequenceIdx = this.curSequenceIdx;

        newRB.lastAim = this.copyAim(this.lastAim, newRB);
        newRB.combo = this.combo;

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
        const team = aim.beEnemy ? to.enemyTeam : to.selfTeam;
        return team.pets[aim.idx];
    }
}

// -----------------------------------------------------------------

export class SkillInfo {
    static infoDict: { [key: string]: string } = {};
    static get(id: string): string {
        if (this.infoDict[id]) return this.infoDict[id];

        const skl: SkillModel = skillModelDict[id];
        let info = '';
        let aim: string;
        if (skl.dirType === SkillDirType.enemy) {
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
            }
        }

        info += '使' + aim;
        info += this.getDmg(skl.mainDmg, skl.eleType);
        info += this.getBuff(skl.mainDmg, skl.mainBuffId, skl.mainBuffTime);

        if (skl.hpLimit) {
            info += `(目标血量须低于${skl.hpLimit}%才可发动)`;
        }

        if (skl.aimType !== SkillAimtype.one) {
            let subAim: string;
            switch (skl.aimType) {
                case SkillAimtype.oneAndNext:
                    subAim = '下方相邻目标';
                    break;
                case SkillAimtype.oneAndOthers:
                    subAim = (skl.dirType === SkillDirType.enemy ? '敌方' : '己方') + '其他目标';
                    break;
                case SkillAimtype.oneAndSelf:
                    subAim = '自己';
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
        const from = BtlCtrlr.getCastRealDmg(pet2.sklDmgFrom, rate, pet2.atkDmgFrom) * 0.1;
        const to = BtlCtrlr.getCastRealDmg(pet2.sklDmgTo, rate, pet2.atkDmgTo) * 0.1;
        return `${from.toFixed(1)}到${to.toFixed(1)}`;
    }

    static getRealSklStr(skillId: string, pet2: Pet2): string {
        const info = this.get(skillId);
        const skl: SkillModel = skillModelDict[skillId];
        const mainDmgStr = this.getSklDmgStr(pet2, skl.mainDmg * 0.01);
        const subDmgStr = this.getSklDmgStr(pet2, skl.subDmg * 0.01);
        return info.replace('##', mainDmgStr).replace('^^', subDmgStr);
    }
}
