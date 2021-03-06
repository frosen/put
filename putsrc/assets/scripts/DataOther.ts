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
    ExplModel,
    ActPosModel,
    AmplAttriType,
    FeatureBtlData
} from './DataModel';
import {
    BioType,
    EleType,
    BtlType,
    Pet,
    ExplMmr,
    EPetMmr,
    Equip,
    GameData,
    Item,
    ItemType,
    SPetMmr,
    PrvtyMax
} from './DataSaved';

import { PetModelDict } from '../configs/PetModelDict';
import { SkillModelDict } from '../configs/SkillModelDict';
import { deepCopy } from './Utils';
import { BtlCtrlr } from './BtlCtrlr';
import { randomRate, getRandomOneInList, normalRandom } from './Random';
import { ActPosModelDict, PAKey } from '../configs/ActPosModelDict';
import { ExpModels } from '../configs/ExpModels';
import { SpcBtlModelDict } from '../configs/EvtModelDict';

// -----------------------------------------------------------------

const DmgRangeByBio = [[], [0.85, 1.15], [0.6, 1.4], [1, 1], [0.85, 1.15], [0.85, 1.15]];

export class Pet2 {
    // 原始值 -----------------------------------------------------------------
    strengthOri!: number;
    concentrationOri!: number;
    durabilityOri!: number;
    agilityOri!: number;
    sensitivityOri!: number;
    elegantOri!: number;

    hpMaxOri!: number;
    mpMaxOri!: number;

    atkDmgFromOri!: number;
    atkDmgToOri!: number;

    sklDmgFromOri!: number;
    sklDmgToOri!: number;

    // 终值 -----------------------------------------------------------------

    strength!: number;
    concentration!: number;
    durability!: number;
    agility!: number;
    sensitivity!: number;
    elegant!: number;

    hpMax!: number;
    mpMax!: number;

    atkDmgFrom!: number;
    atkDmgTo!: number;

    sklDmgFrom!: number;
    sklDmgTo!: number;
    /** 反应速度 */
    speed!: number;

    /** 额外生物类型 */
    exBioTypes!: BioType[];
    /** 额外元素类型 */
    exEleTypes!: EleType[];
    /** 额外战斗类型 */
    exBtlTypes!: BtlType[];

    critRate!: number;
    critDmgRate!: number;
    evdRate!: number;
    hitRate!: number;
    dfsRate!: number;

    armor!: number;

    skillIds!: string[];

