/*
 * ConfigsChecker.ts
 * 配置检测器
 * luleyan
 */

import * as petModelDict from 'configs/PetModelDict';
import actPosModelDict from 'configs/ActPosModelDict';
import * as skillModelDict from 'configs/SkillModelDict';
import buffModelDict from 'configs/BuffModelDict';
import featureModelDict from 'configs/FeatureModelDict';

function checkActPosModelDict() {
    for (const key in actPosModelDict) {
        const model = actPosModelDict[key];
        if (model.id != key) cc.error('ActPosModelDict中，id与dict的key不符', key, model.id);

        if (Object.keys(model.actDict).length != model.acts.length)
            cc.error('ActPosModelDict中，actDict与acts数量不一致', key);
        for (const actDictKey of Object.keys(model.actDict)) {
            if (!model.acts.includes(actDictKey)) cc.error(`${actDictKey}不在${model.acts}内`, key);
        }

        if (model.actDict.hasOwnProperty('exploration')) {
            let expl = model.actDict['exploration'];
            let petDictKeys = Object.keys(petModelDict);
            for (let index = 0; index < expl.stepModels.length; index++) {
                const stepModel = expl.stepModels[index];
                for (const petId of stepModel.petIds) {
                    if (!petDictKeys.includes(petId))
                        cc.error('ActPosModelDict中，exploration中的petId有误', key, index, petId);
                }
            }
        }

        for (const mov of model.movs) {
            if (!Object.keys(actPosModelDict).includes(mov.id)) cc.error('ActPosModelDict中，mov的id不存在', mov.id);
        }
    }
}

function checkPetModelDict() {
    let skillDictKeys = Object.keys(skillModelDict);
    for (const key in petModelDict) {
        const model = petModelDict[key];
        for (const skillId of model.selfSkillIds) {
            if (!skillDictKeys.includes(skillId)) cc.error('pet model中的skillId有误', key, skillId);
        }
    }
}

function checkSkillModelDict() {
    let buffDictKeys = Object.keys(buffModelDict);
    for (const key in skillModelDict) {
        const model = skillModelDict[key];
        if (model.mainBuffId && !buffDictKeys.includes(model.mainBuffId))
            cc.error('skill model中的mainBuffId有误', key, model.mainBuffId);
        if (model.subBuffId && !buffDictKeys.includes(model.subBuffId))
            cc.error('skill model中的subBuffId有误', key, model.subBuffId);
    }
}

function checkBuffModelDict() {
    for (const key in buffModelDict) {
        const model = buffModelDict[key];
        if (model.id != key) cc.error('buffModelDict中，id与dict的key不符', key, model.id);
        if (
            model.hasOwnProperty('id') &&
            model.hasOwnProperty('cnName') &&
            model.hasOwnProperty('brief') &&
            model.hasOwnProperty('buffType') &&
            model.hasOwnProperty('eleType') &&
            model.hasOwnProperty('getInfo')
        ) {
        } else {
            cc.error('buffModelDict中，缺少一个必要项目', key);
        }

        if (model.hasOwnProperty('onStarted') || model.hasOwnProperty('onEnd') || model.hasOwnProperty('onTurnEnd')) {
        } else {
            cc.error('buffModelDict中，onStarted onEnd onTurnEnd 必有其一', key);
        }
    }
}

function checkFeatureModelDict() {
    for (const key in featureModelDict) {
        const model = featureModelDict[key];
        if (model.id != key) cc.error('featureModelDict中，id与dict的key不符', key, model.id);
        if (model.hasOwnProperty('id') && model.hasOwnProperty('dataAreas') && model.hasOwnProperty('getInfo')) {
        } else {
            cc.error('featureModelDict中，缺少一个必要项目', key);
        }
    }
}

export default function checkConfigs() {
    checkActPosModelDict();
    checkPetModelDict();
    checkSkillModelDict();
    checkBuffModelDict();
    checkFeatureModelDict();
}
