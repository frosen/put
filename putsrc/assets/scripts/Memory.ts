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
    ExplMmr,
    PetState,
    SelfPetMmr,
    BattleMmr,
    PetMmr,
    GameData,
    Equip,
    ItemType,
    Money,
    PetEquipCountMax,
    PrvtyMax,
    Drink,
    Cnsum,
    CaughtPet,
    Catcher,
    EqpAmplr,
    CnsumType,
    Material,
    UpdCntByStep,
    PosData,
    PADExpl,
    ZUAN,
    JIN,
    KUAI,
    PADEqpMkt,
    PADPetMkt,
    PADQuester,
    PADACntr,
    PADBase
} from './DataSaved';
import {
    FeatureModel,
    PetModel,
    EquipPosType,
    EquipModel,
    DrinkModel,
    DrinkAimType,
    CnsumModel,
    PAKey,
    ReputRank
} from './DataModel';
import { equipModelDict } from 'configs/EquipModelDict';
import { randomInt, randomRate, getRandomOneInListWithRate, getRandomOneInList } from './Random';
import { equipIdsByLvRank } from 'configs/EquipIdsByLvRank';
import { skillIdsByEleType } from 'configs/SkillIdsByEleType';
import { GameJITDataTool, AmplAttriType } from './DataOther';
import { drinkModelDict } from 'configs/DrinkModelDict';
import { inbornFeatures } from 'configs/InbornFeatures';
import { expModels } from 'configs/ExpModels';
import { catcherModelDict } from 'configs/CatcherModelDict';
import { eqpAmplrModelDict } from 'configs/EqpAmplrModelDict';
import { materialModelDict } from 'configs/MaterialModelDict';
import Tea = require('./Tea');

let memoryDirtyToken: number = -1;
let sfbdCount: number = -1;
function checkDataCorrect(): boolean {
    if (sfbdCount > 0) {
        sfbdCount++;
        if (sfbdCount > 100) cc.game.end();
        return false;
    }
    return true;
}

// @ts-ignore
window.__errorHandler = function () {
    if (sfbdCount < 0) sfbdCount = 1;
};

const MagicNum = 1654435769 + Math.floor(Math.random() * 1000000000);
function getCheckedNumber(s: number): number {
    return (s * MagicNum) >> 19;
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
    const realDict = dict || {};
    const ckDict = {};
    for (const key in realDict) {
        if (!realDict.hasOwnProperty(key)) continue;
        const cNum = realDict[key];
        if (typeof cNum === 'number') ckDict[key] = getCheckedNumber(cNum) as any;
    }
    return new Proxy(realDict, {
        set: function (target, key, value, receiver) {
            if (typeof value === 'number') {
                ckDict[key] = getCheckedNumber(value);
            }
            memoryDirtyToken = Math.abs(memoryDirtyToken) * -1;
            return Reflect.set(target, key, value, receiver);
        },
        get: function (target, key) {
            const v = target[key];
            if (typeof v === 'number') {
                if (getCheckedNumber(v) !== ckDict[key]) {
                    if (sfbdCount < 0) sfbdCount = 1;
                    if (!CC_BUILD) throw new Error('number check wrong!');
                }
            }
            return v;
        }
    });
}

function newInsWithChecker<T extends Object>(cls: { new (): T }): T {
    const ins = new cls();
    // @ts-ignore
    ins.__proto__ = Object.prototype; // 为了避免保存读取无误，移除原型链
    return newDict(ins);
}

function turnToDataWithChecker(data: any) {
    if (data instanceof Array) {
        for (let i = 0; i < data.length; ++i) data[i] = turnToDataWithChecker(data[i]);
        return newList(data);
    } else if (data instanceof Object) {
        for (const i in data) data[i] = turnToDataWithChecker(data[i]);
        return newDict(data);
    } else {
        return data;
    }
}

// -----------------------------------------------------------------

export class Memory {
    gameData: GameData = null;

    saveToken: boolean = false;
    saveInterval: number = 0;

    set dirtyToken(t: number) {
        memoryDirtyToken = t;
    }
    get dirtyToken() {
        return memoryDirtyToken;
    }

    init() {
        // 初始化，或者恢复历史数据
        const lastGameData = this.loadMemory();
        if (!lastGameData || true) {
            this.gameData = newInsWithChecker(GameData);
            GameDataTool.init(this.gameData);
            this.test();
        } else {
            this.gameData = turnToDataWithChecker(lastGameData);
        }

        // 整理历史数据
        GameJITDataTool.init();
        Memory.resetGameData(this.gameData);
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
            this.saveInterval = 1;
            this.saveMemory();
        }

