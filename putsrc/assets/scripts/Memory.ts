/*
 * Memory.ts
 * 储存
 * luleyan
 */

import { petModelDict } from 'configs/PetModelDict';
import { featureModelDict } from 'configs/FeatureModelDict';
import { featureLvsByPetLv } from 'configs/FeatureLvsByPetLv';
import {
    Feature,
    Pet,
    ActPos,
    ExplMmr,
    PetState,
    SelfPetMmr,
    BattleMmr,
    PetMmr,
    GameData,
    Equip,
    ItemType,
    Money
} from './DataSaved';
import { FeatureModel, PetModel, EquipPosType, EquipModel } from './DataModel';
import { equipModelDict } from 'configs/EquipModelDict';
import { random, randomRate, getRandomOneInListWithRate, getRandomOneInList } from './Random';
import { equipIdsByLvRank } from 'configs/EquipIdsByLvRank';
import { skillIdsByEleType } from 'configs/SkillIdsByEleType';

let memoryDirtyToken: number = -1;

const MagicNum = 1654435769 + Math.floor(Math.random() * 1000000000);
function getCheckedNumber(s: number): number {
    return (s * MagicNum) >> 19;
}

function newInsWithChecker<T extends Object>(cls: { new (): T }): T {
    let ins = new cls();
    let checkIns = new cls();
    for (const key in checkIns) {
        if (!checkIns.hasOwnProperty(key)) continue;
        let cNum = checkIns[key];
        if (typeof cNum == 'number') checkIns[key] = getCheckedNumber(cNum) as any;
    }
    return new Proxy(ins, {
        set: function (target, key, value, receiver) {
            if (typeof value == 'number') {
                checkIns[key] = getCheckedNumber(value);
            }
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
            return Reflect.set(target, key, value, receiver);
        },
        get: function (target, key) {
            let v = target[key];
            if (typeof v == 'number') {
                if (getCheckedNumber(v) != checkIns[key]) {
                    throw new Error('number check wrong!');
                }
            }
            return v;
        }
    });
}

function newList(list = null) {
    return new Proxy(list || [], {
        set: function (target, key, value, receiver) {
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
            return Reflect.set(target, key, value, receiver);
        }
    });
}

function newDict(dict = null) {
    return new Proxy(dict || {}, {
        set: function (target, key, value, receiver) {
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
            return Reflect.set(target, key, value, receiver);
        }
    });
}

// -----------------------------------------------------------------

export class Memory {
    gameData: GameData = newInsWithChecker(GameData);

    saveToken: boolean = false;
    saveInterval: number = 0;

    set dirtyToken(t: number) {
        memoryDirtyToken = t;
    }
    get dirtyToken() {
        return memoryDirtyToken;
    }

    init() {
        GameDataTool.init(this.gameData);
        this.test();
    }

    update(dt: number) {
        if (memoryDirtyToken < 0) {
            memoryDirtyToken = memoryDirtyToken * -1 + 1;
            for (const listener of this.dataListeners) {
                listener.onMemoryDataChanged();
            }

            this.saveToken = true;
        }

        if (this.saveInterval > 0) {
            this.saveInterval -= dt;
        } else if (this.saveToken) {
            this.saveToken = false;
            this.saveInterval = 2.5;
            this.saveMemory();
        }
    }

    dataListeners: any[] = [];

    addDataListener(listener: any) {
        cc.assert('onMemoryDataChanged' in listener, 'Memory的观察者必须有onMemoryDataChanged这个函数');
        this.dataListeners.push(listener);
    }

    removeDataListener(listener: any) {
        this.dataListeners.length;
        for (let index = 0; index < this.dataListeners.length; index++) {
            const element = this.dataListeners[index];
            if (element == listener) {
                this.dataListeners.splice(index, 1);
            }
        }
    }

    saveMemory() {
        cc.log('STORM cc ^_^ 保存 ');
    }

    // -----------------------------------------------------------------

