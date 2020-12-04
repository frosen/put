/*
 * ProTtlModelDict.ts
 * 持续效果
 * luleyan
 */

import { ProTtlModel, ProTtlType } from '../scripts/DataModel';

const ProTtlModelDict: { [key: string]: ProTtlModel } = {
    ShouCangJia: {
        id: 'ShouCangJia',
        cnName: '收藏家',
        proTtlType: ProTtlType.purchase,
        subIdx: 1,
        info: ''
    },
    XueBa: {
        id: 'XueBa',
        cnName: '学霸',
        proTtlType: ProTtlType.purchase,
        subIdx: 2,
        info: ''
    },
    KongJianGuiHuaShi: {
        id: 'KongJianGuiHuaShi',
        cnName: '空间规划师',
        proTtlType: ProTtlType.purchase,
        subIdx: 3,
        info: ''
    },
    JiYiDaShi: {
        id: 'JiYiDaShi',
        cnName: '记忆大师',
        proTtlType: ProTtlType.purchase,
        subIdx: 4,
        info: ''
    },
    JingLingWang: {
        id: 'JingLingWang',
        cnName: '精灵王',
        proTtlType: ProTtlType.purchase,
        subIdx: 5,
        info: ''
    },
    LingXiu: {
        id: 'LingXiu',
        cnName: '领袖',
        proTtlType: ProTtlType.purchase,
        subIdx: 6,
        info: ''
    },
    AnHeiKe: {
        id: 'AnHeiKe',
        cnName: '暗黑客',
        proTtlType: ProTtlType.purchase,
        subIdx: 7,
        info: ''
    }
};

export const proTtlModelDict: { [key: string]: ProTtlModel } = ProTtlModelDict as { [key: string]: ProTtlModel };
