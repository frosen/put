/*
 * ConfigsChecker.ts
 * 配置检测器
 * luleyan
 */

import * as petModelDict from 'configs/PetModelDict';
import * as actPosModelDict from 'configs/ActPosModelDict';

const ActPosChecker = {
    data: {
        id: 'string',
        cnName: 'string',
        lv: 'number',
        acts: ['work', 'quest', 'shop', 'equipMarket', 'petMarket', 'recycler', 'store', 'awardsCenter', 'exploration'],
        actDict: {
            data: {
                work: null,
                quest: null,
                shop: null,
                equipMarket: null,
                petMarket: null,
                recycler: null,
                store: null,
                awardsCenter: null,
                exploration: {
                    data: {
                        stepModels: {
                            data: [
                                {
                                    data: {
                                        petIds: Object.keys(petModelDict)
                                    },
                                    type: 'all'
                                }
                            ]
                        }
                    },
                    type: 'all'
                }
            },
            type: 'have',
            call(key, obj, base) {
                let a = base.acts.includes(key);
                let b = Object.keys(obj).length == base.acts.length;
                let r = a && b;
                if (!r) cc.error('config: actDict中的key要与acts一致', a, b, key, Object.keys(obj).length, base.acts.length);
                return r;
            }
        },
        evts: [
            {
                data: {}
            }
        ],
        movs: [
            {
                data: {
                    id: function(key, obj, base) {
                        return Object.keys(actPosModelDict).includes(obj[key]);
                    },
                    price: 'number',
                    condition: {
                        data: {}
                    }
                },
                type: 'all'
            }
        ],
        loc: {
            data: {
                x: 'number',
                y: 'number'
            },
            type: 'all'
        }
    },
    type: 'all'
};

/**
 * string: 类型
 * object: 根据type进行不同的匹配，可通过call进行匹配
 * array: 如果只有一个，则所有匹配这一个，如果是多个则和这里面一个相同即可
 */
function checkDict(obj: any, checker: any, path: string, base: any) {
    if (!checker) {
        cc.log('checker为空: ', path);
        return;
    }
    if (!obj) return;

    let data = checker.data;
    let type = checker.type;

    if (typeof type == 'undefined') {
    } else if (type == 'have') {
        let curKeys = Object.keys(obj);
        let checkerKeys = Object.keys(data);
        for (const curKey of curKeys) {
            if (!checkerKeys.includes(curKey)) cc.error('config中包含错误的key：', path, curKey);
        }
    } else if (type == 'all') {
        let curKeys = Object.keys(obj);
        let checkerKeys = Object.keys(data);
        for (const curKey of curKeys) {
            if (!checkerKeys.includes(curKey)) cc.error('config中包含错误的key：', path, curKey);
        }
        if (checkerKeys.length != curKeys.length) {
            cc.error('config中key的数量与需要的不符：', path);
        }
    } else {
        cc.error('Wrong type', type);
    }

    if (checker.call) {
        for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            if (!checker.call(key, obj, base)) {
                cc.error('config中在检测回调中出错', path, key);
            }
        }
    }
    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        let value = obj[key];
        const subChecker = data[key];
        if (typeof subChecker == 'string') {
            if (typeof value != subChecker) cc.error('config中value的类型有误', path, key);
        } else if (typeof subChecker == 'function') {
            if (!subChecker(key, obj, base)) cc.error('config中func value有错误', path, key);
        } else if (typeof subChecker == 'object') {
            if (subChecker instanceof Array) {
                if (subChecker.length > 1) {
                    for (let index = 0; index < value.length; index++) {
                        const subvalue = value[index];
                        if (!subChecker.includes(subvalue)) cc.error('config中包含错误的array value：', path, index);
                    }
                } else {
                    let subSubChecker = subChecker[0];
                    for (let index = 0; index < value.length; index++) {
                        const subValue = value[index];
                        if (typeof subSubChecker == 'string') {
                            if (typeof subValue != subSubChecker) cc.error('config中array value的类型有误', path, index);
                        } else if (typeof subSubChecker == 'object') {
                            checkDict(subValue, subSubChecker, path + '/' + key + '/' + String(index), base);
                        }
                    }
                }
            } else {
                checkDict(value, subChecker, path + '/' + key, base);
            }
        }
    }
}

export default function checkConfigs() {
    for (const key in actPosModelDict) {
        const model = actPosModelDict[key];
        if (model.id != key) cc.error('id与dict的key不符', key, model.id);
        checkDict(model, ActPosChecker, '::' + String(key), model);
    }
}