        Memory.updateGameData(this.gameData);
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
            if (element === listener) {
                this.dataListeners.splice(index, 1);
            }
        }
    }

    curSaveDataId: number = 1;

    saveMemory() {
        cc.log('STORM cc ^_^ 保存 ');
        if (!checkDataCorrect()) return;

        const savedData = {
            g: this.gameData,
            t: Date.now()
        };

        const encodeStr = Tea.Tea.encrypt(JSON.stringify(savedData), '0x5d627c');
        this.curSaveDataId = this.curSaveDataId === 1 ? 2 : 1;
        cc.sys.localStorage.setItem(`sg${this.curSaveDataId}`, encodeStr);
    }

    loadMemory(): any {
        const sg1 = cc.sys.localStorage.getItem('sg1');
        const sg2 = cc.sys.localStorage.getItem('sg2');
        const sd1 = (sg1 && this.decodeSaveData(sg1)) || { t: -1, g: null };
        const sd2 = (sg2 && this.decodeSaveData(sg2)) || { t: -1, g: null };

        let lastGameData: any;
        if (sd1.t < 0 && sd2.t < 0) {
            lastGameData = null;
            this.curSaveDataId = 1;
        } else if (sd1.t > sd2.t) {
            lastGameData = sd1.g;
            this.curSaveDataId = 1;
        } else {
            lastGameData = sd2.g;
            this.curSaveDataId = 2;
        }
        return lastGameData;
    }

    decodeSaveData(encodeStr: string): { g: any; t: number } {
        try {
            const decodeStr = Tea.Tea.decrypt(encodeStr, '0x5d627c');
            const data = JSON.parse(decodeStr) as { g: any; t: number };
            return data;
        } catch (error) {
            return null;
        }
    }

    // -----------------------------------------------------------------

    static lastUpdateTime: number = 0;

    static updateGameData(gameData: GameData) {
        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = Date.now();
            return;
        }
        const curTime = Date.now();
        const diff = curTime - this.lastUpdateTime;
        const INTERVAL = 60000;
        if (diff >= INTERVAL) {
            this.lastUpdateTime += INTERVAL;
            for (const pet of gameData.pets) this.updatePet(pet, curTime);
        }
    }

    static updatePet(pet: Pet, curTime: number) {
        if (pet.prvty < PrvtyMax) {
            const range = 600000; // 默契值 10min1点(10 * 60 * 1000)
            if (curTime - pet.prvtyTime > range) {
                const count = Math.floor((curTime - pet.prvtyTime) / range);
                if (pet.state === PetState.ready || pet.state === PetState.rest) {
                    pet.prvty += 100 * GameJITDataTool.getAmplPercent(pet, AmplAttriType.prvty) * count;
                    pet.prvty = Math.min(pet.prvty, PrvtyMax);
                }
                pet.prvtyTime += range * count;
            }
        }

        if (pet.drink) {
            if (curTime - pet.drinkTime >= drinkModelDict[pet.drink.id].dura) {
                GameDataTool.clearDrinkFromPet(pet);
            }
        }
    }

    static resetGameData(gameData: GameData) {
        for (const pet of gameData.pets) {
            const drink = pet.drink;
            if (drink) {
                const drinkModel = drinkModelDict[drink.id];
                GameJITDataTool.addAmplByDrink(pet, drinkModel);
            }
        }
    }

    // -----------------------------------------------------------------

    test() {
        this.gameData.curPosId = 'YiZhuang';

        GameDataTool.addPet(this.gameData, 'FaTiaoWa', 1, 1, [], (pet: Pet) => {
            pet.state = PetState.ready;
            pet.nickname = '妙妙';
            pet.prvty = 400000;
            pet.equips[0] = EquipDataTool.createRandomByLv(15, 20);
        });

        GameDataTool.addPet(this.gameData, 'YaHuHanJuRen', 1, 1, [], (pet: Pet) => {
            pet.state = PetState.ready;
            pet.prvty = 400000;
            pet.drink = CnsumDataTool.create(Drink, 'LingGanYaoJi2');
            pet.drinkTime = Date.now();
        });

        GameDataTool.addPet(this.gameData, 'BaiLanYuYan', 1, 1, [], (pet: Pet) => {
            pet.state = PetState.ready;
            pet.prvty = 400000;
            const f = newInsWithChecker(Feature);
            f.id = 'hitWithDark';
            f.lv = 1;
            pet.learnedFeatures.push(f);
        });

        // GameDataTool.handleMoney(this.gameData, money => (money.sum += 15643351790));

        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(21, 25));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(21, 25));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(21, 25));

        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(11, 15));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(11, 15));
        GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(11, 15));

        // GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(30, 33));
        // GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(30, 33));
        // GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(30, 33));

        // GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(15, 20));
        // GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(15, 20));
        // GameDataTool.addEquip(this.gameData, EquipDataTool.createRandomByLv(15, 20));

        GameDataTool.addCnsum(this.gameData, 'LingGanYaoJi1', 2);

        GameDataTool.addCnsum(this.gameData, 'PuTongXianJing1', 20);
        GameDataTool.addCnsum(this.gameData, 'CiLiPan1', 2);
        GameDataTool.addCnsum(this.gameData, 'DaMoShi', 2);
        GameDataTool.addCnsum(this.gameData, 'YingZhiChiLun', 2);
        GameDataTool.handleMoney(this.gameData, (money: Money) => (money.sum += 1000));

        GameDataTool.addCaughtPet(this.gameData, 'BaiLanYuYan', 3, 6, [FeatureDataTool.createInbornFeature()]);

        // this.gameData.curPosId = 'GuangJiDianDaDao';
        // GameDataTool.createExpl(this.gameData, 0);
        // this.gameData.curExpl.startTime = Date.now() - 1000 * 60 * 60 * 24 * 2;
        // this.gameData.curExpl.catcherId = 'PuTongXianJing1';
        // this.gameData.curExpl.chngUpdCnt = 2100;

        // const ePets = [];
        // for (const index = 0; index < 3; index++) ePets.push(MmrTool.createPetMmr('FaTiaoWa', 2, 1, []));
        // GameDataTool.createBattle(this.gameData, 100, (1000 * 60 * 100) / 750 - 10, 0, []);
        // this.gameData.curExpl.curBattle.enemys = ePets;
    }
}