    setData(pet: Pet, ampl: number, exPrvty?: number, exDrinkId?: string, exEquips?: (Equip | undefined)[]) {
        const petModel: PetModel = PetModelDict[pet.id];

        const lv = pet.lv;
        const bioType = petModel.bioType;

        const dmgRange = DmgRangeByBio[bioType];

        // 一级原始属性
        this.strengthOri = Math.floor((petModel.baseStrength + petModel.addStrength * lv) * ampl);
        this.concentrationOri = Math.floor((petModel.baseConcentration + petModel.addConcentration * lv) * ampl);
        this.durabilityOri = Math.floor((petModel.baseDurability + petModel.addDurability * lv) * ampl);
        this.agilityOri = Math.floor((petModel.baseAgility + petModel.addAgility * lv) * ampl);
        this.sensitivityOri = Math.floor((petModel.baseSensitivity + petModel.addSensitivity * lv) * ampl);
        this.elegantOri = Math.floor((petModel.baseElegant + petModel.addElegant * lv) * ampl);

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
            if (model.onBaseSetting) model.onBaseSetting(this, datas);
        });

        // 装备加成
        const equips = exEquips || pet.equips;
        for (const equip of equips) {
            if (equip) EquipTool.getFinalAttris(equip, this);
        }

        // 饮品加成
        const drinkId = exDrinkId || pet.drinkId;
        if (drinkId) {
            this.strength *= GameDataTool.getDrinkAmpl(AmplAttriType.strength, undefined, drinkId);
            this.concentration *= GameDataTool.getDrinkAmpl(AmplAttriType.concentration, undefined, drinkId);
            this.durability *= GameDataTool.getDrinkAmpl(AmplAttriType.durability, undefined, drinkId);
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
        this.exBtlTypes = [];

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
            if (model.onSetting) model.onSetting(this, datas);
        });

        // 限制
        this.hpMax = Math.max(this.hpMax, 1);
        this.mpMax = Math.max(this.mpMax, 1);
        this.atkDmgFrom = Math.max(this.atkDmgFrom, 1);
        this.atkDmgTo = Math.max(this.atkDmgTo, 1);
        this.sklDmgFrom = Math.max(this.sklDmgFrom, 1);
        this.sklDmgTo = Math.max(this.sklDmgTo, 1);

        // 招式
        if (!this.skillIds) this.skillIds = [];
        let skillIdx = 0;
        for (let index = equips.length - 1; index >= 0; index--) {
            const equip = equips[index]; // 装备招式
            if (!equip) continue;
            const skillId = equip.skillId;
            if (!skillId) continue;
            this.skillIds[skillIdx] = skillId;
            skillIdx++;
        }
        const selfSkillIds = PetTool.getSelfSkillIdByCurLv(pet); // 自带招式
        for (let index = selfSkillIds.length - 1; index >= 0; index--) {
            const skillId = selfSkillIds[index];
            this.skillIds[skillIdx] = skillId;
            skillIdx++;
        }
        this.skillIds.length = skillIdx;
    }

    // 单独计算属性 -----------------------------------------------------------------

    static pet2ForCalc?: Pet2;

    static getPet2ForCalc(): Pet2 {
        if (this.pet2ForCalc) return this.pet2ForCalc;
        const pet2 = new Pet2();

        pet2.strengthOri = 0;
        pet2.concentrationOri = 0;
        pet2.durabilityOri = 0;
        pet2.agilityOri = 0;
        pet2.sensitivityOri = 0;
        pet2.elegantOri = 0;

        pet2.strength = 0;
        pet2.concentration = 0;
        pet2.durability = 0;
        pet2.agility = 0;
        pet2.sensitivity = 0;
        pet2.elegant = 0;

        this.pet2ForCalc = pet2;
        return this.pet2ForCalc;
    }

    static handlePet2ForCalc(pet2: Pet2, pet: Pet) {
        PetTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            if (model.onBaseSetting) model.onBaseSetting(pet2, datas);
        });

        for (const equip of pet.equips) {
            if (equip) EquipTool.getFinalAttris(equip, pet2);
        }

        PetTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            if (model.onSetting) model.onSetting(pet2, datas);
        });
    }

    static calcSensitivity(pet: Pet): number {
        const petModel: PetModel = PetModelDict[pet.id];
        const pet2 = this.getPet2ForCalc();
        pet2.sensitivityOri = Math.floor(petModel.baseSensitivity + petModel.addSensitivity * pet.lv);
        pet2.sensitivity = pet2.sensitivityOri;
        this.handlePet2ForCalc(pet2, pet);
        return pet2.sensitivity;
    }

    static calcElegant(pet: Pet): number {
        const petModel: PetModel = PetModelDict[pet.id];
        const pet2 = this.getPet2ForCalc();
        pet2.elegantOri = Math.floor(petModel.baseElegant + petModel.addElegant * pet.lv);
        pet2.elegant = pet2.elegantOri;
        this.handlePet2ForCalc(pet2, pet);
        return pet2.elegant;
    }
}

// battle -----------------------------------------------------------------

export class StartFeature {
    func!: (pet: BtlPet, datas: number[], ctrlr: BtlCtrlr) => void;
    datas!: number[];
    id!: string;
}

export class AtkFeature {
    func!: (pet: BtlPet, aim: BtlPet, datas: number[], bData: FeatureBtlData) => void;
    datas!: number[];
    id!: string;
}

