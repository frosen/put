/*
 * ConfigsChecker.ts
 * 配置检测器
 * luleyan
 */

import * as petModelDict from 'configs/PetModelDict';
import actPosModelDict from 'configs/ActPosModelDict';

export default function checkConfigs() {
    for (const key in actPosModelDict) {
        const model = actPosModelDict[key];
        if (model.id != key) cc.error('id与dict的key不符', key, model.id);

        if (Object.keys(model.actDict).length != model.acts.length) cc.error('actDict与acts数量不一致', key);
        for (const actDictKey of Object.keys(model.actDict)) {
            if (!model.acts.includes(actDictKey)) cc.error(`${actDictKey}不在${model.acts}内`, key);
        }

        if (model.actDict.hasOwnProperty('exploration')) {
            let expl = model.actDict['exploration'];
            let petDictKeys = Object.keys(petModelDict);
            for (let index = 0; index < expl.stepModels.length; index++) {
                const stepModel = expl.stepModels[index];
                for (const petId of stepModel.petIds) {
                    if (!petDictKeys.includes(petId)) cc.error('exploration中的petId有误', key, index, petId);
                }
            }
        }

        for (const mov of model.movs) {
            if (!Object.keys(actPosModelDict).includes(mov.id)) cc.error('mov的id不存在', mov.id);
        }
    }
}
