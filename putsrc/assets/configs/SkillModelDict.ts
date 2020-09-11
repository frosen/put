/*
 * SkillModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

import { SkillModel } from 'scripts/DataModel';
  
export const skillModelDict: { [key: string]: SkillModel } = {
    HuoYanDan: {
        id: 'HuoYanDan',
        cnName: '火焰弹',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 1,
        spBattleType: 0,
        mainDmg: 380,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 35,
        rage: 0,
        hpLimit: 0
    },
    LiaoYuan: {
        id: 'LiaoYuan',
        cnName: '燎原',
        skillType: 1,
        dirType: 1,
        aimType: 3,
        eleType: 1,
        spBattleType: 0,
        mainDmg: 150,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 100,
        subBuffId: '',
        subBuffTime: 0,
        cd: 5,
        mp: 55,
        rage: 0,
        hpLimit: 0
    },
    ZhuoShao: {
        id: 'ZhuoShao',
        cnName: '灼烧',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 1,
        spBattleType: 0,
        mainDmg: 120,
        mainBuffId: 'ZhuoShao',
        mainBuffTime: 3,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 3,
        mp: 25,
        rage: 0,
        hpLimit: 0
    },
    ReLi: {
        id: 'ReLi',
        cnName: '热力',
        skillType: 2,
        dirType: 2,
        aimType: 1,
        eleType: 1,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'ReLi',
        mainBuffTime: 3,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 12,
        rage: 0,
        hpLimit: 0
    },
    ShuiLengDan: {
        id: 'ShuiLengDan',
        cnName: '水冷弹',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 2,
        spBattleType: 0,
        mainDmg: 260,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 2,
        mp: 25,
        rage: 0,
        hpLimit: 0
    },
    JingJie: {
        id: 'JingJie',
        cnName: '警戒',
        skillType: 2,
        dirType: 2,
        aimType: 1,
        eleType: 2,
        spBattleType: 1,
        mainDmg: 0,
        mainBuffId: 'JingJie',
        mainBuffTime: 1,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 2,
        mp: 10,
        rage: 0,
        hpLimit: 0
    },
    JingZhongChangMing: {
        id: 'JingZhongChangMing',
        cnName: '警钟长鸣',
        skillType: 3,
        dirType: 2,
        aimType: 3,
        eleType: 2,
        spBattleType: 1,
        mainDmg: 0,
        mainBuffId: 'JingJie',
        mainBuffTime: 3,
        subDmg: 0,
        subBuffId: 'JingJie',
        subBuffTime: 2,
        cd: 0,
        mp: 0,
        rage: 60,
        hpLimit: 0
    },
    YinSuQiLiu: {
        id: 'YinSuQiLiu',
        cnName: '音速气流',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 3,
        spBattleType: 0,
        mainDmg: 320,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 3,
        mp: 30,
        rage: 0,
        hpLimit: 0
    },
    JiFengRen: {
        id: 'JiFengRen',
        cnName: '疾风刃',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 3,
        spBattleType: 0,
        mainDmg: 130,
        mainBuffId: 'GeShang',
        mainBuffTime: 3,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 5,
        mp: 40,
        rage: 0,
        hpLimit: 0
    },
    ChaoZhongJi: {
        id: 'ChaoZhongJi',
        cnName: '超重击',
        skillType: 2,
        dirType: 2,
        aimType: 1,
        eleType: 4,
        spBattleType: 1,
        mainDmg: 0,
        mainBuffId: 'QiangJi',
        mainBuffTime: 1,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 2,
        mp: 6,
        rage: 0,
        hpLimit: 0
    },
    LuoShi: {
        id: 'LuoShi',
        cnName: '落石',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 4,
        spBattleType: 0,
        mainDmg: 110,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 2,
        mp: 9,
        rage: 0,
        hpLimit: 0
    },
    FangHuZhao: {
        id: 'FangHuZhao',
        cnName: '防护罩',
        skillType: 2,
        dirType: 2,
        aimType: 1,
        eleType: 4,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'FangHu',
        mainBuffTime: 2,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 3,
        mp: 16,
        rage: 0,
        hpLimit: 0
    },
    DianZiMaiChong: {
        id: 'DianZiMaiChong',
        cnName: '电子脉冲',
        skillType: 1,
        dirType: 1,
        aimType: 2,
        eleType: 5,
        spBattleType: 0,
        mainDmg: 160,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 240,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 33,
        rage: 0,
        hpLimit: 0
    },
    MieShi: {
        id: 'MieShi',
        cnName: '蔑视',
        skillType: 2,
        dirType: 1,
        aimType: 1,
        eleType: 5,
        spBattleType: 1,
        mainDmg: 0,
        mainBuffId: 'ChaoFeng',
        mainBuffTime: 2,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 6,
        rage: 0,
        hpLimit: 0
    },
    RongJie: {
        id: 'RongJie',
        cnName: '熔接',
        skillType: 1,
        dirType: 2,
        aimType: 1,
        eleType: 1,
        spBattleType: 4,
        mainDmg: -350,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 25,
        rage: 0,
        hpLimit: 70
    },
    HuiChunShu: {
        id: 'HuiChunShu',
        cnName: '回春术',
        skillType: 1,
        dirType: 2,
        aimType: 1,
        eleType: 3,
        spBattleType: 2,
        mainDmg: 0,
        mainBuffId: 'HuiChun',
        mainBuffTime: 3,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 1,
        mp: 15,
        rage: 0,
        hpLimit: 90
    },
    ZhiMang: {
        id: 'ZhiMang',
        cnName: '致盲',
        skillType: 2,
        dirType: 1,
        aimType: 1,
        eleType: 5,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'MangMu',
        mainBuffTime: 2,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 5,
        mp: 20,
        rage: 0,
        hpLimit: 0
    },
    LingJing: {
        id: 'LingJing',
        cnName: '凌晶',
        skillType: 1,
        dirType: 1,
        aimType: 2,
        eleType: 2,
        spBattleType: 0,
        mainDmg: 220,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 170,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 26,
        rage: 0,
        hpLimit: 0
    },
    ShuangDong: {
        id: 'ShuangDong',
        cnName: '霜冻',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 2,
        spBattleType: 0,
        mainDmg: 80,
        mainBuffId: 'HanLeng',
        mainBuffTime: 4,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 3,
        mp: 23,
        rage: 0,
        hpLimit: 0
    },
    DiZhen: {
        id: 'DiZhen',
        cnName: '地震',
        skillType: 1,
        dirType: 1,
        aimType: 3,
        eleType: 4,
        spBattleType: 0,
        mainDmg: 90,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 90,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 45,
        rage: 0,
        hpLimit: 0
    },
    BengHuai: {
        id: 'BengHuai',
        cnName: '崩坏',
        skillType: 1,
        dirType: 1,
        aimType: 2,
        eleType: 4,
        spBattleType: 0,
        mainDmg: 300,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 150,
        subBuffId: '',
        subBuffTime: 0,
        cd: 5,
        mp: 40,
        rage: 0,
        hpLimit: 0
    },
    DiLie: {
        id: 'DiLie',
        cnName: '地裂',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 4,
        spBattleType: 0,
        mainDmg: 250,
        mainBuffId: 'ZhuiLuo',
        mainBuffTime: 2,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 3,
        mp: 31,
        rage: 0,
        hpLimit: 0
    },
    TaiFeng: {
        id: 'TaiFeng',
        cnName: '台风',
        skillType: 1,
        dirType: 1,
        aimType: 3,
        eleType: 3,
        spBattleType: 0,
        mainDmg: 50,
        mainBuffId: 'ZhuiLuo',
        mainBuffTime: 2,
        subDmg: 45,
        subBuffId: 'ZhuiLuo',
        subBuffTime: 2,
        cd: 7,
        mp: 60,
        rage: 0,
        hpLimit: 0
    },
    KongJuShu: {
        id: 'KongJuShu',
        cnName: '恐惧术',
        skillType: 2,
        dirType: 1,
        aimType: 1,
        eleType: 6,
        spBattleType: 4,
        mainDmg: 0,
        mainBuffId: 'KongJu',
        mainBuffTime: 2,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 7,
        mp: 34,
        rage: 0,
        hpLimit: 50
    },
    YueHuo: {
        id: 'YueHuo',
        cnName: '月火',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 5,
        spBattleType: 0,
        mainDmg: 75,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 0,
        mp: 10,
        rage: 0,
        hpLimit: 0
    },
    ShanYao: {
        id: 'ShanYao',
        cnName: '闪耀',
        skillType: 2,
        dirType: 2,
        aimType: 1,
        eleType: 5,
        spBattleType: 1,
        mainDmg: 0,
        mainBuffId: 'ShanYao',
        mainBuffTime: 3,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 21,
        rage: 0,
        hpLimit: 0
    },
    DuShang: {
        id: 'DuShang',
        cnName: '毒伤',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 6,
        spBattleType: 0,
        mainDmg: 30,
        mainBuffId: 'ZhongDu',
        mainBuffTime: 6,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 3,
        mp: 24,
        rage: 0,
        hpLimit: 0
    },
    XiXueShu: {
        id: 'XiXueShu',
        cnName: '吸血术',
        skillType: 1,
        dirType: 1,
        aimType: 4,
        eleType: 6,
        spBattleType: 0,
        mainDmg: 220,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: -110,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 30,
        rage: 0,
        hpLimit: 0
    },
    ZhongJie: {
        id: 'ZhongJie',
        cnName: '终结',
        skillType: 1,
        dirType: 1,
        aimType: 1,
        eleType: 6,
        spBattleType: 0,
        mainDmg: 500,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 3,
        mp: 20,
        rage: 0,
        hpLimit: 20
    },
    KuangReZhiWu: {
        id: 'KuangReZhiWu',
        cnName: '狂热之舞',
        skillType: 1,
        dirType: 2,
        aimType: 3,
        eleType: 1,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'ReLi',
        mainBuffTime: 4,
        subDmg: 0,
        subBuffId: 'ReLi',
        subBuffTime: 3,
        cd: 8,
        mp: 50,
        rage: 0,
        hpLimit: 0
    },
    YuHe: {
        id: 'YuHe',
        cnName: '愈合',
        skillType: 1,
        dirType: 2,
        aimType: 1,
        eleType: 2,
        spBattleType: 4,
        mainDmg: -420,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 5,
        mp: 30,
        rage: 0,
        hpLimit: 50
    },
    ShengGuang: {
        id: 'ShengGuang',
        cnName: '圣光',
        skillType: 3,
        dirType: 2,
        aimType: 3,
        eleType: 5,
        spBattleType: 0,
        mainDmg: -600,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: -500,
        subBuffId: '',
        subBuffTime: 0,
        cd: 0,
        mp: 0,
        rage: 90,
        hpLimit: 0
    },
    XieE: {
        id: 'XieE',
        cnName: '邪恶',
        skillType: 2,
        dirType: 2,
        aimType: 1,
        eleType: 6,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'XieE',
        mainBuffTime: 3,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 5,
        mp: 28,
        rage: 0,
        hpLimit: 0
    },
    ELingGuiChao: {
        id: 'ELingGuiChao',
        cnName: '恶灵归巢',
        skillType: 1,
        dirType: 2,
        aimType: 3,
        eleType: 6,
        spBattleType: 1,
        mainDmg: -500,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: 'GeShang',
        subBuffTime: 2,
        cd: 2,
        mp: 10,
        rage: 0,
        hpLimit: 40
    },
    BaoZha: {
        id: 'BaoZha',
        cnName: '爆炸',
        skillType: 3,
        dirType: 1,
        aimType: 3,
        eleType: 1,
        spBattleType: 0,
        mainDmg: 500,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 400,
        subBuffId: '',
        subBuffTime: 0,
        cd: 0,
        mp: 0,
        rage: 75,
        hpLimit: 0
    },
    TaiKongWu: {
        id: 'TaiKongWu',
        cnName: '太空舞',
        skillType: 3,
        dirType: 2,
        aimType: 1,
        eleType: 3,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'KongWu',
        mainBuffTime: 15,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 0,
        mp: 0,
        rage: 50,
        hpLimit: 0
    },
    QiMenDunJia: {
        id: 'QiMenDunJia',
        cnName: '奇门遁甲',
        skillType: 3,
        dirType: 1,
        aimType: 4,
        eleType: 4,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'SiMen',
        mainBuffTime: 5,
        subDmg: 0,
        subBuffId: 'ShengMen',
        subBuffTime: 5,
        cd: 0,
        mp: 0,
        rage: 110,
        hpLimit: 0
    },
    YinYingJiaoSha: {
        id: 'YinYingJiaoSha',
        cnName: '阴影绞杀',
        skillType: 3,
        dirType: 1,
        aimType: 1,
        eleType: 6,
        spBattleType: 3,
        mainDmg: 2000,
        mainBuffId: '',
        mainBuffTime: 0,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 0,
        mp: 0,
        rage: 70,
        hpLimit: 20
    },
    LiuSha: {
        id: 'LiuSha',
        cnName: '流沙',
        skillType: 2,
        dirType: 1,
        aimType: 3,
        eleType: 4,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'LiuSha',
        mainBuffTime: 3,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 6,
        mp: 25,
        rage: 0,
        hpLimit: 0
    },
    YuYiShengCheng: {
        id: 'YuYiShengCheng',
        cnName: '羽翼生成',
        skillType: 2,
        dirType: 2,
        aimType: 2,
        eleType: 3,
        spBattleType: 0,
        mainDmg: 0,
        mainBuffId: 'FeiXing',
        mainBuffTime: 4,
        subDmg: 0,
        subBuffId: 'FeiXing',
        subBuffTime: 4,
        cd: 3,
        mp: 8,
        rage: 0,
        hpLimit: 0
    },
    DunQiang: {
        id: 'DunQiang',
        cnName: '盾墙',
        skillType: 2,
        dirType: 2,
        aimType: 1,
        eleType: 4,
        spBattleType: 3,
        mainDmg: 0,
        mainBuffId: 'DunQiang',
        mainBuffTime: 1,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 25,
        rage: 0,
        hpLimit: 0
    },
    NingJingZhiYu: {
        id: 'NingJingZhiYu',
        cnName: '宁静之雨',
        skillType: 2,
        dirType: 1,
        aimType: 1,
        eleType: 2,
        spBattleType: 3,
        mainDmg: 0,
        mainBuffId: 'NingJing',
        mainBuffTime: 4,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 4,
        mp: 17,
        rage: 0,
        hpLimit: 0
    },
    JingShenRanJin: {
        id: 'JingShenRanJin',
        cnName: '精神燃尽',
        skillType: 2,
        dirType: 1,
        aimType: 1,
        eleType: 1,
        spBattleType: 3,
        mainDmg: 0,
        mainBuffId: 'JingJin',
        mainBuffTime: 5,
        subDmg: 0,
        subBuffId: '',
        subBuffTime: 0,
        cd: 5,
        mp: 22,
        rage: 0,
        hpLimit: 0
    },
    XiaZhi: {
        id: 'XiaZhi',
        cnName: '夏至',
        skillType: 3,
        dirType: 1,
        aimType: 3,
        eleType: 1,
        spBattleType: 0,
        mainDmg: 100,
        mainBuffId: 'ZhuoShao',
        mainBuffTime: 6,
        subDmg: 60,
        subBuffId: 'ZhuoShao',
        subBuffTime: 5,
        cd: 0,
        mp: 0,
        rage: 65,
        hpLimit: 0
    }
};