export class FeatureDataTool {
    static createInbornFeature(): Feature {
        const feature = new Feature();
        feature.id = getRandomOneInList(inbornFeatures);
        const r = Math.random();
        feature.lv = 1 + Math.floor(r * r * r * 10); // 使用3次方，使随机结果更小
        return feature;
    }

    static getDatas(featureId: string, lv: number) {
        const featureModel = featureModelDict[featureId];
        const datas = [];
        for (const dataArea of featureModel.dataAreas) {
            const data = dataArea[0] + (lv - 1) * dataArea[1];
            datas.push(data);
        }
        return datas;
    }

    static clone(feature: Feature): Feature {
        const newFeature = newInsWithChecker(Feature);
        newFeature.id = feature.id;
        newFeature.lv = feature.lv;
        return newFeature;
    }
}

export class PetDataTool {
    static create(id: string, lv: number, rank: number, features: Feature[], gameData: GameData): Pet {
        const pet = newInsWithChecker(Pet);

        pet.inbornFeatures = newList();
        pet.learnedFeatures = newList();

        const equips = [];
        for (let index = 0; index < PetEquipCountMax; index++) equips.push(null);
        pet.equips = newList(equips);

        pet.id = id;
        pet.nickname = null;
        pet.master = '';

        pet.catchTime = Date.now();
        pet.catchIdx = gameData ? gameData.totalPetCount : -99;
        pet.catchLv = lv;
        pet.catchRank = rank;

        pet.state = PetState.rest;

        pet.lv = lv;
        pet.rank = rank;

        pet.prvty = 0;
        pet.prvtyTime = pet.catchTime;

        pet.drink = null;
        pet.drinkTime = 0;

        pet.exp = 0;

        for (const feature of features) pet.inbornFeatures.push(FeatureDataTool.clone(feature));

        return pet;
    }

    static getCnName(pet: Pet, needSpace: boolean = false): string {
        if (pet.nickname) return pet.nickname;
        else return PetDataTool.getBaseCnName(pet, needSpace);
    }

    static getBaseCnName(pet: Pet, needSpace: boolean = false): string {
        if (pet.inbornFeatures.length > 0) {
            let name = '';
            for (let index = 1; index >= 0; index--) {
                const feature = pet.inbornFeatures[index];
                if (!feature) continue;
                name += featureModelDict[feature.id].cnBrief;
            }
            return name + (needSpace ? ' 之 ' : '之') + PetDataTool.getOriNameById(pet.id);
        } else {
            return PetDataTool.getOriNameById(pet.id);
        }
    }

    static getOriNameById(id: string): string {
        return petModelDict[id].cnName;
    }

    static eachFeatures(pet: Pet, callback: (featureModel: FeatureModel, datas: number[]) => void) {
        for (const equip of pet.equips) {
            if (!equip) continue;
            const equipModel = equipModelDict[equip.id];
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

        const selfFeatures = PetDataTool.getSelfFeaturesByCurLv(pet);
        for (const feature of selfFeatures) {
            callback(featureModelDict[feature.id], FeatureDataTool.getDatas(feature.id, feature.lv));
        }
    }

    static getSelfFeaturesByCurLv(pet: Pet) {
        const selfFeatureIds = (petModelDict[pet.id] as PetModel).selfFeatureIds;
        const featureLvs = featureLvsByPetLv[pet.lv];
        const features: Feature[] = [];

        for (let index = 0; index < selfFeatureIds.length; index++) {
            const featureLv = featureLvs[index];
            if (featureLv === 0) continue;

            const newFeature = new Feature();
            newFeature.id = selfFeatureIds[index];
            newFeature.lv = featureLv;
            features.push(newFeature);
        }
        return features;
    }

    static getSelfSkillIdByCurLv(pet: Pet): string[] {
        const skillIds = petModelDict[pet.id].selfSkillIds;
        if (pet.lv >= 30) {
            return [skillIds[0], skillIds[1]];
        } else if (pet.lv >= 10) {
            return [skillIds[0]];
        } else {
            return [];
        }
    }

    static getRealPrvty(pet: Pet, exPrvty: number = -1) {
        const r = exPrvty === -1 ? pet.prvty : exPrvty;
        return Math.floor(Math.sqrt(r * 0.01));
    }

    static addExp(pet: Pet, exp: number): number {
        let newExp = pet.exp + exp;
        let lv = pet.lv;
        while (true) {
            if (lv >= expModels.length) return 0;
            const curExpMax = expModels[lv];

            if (newExp < curExpMax) {
                pet.exp = newExp;
                const lvDiff = lv - pet.lv;
                pet.lv = lv;
                return lvDiff + newExp / curExpMax;
            } else {
                lv++;
                newExp -= curExpMax;
            }
        }
    }
}

export class CnsumDataTool {
    static create<T extends Cnsum>(cls: { new (): T }, id: string, count: number = 1): T {
        const cnsum = newInsWithChecker(cls);
        cnsum.id = id;
        cnsum.count = count;
        return cnsum;
    }

