/*
 * Memory.ts
 * 储存
 * luleyan
 */

import { petModelDict } from 'configs/PetModelDict';
import { featureModelDict } from 'configs/FeatureModelDict';
import {
    Feature,
    Pet,
    ExplMmr,
    PetState,
    SPetMmr,
    BattleMmr,
    EPetMmr,
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
    PosData,
    PADExpl,
    ZUAN,
    JIN,
    KUAI,
    PADEqpMkt,
    PADPetMkt,
    PADQuester,
    PADACntr,
    PADBase,
    Quest,
    AcceQuestInfo,
    QuestDLineType,
    QuestAmplType,
    QuestAmplRates,
    QuestAmplAwardRates,
    QuestDLineAwardRates
} from './DataSaved';
import {
    FeatureModel,
    EquipPosType,
    EquipModel,
    DrinkModel,
    CnsumModel,
    PAKey,
    ReputRank,
    QuestType,
    QuestModel
} from './DataModel';
import { equipModelDict } from 'configs/EquipModelDict';
import { randomInt, randomRate, getRandomOneInListWithRate, getRandomOneInList } from './Random';
import { equipIdsByLvRank } from 'configs/EquipIdsByLvRank';
import { skillIdsByEleType } from 'configs/SkillIdsByEleType';
import { GameJITDataTool, AmplAttriType } from './DataOther';
import { drinkModelDict } from 'configs/DrinkModelDict';
import { expModels } from 'configs/ExpModels';
import { catcherModelDict } from 'configs/CatcherModelDict';
import { eqpAmplrModelDict } from 'configs/EqpAmplrModelDict';
import { materialModelDict } from 'configs/MaterialModelDict';
import { questModelDict } from 'configs/QuestModelDict';
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
        cc.log('STORM 保存 ');
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
        const curTime = Date.now();
        const Interval = 60 * 1000; // 每1分钟检测一次
        if (curTime - this.lastUpdateTime >= Interval) {
            this.lastUpdateTime = curTime;
            this.updateGameDataReal(gameData, curTime);
        }
    }

    static updateGameDataReal(gameData: GameData, curTime: number) {
        for (const pet of gameData.pets) {
            if (pet.prvty < PrvtyMax) {
                const Range = 10 * 60 * 1000; // 默契值 10min1点
                if (curTime - pet.prvtyTime > Range) {
                    const count = Math.floor((curTime - pet.prvtyTime) / Range);
                    if (pet.state === PetState.ready || pet.state === PetState.rest) {
                        pet.prvty += Math.floor(100 * GameJITDataTool.getAmplRate(pet, AmplAttriType.prvty) * count);
                        pet.prvty = Math.min(pet.prvty, PrvtyMax);
                    }
                    pet.prvtyTime += Range * count;
                }
            }

            if (pet.drink) {
                if (curTime - pet.drinkTime >= drinkModelDict[pet.drink.id].dura) {
                    GameDataTool.clearDrinkFromPet(pet);
                }
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
        this.gameData.curPosId = 'YiZhuangJiDi';

        let pet = PetTool.createWithRandomFeature('FaTiaoWa', 30);
        GameDataTool.addPet(this.gameData, pet.id, pet.lv, pet.exFeatureIds, pet.inbFeatures, (pet: Pet) => {
            pet.state = PetState.ready;
            pet.nickname = '妙妙';
            pet.prvty = 400000;
            pet.equips[0] = EquipTool.createRandomByLv(15, 20);
        });

        pet = PetTool.createWithRandomFeature('YaHuHanJuRen', 30);
        GameDataTool.addPet(this.gameData, pet.id, pet.lv, pet.exFeatureIds, pet.inbFeatures, (pet: Pet) => {
            pet.state = PetState.ready;
            pet.prvty = 400000;
            pet.drink = CnsumTool.create(Drink, 'LingGanYaoJi2');
            pet.drinkTime = Date.now();
        });

        pet = PetTool.createWithRandomFeature('BaiLanYuYan', 30);
        GameDataTool.addPet(this.gameData, pet.id, pet.lv, pet.exFeatureIds, pet.inbFeatures, (pet: Pet) => {
            pet.state = PetState.ready;
            pet.prvty = 400000;
            const f = newInsWithChecker(Feature);
            f.id = 'hitWithDark';
            f.lv = 1;
            pet.lndFeatures.push(f);
        });

        pet = PetTool.createWithRandomFeature('HeiFengWuRenJi', 30);
        GameDataTool.addPet(this.gameData, pet.id, pet.lv, pet.exFeatureIds, pet.inbFeatures);

        pet = PetTool.createWithRandomFeature('CiHuaYouLing', 29);
        GameDataTool.addPet(this.gameData, pet.id, pet.lv, pet.exFeatureIds, pet.inbFeatures);

        // GameDataTool.handleMoney(this.gameData, money => (money.sum += 15643351790));

        GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(21, 25));
        GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(21, 25));
        GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(21, 25));

        GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(11, 15));
        GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(11, 15));
        GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(11, 15));

        // GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(30, 33));
        // GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(30, 33));
        // GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(30, 33));

        // GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(15, 20));
        // GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(15, 20));
        // GameDataTool.addEquip(this.gameData, EquipTool.createRandomByLv(15, 20));

        GameDataTool.addCnsum(this.gameData, 'LingGanYaoJi1', 2);

        GameDataTool.addCnsum(this.gameData, 'PuTongXianJing1', 20);
        GameDataTool.addCnsum(this.gameData, 'CiLiPan1', 2);
        GameDataTool.addCnsum(this.gameData, 'DaMoShi', 2);
        GameDataTool.addCnsum(this.gameData, 'YingZhiChiLun', 33);
        GameDataTool.handleMoney(this.gameData, (money: Money) => (money.sum += 1000));

        const cPet = CaughtPetTool.createByPet(PetTool.createWithRandomFeature('BaiLanYuYan', 3));
        GameDataTool.addCaughtPet(this.gameData, cPet);

        this.gameData.curPosId = 'GuangJiDianZhiLu';
        actPosModelDict[this.gameData.curPosId].lv = 30;
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