export class CastFeature {
    func!: (pet: BtlPet, aim: BtlPet, datas: number[], bData: FeatureBtlData) => void;
    datas!: number[];
    id!: string;
}

export class HurtFeature {
    func!: (pet: BtlPet, caster: BtlPet, datas: number[], bData: FeatureBtlData) => void;
    datas!: number[];
    id!: string;
}

export class HealFeature {
    func!: (pet: BtlPet, caster: BtlPet, datas: number[], bData: FeatureBtlData) => void;
    datas!: number[];
    id!: string;
}

export class EDeadFeature {
    func!: (pet: BtlPet, aim: BtlPet, caster: BtlPet, datas: number[], ctrlr: BtlCtrlr) => void;
    datas!: number[];
    id!: string;
}

export class DeadFeature {
    func!: (pet: BtlPet, caster: BtlPet, datas: number[], ctrlr: BtlCtrlr) => void;
    datas!: number[];
    id!: string;
}

export class TurnFeature {
    func!: (pet: BtlPet, datas: number[], ctrlr: BtlCtrlr) => void;
    datas!: number[];
    id!: string;
}

export class BtlSkill {
    id!: string;
    cd: number = 0;
    mpUsing: number = 0;
}

export class BtlBuff {
    id!: string;
    time!: number;
    caster!: BtlPet;
    data: any;
}

export const RageMax: number = 150;
export const BtlPetLenMax: number = 5;

export class BtlPet {
    idx: number = 0;

    fromationIdx: number = 0;
    beEnemy: boolean = false;

    last?: BtlPet;
    next?: BtlPet;

    pet!: Pet;
    pet2!: Pet2;

    hp: number = 0;
    hpMax: number = 0;

    startFeatures: StartFeature[] = [];
    atkFeatures: AtkFeature[] = [];
    castFeatures: CastFeature[] = [];
    hurtFeatures: HurtFeature[] = [];
    healFeatures: HealFeature[] = [];
    eDeadFeatures: EDeadFeature[] = [];
    deadFeatures: DeadFeature[] = [];
    turnFeatures: TurnFeature[] = [];

    skillDatas: BtlSkill[] = [];

    buffDatas: BtlBuff[] = [];

    ctrlSelfAimIdx: number = -1;
    ctrlEnemyAimIdx: number = -1;

    sklForbidFlag: number = 0; // 二进制flag，位数代表禁用的索引

    static addFeatureFuncToList(
        bPet: BtlPet,
        listName: keyof BtlPet,
        funcName: keyof FeatureModel,
        model: FeatureModel,
        datas: number[]
    ) {
        if (!model.hasOwnProperty(funcName)) return;
        const list: { func: any; datas: number[]; id: string }[] = bPet[listName] as any;
        for (const featureInList of list) {
            if (featureInList.id !== model.id) continue;
            for (let index = 0; index < featureInList.datas.length; index++) {
                featureInList.datas[index] += datas[index];
            }
            return;
        }
        list.push({ func: (model[funcName] as Function).bind(model), datas, id: model.id });
    }

    static getSkillMpUsing(skillId: string, pet: Pet) {
        const skillModel: SkillModel = SkillModelDict[skillId];
        if (skillModel.skillType === SkillType.ultimate) return 0;
        const petModel = PetModelDict[pet.id];

        if (petModel.eleType === skillModel.eleType) return Math.floor(skillModel.mp! * 0.9);
        else return skillModel.mp!;
    }

    initPosition(idx: number, fromationIdx: number, beEnemy: boolean) {
        this.idx = idx;
        this.fromationIdx = fromationIdx;
        this.beEnemy = beEnemy;
    }