    static getTypeById(cnsumId: string): CnsumType {
        if (cnsumId in drinkModelDict) return CnsumType.drink;
        else if (cnsumId in catcherModelDict) return CnsumType.catcher;
        else if (cnsumId in eqpAmplrModelDict) return CnsumType.eqpAmplr;
        else if (cnsumId in materialModelDict) return CnsumType.material;
        else return null;
    }

    static getModelById(cnsumId: string): CnsumModel {
        if (cnsumId in drinkModelDict) return drinkModelDict[cnsumId];
        else if (cnsumId in catcherModelDict) return catcherModelDict[cnsumId];
        else if (cnsumId in eqpAmplrModelDict) return eqpAmplrModelDict[cnsumId];
        else if (cnsumId in materialModelDict) return materialModelDict[cnsumId];
        else return null;
    }

    static getClassById(cnsumId: string): { new (): Cnsum } {
        if (cnsumId in drinkModelDict) return Drink;
        else if (cnsumId in catcherModelDict) return Catcher;
        else if (cnsumId in eqpAmplrModelDict) return EqpAmplr;
        else if (cnsumId in materialModelDict) return Material;
        else return null;
    }
}

export class MoneyTool {
    static getEach(count: number): { zuan: number; jin: number; kuai: number } {
        const ZuanRate = 100000000;
        const JinRate = 10000;
        const zuan = Math.floor(count / ZuanRate);

        count %= ZuanRate;
        const jin = Math.floor(count / JinRate);

        const kuai = count % JinRate;

        return { zuan, jin, kuai };
    }

    static getStr(count: number): string {
        let { zuan, jin, kuai } = MoneyTool.getEach(count);
        const zuanStr = zuan > 0 ? String(zuan) + ZUAN : '';
        const jinStr = jin > 0 ? '  ' + String(jin) + JIN : '';
        const kuaiStr = kuai > 0 || (zuan === 0 && jin === 0) ? '  ' + String(kuai) + KUAI : '';
        return zuanStr + jinStr + kuaiStr;
    }