export class FeatureTool {
    static create(id: string, lv: number): Feature {
        const newFeature = newInsWithChecker(Feature);
        newFeature.id = id;
        newFeature.lv = lv;
        return newFeature;
    }

    static clone(feature: Feature): Feature {
        const newFeature = newInsWithChecker(Feature);
        newFeature.id = feature.id;
        newFeature.lv = feature.lv;
        return newFeature;
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
}

export class PetTool {
    static create(id: string, lv: number, exFeatureIds: string[], features: Feature[]): Pet {
        const pet = newInsWithChecker(Pet);

        pet.id = id;
        pet.nickname = '';
        pet.master = '';

        pet.catchTime = 0;
        pet.catchIdx = 0;
        pet.catchLv = 0;

        pet.state = PetState.rest;

        pet.lv = lv;

        pet.prvty = 0;
        pet.prvtyTime = 0;

        pet.drink = null;
        pet.drinkTime = 0;

        pet.exp = 0;

        pet.exFeatureIds = newList();
        pet.inbFeatures = newList();
        pet.lndFeatures = newList();

        for (const featureId of exFeatureIds) pet.exFeatureIds.push(featureId);
        for (const feature of features) pet.inbFeatures.push(FeatureTool.clone(feature));

        const equips = [];
        for (let index = 0; index < PetEquipCountMax; index++) equips.push(null);
        pet.equips = newList(equips);

        pet.merges = newList();

        return pet;
    }

