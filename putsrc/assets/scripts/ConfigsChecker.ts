/*
 * ConfigsChecker.ts
 * 配置检测器
 * luleyan
 */

import { petModelDict } from 'configs/PetModelDict';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { skillModelDict } from 'configs/SkillModelDict';
import { buffModelDict } from 'configs/BuffModelDict';
import { featureModelDict } from 'configs/FeatureModelDict';
import { equipModelDict } from 'configs/EquipModelDict';
import { inbornFeatures } from 'configs/InbornFeatures';
import { drinkModelDict } from 'configs/DrinkModelDict';
import { catcherModelDict } from 'configs/CatcherModelDict';
import { eqpAmplrModelDict } from 'configs/EqpAmplrModelDict';
import { EqpMktModel, ExplModel, PAKey, PetMktModel, ShopModel } from './DataModel';
import { CnsumDataTool } from './Memory';

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
    for (const key in actPosModelDict) {
        const model = actPosModelDict[key];
        if (model.id !== key) cc.error('ActPosModelDict中，id与dict的key不符', key, model.id);

        for (const pakey in model.actMDict) {
            const actModel = model.actMDict[pakey];

            const petDictKeys = Object.keys(petModelDict);
            const eqpDictKeys = Object.keys(equipModelDict);
            if (pakey === PAKey.expl) {
                need(actModel, ['stepMax', 'petIdLists', 'itemIdLists', 'eqpIdLists'], key + 'expl');
                for (const petIdList of (actModel as ExplModel).petIdLists) {
                    if (!petIdList) continue;
                    for (const petId of petIdList) {
                        if (!petDictKeys.includes(petId)) cc.error('ActPosModelDict expl中，petIdLists中的petId有误', key, petId);
                    }
                }
                for (const eqpIdList of (actModel as ExplModel).eqpIdLists) {
                    if (!eqpIdList) continue;
                    for (const eqpId of eqpIdList) {
                        if (!eqpDictKeys.includes(eqpId))
                            cc.error('ActPosModelDict expl中，equipModelDict中的eqpId有误', key, eqpId);
                    }
                }
                for (const itemIdList of (actModel as ExplModel).itemIdLists) {
                    if (!itemIdList) continue;
                    for (const itemId of itemIdList) {
                        const type = CnsumDataTool.getTypeById(itemId);
                        if (!type) cc.error('ActPosModelDict expl中，itemIdList中的itemId有误', key, itemId);
                    }
                }
            } else if (pakey === PAKey.shop) {
                need(actModel, ['goodsIdList'], key + 'shop');
                for (const itemId of (actModel as ShopModel).goodsIdList) {
                    const type = CnsumDataTool.getTypeById(itemId);
                    if (!type) cc.error('ActPosModelDict shop中，itemIdList中的itemId有误', key, itemId);
                }
            } else if (pakey === PAKey.eqpMkt) {
                need(actModel, ['eqpIdLists'], key + 'eqpMkt');
                for (const eqpIdList of (actModel as EqpMktModel).eqpIdLists) {
                    if (!eqpIdList) continue;
                    for (const eqpId of eqpIdList) {
                        if (!eqpDictKeys.includes(eqpId))
                            cc.error('ActPosModelDict eqpMkt中，equipModelDict中的eqpId有误', key, eqpId);
                    }
                }
            } else if (pakey === PAKey.petMkt) {
                need(actModel, ['petIdLists'], key + 'petMkt');
                for (const petIdList of (actModel as PetMktModel).petIdLists) {
                    if (!petIdList) continue;
                    for (const petId of petIdList) {
                        if (!petDictKeys.includes(petId))
                            cc.error('ActPosModelDict petMkt中，petIdLists中的petId有误', key, petId);
                    }
                }
            } else if (pakey === PAKey.quester) {
                need(actModel, ['questIdList'], key + 'quester');
            } else if (pakey === PAKey.aCntr) {
                need(actModel, ['awardList'], key + 'aCntr');
            }
        }

        for (const mov of model.movs) {
            if (!Object.keys(actPosModelDict).includes(mov.id)) cc.error('ActPosModelDict中，mov的id不存在', mov.id);
        }
    }
}

function checkPetModelDict() {
    for (const key in petModelDict) {
        const model = petModelDict[key];
        for (const skillId of model.selfSkillIds) {
            if (!skillModelDict.hasOwnProperty(skillId)) cc.error('pet model中的skillId有误', key, skillId);
        }
        for (const featureId of model.selfFeatureIds) {
            featureModelDict;
            if (!featureModelDict.hasOwnProperty(featureId)) cc.error('pet model中的featureId有误', key, featureId);
        }
    }
}

function checkSkillModelDict() {
    const buffDictKeys = Object.keys(buffModelDict);
    for (const key in skillModelDict) {
        const model = skillModelDict[key];
        if (model.mainBuffId && !buffDictKeys.includes(model.mainBuffId))
            cc.error('skill model中的mainBuffId有误', key, model.mainBuffId);
        if (model.subBuffId && !buffDictKeys.includes(model.subBuffId))
            cc.error('skill model中的subBuffId有误', key, model.subBuffId);
    }
}

function checkBuffModelDict() {
    const buffBriefDict = {};
    for (const key in buffModelDict) {
        const model = buffModelDict[key];
        if (model.id !== key) cc.error('buffModelDict中，id与dict的key不符', key, model.id);
        need(model, ['id', 'cnName', 'brief', 'buffType', 'eleType', 'getInfo'], 'buffModelDict');
        needAtLeast(model, ['onStarted', 'onEnd', 'onTurnEnd'], 1, 'buffModelDict');

        if (buffBriefDict[model.brief] === true) cc.error('buffModelDict中，brief重复了', key);
        buffBriefDict[model.brief] = true;
    }
}

function checkFeatureModelDict() {
    const briefDict = {};

    for (const key in featureModelDict) {
        const model = featureModelDict[key];
        if (model.id !== key) cc.error('featureModelDict中，id与dict的key不符：', key, model.id);
        need(model, ['id', 'dataAreas', 'getInfo', 'cnBrief'], 'featureModelDict');
        if (briefDict[model.cnBrief] === true) cc.error('featureModelDict中，cnBrief重复了：', key);
        briefDict[model.cnBrief] = true;
    }
}

function checkFeatureInBorn() {
    for (const featureId of inbornFeatures) {
        if (!featureModelDict.hasOwnProperty(featureId)) cc.error('inBornFeatures中有错误id：', featureId);
    }
}

function checkEquipModelDict() {
    for (const key in equipModelDict) {
        const model = equipModelDict[key];
        if (model.id !== key) cc.error('equipModelDict中，id与dict的key不符：', key, model.id);
        const features = model.featureIds;
        for (const feature of features) {
            if (!(feature in featureModelDict)) {
                cc.error('equipModelDict中，feature有误：', key, feature);
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

    checkAllKeys(equipModelDict, 'equipModelDict');
    checkAllKeys(drinkModelDict, 'drinkModelDict');
    checkAllKeys(catcherModelDict, 'catcherModelDict');
    checkAllKeys(eqpAmplrModelDict, 'eqpAmplrModelDict');
}

export function checkConfigs() {
    try {
        checkActPosModelDict();
        checkPetModelDict();
        checkSkillModelDict();
        checkBuffModelDict();
        checkFeatureModelDict();
        checkFeatureInBorn();
        checkEquipModelDict();
        checkItems();
    } catch (error) {
        cc.log('CHECK ERROR: ', error);
    }
}
