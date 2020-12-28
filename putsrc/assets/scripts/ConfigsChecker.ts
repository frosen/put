/*
 * ConfigsChecker.ts
 * 配置检测器
 * luleyan
 */

import { petModelDict } from '../configs/PetModelDict';
import { ActPosModelDict, PAKey } from '../configs/ActPosModelDict';
import { skillModelDict } from '../configs/SkillModelDict';
import { buffModelDict } from '../configs/BuffModelDict';
import { featureModelDict, normalFeatureModelDict } from '../configs/FeatureModelDict';
import { equipModelDict } from '../configs/EquipModelDict';
import { drinkModelDict } from '../configs/DrinkModelDict';
import { catcherModelDict } from '../configs/CatcherModelDict';
import { eqpAmplrModelDict } from '../configs/EqpAmplrModelDict';
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

            const petDictKeys = Object.keys(petModelDict);
            const eqpDictKeys = Object.keys(equipModelDict);
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
                            cc.error('ActPosModelDict expl中，equipModelDict中的eqpId有误', key, eqpId);
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
                            cc.error('ActPosModelDict eqpMkt中，equipModelDict中的eqpId有误', key, eqpId);
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
    for (const key in petModelDict) {
        const model = petModelDict[key];
        if (model.id !== key) cc.error('petModelDict中，id与dict的key不符', key, model.id);
        if (nameDict[model.cnName] === true) cc.error('petModelDict中，name重复了', key);
        nameDict[model.cnName] = true;

        for (const skillId of model.selfSkillIds) {
            if (!skillModelDict.hasOwnProperty(skillId)) cc.error('pet model中的skillId有误', key, skillId);
        }

        for (const featureId of model.selfFeatureIds) {
            if (!normalFeatureModelDict.hasOwnProperty(featureId)) cc.error('pet model中的featureId有误', key, featureId);
        }
    }
}

function checkSkillModelDict() {
    const buffDictKeys = Object.keys(buffModelDict);
    const nameDict = {};
    for (const key in skillModelDict) {
        const model = skillModelDict[key];
        if (model.id !== key) cc.error('skillModelDict中，id与dict的key不符', key, model.id);
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
    for (const key in buffModelDict) {
        const model = buffModelDict[key];
        if (model.id !== key) cc.error('buffModelDict中，id与dict的key不符', key, model.id);
        needAtLeast(model, ['onStarted', 'onEnd', 'onTurnEnd'], 1, 'buffModelDict');

        if (nameDict[model.brief] === true) cc.error('buffModelDict中，brief重复了', key);
        if (nameDict[model.cnName] === true) cc.error('buffModelDict中，cnName重复了', key);
        nameDict[model.brief] = true;
        nameDict[model.cnName] = true;
    }
}

function checkFeatureModelDict() {
    const nameDict = {};

    for (const key in featureModelDict) {
        const model = featureModelDict[key];
        if (model.id !== key) cc.error('featureModelDict中，id与dict的key不符：', key, model.id);
        if (nameDict[model.cnBrief] === true) cc.error('featureModelDict中，cnBrief重复了：', key);
        nameDict[model.cnBrief] = true;
        needAtLeast(
            model,
            ['onBaseSetting', 'onSetting', 'onBtlStart', 'onAtk', 'onCast', 'onHurt', 'onHeal', 'onEDead', 'onDead'],
            1,
            'featureModelDict'
        );
    }
}

function checkEquipModelDict() {
    const nameDict = {};
    for (const key in equipModelDict) {
        const model = equipModelDict[key];
        if (model.id !== key) cc.error('equipModelDict中，id与dict的key不符：', key, model.id);
        if (nameDict[model.cnName] === true) cc.error('equipModelDict中，name重复了', key);
        nameDict[model.cnName] = true;

        const featureIds = model.featureIds;
        for (const featureId of featureIds) {
            if (!normalFeatureModelDict.hasOwnProperty(featureId)) {
                cc.error('equipModelDict中，feature有误：', key, featureId);
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
        checkEquipModelDict();
        checkItems();
    } catch (error) {
        cc.log('CHECK ERROR: ', error);
    }
}