    static createWithRandomFeature(id: string, lv: number): Pet {
        const model = petModelDict[id];
        const selfFeatureIds = model.selfFeatureIds;

        const exFIds = [];
        const exFR = Math.random();
        if (lv > 10 && exFR > 0.4) exFIds.push(getRandomOneInList(selfFeatureIds)); // 有一定等级的怪物才会有天赋
        if (lv > 20 && exFR > 0.8) exFIds.push(getRandomOneInList(selfFeatureIds));

        if (exFIds.length === 2 && exFIds[0] === exFIds[1]) exFIds.length = 1; // 天赋特性不能重复

        const features = [];
        for (const exFId of exFIds) {
            const feature = FeatureTool.create(exFId, 1 + randomInt(3));
            features.push(feature);
        }

        const pet = PetTool.create(id, lv, exFIds, features);
        for (let curLv = 0; curLv <= lv; curLv++) {
            PetTool.addFeatureByLvUp(pet, curLv);
        }

        return pet;
    }

    static getRandomFeatures(lv: number): Feature[] {
        const features = [];

        return features;
    }

    static getCnName(pet: Pet, needSpace: boolean = false): string {
        if (pet.nickname) return pet.nickname;
        else return PetTool.getBaseCnName(pet, needSpace);
    }

    static getBaseCnName(pet: Pet, needSpace: boolean = false): string {
        if (pet.exFeatureIds.length === 1) {
            const name = featureModelDict[pet.exFeatureIds[0]].cnBrief;
            return name + (needSpace ? ' 之 ' : '之') + PetTool.getOriNameById(pet.id);
        } else if (pet.exFeatureIds.length === 2) {
            let name = '';
            for (let index = pet.exFeatureIds.length - 1; index >= 0; index--) {
                const id = pet.exFeatureIds[index];
                name += featureModelDict[id].cnBrief;
            }
            return name + (needSpace ? ' ' : '') + PetTool.getOriNameById(pet.id);
        } else {
            return PetTool.getOriNameById(pet.id);
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
                callback(featureModelDict[featureId], FeatureTool.getDatas(featureId, lv));
            }
            for (const feature of equip.affixes) {
                callback(featureModelDict[feature.id], FeatureTool.getDatas(feature.id, feature.lv));
            }
        }

        for (const feature of pet.inbFeatures) {
            callback(featureModelDict[feature.id], FeatureTool.getDatas(feature.id, feature.lv));
        }

        for (const feature of pet.lndFeatures) {
            callback(featureModelDict[feature.id], FeatureTool.getDatas(feature.id, feature.lv));
        }
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
                PetTool.lvUp(pet, lv);

                return lvDiff + newExp / curExpMax;
            } else {
                lv++;
                newExp -= curExpMax;
            }
        }
    }

    static lvUp(pet: Pet, newLv: number) {
        const oldLv = pet.lv;
        pet.lv = newLv;
        for (let curLv = oldLv + 1; curLv <= newLv; curLv++) {
            PetTool.addFeatureByLvUp(pet, curLv);
        }
    }

    static addFeatureByLvUp(pet: Pet, curLv: number) {
        if (curLv >= 11 && (curLv - 11) % 3 === 0) {
            const addLv = 1;
            const model = petModelDict[pet.id];
            // 相邻次获取不一样的，不让一个feature格外的大
            const fromFront = (curLv - 11) % 6 === 0;
            const selfFeatureIds = fromFront ? model.selfFeatureIds.slice(0, 3) : model.selfFeatureIds.slice(3, 6);
            const id = getRandomOneInList(selfFeatureIds);
            for (const feature of pet.inbFeatures) {
                if (feature.id === id) {
                    feature.lv += addLv;
                    return;
                }
            }
            pet.inbFeatures.push(FeatureTool.create(id, addLv));
        }
    }

    static merge(pet: Pet, feature: Feature) {
        let petFeature: Feature = null;
        for (const lndFeature of pet.lndFeatures) {
            if (lndFeature.id === feature.id) {
                petFeature = lndFeature;
                break;
            }
        }

        if (petFeature) petFeature.lv += feature.lv;
        else pet.lndFeatures.push(FeatureTool.clone(feature));
    }
}