    test() {
        this.gameData.curPosId = 'YiZhuang';

        GameDataTool.addPet(this.gameData, 'FaTiaoWa', 1, 4, [], (pet: Pet) => {
            pet.state = PetState.ready;
            pet.privity = 100;
        });

        GameDataTool.addPet(this.gameData, 'YaHuHanJuRen', 1, 2, [], (pet: Pet) => {
            pet.state = PetState.ready;
        });

        GameDataTool.addPet(this.gameData, 'BaiLanYuYan', 1, 2, [], (pet: Pet) => {
            pet.state = PetState.ready;
        });

        GameDataTool.handleMoney(this.gameData, money => (money.count += 15643351790));

        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(21, 25));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(21, 25));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(21, 25));

        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(11, 15));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(11, 15));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(11, 15));

        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(30, 33));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(30, 33));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandom(30, 33));
    }
}

export class FeatureDataTool {
    static getDatas(featureId: string, lv: number) {
        let featureModel = featureModelDict[featureId];
        let datas = [];
        for (const dataArea of featureModel.dataAreas) {
            let data = dataArea[0] + (lv - 1) * dataArea[1];
            datas.push(data);
        }
        return datas;
    }

    static clone(feature: Feature): Feature {
        let newFeature = newInsWithChecker(Feature);
        newFeature.id = feature.id;
        newFeature.lv = feature.lv;
        return newFeature;
    }
}

export class PetDataTool {
    static create(id: string, lv: number, rank: number, features: Feature[], gameData: GameData): Pet {
        let pet = newInsWithChecker(Pet);

        pet.inbornFeatures = newList();
        pet.learnedFeatures = newList();
        pet.equips = newList();

        pet.id = id;
        pet.master = '';

        pet.catchTime = new Date().getTime();
        pet.catchIdx = gameData ? gameData.totalPetCount : -99;
        pet.catchLv = lv;
        pet.catchRank = rank;

        pet.state = PetState.rest;

        pet.lv = lv;
        pet.rank = rank;

        pet.privity = 0;
        pet.privityChangedTime = pet.catchTime;

        pet.learningType = '';
        pet.learingValue = 0;

        pet.exp = 0;

        for (const feature of features) pet.inbornFeatures.push(FeatureDataTool.clone(feature));

        return pet;
    }

    static eachFeatures(pet: Pet, callback: (featureModel: FeatureModel, datas: number[]) => void) {
        for (const equip of pet.equips) {
            let equipModel = equipModelDict[equip.id];
            for (let index = 0; index < equipModel.featureIds.length; index++) {
                const featureId = equipModel.featureIds[index];
                const lv = equip.selfFeatureLvs[index];
                callback(featureModelDict[featureId], FeatureDataTool.getDatas(featureId, lv));
            }
            for (const feature of equip.affixes) {
                callback(featureModelDict[feature.id], FeatureDataTool.getDatas(feature.id, feature.lv));
            }
        }

        for (const feature of pet.learnedFeatures) {
            callback(featureModelDict[feature.id], FeatureDataTool.getDatas(feature.id, feature.lv));
        }

        for (const feature of pet.inbornFeatures) {
            callback(featureModelDict[feature.id], FeatureDataTool.getDatas(feature.id, feature.lv));
        }

        let selfFeatures = PetDataTool.getSelfFeaturesByCurLv(pet);
        for (const feature of selfFeatures) {
            callback(featureModelDict[feature.id], FeatureDataTool.getDatas(feature.id, feature.lv));
        }
    }

    static getSelfFeaturesByCurLv(pet: Pet) {
        let selfFeatureIds = (petModelDict[pet.id] as PetModel).selfFeatureIds;
        let featureLvs = featureLvsByPetLv[pet.lv];
        let features: Feature[] = [];

        for (let index = 0; index < selfFeatureIds.length; index++) {
            let featureLv = featureLvs[index];
            if (featureLv == 0) continue;

            let newFeature = new Feature();
            newFeature.id = selfFeatureIds[index];
            newFeature.lv = featureLv;
            features.push(newFeature);
        }
        return features;
    }

    static getSelfSkillIdByCurLv(pet: Pet): string[] {
        let skillIds = petModelDict[pet.id].selfSkillIds;
        if (pet.lv >= 30) {
            return [skillIds[0], skillIds[1]];
        } else if (pet.lv >= 10) {
            return [skillIds[0]];
        } else {
            return [];
        }
    }
}