    init(pet: Pet, ampl: number, exPrvty: number, exDrinkId?: string, exEquips?: (Equip | undefined)[]) {
        this.pet = pet;
        if (!this.pet2) this.pet2 = new Pet2();
        this.pet2.setData(pet, ampl, exPrvty, exDrinkId, exEquips);

        this.hp = this.pet2.hpMax;
        this.hpMax = this.pet2.hpMax;

        // 特性
        this.startFeatures.length = 0;
        this.atkFeatures.length = 0;
        this.castFeatures.length = 0;
        this.hurtFeatures.length = 0;
        this.healFeatures.length = 0;
        this.eDeadFeatures.length = 0;
        this.deadFeatures.length = 0;
        this.turnFeatures.length = 0;

        PetTool.eachFeatures(pet, (model: FeatureModel, datas: number[]) => {
            BtlPet.addFeatureFuncToList(this, 'startFeatures', 'onBtlStart', model, datas);
            BtlPet.addFeatureFuncToList(this, 'atkFeatures', 'onAtk', model, datas);
            BtlPet.addFeatureFuncToList(this, 'castFeatures', 'onCast', model, datas);
            BtlPet.addFeatureFuncToList(this, 'hurtFeatures', 'onHurt', model, datas);
            BtlPet.addFeatureFuncToList(this, 'healFeatures', 'onHeal', model, datas);
            BtlPet.addFeatureFuncToList(this, 'eDeadFeatures', 'onEDead', model, datas);
            BtlPet.addFeatureFuncToList(this, 'deadFeatures', 'onDead', model, datas);
            BtlPet.addFeatureFuncToList(this, 'turnFeatures', 'onTurn', model, datas);
        });

        // 招式
        this.skillDatas.length = this.pet2.skillIds.length;
        for (let index = 0; index < this.pet2.skillIds.length; index++) {
            const skillId = this.pet2.skillIds[index];
            const skill = this.skillDatas[index] || new BtlSkill();
            skill.id = skillId;
            skill.mpUsing = BtlPet.getSkillMpUsing(skillId, pet);
            this.skillDatas[index] = skill;
        }
    }

    clone() {
        const newBPet = new BtlPet();
        newBPet.idx = this.idx;
        newBPet.fromationIdx = this.fromationIdx;
        newBPet.beEnemy = this.beEnemy;

        newBPet.last = this.last; // 暂时指向旧数据，在RealBtl的clone中更新
        newBPet.next = this.next; // 暂时指向旧数据，在RealBtl的clone中更新

        newBPet.pet = this.pet;
        newBPet.pet2 = deepCopy(this.pet2);

        newBPet.hp = this.hp;
        newBPet.hpMax = this.hpMax;

        newBPet.startFeatures = this.startFeatures;
        newBPet.atkFeatures = this.atkFeatures;
        newBPet.castFeatures = this.castFeatures;
        newBPet.hurtFeatures = this.hurtFeatures;
        newBPet.healFeatures = this.healFeatures;
        newBPet.eDeadFeatures = this.eDeadFeatures;
        newBPet.deadFeatures = this.deadFeatures;
        newBPet.turnFeatures = this.turnFeatures;

        for (const skill of this.skillDatas) {
            const newSkill = new BtlSkill();
            newSkill.cd = skill.cd;
            newSkill.id = skill.id;
            newBPet.skillDatas.push(newSkill);
        }

        for (const buff of this.buffDatas) {
            const newBuff = new BtlBuff();
            newBuff.id = buff.id;
            newBuff.caster = buff.caster;
            newBuff.time = buff.time;
            newBuff.data = buff.data;
            newBPet.buffDatas.push(newBuff);
        }

        return newBPet;
    }
}

export class BtlTeam {
    pets: BtlPet[] = [];

    mpMax: number = 0;
    mp: number = 0;
    rage: number = 0;

    reset(len: number, beEnemy: boolean, call: (bPet: BtlPet, petIdx: number) => void) {
        this.pets.length = len;
        let mpMax = 0;
        let last: BtlPet | undefined;
        for (let petIdx = 0; petIdx < len; petIdx++) {
            const btlPet = this.pets[petIdx] || new BtlPet();
            const fIdx = BtlPetLenMax - len + petIdx;
            btlPet.initPosition(petIdx, fIdx, beEnemy);
            call(btlPet, petIdx);
            if (last) {
                btlPet.last = last;
                btlPet.next = undefined;
                last.next = btlPet;
            } else btlPet.last = undefined;
            last = btlPet;

            this.pets[petIdx] = btlPet;

            mpMax += btlPet.pet2.mpMax;
        }

        this.mpMax = mpMax;
        this.mp = mpMax;
        this.rage = 0;
    }
}

