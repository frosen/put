/*
 * ConfigsChecker.ts
 * 配置检测器
 * luleyan
 */

import { PetModelDict } from '../configs/PetModelDict';
import { ActPosModelDict, PAKey } from '../configs/ActPosModelDict';
import { SkillModelDict } from '../configs/SkillModelDict';
import { BuffModelDict } from '../configs/BuffModelDict';
import { FeatureModelDict, NormalFeatureModelDict } from '../configs/FeatureModelDict';
import { EquipModelDict } from '../configs/EquipModelDict';
import { DrinkModelDict } from '../configs/DrinkModelDict';
import { CatcherModelDict } from '../configs/CatcherModelDict';
import { EqpAmplrModelDict } from '../configs/EqpAmplrModelDict';
import { ACntrModel, EqpMktModel, ExplModel, PetMktModel, QuesterModel, ShopModel } from './DataModel';
import { CnsumTool } from './Memory';

function need(ins: any, attris: string[], name: string) {
    for (const attri of attris) {
        if (!ins.hasOwnProperty(attri)) cc.error(`${name}中，缺少一个必要项目${attri}`);
    }
}

function needAtLeast(ins: any, attris: string[], num: number, name: string) {
    let noAttris = [];
    for (const attri of attris) {
        if (!ins.hasOwnProperty(attri)) noAttris.push(attri);
    }
    if (attris.length - noAttris.length < num) {
        cc.error(`${name}中，至少需要${attris}中的${num}个，但现在缺少${noAttris}`);
    }
}

function checkActPosModelDict() {
    for (const key in ActPosModelDict) {
        const model = ActPosModelDict[key];
        if (model.id !== key) cc.error('ActPosModelDict中，id与dict的key不符', key, model.id);

        for (const pakey in model.actMDict) {
            const actModel = model.actMDict[pakey];

            const petDictKeys = Object.keys(PetModelDict);
            const eqpDictKeys = Object.keys(EquipModelDict);
            if (pakey === PAKey.expl) {
                need(actModel, Object.keys(ExplModel), key + ':' + pakey);

                for (const petIdList of (actModel as ExplModel).petIdLists) {
                    if (petIdList.length < 5) {
                        cc.error('ActPosModelDict expl中，petIdList的len不能<5，否则影响恢复时回合数计算', key);
                    }
                    for (const petId of petIdList) {
                        if (!petDictKeys.includes(petId)) cc.error('ActPosModelDict expl中，petIdLists中的petId有误', key, petId);
                    }
                }
                for (const eqpIdList of (actModel as ExplModel).eqpIdLists) {
                    if (!eqpIdList) continue;
                    for (const eqpId of eqpIdList) {
                        if (!eqpDictKeys.includes(eqpId))
                            cc.error('ActPosModelDict expl中，EquipModelDict中的eqpId有误', key, eqpId);
                    }
                }
                for (const itemIdList of (actModel as ExplModel).itemIdLists) {
                    if (!itemIdList) continue;
                    for (const itemId of itemIdList) {
                        const type = CnsumTool.getTypeById(itemId);
                        if (!type) cc.error('ActPosModelDict expl中，itemIdList中的itemId有误', key, itemId);
                    }
                }
            } else if (pakey === PAKey.shop) {
                need(actModel, Object.keys(ShopModel), key + ':' + pakey);
                for (const itemId of (actModel as ShopModel).goodsIdList) {
                    const type = CnsumTool.getTypeById(itemId);
                    if (!type) cc.error('ActPosModelDict shop中，itemIdList中的itemId有误', key, itemId);
                }
            } else if (pakey === PAKey.eqpMkt) {
                need(actModel, Object.keys(EqpMktModel), key + ':' + pakey);
                for (const eqpIdList of (actModel as EqpMktModel).eqpIdLists) {
                    if (!eqpIdList) continue;
                    for (const eqpId of eqpIdList) {
                        if (!eqpDictKeys.includes(eqpId))
                            cc.error('ActPosModelDict eqpMkt中，EquipModelDict中的eqpId有误', key, eqpId);
                    }
                }
            } else if (pakey === PAKey.petMkt) {
                need(actModel, Object.keys(PetMktModel), key + ':' + pakey);
                for (const petIdList of (actModel as PetMktModel).petIdLists) {
                    if (!petIdList) continue;
                    for (const petId of petIdList) {
                        if (!petDictKeys.includes(petId))
                            cc.error('ActPosModelDict petMkt中，petIdLists中的petId有误', key, petId);
                    }
                }
            } else if (pakey === PAKey.quester) {
                need(actModel, Object.keys(QuesterModel), key + ':' + pakey);
            } else if (pakey === PAKey.aCntr) {
                need(actModel, Object.keys(ACntrModel), key + ':' + pakey);
            }
        }

        for (const mov of model.movs) {
            if (!Object.keys(ActPosModelDict).includes(mov.id)) cc.error('ActPosModelDict中，mov的id不存在', mov.id);
        }
    }
}