export class EquipDataTool {
    static create(
        id: string,
        skillId: string,
        growth: number,
        featureLvs: number[],
        affixes: Feature[],
        learnTimes: number
    ): Equip {
        let equip = newInsWithChecker(Equip);

        equip.id = id;
        equip.itemType = ItemType.equip;
        equip.skillId = skillId;
        equip.growth = growth;
        equip.selfFeatureLvs = newList();
        for (const lv of featureLvs) equip.selfFeatureLvs.push(lv);
        equip.affixes = newList();
        for (const feature of affixes) equip.affixes.push(FeatureDataTool.clone(feature));
        equip.learnTimes = learnTimes;

        return equip;
    }

    static createRandom(lvFrom: number, lvTo: number): Equip {
        let equipIds: string[];
        let lv = lvFrom + random(lvTo - lvFrom + 1);
        let equipIdsByRank = equipIdsByLvRank[lv];
        switch (equipIdsByRank.length) {
            case 0:
                return null;
            case 1:
                equipIds = equipIdsByRank[0];
                break;
            case 2:
                equipIds = equipIdsByRank[randomRate(0.7) ? 0 : 1];
                break;
            case 3:
                equipIds = equipIdsByRank[getRandomOneInListWithRate([0, 1, 2], [0.7, 0.25])];
                break;
        }
        let equipId = getRandomOneInList(equipIds);

        let equipModel = equipModelDict[equipId];

        let skillId: string;
        let skillIds = skillIdsByEleType[equipModel.eleType];
        if (skillIds) {
            skillId = getRandomOneInList(skillIds);
        } else {
            skillId = '';
        }

        let featureLvs = [];
        let equipType = equipModel.equipPosType;
        let beginLv = equipType == EquipPosType.weapon ? 20 : equipType == EquipPosType.defense ? 30 : 40;
        let featureLvFrom = lv <= beginLv ? 1 : Math.ceil((lv - beginLv) * 0.1) + 1;
        for (let index = 0; index < equipModel.featureIds.length; index++) featureLvs.push(featureLvFrom + random(3));

        let affixes = [];
        if (lv >= 26 && randomRate(0.7)) {
            let featureIds = Object.keys(featureModelDict);
            let featureId = getRandomOneInList(featureIds);
            let feature = new Feature();
            feature.id = featureId;
            feature.lv = 1;
            affixes.push(feature);
        }

        return this.create(equipId, skillId, 0, featureLvs, affixes, 0);
    }

    static getLv(equip: Equip): number {
        return equipModelDict[equip.id].lv + equip.growth;
    }

    static getCnName(equip: Equip): string {
        if (equip.affixes.length > 0) {
            let name = '';
            for (let index = equip.affixes.length - 1; index >= 0; index--) {
                const affix = equip.affixes[index];
                name += featureModelDict[affix.id].cnBrief;
            }
            return name + '之' + equipModelDict[equip.id].cnName;
        } else {
            return equipModelDict[equip.id].cnName;
        }
    }

    static getToken(e: Equip): string {
        return String(e.catchIdx); // 可以用catchIdx代表唯一的装备，因为装备在创建，增加和变化时，都会更新catchIdx
    }

    static getFinalAttris(equip: Equip, attris: {} = null): {} {
        // 装备加成
        let setAttriByEquip = (attris: {}, equipModel: EquipModel, key: string, growth: number) => {
            if (equipModel[key] > 0) attris[key] += equipModel[key] + growth;
        };

        let equipModel = equipModelDict[equip.id];
        let finalAttris = attris || {
            strength: 0,
            concentration: 0,
            durability: 0,
            agility: 0,
            sensitivity: 0,
            elegant: 0,
            armor: 0
        };

        setAttriByEquip(finalAttris, equipModel, 'strength', equip.growth * 20);
        setAttriByEquip(finalAttris, equipModel, 'concentration', equip.growth * 20);
        setAttriByEquip(finalAttris, equipModel, 'durability', equip.growth * 20);
        setAttriByEquip(finalAttris, equipModel, 'agility', equip.growth * 10);
        setAttriByEquip(finalAttris, equipModel, 'sensitivity', equip.growth * 10);
        setAttriByEquip(finalAttris, equipModel, 'elegant', equip.growth * 10);
        setAttriByEquip(finalAttris, equipModel, 'armor', 0);
        return finalAttris;
    }
}