export class CnsumTool {
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

export class EquipTool {
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
        for (const feature of affixes) equip.affixes.push(FeatureTool.clone(feature));
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

export class CaughtPetTool {
    static create(id: string, lv: number, exFeatureIds: string[], features: Feature[]): CaughtPet {
        const cp = newInsWithChecker(CaughtPet);
        cp.id = 'cp_' + id;
        cp.petId = id;
        cp.lv = lv;
        cp.exFeatureIds = exFeatureIds;
        cp.features = features;
        return cp;
    }

    static createByPet(pet: Pet): CaughtPet {
        return CaughtPetTool.create(pet.id, pet.lv, pet.exFeatureIds, pet.inbFeatures);
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
            petName = name + (needSpace ? ' 之 ' : '之') + PetTool.getOriNameById(petId);
        } else {
            petName = PetTool.getOriNameById(petId);
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
        pADQuester.quests = [];
        pADQuester.doneTimeDict = {};
        return pADQuester;
    }

    static createPADACntr(): PADACntr {
        const pADACntr = newInsWithChecker(PADACntr);
        pADACntr.soldoutList = [];
        return pADACntr;
    }
}

export class QuestTool {
    static create(id: string, dLine: QuestDLineType, ampl: QuestAmplType): Quest {
        const quest = newInsWithChecker(Quest);
        quest.id = id;
        quest.startTime = Date.now();
        quest.progress = 0;
        quest.dLine = dLine;
        quest.ampl = ampl;
        return quest;
    }

    static getRealCount(quest: Quest): number {
        const model = questModelDict[quest.id];
        const count = model.need.count;
        return Math.floor(count * QuestAmplRates[quest.ampl]);
    }

    static getRealReput(quest: Quest): number {
        const model = questModelDict[quest.id];
        const reput = model.awardReput;
        return Math.floor(reput * QuestAmplAwardRates[quest.ampl] * QuestDLineAwardRates[quest.dLine]);
    }

    static getRealMoney(quest: Quest): number {
        const model = questModelDict[quest.id];
        const money = model.awardMoney;
        return Math.floor(money * QuestAmplAwardRates[quest.ampl] * QuestDLineAwardRates[quest.dLine]);
    }
}

export class MmrTool {
    static createExplMmr(startStep: number): ExplMmr {
        const expl = newInsWithChecker(ExplMmr);
        expl.startTime = Date.now();
        expl.startStep = startStep;
        expl.stepEnterTime = expl.startTime;
        expl.curStep = startStep;
        expl.chngUpdCnt = 0;
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

    static createSPetMmr(pet: Pet): SPetMmr {
        const selfPetMmr = newInsWithChecker(SPetMmr);
        selfPetMmr.catchIdx = pet.catchIdx;
        selfPetMmr.prvty = pet.prvty;
        const tokens = [];
        for (const equip of pet.equips) tokens.push(EquipTool.getToken(equip));
        selfPetMmr.eqpTokens = newList(tokens);
        return selfPetMmr;
    }

    static createEPetMmr(id: string, lv: number, exFeatureIds: string[], features: Feature[]): EPetMmr {
        const p = newInsWithChecker(EPetMmr);
        p.id = id;
        p.lv = lv;
        p.exFeatureIds = newList();
        p.features = newList();
        for (const featureId of exFeatureIds) p.exFeatureIds.push(featureId);
        for (const feature of features) p.features.push(FeatureTool.clone(feature));
        return p;
    }
}

export class AcceQuestInfoTool {
    static create(questId: string, posId: string): AcceQuestInfo {
        const questInfo = newInsWithChecker(AcceQuestInfo);
        questInfo.questId = questId;
        questInfo.posId = posId;
        return questInfo;
    }
}

export class GameDataTool {
    static SUC: string = 'K';

    static init(gameData: GameData) {
        gameData.profTitleIds = newList();

        gameData.pets = newList();
        gameData.totalPetCount = 0;

        gameData.items = newList();
        const money = newInsWithChecker(Money);
        money.sum = 0;
        gameData.items.push(money);
        gameData.weight = 0;
        gameData.totalEquipCount = 0;

        gameData.curPosId = '';
        gameData.posDataDict = newDict();

        gameData.curExpl = null;

        gameData.acceQuestInfos = newList();
    }