    static getSimpleStr(count: number): string {
        let { zuan, jin, kuai } = MoneyTool.getEach(count);

        const padding4 = function (num: number) {
            const frac = String(num / 10000);
            return frac.slice(1);
        };

        if (zuan > 0) {
            if (jin > 0) {
                return String(zuan) + padding4(jin) + ZUAN;
            } else {
                return String(zuan) + ZUAN;
            }
        } else if (jin > 0) {
            if (kuai > 0) {
                return String(jin) + padding4(kuai) + JIN;
            } else {
                return String(jin) + JIN;
            }
        } else {
            return String(kuai) + KUAI;
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
        const equip = newInsWithChecker(Equip);

        equip.id = id;
        equip.skillId = skillId;
        equip.growth = growth;
        equip.selfFeatureLvs = newList();
        for (const lv of featureLvs) equip.selfFeatureLvs.push(lv);
        equip.affixes = newList();
        for (const feature of affixes) equip.affixes.push(FeatureDataTool.clone(feature));
        equip.learnTimes = learnTimes;

        return equip;
    }

    static createRandomById(equipId: string): Equip {
        const equipModel = equipModelDict[equipId];
        const lv = equipModel.lv;

        let skillId: string;
        const skillIds = skillIdsByEleType[equipModel.eleType];
        if (skillIds) {
            skillId = getRandomOneInList(skillIds);
        } else {
            skillId = '';
        }

        const featureLvs = [];
        const equipType = equipModel.equipPosType;
        const startLv = equipType === EquipPosType.weapon ? 20 : equipType === EquipPosType.defense ? 30 : 40;
        const featureLvFrom = lv <= startLv ? 1 : Math.ceil((lv - startLv) * 0.1) + 1;
        for (let index = 0; index < equipModel.featureIds.length; index++) featureLvs.push(featureLvFrom + randomInt(3));

        const affixes: Feature[] = [];
        if (randomRate(0.5)) {
            const featureIds = Object.keys(featureModelDict);
            const featureId = getRandomOneInList(featureIds);
            const feature = new Feature();
            feature.id = featureId;
            feature.lv = 1;
            affixes.push(feature);
        }

        return this.create(equipId, skillId, 0, featureLvs, affixes, 0);
    }

    static createRandomByLv(lvFrom: number, lvTo: number, rankMax: number = 9999): Equip {
        let equipIds: string[];
        let lv = lvFrom + randomInt(lvTo - lvFrom + 1);
        if (lv < 0) lv = 0;
        if (lv >= equipIdsByLvRank.length) lv = equipIdsByLvRank.length - 1;
        const equipIdsByRank = equipIdsByLvRank[lv];
        const len = Math.min(equipIdsByRank.length, rankMax);
        switch (len) {
            case 0:
                return null;
            case 1:
                equipIds = equipIdsByRank[0];
                break;
            case 2:
                equipIds = equipIdsByRank[randomRate(0.7) ? 0 : 1];
                break;
            case 3:
                equipIds = equipIdsByRank[getRandomOneInListWithRate([0, 1, 2], [0.6, 0.9])];
                break;
        }
        const equipId = getRandomOneInList(equipIds);
        return this.createRandomById(equipId);
    }

    static createByFullId(fullId: string): Equip {
        const infos = fullId.split('-');

        const fLvStrs = infos[2].split('$');
        const fLvs: number[] = [];
        for (const fLvStr of fLvStrs) fLvs.push(Number(fLvStr));

        const afStrs = infos[3].split('$');
        const afs: Feature[] = [];
        for (const afStr of afStrs) {
            const afInfo = afStr.split('#');
            const feature = new Feature();
            feature.id = afInfo[0];
            feature.lv = Number(afInfo[1] || '1');
            afs.push(feature);
        }
        return this.create(infos[0], infos[1], 0, fLvs, afs, 0);
    }

    static getFullId(equip: Equip): string {
        const id = equip.id;
        const skillId = equip.skillId;
        let fLvStr = '';
        for (const lv of equip.selfFeatureLvs) {
            fLvStr += String(lv) + '$';
        }
        fLvStr = fLvStr.slice(0, -1);
        let affixesStr = '';
        for (const { id, lv } of equip.affixes) {
            affixesStr += id + '#' + String(lv) + '$';
        }
        affixesStr = affixesStr.slice(0, -1);
        return `${id}-${skillId}-${fLvStr}-${affixesStr}`;
    }

    static getLv(equip: Equip): number {
        return equipModelDict[equip.id].lv + equip.growth;
    }

    static getCnName(equip: Equip, needSpace: boolean = false): string {
        if (equip.affixes.length > 0) {
            let name = '';
            for (let index = equip.affixes.length - 1; index >= 0; index--) {
                const affix = equip.affixes[index];
                name += featureModelDict[affix.id].cnBrief;
            }
            return name + (needSpace ? ' 之 ' : '之') + equipModelDict[equip.id].cnName;
        } else {
            return equipModelDict[equip.id].cnName;
        }
    }

    static getToken(e: Equip): string {
        return e ? String(e.catchIdx) : 'x'; // 可以用catchIdx代表唯一的装备，因为装备在创建，增加和变化时，都会更新catchIdx
    }

    static getFinalAttris(equip: Equip, attris: {} = null): {} {
        // 装备加成
        const setAttriByEquip = (attris: {}, equipModel: EquipModel, key: string, growth: number) => {
            if (equipModel[key] > 0) attris[key] += equipModel[key] + growth;
        };

        const equipModel = equipModelDict[equip.id];
        const finalAttris = attris || {
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

    static getPrice(equip: Equip) {
        return 100;
    }
}

export class CaughtPetDataTool {
    static create(id: string, lv: number, rank: number, features: Feature[]): CaughtPet {
        const cp = newInsWithChecker(CaughtPet);
        cp.id = 'cp_' + id;
        cp.petId = id;
        cp.lv = lv;
        cp.rank = rank;
        cp.features = features;
        return cp;
    }

    static getCnName(cpet: CaughtPet, needSpace: boolean = false): string {
        const petId = cpet.id.slice(3);
        let petName: string;
        if (cpet.features.length > 0) {
            let name = '';
            for (let index = 1; index >= 0; index--) {
                const feature = cpet.features[index];
                if (!feature) continue;
                name += featureModelDict[feature.id].cnBrief;
            }
            petName = name + (needSpace ? ' 之 ' : '之') + PetDataTool.getOriNameById(petId);
        } else {
            petName = PetDataTool.getOriNameById(petId);
        }

        return '捕获：' + petName;
    }

    static getPrice(cpet: CaughtPet): number {
        return 100;
    }
}

export class PosDataTool {
    static create(posId: string): PosData {
        const pd = newInsWithChecker(PosData);
        pd.id = posId;
        pd.actDict = newDict();
        return pd;
    }

    static createPADExpl(): PADExpl {
        const pADExpl = newInsWithChecker(PADExpl);
        pADExpl.doneStep = 0;
        return pADExpl;
    }

    static createPADEqpMkt(): PADEqpMkt {
        const pADEqpMkt = newInsWithChecker(PADEqpMkt);
        pADEqpMkt.eqps = [];
        pADEqpMkt.updateTime = 0;
        pADEqpMkt.refreshCnt = 0;
        return pADEqpMkt;
    }

    static createPADPetMkt(): PADPetMkt {
        const pADPetMkt = newInsWithChecker(PADPetMkt);
        pADPetMkt.pets = [];
        pADPetMkt.updateTime = 0;
        pADPetMkt.refreshCnt = 0;
        return pADPetMkt;
    }

    static createPADQuester(): PADQuester {
        const pADQuester = newInsWithChecker(PADQuester);
        pADQuester.updateTime = 0;
        pADQuester.questIds = [];
        return pADQuester;
    }

    static createPADACntr(): PADACntr {
        const pADACntr = newInsWithChecker(PADACntr);
        pADACntr.soldoutList = [];
        return pADACntr;
    }
}

export class MmrTool {
    static createExplMmr(startStep: number): ExplMmr {
        const expl = newInsWithChecker(ExplMmr);
        expl.startTime = Date.now();
        expl.chngUpdCnt = 0;
        expl.startStep = startStep;
        expl.hiding = false;
        expl.catcherId = null;
        return expl;
    }

    static createBattleMmr(seed: number, startUpdCnt: number, spcBtlId: number): BattleMmr {
        const battle = newInsWithChecker(BattleMmr);
        battle.startUpdCnt = startUpdCnt;
        battle.seed = seed;
        battle.selfs = newList();
        battle.enemys = newList();
        battle.spcBtlId = spcBtlId;
        return battle;
    }

    static createSelfPetMmr(pet: Pet): SelfPetMmr {
        const selfPetMmr = newInsWithChecker(SelfPetMmr);
        selfPetMmr.catchIdx = pet.catchIdx;
        selfPetMmr.prvty = pet.prvty;
        const tokens = [];
        for (const equip of pet.equips) tokens.push(EquipDataTool.getToken(equip));
        selfPetMmr.eqpTokens = newList(tokens);
        return selfPetMmr;
    }

    static createPetMmr(id: string, lv: number, rank: number, features: Feature[]): PetMmr {
        const p = newInsWithChecker(PetMmr);
        p.id = id;
        p.lv = lv;
        p.rank = rank;
        p.features = newList();
        for (const feature of features) p.features.push(FeatureDataTool.clone(feature));
        return p;
    }

    static getExplStepFromUpdCnt(updCnt: number): number {
        for (let idx = 0; idx < UpdCntByStep.length; idx++) {
            if (updCnt < UpdCntByStep[idx]) return idx;
        }
        return UpdCntByStep.length;
    }

    static getUpdCntFromExplStep(step: number): number {
        if (step >= UpdCntByStep.length) return 999999999;
        let updCnt = 0;
        for (let idx = 0; idx < step; idx++) updCnt += UpdCntByStep[idx];
        return updCnt;
    }

    static getCurStep(curExpl: ExplMmr) {
        const startUpdCnt = this.getUpdCntFromExplStep(curExpl.startStep);
        return this.getExplStepFromUpdCnt(startUpdCnt + curExpl.chngUpdCnt);
    }
}

export class GameDataTool {
    static SUC: string = 'K';

    static init(gameData: GameData) {
        gameData.posDataDict = newDict();
        gameData.pets = newList();
        gameData.items = newList();

        const money = newInsWithChecker(Money);
        money.sum = 0;
        gameData.items.push(money);

        gameData.weight = 0;
        gameData.totalPetCount = 0;

        gameData.curPosId = '';
        gameData.curExpl = null;
    }

    // -----------------------------------------------------------------

    static addPet(
        gameData: GameData,
        id: string,
        lv: number,
        rank: number,
        features: Feature[],
        callback: (pet: Pet) => void = null
    ): string {
        if (gameData.pets.length >= this.getPetCountMax(gameData)) return '精灵数量到达上限';

        gameData.totalPetCount++;

        const pet = PetDataTool.create(id, lv, rank, features, gameData);
        gameData.pets.push(pet);

        this.sortPetsByState(gameData);

        if (callback) callback(pet);

        return this.SUC;
    }

    static movePetInList(gameData: GameData, from: number, to: number): string {
        if (from < 0 || gameData.pets.length <= from || to < 0 || gameData.pets.length <= to) return '请勿把项目移出列表范围';
        const pet = gameData.pets[from];
        gameData.pets.splice(from, 1);
        gameData.pets.splice(to, 0, pet);
        this.sortPetsByState(gameData);
        return this.SUC;
    }

    static deletePet(gameData: GameData, index: number): string {
        const curCatchIdx = gameData.pets[index].catchIdx;
        if (gameData.curExpl && gameData.curExpl.curBattle) {
            for (const petMmr of gameData.curExpl.curBattle.selfs) {
                if (curCatchIdx === petMmr.catchIdx) return '当前精灵处于战斗状态，无法放生';
            }
        }
        gameData.pets.splice(index, 1);
        return this.SUC;
    }

    static sortPetsByState(gameData: GameData) {
        gameData.pets.sort((a: Pet, b: Pet): number => {
            return a.state - b.state;
        });
    }

    // -----------------------------------------------------------------

    static useDrinkToPet(gameData: GameData, pet: Pet, drink: Drink, curTime: number = null): string {
        const drinkModel: DrinkModel = drinkModelDict[drink.id];

        if (pet.drinkTime > 0) {
            if (Date.now() - pet.drinkTime < 10 * 60 * 1000) return '10分钟内不能重复使用饮品';
        }

        if (pet.lv > drinkModel.lvMax) return `${drinkModel.cnName}不能作用于等级高于${drinkModel.lvMax}的精灵`;

        GameJITDataTool.addAmplByDrink(pet, drinkModel);

        pet.drink = CnsumDataTool.create(Drink, drink.id); // 不用 pet.drink = drink，是因为drink内部有count代表多个
        pet.drinkTime = curTime || Date.now();

        return this.SUC;
    }

    static clearDrinkFromPet(pet: Pet) {
        const drink = pet.drink;
        const drinkModel: DrinkModel = drinkModelDict[drink.id];

        if (drinkModel.aim === DrinkAimType.one) {
            GameJITDataTool.removeAmpl(pet, drinkModel.id);
        } else {
            GameJITDataTool.removeAmpl(null, `${pet.catchIdx}_${drinkModel.id}`);
        }

        pet.drink = null;
        pet.drinkTime = 0;
    }

    // -----------------------------------------------------------------

    static addCnsum(gameData: GameData, cnsumId: string, count: number = 1, callback: (cnsum: Cnsum) => void = null): string {
        if (gameData.weight >= this.getItemCountMax(gameData)) return '道具数量到达最大值';
        gameData.weight += count;

        let itemIdx: number = -1;
        for (let index = 0; index < gameData.items.length; index++) {
            const itemInList = gameData.items[index];
            if (itemInList.itemType !== ItemType.cnsum) continue;
            if (itemInList.id === cnsumId) {
                itemIdx = index;
                break;
            }
        }

        if (itemIdx === -1) {
            const cnsumClass = CnsumDataTool.getClassById(cnsumId);
            const realCnsum: Cnsum = CnsumDataTool.create(cnsumClass, cnsumId, count);
            gameData.items.push(realCnsum);
            if (callback) callback(realCnsum);
        } else {
            const cnsumInList = gameData.items[itemIdx] as Cnsum;
            cnsumInList.count += count;
            if (callback) callback(cnsumInList);
        }

        return this.SUC;
    }

    static addEquip(gameData: GameData, equip: Equip, callback: (equip: Equip) => void = null): string {
        if (gameData.weight >= this.getItemCountMax(gameData)) return '道具数量到达最大值';
        gameData.weight++;

        gameData.totalEquipCount++;
        equip.catchIdx = gameData.totalEquipCount;

        gameData.items.push(equip);

        if (callback) callback(equip);
        return this.SUC;
    }

    static addCaughtPet(
        gameData: GameData,
        id: string,
        lv: number,
        rank: number,
        features: Feature[],
        callback: (cp: CaughtPet) => void = null
    ): string {
        if (gameData.weight >= this.getItemCountMax(gameData)) return '道具数量到达最大值';
        gameData.weight++;

        const cp = CaughtPetDataTool.create(id, lv, rank, features);
        gameData.items.push(cp);

        if (callback) callback(cp);
        return this.SUC;
    }

    static moveItemInList(gameData: GameData, from: number, to: number): string {
        if (from < 0 || gameData.items.length <= from || to < 0 || gameData.items.length <= to) return '请勿把项目移出列表范围';
        if (from === 0 || to === 0) return '货币项目必在首位，不可移动';
        const item = gameData.items[from];
        gameData.items.splice(from, 1);
        gameData.items.splice(to, 0, item);
        return this.SUC;
    }

    static deleteItem(gameData: GameData, index: number, count: number = 1): string {
        if (index < 0 || gameData.items.length <= index) return '索引错误';
        if (index === 0) return '货币项目不可删除';

        const curItem = gameData.items[index];
        if (curItem.itemType === ItemType.cnsum) {
            // 根据cnsum的数量减少重量
            const cnsum = curItem as Cnsum;
            if (cnsum.count < count) {
                return '删除数量大于实际数量';
            } else if (cnsum.count === count) {
                gameData.items.splice(index, 1);
            } else if (cnsum.count > count) {
                cnsum.count -= count;
            }
        } else if (curItem.itemType === ItemType.equip) {
            if (gameData.curExpl && gameData.curExpl.curBattle) {
                const curEquipToken = EquipDataTool.getToken(curItem as Equip);
                for (const petMmr of gameData.curExpl.curBattle.selfs) {
                    for (const itemToken of petMmr.eqpTokens) {
                        if (curEquipToken === itemToken) return '该物品被战斗中精灵持有，无法丢弃';
                    }
                }
            }
            gameData.items.splice(index, 1);
        } else if (curItem.itemType === ItemType.caughtPet) {
            gameData.items.splice(index, 1);
        } else {
            return '类型错误';
        }

        gameData.weight -= count;
        return this.SUC;
    }

    static handleMoney(gameData: GameData, callback: (money: Money) => void) {
        callback(gameData.items[0] as Money);
    }

    static getMoney(gameData: GameData): number {
        return (gameData.items[0] as Money).sum;
    }

    static UNWIELD: number = -666;

    static wieldEquip(gameData: GameData, itemIdx: number, pet: Pet, petEquipIdx: number): string {
        if (petEquipIdx < 0 || PetEquipCountMax <= petEquipIdx) return '精灵装备栏索引错误';
        if (itemIdx !== this.UNWIELD) {
            const item = gameData.items[itemIdx];
            if (!item || item.itemType !== ItemType.equip) return '装备索引有误';

            const equip = item as Equip;
            const equipPosType = equipModelDict[equip.id].equipPosType;
            for (const equipHeld of pet.equips) {
                if (!equipHeld) continue;
                if (equipModelDict[equipHeld.id].equipPosType !== equipPosType) continue;
                const strs = ['', '武器', '防具', '饰品'];
                return '一只精灵同时只能持有一件' + strs[equipPosType];
            }

            const equipModel = equipModelDict[equip.id];
            const petModel = petModelDict[pet.id];
            const sameBio = equipModel.bioType === petModel.bioType;
            const lvReduce = -2;
            const equipCalcLv = equipModel.lv + (sameBio ? lvReduce : 0);
            if (pet.lv < equipCalcLv) {
                const sameBioStr = sameBio ? `\n（生物类型一致，需求${lvReduce}）` : '';
                return `精灵等级L${pet.lv}不满足该装备需求等级L${equipCalcLv}${sameBioStr}`;
            }

            const oldEquip = pet.equips[petEquipIdx];
            pet.equips[petEquipIdx] = equip;
            if (oldEquip) {
                gameData.items[itemIdx] = oldEquip;
            } else {
                gameData.items.splice(itemIdx, 1);
                gameData.weight--;
            }
        } else {
            const oldEquip = pet.equips[petEquipIdx];
            if (!oldEquip) return '空和空无法交换';
            if (gameData.items.length >= this.getItemCountMax(gameData)) return '道具数量到达最大值';

            gameData.items.push(oldEquip);
            pet.equips[petEquipIdx] = undefined;
            gameData.weight++;
        }

        return this.SUC;
    }

    static growForEquip(gameData: GameData, equip: Equip): string {
        equip.growth++;
        gameData.totalEquipCount++;
        equip.catchIdx = gameData.totalEquipCount;
        return this.SUC;
    }

    static addAffixForEquip(gameData: GameData, equip: Equip): string {
        // llytodo
        gameData.totalEquipCount++;
        equip.catchIdx = gameData.totalEquipCount;
        return this.SUC;
    }

    static moveEquipInPetList(gameData: GameData, pet: Pet, from: number, to: number): string {
        const equips = pet.equips;
        if (from < 0 || equips.length <= from || to < 0 || equips.length <= to) return '请勿把项目移出列表范围';

        const equip = equips[from];
        equips.splice(from, 1);
        equips.splice(to, 0, equip);
        return this.SUC;
    }

    // -----------------------------------------------------------------

    static addPos(gameData: GameData, posId: string): PosData {
        if (!gameData.posDataDict.hasOwnProperty(posId)) {
            const pd = PosDataTool.create(posId);
            gameData.posDataDict[posId] = pd;
            return pd;
        } else return gameData.posDataDict[posId];
    }

    static addPA(gameData: GameData, posId: string, paKey: string): PADBase {
        const pd = GameDataTool.addPos(gameData, posId);
        if (!pd.actDict.hasOwnProperty(paKey)) {
            let pad: PADBase;
            if (paKey === PAKey.expl) pad = PosDataTool.createPADExpl();
            else if (paKey === PAKey.eqpMkt) pad = PosDataTool.createPADEqpMkt();
            else if (paKey === PAKey.petMkt) pad = PosDataTool.createPADPetMkt();
            else if (paKey === PAKey.aCntr) pad = PosDataTool.createPADACntr();
            pd.actDict[paKey] = pad;
            return pad;
        } else return pd.actDict[paKey];
    }

    static getReputRank(gameData: GameData, posId: string): ReputRank {
        const reput = gameData.posDataDict[posId].reput;
        return ReputRank.renown;
    }

    static createExpl(gameData: GameData, startStep: number) {
        if (gameData.curExpl) return;
        const expl = MmrTool.createExplMmr(startStep);
        expl.curPosId = gameData.curPosId;
        gameData.curExpl = expl;
    }

    static deleteExpl(gameData: GameData) {
        if (gameData.curExpl) gameData.curExpl = null;
    }

    static createBattle(gameData: GameData, seed: number, startUpdCnt: number, spcBtlId: number, ePets: Pet[]) {
        cc.assert(gameData.curExpl, '创建battle前必有Expl');
        const curExpl = gameData.curExpl;
        if (curExpl.curBattle) return;
        const battle = MmrTool.createBattleMmr(seed, startUpdCnt, spcBtlId);

        for (const pet of this.getReadyPets(gameData)) battle.selfs.push(MmrTool.createSelfPetMmr(pet));
        for (const pet of ePets) battle.enemys.push(MmrTool.createPetMmr(pet.id, pet.lv, pet.rank, pet.inbornFeatures));

        curExpl.curBattle = battle;
    }

    static getReadyPets(gameData: GameData): Pet[] {
        const pets: Pet[] = [];
        for (const pet of gameData.pets) {
            if (pet.state !== PetState.ready) break; // 备战的pet一定在最上，且不会超过5个
            pets[pets.length] = pet;
        }
        return pets;
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

    // -----------------------------------------------------------------
}