export class ActPosDataTool {
    static create(posId: string): ActPos {
        let actPos = newInsWithChecker(ActPos);
        actPos.id = posId;
        return actPos;
    }
}

export class GameDataTool {
    static SUC: string = 'K';

    static init(gameData: GameData) {
        gameData.posDataDict = newDict();
        gameData.pets = newList();
        gameData.items = newList();

        let money = newInsWithChecker(Money);
        money.id = 'money';
        money.itemType = ItemType.money;
        money.count = 0;
        gameData.items.push(money);

        gameData.weight = 0;
        gameData.totalPetCount = 0;

        gameData.curPosId = '';
        gameData.curExpl = null;
    }

    static addPet(
        gameData: GameData,
        id: string,
        lv: number,
        rank: number,
        features: Feature[],
        callback: (pet: Pet) => void = null
    ): string {
        if (gameData.pets.length >= this.getPetCountMax(gameData)) return '宠物数量到达上限';

        gameData.totalPetCount++;

        let pet = PetDataTool.create(id, lv, rank, features, gameData);
        gameData.pets.push(pet);

        this.sortPetsByState(gameData);

        if (callback) callback(pet);

        return this.SUC;
    }

    static sortPetsByState(gameData: GameData) {
        gameData.pets.sort((a: Pet, b: Pet): number => {
            return a.state - b.state;
        });
    }

    static moveUpPetInList(gameData: GameData, index: number) {
        if (index == 0) return;
        let pet = gameData.pets[index];
        gameData.pets.splice(index, 1);
        gameData.pets.splice(index - 1, 0, pet);
    }

    static moveDownPetInList(gameData: GameData, index: number) {
        if (index == gameData.pets.length - 1) return;
        let pet = gameData.pets[index];
        gameData.pets.splice(index, 1);
        gameData.pets.splice(index + 1, 0, pet);
    }

    static deletePet(gameData: GameData, index: number): string {
        let curCatchIdx = gameData.pets[index].catchIdx;
        if (gameData.curExpl) {
            for (const petMmr of gameData.curExpl.selfs) {
                if (curCatchIdx == petMmr.catchIdx) return '当前宠物处于战斗或备战状态，无法放生';
            }
        }
        gameData.pets.splice(index, 1);
        return this.SUC;
    }

    // -----------------------------------------------------------------

    static handleMoney(gameData: GameData, callback: (money: Money) => void) {
        callback(gameData.items[0] as Money);
    }

    static getMoney(gameData: GameData) {
        return (gameData.items[0] as Money).count;
    }

    static addEquip(gameData: GameData, equip: Equip, callback: (equip: Equip) => void = null): string {
        if (gameData.items.length >= this.getItemCountMax(gameData)) return '道具数量到达最大值';
        gameData.weight++;

        gameData.totalEquipCount++;
        equip.catchIdx = gameData.totalEquipCount;

        gameData.items.push(equip);

        if (callback) callback(equip);
        return this.SUC;
    }

    static putOnEquip(gameData: GameData, equip: Equip, pet: Pet): string {
        if (pet.equips.length >= 3) return '一只宠物最多只能持有三件装备';

        let equipPosType = equipModelDict[equip.id].equipPosType;
        for (const equipHeld of pet.equips) {
            if (equipModelDict[equipHeld.id].equipPosType != equipPosType) continue;
            let strs = ['', '武器', '防具', '饰品'];
            return '一只宠物同时只能持有一件' + strs[equipPosType];
        }

        let index = gameData.items.indexOf(equip);
        if (index == -1) return '此装备不在道具栏里';

        gameData.items.splice(index, 0);
        pet.equips.push(equip);
        gameData.weight--;

        return this.SUC;
    }

