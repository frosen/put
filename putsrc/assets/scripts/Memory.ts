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
    EnemyPetMmr,
    GameDataSaved,
    Equip,
    ItemType
} from './DataSaved';
import { FeatureModel, PetModel, EquipPosType } from './DataModel';
import { GameDataRuntime } from './DataOther';
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
    gameDataS: GameDataSaved = newInsWithChecker(GameDataSaved);
    gameDataR: GameDataRuntime = new GameDataRuntime();

    saveToken: boolean = false;
    saveInterval: number = 0;

    set dirtyToken(t: number) {
        memoryDirtyToken = t;
    }
    get dirtyToken() {
        return memoryDirtyToken;
    }

    init() {
        GameDataSavedTool.init(this.gameDataS);
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
        this.gameDataS.curPosId = 'YiZhuang';

        GameDataSavedTool.addPet(this.gameDataS, 'FaTiaoWa', 1, 4, [], (pet: Pet) => {
            pet.state = PetState.ready;
            pet.privity = 100;
        });

        GameDataSavedTool.addPet(this.gameDataS, 'YaHuHanJuRen', 1, 2, [], (pet: Pet) => {
            pet.state = PetState.ready;
        });

        GameDataSavedTool.addPet(this.gameDataS, 'BaiLanYuYan', 1, 2, [], (pet: Pet) => {
            pet.state = PetState.ready;
        });
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
    static create(id: string, lv: number, rank: number, features: Feature[], gameDataS: GameDataSaved): Pet {
        let pet = newInsWithChecker(Pet);

        pet.inbornFeatures = newList();
        pet.learnedFeatures = newList();
        pet.equips = newList();

        pet.id = id;
        pet.master = '';

        pet.catchTime = new Date().getTime();
        pet.catchIdx = gameDataS ? gameDataS.totalPetCount : -99;
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
        learnTimes: number,
        catchIdx: number
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
        equip.catchIdx = catchIdx;

        return equip;
    }

    static createRandom(lvFrom: number, lvTo: number, catchIdx: number) {
        let equipIds: string[];
        let lv = lvFrom + random(lvTo + 1);
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

        return this.create(equipId, skillId, 0, featureLvs, affixes, 0, catchIdx);
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
        return String(e.catchIdx);
    }
}

export class ActPosDataTool {
    static create(posId: string): ActPos {
        let actPos = newInsWithChecker(ActPos);
        actPos.id = posId;
        return actPos;
    }
}

export class GameDataSavedTool {
    static init(gameDataS: GameDataSaved) {
        gameDataS.posDataDict = newDict();
        gameDataS.pets = newList();
        gameDataS.items = newList();

        gameDataS.totalPetCount = 0;

        gameDataS.curPosId = '';
        gameDataS.curExpl = null;
    }

    static addPet(
        gameDataS: GameDataSaved,
        id: string,
        lv: number,
        rank: number,
        features: Feature[],
        callback: (pet: Pet) => void = null
    ) {
        gameDataS.totalPetCount++;

        let pet = PetDataTool.create(id, lv, rank, features, gameDataS);
        gameDataS.pets.push(pet);

        this.sortPetsByState(gameDataS);

        if (callback) callback(pet);
    }

    static sortPetsByState(gameDataS: GameDataSaved) {
        gameDataS.pets.sort((a: Pet, b: Pet): number => {
            return a.state - b.state;
        });
    }

    static moveUpPetInList(gameDataS: GameDataSaved, index: number) {
        if (index == 0) return;
        let pet = gameDataS.pets[index];
        gameDataS.pets.splice(index, 1);
        gameDataS.pets.splice(index - 1, 0, pet);
    }

    static moveDownPetInList(gameDataS: GameDataSaved, index: number) {
        if (index == gameDataS.pets.length - 1) return;
        let pet = gameDataS.pets[index];
        gameDataS.pets.splice(index, 1);
        gameDataS.pets.splice(index + 1, 0, pet);
    }

    static deletePet(gameDataS: GameDataSaved, index: number) {
        gameDataS.pets.splice(index, 1);
    }

    // -----------------------------------------------------------------

    static addActPos(gameDataS: GameDataSaved, posId: string): ActPos {
        let actPos = ActPosDataTool.create(posId);
        gameDataS.posDataDict[posId] = actPos;
        return actPos;
    }

    static createExpl(gameDataS: GameDataSaved) {
        if (gameDataS.curExpl) return;
        let expl = newInsWithChecker(ExplMmr);
        expl.startTime = new Date().getTime();
        expl.curStep = 0;
        expl.selfs = newList();
        for (const pet of gameDataS.pets) {
            if (pet.state != PetState.ready) break; // 备战的pet一定在最上，且不会超过5个
            let selfPetMmr = newInsWithChecker(SelfPetMmr);
            selfPetMmr.catchIdx = pet.catchIdx;
            selfPetMmr.privity = pet.privity;
            let tokens = [];
            for (const equip of pet.equips) tokens.push(EquipDataTool.getToken(equip));
            selfPetMmr.eqpTokens = newList(tokens);
            expl.selfs.push(selfPetMmr);
        }
        expl.hiding = false;

        gameDataS.curExpl = expl;
    }

    static deleteExpl(gameDataS: GameDataSaved) {
        if (gameDataS.curExpl) {
            gameDataS.curExpl = null;
        }
    }

    static createBattle(gameDataS: GameDataSaved, seed: number, pets: Pet[]) {
        cc.assert(gameDataS.curExpl, '创建battle前必有Expl');
        let curExpl = gameDataS.curExpl;
        if (curExpl.curBattle) return;
        let battle = newInsWithChecker(BattleMmr);
        battle.startTime = new Date().getTime();
        battle.seed = seed;
        battle.enemys = newList();
        battle.catchPetIdx = -1;

        curExpl.curBattle = battle;

        for (const pet of pets) {
            this.createEnemyPet(gameDataS, pet.id, pet.lv, pet.rank, pet.inbornFeatures);
        }
    }

    static createEnemyPet(gameDataS: GameDataSaved, id: string, lv: number, rank: number, features: Feature[]) {
        let p = newInsWithChecker(EnemyPetMmr);
        p.id = id;
        p.lv = lv;
        p.rank = rank;
        p.features = newList();
        for (const feature of features) p.features.push(FeatureDataTool.clone(feature));

        gameDataS.curExpl.curBattle.enemys.push(p);
    }

    static deleteBattle(gameDataS: GameDataSaved) {
        cc.assert(gameDataS.curExpl, '删除battle前必有Expl');
        gameDataS.curExpl.curBattle = null;
    }
}