export class BossMaster {
    static main: string = 'main';
    static sub: string = 'sub';
}

export class RealBtl {
    start: boolean = false;

    selfTeam!: BtlTeam;
    enemyTeam!: BtlTeam;

    btlRound: number = 0;
    atkRound: number = 0;

    order: BtlPet[] = [];
    curOrderIdx: number = 0;
    sequnence!: number[];
    curSequenceIdx!: number;

    lastAim?: BtlPet;
    combo: number = 1;

    resetSelf(gameData: GameData, sPetMmrs?: SPetMmr[]) {
        if (!this.selfTeam) this.selfTeam = new BtlTeam();

        let sPets: Pet[];
        const exPrvtys: number[] = [];
        const exDrinkIds: string[] = [];
        const exEquipss: (Equip | undefined)[][] = [];
        if (sPetMmrs) {
            sPets = [];

            const checkEquipToken = (
                token: string,
                items: (Item | undefined)[],
                equipsOutput: (Equip | undefined)[]
            ): boolean => {
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
                sPets.push(curPet!);

                exPrvtys.push(selfPetMmr.prvty);
                exDrinkIds.push(selfPetMmr.drinkId);

                const equips: (Equip | undefined)[] = [];
                for (const token of selfPetMmr.eqpTokens) {
                    if (checkEquipToken(token, curPet!.equips, equips)) continue;
                    if (checkEquipToken(token, gameData.items, equips)) continue;
                    for (const petInAll of gameData.pets) {
                        if (checkEquipToken(token, petInAll.equips, equips)) {
                            break;
                        }
                    }
                }
                exEquipss.push(equips);
            }
        } else sPets = GameDataTool.getReadyPets(gameData);

        this.selfTeam.reset(sPets.length, false, (bPet: BtlPet, petIdx: number) => {
            bPet.init(sPets[petIdx], 1, exPrvtys[petIdx], exDrinkIds[petIdx], exEquipss[petIdx]);
        });
    }

    resetEnemy(expl: ExplMmr, spcBtlId?: string, ePetMmrs?: EPetMmr[]) {
        if (!this.enemyTeam) this.enemyTeam = new BtlTeam();

        if (spcBtlId) {
            const spcBtlModel = SpcBtlModelDict[spcBtlId];
            this.enemyTeam.reset(spcBtlModel.pets.length, true, (bPet: BtlPet, petIdx: number) => {
                const spcBtlPet = spcBtlModel.pets[petIdx];
                const ePet = PetTool.create(spcBtlPet.id, spcBtlPet.lv, [], spcBtlPet.features || []);
                ePet.nickname = spcBtlPet.name || '';
                ePet.master = spcBtlPet.main ? BossMaster.main : BossMaster.sub;
                bPet.init(ePet, spcBtlPet.ampl, PrvtyMax);
            });
        } else if (ePetMmrs) {
            const { ampl, prvty } = RealBtl.getEnemyAmplAndPrvtyByStep(expl.curStep);
            this.enemyTeam.reset(ePetMmrs.length, true, (bPet: BtlPet, petIdx: number) => {
                const ePetMmr = ePetMmrs[petIdx];
                const ePet = PetTool.create(ePetMmr.id, ePetMmr.lv, ePetMmr.exFeatureIds, ePetMmr.features);
                bPet.init(ePet, ampl, prvty);
            });
        } else {
            const { ampl, prvty } = RealBtl.getEnemyAmplAndPrvtyByStep(expl.curStep);
            const ePetsDatas = RealBtl.createRandomEnemyPetData(expl);
            this.enemyTeam.reset(ePetsDatas.length, true, (bPet: BtlPet, petIdx: number) => {
                const ePetData = ePetsDatas[petIdx];
                const ePet = PetTool.createByRandomFeature(ePetData.id, ePetData.lv);
                bPet.init(ePet, ampl, prvty);
            });

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
        }

        this.btlRound = 0;
        this.atkRound = 0;

        this.order.length = 0;
        for (const pet of this.selfTeam.pets) this.order.push(pet);
        for (const pet of this.enemyTeam.pets) this.order.push(pet);

        this.start = true;
    }

