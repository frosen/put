/*
 * ProTtlModelDict.ts
 * 持续效果
 * luleyan
 */

import { ProTtlModel, ProTtlType } from '../scripts/DataModel';

export class PTN {
    static DaShanRen = 'DaShanRen';
    static XueBa = 'XueBa';
    static ShouCangJia = 'ShouCangJia';
    static KongJianGuiHuaShi = 'KongJianGuiHuaShi';
    static WangLuoMingRen = 'WangLuoMingRen';
    static JiYiDaShi = 'JiYiDaShi';
    static JingLingWang = 'JingLingWang';
    static LingXiu = 'LingXiu';
    static YeZhiShen = 'YeZhiShen';

    static DaXueSheng = 'DaXueSheng';
    static JiXieShi = 'JiXieShi';
    static SiYangYuan = 'SiYangYuan';

    static ZongHuoZhe = 'ZongHuoZhe';
    static YuShuiZhe = 'YuShuiZhe';
    static KongWuZhe = 'KongWuZhe';
    static DiFuZhe = 'DiFuZhe';
    static GuangShi = 'GuangShi';
    static AnShi = 'AnShi';

    static ZhanShuDaShi = 'ZhanShuDaShi';
    static YiLingZhe = 'KongLingZhe';
    static YingYan = 'YingYan';
}

const ProTtlModelDict: { [key: string]: ProTtlModel } = {
    [PTN.DaShanRen]: {
        id: PTN.DaShanRen,
        cnName: d => `大善人${d}`,
        proTtlType: ProTtlType.kind,
        info: 'thx'
    },
    [PTN.XueBa]: {
        id: PTN.XueBa,
        cnName: '学霸',
        proTtlType: ProTtlType.purchase,
        order: 1,
        info: '精灵战斗获取的经验+25%'
    },
    [PTN.ShouCangJia]: {
        id: PTN.ShouCangJia,
        cnName: '收藏家',
        proTtlType: ProTtlType.purchase,
        order: 2,
        info: '可以获得成就系统中的额外超级奖励'
    },
    [PTN.KongJianGuiHuaShi]: {
        id: PTN.KongJianGuiHuaShi,
        cnName: '空间规划师',
        proTtlType: ProTtlType.purchase,
        order: 3,
        info: '道具持有上限加倍'
    },
    [PTN.WangLuoMingRen]: {
        id: PTN.WangLuoMingRen,
        cnName: '网络名人',
        proTtlType: ProTtlType.purchase,
        order: 4,
        info: '完成任务获取的声望+25%'
    },
    [PTN.JiYiDaShi]: {
        id: PTN.JiYiDaShi,
        cnName: '记忆大师',
        proTtlType: ProTtlType.purchase,
        order: 5,
        info: '直接获得10颗[永恒记忆碎片]，之后每周获得2颗直到拥有10颗；[永恒记忆碎片]可用于解除绑定和更改名称'
    },
    [PTN.JingLingWang]: {
        id: PTN.JingLingWang,
        cnName: '精灵王',
        proTtlType: ProTtlType.purchase,
        order: 6,
        info: '精灵持有上限增加3格；可以给精灵起更多字的名字；精灵战斗后再额外获得15%的经验'
    },
    [PTN.LingXiu]: {
        id: PTN.LingXiu,
        cnName: '领袖',
        proTtlType: ProTtlType.purchase,
        order: 7,
        info: '公会等级提高速度增加15%，最多200%；公会所有会员额外获得1%经验，最多100%；'
    },
    [PTN.YeZhiShen]: {
        id: PTN.YeZhiShen,
        cnName: '夜之神',
        proTtlType: ProTtlType.purchase,
        order: 8,
        info: '可与暗系精灵产生默契；可以给装备增加额外词缀；夜里探索时降低被非黑暗客看到的几率；拍卖加密没有限制'
    },

    // -----------------------------------------------------------------

    [PTN.DaXueSheng]: {
        id: PTN.DaXueSheng,
        cnName: d => `大学生L${d}`,
        proTtlType: ProTtlType.pet,
        order: 1,
        info: d => `魔法精灵经验+${d * 5}%`
    },
    [PTN.JiXieShi]: {
        id: PTN.JiXieShi,
        cnName: d => `机械师L${d}`,
        proTtlType: ProTtlType.pet,
        order: 2,
        info: d => `机械精灵经验+${d * 5}%`
    },
    [PTN.SiYangYuan]: {
        id: PTN.SiYangYuan,
        cnName: d => `饲养员L{d}`,
        proTtlType: ProTtlType.pet,
        order: 3,
        info: d => `自然精灵经验+${d * 5}%`
    },

    [PTN.ZongHuoZhe]: {
        id: PTN.ZongHuoZhe,
        cnName: d => `纵火者L{d}`,
        proTtlType: ProTtlType.pet,
        order: 11,
        info: d => `火系精灵经验+${d * 5}%`
    },
    [PTN.YuShuiZhe]: {
        id: PTN.YuShuiZhe,
        cnName: d => `御水者L{d}`,
        proTtlType: ProTtlType.pet,
        order: 12,
        info: d => `水系精灵经验+${d * 5}%`
    },
    [PTN.KongWuZhe]: {
        id: PTN.KongWuZhe,
        cnName: d => `空舞者L{d}`,
        proTtlType: ProTtlType.pet,
        order: 13,
        info: d => `空系精灵经验+${d * 5}%`
    },
    [PTN.DiFuZhe]: {
        id: PTN.DiFuZhe,
        cnName: d => `地缚者L{d}`,
        proTtlType: ProTtlType.pet,
        order: 14,
        info: d => `地系精灵经验+${d * 5}%`
    },
    [PTN.GuangShi]: {
        id: PTN.GuangShi,
        cnName: d => `光使L{d}`,
        proTtlType: ProTtlType.pet,
        order: 15,
        info: d => `光系精灵经验+${d * 5}%`
    },
    [PTN.AnShi]: {
        id: PTN.AnShi,
        cnName: d => `暗使L{d}`,
        proTtlType: ProTtlType.pet,
        order: 16,
        info: d => `暗系精灵经验+${d * 5}%`
    },

    // -----------------------------------------------------------------

    [PTN.ZhanShuDaShi]: {
        id: PTN.ZhanShuDaShi,
        cnName: '战术大师',
        proTtlType: ProTtlType.function,
        info: ''
    },
    [PTN.YiLingZhe]: {
        id: PTN.YiLingZhe,
        cnName: '抑灵者',
        proTtlType: ProTtlType.function,
        info: ''
    },
    [PTN.YingYan]: {
        id: PTN.YingYan,
        cnName: '鹰眼',
        proTtlType: ProTtlType.function,
        info: ''
    }
};

export const proTtlModelDict: { [key: string]: ProTtlModel } = ProTtlModelDict as { [key: string]: ProTtlModel };
