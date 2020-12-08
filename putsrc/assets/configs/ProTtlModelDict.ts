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
        order: 1,
        info: '可以使用收藏功能下的超级奖励'
    },
    XueBa: {
        id: 'XueBa',
        cnName: '学霸',
        proTtlType: ProTtlType.purchase,
        order: 2,
        info: '精灵战斗后额外获得25%的经验'
    },
    KongJianGuiHuaShi: {
        id: 'KongJianGuiHuaShi',
        cnName: '空间规划师',
        proTtlType: ProTtlType.purchase,
        order: 3,
        info: '道具持有上限加倍'
    },
    JiYiDaShi: {
        id: 'JiYiDaShi',
        cnName: '记忆大师',
        proTtlType: ProTtlType.purchase,
        order: 4,
        info: '直接获得10颗[永恒记忆碎片]，之后每周获得2颗，持有上限为10颗，[永恒记忆碎片]可解除装备或精灵的绑定'
    },
    JingLingWang: {
        id: 'JingLingWang',
        cnName: '精灵王',
        proTtlType: ProTtlType.purchase,
        order: 5,
        info: '精灵持有上限增加3格'
    },
    LingXiu: {
        id: 'LingXiu',
        cnName: '领袖',
        proTtlType: ProTtlType.purchase,
        order: 6,
        info: '所在公会所有会员额外获得1%经验，最多100%，公会等级提高速度增加5%，最多1000%，公会人数上限提高2人'
    },
    AnHeiKe: {
        id: 'AnHeiKe',
        cnName: '暗黑客',
        proTtlType: ProTtlType.purchase,
        order: 7,
        info:
            '可与暗系精灵产生默契（否则使用暗系精灵时默契值不成长）；可以给装备增加第四个词缀；夜里探索时降低被非黑暗客看到的几率；拍卖加密没有限制'
    }
};

export const proTtlModelDict: { [key: string]: ProTtlModel } = ProTtlModelDict as { [key: string]: ProTtlModel };