function checkPetModelDict() {
    const nameDict = {};
    for (const key in PetModelDict) {
        const model = PetModelDict[key];
        if (model.id !== key) cc.error('PetModelDict中，id与dict的key不符', key, model.id);
        if (nameDict[model.cnName] === true) cc.error('PetModelDict中，name重复了', key);
        nameDict[model.cnName] = true;

        for (const skillId of model.selfSkillIds) {
            if (!SkillModelDict.hasOwnProperty(skillId)) cc.error('pet model中的skillId有误', key, skillId);
        }

        for (const featureId of model.selfFeatureIds) {
            if (!NormalFeatureModelDict.hasOwnProperty(featureId)) cc.error('pet model中的featureId有误', key, featureId);
        }
    }
}

function checkSkillModelDict() {
    const buffDictKeys = Object.keys(BuffModelDict);
    const nameDict = {};
    for (const key in SkillModelDict) {
        const model = SkillModelDict[key];
        if (model.id !== key) cc.error('SkillModelDict中，id与dict的key不符', key, model.id);
        if (nameDict[model.cnName] === true) cc.error('skillBriefDict中，name重复了', key);
        nameDict[model.cnName] = true;

        if (model.mainBuffId && !buffDictKeys.includes(model.mainBuffId))
            cc.error('skill model中的mainBuffId有误', key, model.mainBuffId);
        if (model.subBuffId && !buffDictKeys.includes(model.subBuffId))
            cc.error('skill model中的subBuffId有误', key, model.subBuffId);
    }
}

function checkBuffModelDict() {
    const nameDict = {};
    for (const key in BuffModelDict) {
        const model = BuffModelDict[key];
        if (model.id !== key) cc.error('BuffModelDict中，id与dict的key不符', key, model.id);
        needAtLeast(model, ['onStarted', 'onEnd', 'onTurnEnd'], 1, 'BuffModelDict');

        if (nameDict[model.brief] === true) cc.error('BuffModelDict中，brief重复了', key);
        if (nameDict[model.cnName] === true) cc.error('BuffModelDict中，cnName重复了', key);
        nameDict[model.brief] = true;
        nameDict[model.cnName] = true;
    }
}

function checkFeatureModelDict() {
    const nameDict = {};

    for (const key in FeatureModelDict) {
        const model = FeatureModelDict[key];
        if (model.id !== key) cc.error('FeatureModelDict中，id与dict的key不符：', key, model.id);
        if (nameDict[model.cnBrief] === true) cc.error('FeatureModelDict中，cnBrief重复了：', key);
        nameDict[model.cnBrief] = true;
        needAtLeast(
            model,
            ['onBaseSetting', 'onSetting', 'onBtlStart', 'onAtk', 'onCast', 'onHurt', 'onHeal', 'onEDead', 'onDead', 'onTurn'],
            1,
            'FeatureModelDict'
        );
    }
}

function checkEquipModelDict() {
    const nameDict = {};
    for (const key in EquipModelDict) {
        const model = EquipModelDict[key];
        if (model.id !== key) cc.error('EquipModelDict中，id与dict的key不符：', key, model.id);
        if (nameDict[model.cnName] === true) cc.error('EquipModelDict中，name重复了', key);
        nameDict[model.cnName] = true;

        const featureIds = model.featureIds;
        for (const featureId of featureIds) {
            if (!NormalFeatureModelDict.hasOwnProperty(featureId)) {
                cc.error('EquipModelDict中，feature有误：', key, featureId);
            }
        }
    }
}

function checkItems() {
    const allKeys = {};
    function checkKey(key: string, dictName: string) {
        if (allKeys.hasOwnProperty(key)) {
            cc.error(`${dictName}中存在重复的id${key}`);
        } else {
            allKeys[key] = true;
        }
    }
    function checkAllKeys(dict: Object, name: string) {
        for (const key in dict) checkKey(key, name);
    }

    checkAllKeys(EquipModelDict, 'EquipModelDict');
    checkAllKeys(DrinkModelDict, 'DrinkModelDict');
    checkAllKeys(CatcherModelDict, 'CatcherModelDict');
    checkAllKeys(EqpAmplrModelDict, 'EqpAmplrModelDict');
}

export function checkConfigs() {
    try {
        checkActPosModelDict();
        checkPetModelDict();
        checkSkillModelDict();
        checkBuffModelDict();
        checkFeatureModelDict();
        checkEquipModelDict();
        checkItems();
    } catch (error) {
        cc.log('CHECK ERROR: ', error);
    }
}