    static putOffEquip(gameData: GameData, equip: Equip, pet: Pet): string {
        if (gameData.items.length >= this.getItemCountMax(gameData)) return '道具数量到达最大值';

        let index = pet.equips.indexOf(equip);
        if (index == -1) return '此装备不在宠物身上';

        gameData.weight++;
        pet.equips.splice(index, 0);
        gameData.items.push(equip);

        return this.SUC;
    }

    static makeGrowForEquip(gameData: GameData, equip: Equip): string {
        gameData.totalEquipCount++;
        equip.catchIdx = gameData.totalEquipCount;
        return this.SUC;
    }

    static addAffixForEquip(gameData: GameData, equip: Equip): string {
        gameData.totalEquipCount++;
        equip.catchIdx = gameData.totalEquipCount;
        return this.SUC;
    }

    // -----------------------------------------------------------------

    static addActPos(gameData: GameData, posId: string): ActPos {
        let actPos = ActPosDataTool.create(posId);
        gameData.posDataDict[posId] = actPos;
        return actPos;
    }

    static createExpl(gameData: GameData) {
        if (gameData.curExpl) return;
        let expl = newInsWithChecker(ExplMmr);
        expl.startTime = new Date().getTime();
        expl.curStep = 0;
        expl.hiding = false;
        gameData.curExpl = expl;
        this.resetSelfPetsInExpl(gameData);
    }

    static resetSelfPetsInExpl(gameData: GameData) {
        let expl = gameData.curExpl;
        if (!expl.selfs) expl.selfs = newList();
        else expl.selfs.length = 0;

        for (const pet of gameData.pets) {
            cc.log('^_^!', petModelDict[pet.id].cnName);
            if (pet.state != PetState.ready) break; // 备战的pet一定在最上，且不会超过5个
            let selfPetMmr = newInsWithChecker(SelfPetMmr);
            selfPetMmr.catchIdx = pet.catchIdx;
            selfPetMmr.lv = pet.lv;
            selfPetMmr.rank = pet.rank;
            selfPetMmr.state = pet.state;
            selfPetMmr.lndFchrLen = pet.learnedFeatures.length;
            selfPetMmr.privity = pet.privity;
            let tokens = [];
            for (const equip of pet.equips) tokens.push(EquipDataTool.getToken(equip));
            selfPetMmr.eqpTokens = newList(tokens);
            expl.selfs.push(selfPetMmr);
            cc.log('^_^!nn', selfPetMmr);
        }
    }

    static deleteExpl(gameData: GameData) {
        if (gameData.curExpl) gameData.curExpl = null;
    }

    static createBattle(gameData: GameData, seed: number, pets: Pet[], spcBtlId: number) {
        cc.assert(gameData.curExpl, '创建battle前必有Expl');
        let curExpl = gameData.curExpl;
        if (curExpl.curBattle) return;
        let battle = newInsWithChecker(BattleMmr);
        battle.startTime = new Date().getTime();
        battle.seed = seed;
        battle.enemys = newList();
        battle.catchPetIdx = -1;
        battle.spcBtlId = spcBtlId;

        curExpl.curBattle = battle;

        for (const pet of pets) {
            this.createEnemyPet(gameData, pet.id, pet.lv, pet.rank, pet.inbornFeatures);
        }
    }

    static createEnemyPet(gameData: GameData, id: string, lv: number, rank: number, features: Feature[]) {
        let p = newInsWithChecker(PetMmr);
        p.id = id;
        p.lv = lv;
        p.rank = rank;
        p.features = newList();
        for (const feature of features) p.features.push(FeatureDataTool.clone(feature));

        gameData.curExpl.curBattle.enemys.push(p);
    }

    static deleteBattle(gameData: GameData) {
        cc.assert(gameData.curExpl, '删除battle前必有Expl');
        gameData.curExpl.curBattle = null;
    }

    // -----------------------------------------------------------------

    static getPetCountMax(gameData: GameData) {
        return 10; // llytodo 根据职称不同而不同
    }

    static getItemCountMax(gameData: GameData) {
        return 300; // llytodo 根据职称不同而不同
    }
}
