/*
 * ProTtlModelDict.ts
 * 持续效果
 * luleyan
 */

import { ProTtlModel, ProTtlType } from '../scripts/DataModel';

export class PTKey {
    static XueBa = 'XueBa';
    static ShouCangJia = 'ShouCangJia';
    static KongJianGuiHuaShi = 'KongJianGuiHuaShi';
    static JiYiDaShi = 'JiYiDaShi';
    static JingLingWang = 'JingLingWang';
    static LingXiu = 'LingXiu';
    static AnHeiKe = 'AnHeiKe';

    static ZhanShuDaShi = 'ZhanShuDaShi';
    static KongLingZhe = 'KongLingZhe';
    static YingYan = 'YingYan';
}

const ProTtlModelDict: { [key: string]: ProTtlModel } = {
    [PTKey.XueBa]: {
        id: PTKey.XueBa,
        cnName: '学霸',
        proTtlType: ProTtlType.purchase,
        order: 1,
        info: '精灵战斗后额外获得25%的经验'
    },
    [PTKey.ShouCangJia]: {
        id: PTKey.ShouCangJia,
        cnName: '收藏家',
        proTtlType: ProTtlType.purchase,
        order: 2,
        info: '可以获得成就系统中的额外超级奖励'
    },
    [PTKey.KongJianGuiHuaShi]: {
        id: PTKey.KongJianGuiHuaShi,
        cnName: '空间规划师',
        proTtlType: ProTtlType.purchase,
        order: 3,
        info: '道具持有上限加倍'
    },
    [PTKey.JiYiDaShi]: {
        id: PTKey.JiYiDaShi,
        cnName: '记忆大师',
        proTtlType: ProTtlType.purchase,
        order: 4,
        info: '直接获得10颗[永恒记忆碎片]，之后每周获得2颗直到拥有10颗；[永恒记忆碎片]可用于解除绑定和更改名称'
    },
    [PTKey.JingLingWang]: {
        id: PTKey.JingLingWang,
        cnName: '精灵王',
        proTtlType: ProTtlType.purchase,
        order: 5,
        info: '精灵持有上限增加3格；可以给精灵起更多字的名字；精灵战斗后再额外获得15%的经验'
    },
    [PTKey.LingXiu]: {
        id: PTKey.LingXiu,
        cnName: '领袖',
        proTtlType: ProTtlType.purchase,
        order: 6,
        info: '公会等级提高速度增加15%，最多200%；公会所有会员额外获得1%经验，最多100%；'
    },
    [PTKey.AnHeiKe]: {
        id: PTKey.AnHeiKe,
        cnName: '暗黑客',
        proTtlType: ProTtlType.purchase,
        order: 7,
        info: '可与暗系精灵产生默契；可以给装备增加额外词缀；夜里探索时降低被非黑暗客看到的几率；拍卖加密没有限制'
    },
    [PTKey.ZhanShuDaShi]: {
        id: PTKey.ZhanShuDaShi,
        cnName: '战术大师',
        proTtlType: ProTtlType.function,
        info: ''
    },
    [PTKey.KongLingZhe]: {
        id: PTKey.KongLingZhe,
        cnName: '控灵者',
        proTtlType: ProTtlType.function,
        info: ''
    },
    [PTKey.YingYan]: {
        id: PTKey.YingYan,
        cnName: '鹰眼',
        proTtlType: ProTtlType.function,
        info: ''
    }
};

export const proTtlModelDict: { [key: string]: ProTtlModel } = ProTtlModelDict as { [key: string]: ProTtlModel };
