/*
 * BuffModelDict.ts
 * 持续效果
 * luleyan
 */

import { ProfTitleModel } from 'scripts/DataModel';

const ProfTitleModelDict: { [key: string]: Partial<ProfTitleModel> } = {
    ShouCangJia: {
        id: 'ShouCangJia',
        cnName: '收藏家'
    },
    XueBa: {
        id: 'XueBa',
        cnName: '学霸'
    },
    KongJianGuiHuaShi: {
        id: 'KongJianGuiHuaShi',
        cnName: '空间规划师'
    },
    JiYiDaShi: {
        id: 'JiYiDaShi',
        cnName: '记忆大师'
    },
    JingLingWang: {
        id: 'JingLingWang',
        cnName: '精灵王'
    },
    LingXiu: {
        id: 'LingXiu',
        cnName: '领袖'
    },
    AnHeiKe: {
        id: 'AnHeiKe',
        cnName: '暗黑客'
    }
};

export let profTitleModelDict: { [key: string]: ProfTitleModel } = <{ [key: string]: ProfTitleModel }>ProfTitleModelDict;