    static getEnemyAmplAndPrvtyByStep(step: number): { ampl: number; prvty: number } {
        if (step === 0) return { ampl: 1, prvty: 0 };
        else if (step === 1) return { ampl: 1, prvty: 30 };
        else if (step === 1) return { ampl: 1.1, prvty: 60 };
        else return { ampl: 1.3, prvty: 90 };
    }

    static createRandomEnemyPetData(expl: ExplMmr): { id: string; lv: number }[] {
        const posId = expl.curPosId;
        const curPosModel = ActPosModelDict[posId];
        const explModel: ExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;

        const curStep = expl.curStep;
        const petIdLists = explModel.petIdLists;
        if (!petIdLists || petIdLists.length === 0) cc.error(`${curPosModel.cnName}没有精灵列表petIdLists，无法战斗`);
        const petIds = petIdLists[curStep];

        const enmeyPetType1 = getRandomOneInList(petIds);
        const enmeyPetType2 = getRandomOneInList(petIds);

        const { base: lvBase, range: lvRange } = RealBtl.calcLvArea(curPosModel, curStep);

        let petCount = RealBtl.getEnemyPetCountByLv(lvBase);
        if (randomRate(0.5)) petCount -= 1; // 增加一些随机感

        const petDatas: { id: string; lv: number }[] = [];
        for (let index = 0; index < petCount; index++) {
            const id = randomRate(0.5) ? enmeyPetType1 : enmeyPetType2;
            let lv = lvBase - lvRange + normalRandom(lvRange * 2);
            lv = Math.min(Math.max(1, lv), ExpModels.length);
            petDatas.push({ id, lv });
        }
        return petDatas;
    }

    static calcLvArea(posModel: ActPosModel, step: number): { base: number; range: number } {
        return { base: posModel.lv + step * 2, range: 2 };
    }

    static getEnemyPetCountByLv(lv: number): number {
        if (lv < 10) return 3;
        else if (lv < 20) return 4;
        else return 5;
    }

    clone() {
        const newRB = new RealBtl();
        newRB.start = this.start;
        newRB.selfTeam = deepCopy(this.selfTeam) as BtlTeam;
        newRB.enemyTeam = deepCopy(this.enemyTeam) as BtlTeam;
        newRB.btlRound = this.btlRound;
        newRB.atkRound = this.atkRound;
        for (const bPet of this.order) {
            newRB.order.push(this.copyAim(newRB, bPet)!);
        }
        newRB.curOrderIdx = this.curOrderIdx;
        newRB.sequnence = deepCopy(this.sequnence) as number[];
        newRB.curSequenceIdx = this.curSequenceIdx;

        newRB.lastAim = this.copyAim(newRB, this.lastAim);
        newRB.combo = this.combo;

        for (const pet of newRB.selfTeam.pets) {
            pet.last = this.copyAim(newRB, pet.last);
            pet.next = this.copyAim(newRB, pet.next);
        }

        for (const pet of newRB.enemyTeam.pets) {
            pet.last = this.copyAim(newRB, pet.last);
            pet.next = this.copyAim(newRB, pet.next);
        }

        return newRB;
    }

    copyAim(to: RealBtl, aim?: BtlPet): BtlPet | undefined {
        if (!aim) return undefined;
        const team = aim.beEnemy ? to.enemyTeam : to.selfTeam;
        return team.pets[aim.idx];
    }
}
