/*
 * ProTtlModelDict.ts
 * 持续效果
 * luleyan
 */

import { ProTtlModel, ProTtlType } from '../scripts/DataModel';

export class PTKey {
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
    static KongLingZhe = 'KongLingZhe';
    static YingYan = 'YingYan';
}

const ProTtlModelDict: { [key: string]: ProTtlModel } = {
    [PTKey.DaShanRen]: {
        id: PTKey.DaShanRen,
        cnName: d => `大善人${d}`,
        proTtlType: ProTtlType.kind,
        info: 'thx'
    },
    [PTKey.XueBa]: {
        id: PTKey.XueBa,
        cnName: '学霸',
        proTtlType: ProTtlType.purchase,
        order: 1,
        info: '精灵战斗获取的经验+25%'
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
    [PTKey.WangLuoMingRen]: {
        id: PTKey.WangLuoMingRen,
        cnName: '网络名人',
        proTtlType: ProTtlType.purchase,
        order: 4,
        info: '完成任务获取的声望+25%'
    },
    [PTKey.JiYiDaShi]: {
        id: PTKey.JiYiDaShi,
        cnName: '记忆大师',
        proTtlType: ProTtlType.purchase,
        order: 5,
        info: '直接获得10颗[永恒记忆碎片]，之后每周获得2颗直到拥有10颗；[永恒记忆碎片]可用于解除绑定和更改名称'
    },
    [PTKey.JingLingWang]: {
        id: PTKey.JingLingWang,
        cnName: '精灵王',
        proTtlType: ProTtlType.purchase,
        order: 6,
        info: '精灵持有上限增加3格；可以给精灵起更多字的名字；精灵战斗后再额外获得15%的经验'
    },
    [PTKey.LingXiu]: {
        id: PTKey.LingXiu,
        cnName: '领袖',
        proTtlType: ProTtlType.purchase,
        order: 7,
        info: '公会等级提高速度增加15%，最多200%；公会所有会员额外获得1%经验，最多100%；'
    },
    [PTKey.YeZhiShen]: {
        id: PTKey.YeZhiShen,
        cnName: '夜之神',
        proTtlType: ProTtlType.purchase,
        order: 8,
        info: '可与暗系精灵产生默契；可以给装备增加额外词缀；夜里探索时降低被非黑暗客看到的几率；拍卖加密没有限制'
    },

    // -----------------------------------------------------------------

    [PTKey.DaXueSheng]: {
        id: PTKey.DaXueSheng,
        cnName: d => `大学生L${d}`,
        proTtlType: ProTtlType.pet,
        order: 1,
        info: d => `魔法精灵经验+${d * 5}%`
    },
    [PTKey.JiXieShi]: {
        id: PTKey.JiXieShi,
        cnName: d => `机械师L${d}`,
        proTtlType: ProTtlType.pet,
        order: 2,
        info: d => `机械精灵经验+${d * 5}%`
    },
    [PTKey.SiYangYuan]: {
        id: PTKey.SiYangYuan,
        cnName: d => `饲养员L{d}`,
        proTtlType: ProTtlType.pet,
        order: 3,
        info: d => `自然精灵经验+${d * 5}%`
    },

    [PTKey.ZongHuoZhe]: {
        id: PTKey.ZongHuoZhe,
        cnName: d => `纵火者L{d}`,
        proTtlType: ProTtlType.pet,
        order: 11,
        info: d => `火系精灵经验+${d * 5}%`
    },
    [PTKey.YuShuiZhe]: {
        id: PTKey.YuShuiZhe,
        cnName: d => `御水者L{d}`,
        proTtlType: ProTtlType.pet,
        order: 12,
        info: d => `水系精灵经验+${d * 5}%`
    },
    [PTKey.KongWuZhe]: {
        id: PTKey.KongWuZhe,
        cnName: d => `空舞者L{d}`,
        proTtlType: ProTtlType.pet,
        order: 13,
        info: d => `空系精灵经验+${d * 5}%`
    },
    [PTKey.DiFuZhe]: {
        id: PTKey.DiFuZhe,
        cnName: d => `地缚者L{d}`,
        proTtlType: ProTtlType.pet,
        order: 14,
        info: d => `地系精灵经验+${d * 5}%`
    },
    [PTKey.GuangShi]: {
        id: PTKey.GuangShi,
        cnName: d => `光使L{d}`,
        proTtlType: ProTtlType.pet,
        order: 15,
        info: d => `光系精灵经验+${d * 5}%`
    },
    [PTKey.AnShi]: {
        id: PTKey.AnShi,
        cnName: d => `暗使L{d}`,
        proTtlType: ProTtlType.pet,
        order: 16,
        info: d => `暗系精灵经验+${d * 5}%`
    },

    // -----------------------------------------------------------------

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