    // -----------------------------------------------------------------

    static addPet(
        gameData: GameData,
        id: string,
        lv: number,
        exFeatureIds: string[],
        features: Feature[],
        callback: (pet: Pet) => void = null
    ): string {
        if (gameData.pets.length >= this.getPetCountMax(gameData)) return '精灵数量到达上限';

        gameData.totalPetCount++;

        const pet = PetTool.create(id, lv, exFeatureIds, features);
        pet.master = 'XXX'; // llytodo 自己的名字
        pet.catchTime = Date.now();
        pet.catchIdx = gameData.totalPetCount;
        pet.catchLv = pet.lv;
        pet.prvtyTime = pet.catchTime;
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
        const pet = gameData.pets[index];
        if (pet.state !== PetState.rest) return '精灵未在休息状态，无法放生';

        const curCatchIdx = pet.catchIdx;
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

    static mergePet(gameData: GameData, petIdx: number, caughtPetIdx: number, featureId: string): string {
        const pet = gameData.pets[petIdx];
        if (pet.state !== PetState.rest) return '精灵未在休息状态，无法融合';

        const curCatchIdx = pet.catchIdx;
        if (gameData.curExpl && gameData.curExpl.curBattle) {
            for (const petMmr of gameData.curExpl.curBattle.selfs) {
                if (curCatchIdx === petMmr.catchIdx) return '当前精灵处于战斗状态，无法融合';
            }
        }

        const MergeStartLv = 10;
        const MergeIntervalLv = 5;
        if (pet.lv < MergeStartLv) return `精灵等级低于${MergeStartLv}级，无法融合`;

        const canCnt = Math.floor((pet.lv - MergeStartLv) / MergeIntervalLv) + 1; // 10级后每5级可有一次

        if (pet.merges.length >= canCnt) {
            const nextLv = canCnt * MergeIntervalLv + MergeStartLv;
            return `融合层数已达到上限，升至${nextLv}级时可继续增加上限`;
        }

        const caughtPet = gameData.items[caughtPetIdx] as CaughtPet;

        for (const merged of pet.merges) {
            if (merged.petId === caughtPet.petId) {
                const petName = petModelDict[caughtPet.petId].cnName;
                return `${petName}已被融合过\n不得融入2只同种类精灵`;
            }
        }

        let mergeFeature: Feature = null;
        for (const cFeature of caughtPet.features) {
            if (cFeature.id === featureId) {
                mergeFeature = cFeature;
                break;
            }
        }
        if (!mergeFeature) return `${caughtPet.id}不具备${featureId}`;

        const PrvtyDisplay = 30;
        const PrvtyNeed = PrvtyDisplay * PrvtyDisplay * 100;
        if (pet.prvty < PrvtyNeed) return `融合需要精灵默契值高于${PrvtyDisplay}`;

        const rzt = GameDataTool.deleteItem(gameData, caughtPetIdx);
        if (rzt !== this.SUC) return rzt;

        PetTool.merge(pet, mergeFeature);

        pet.prvty -= PrvtyNeed;

        return this.SUC;
    }

    // -----------------------------------------------------------------

    static useDrinkToPet(gameData: GameData, pet: Pet, drink: Drink, curTime: number = null): string {
        const drinkModel: DrinkModel = drinkModelDict[drink.id];

        if (pet.drinkTime > 0) {
            if (Date.now() - pet.drinkTime < 10 * 60 * 1000) return '10分钟内不能重复使用饮品';
        }

        if (pet.lv > drinkModel.lvMax) return `${drinkModel.cnName}不能作用于等级高于${drinkModel.lvMax}的精灵`;

        GameJITDataTool.addAmplByDrink(pet, drinkModel);

        pet.drink = CnsumTool.create(Drink, drink.id); // 不用 pet.drink = drink，是因为drink内部有count代表多个
        pet.drinkTime = curTime || Date.now();

        return this.SUC;
    }

    static clearDrinkFromPet(pet: Pet) {
        const drink = pet.drink;
        const drinkModel: DrinkModel = drinkModelDict[drink.id];
        GameJITDataTool.removeAmpl(pet, drinkModel.id);

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
            const cnsumClass = CnsumTool.getClassById(cnsumId);
            const realCnsum: Cnsum = CnsumTool.create(cnsumClass, cnsumId, count);
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

    static addCaughtPet(gameData: GameData, cp: CaughtPet, callback: (cp: CaughtPet) => void = null): string {
        if (gameData.weight >= this.getItemCountMax(gameData)) return '道具数量到达最大值';
        gameData.weight++;

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
                const curEquipToken = EquipTool.getToken(curItem as Equip);
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
            else if (paKey === PAKey.quester) pad = PosDataTool.createPADQuester();
            else if (paKey === PAKey.aCntr) pad = PosDataTool.createPADACntr();
            pd.actDict[paKey] = pad;
            return pad;
        } else return pd.actDict[paKey];
    }

    static addReput(gameData: GameData, posId: string, reput: number) {
        gameData.posDataDict[posId].reput += reput;
    }

    static getReputRank(gameData: GameData, posId: string): ReputRank {
        const reput = gameData.posDataDict[posId].reput;
        return ReputRank.renown;
    }

    // -----------------------------------------------------------------

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

        for (const pet of this.getReadyPets(gameData)) battle.selfs.push(MmrTool.createSPetMmr(pet));
        for (const pet of ePets) {
            battle.enemys.push(MmrTool.createEPetMmr(pet.id, pet.lv, pet.exFeatureIds, pet.inbFeatures));
        }

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

    static addAcceQuest(gameData: GameData, questId: string, posId: string): string {
        if (gameData.acceQuestInfos.length >= 10) return '任务数量已达到最大值\n请先完成已经接受了的任务';
        const quest = AcceQuestInfoTool.create(questId, posId);
        gameData.acceQuestInfos.push(quest);
        return this.SUC;
    }

    static deleteAcceQuest(gameData: GameData, questId: string, posId: string) {
        for (let index = 0; index < gameData.acceQuestInfos.length; index++) {
            const quest = gameData.acceQuestInfos[index];
            if (quest.posId === posId && quest.questId === questId) {
                gameData.acceQuestInfos.splice(index, 1);
                break;
            }
        }
    }

    static getNeedQuest(
        gameData: GameData,
        questType: QuestType,
        check: (quest: Quest, model: QuestModel) => boolean
    ): { quest: Quest; model: QuestModel } {
        for (const questInfo of gameData.acceQuestInfos) {
            const model = questModelDict[questInfo.questId];
            if (model.type !== questType) continue;
            const quests = (gameData.posDataDict[questInfo.posId].actDict[PAKey.quester] as PADQuester).quests;
            for (const quest of quests) {
                if (quest.id !== questInfo.questId) continue;
                if (quest.progress >= QuestTool.getRealCount(quest)) continue;
                if (!check(quest, model)) continue;
                return { quest, model };
            }
        }
        return null;
    }

    static eachNeedQuest(gameData: GameData, questType: QuestType, call: (quest: Quest, model: QuestModel) => void) {
        for (const questInfo of gameData.acceQuestInfos) {
            const model = questModelDict[questInfo.questId];
            if (model.type !== questType) continue;
            const quests = (gameData.posDataDict[questInfo.posId].actDict[PAKey.quester] as PADQuester).quests;
            for (const quest of quests) {
                if (quest.id !== questInfo.questId) continue;
                if (quest.progress >= QuestTool.getRealCount(quest)) continue;
                call(quest, model);
            }
        }
    }

    // -----------------------------------------------------------------

    static getPetCountMax(gameData: GameData) {
        return 10; // llytodo 根据职称不同而不同
    }

    static getItemCountMax(gameData: GameData) {
        return 300; // llytodo 根据职称不同而不同
    }

    static getPetNameLenMax(gameData: GameData) {
        return 2;
    }

    // -----------------------------------------------------------------
}
