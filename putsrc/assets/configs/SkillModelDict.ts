/*
 * SkillModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

export class SkillN {
    static HuoYanDan = 'HuoYanDan';
    static LiaoYuan = 'LiaoYuan';
    static ZhuoShao = 'ZhuoShao';
    static ReLi = 'ReLi';
    static ShuiLengDan = 'ShuiLengDan';
    static JingJie = 'JingJie';
    static JingZhongChangMing = 'JingZhongChangMing';
    static YinSuQiLiu = 'YinSuQiLiu';
    static JiFengRen = 'JiFengRen';
    static ChaoZhongJi = 'ChaoZhongJi';
    static LuoShi = 'LuoShi';
    static FangHuZhao = 'FangHuZhao';
    static LiZiPao = 'LiZiPao';
    static GuangLeng = 'GuangLeng';
    static DianZiMaiChong = 'DianZiMaiChong';
    static MieShi = 'MieShi';
    static RongJie = 'RongJie';
    static HuiChunShu = 'HuiChunShu';
    static ZhiMang = 'ZhiMang';
    static LingJing = 'LingJing';
    static ShuangDong = 'ShuangDong';
    static DiZhen = 'DiZhen';
    static BengHuai = 'BengHuai';
    static DiLie = 'DiLie';
    static TaiFeng = 'TaiFeng';
    static KongJuShu = 'KongJuShu';
    static YueHuo = 'YueHuo';
    static ShanYao = 'ShanYao';
    static DuShang = 'DuShang';
    static XiXueShu = 'XiXueShu';
    static ZhongJie = 'ZhongJie';
    static KuangReZhiWu = 'KuangReZhiWu';
    static YuHe = 'YuHe';
    static XinGuang = 'XinGuang';
    static XieE = 'XieE';
    static ELingGuiChao = 'ELingGuiChao';
    static BaoZha = 'BaoZha';
    static TaiKongWu = 'TaiKongWu';
    static QiMenDunJia = 'QiMenDunJia';
    static YinYingJiaoSha = 'YinYingJiaoSha';
    static LiuSha = 'LiuSha';
    static YuYiShengCheng = 'YuYiShengCheng';
    static DunQiang = 'DunQiang';
    static NingJingZhiYu = 'NingJingZhiYu';
    static JingShenRanJin = 'JingShenRanJin';
    static XiaZhi = 'XiaZhi';
}

import { SkillModel } from '../scripts/DataModel';

export const SkillModelDict: { [key: string]: SkillModel } = {
    HuoYanDan: {
        id: 'HuoYanDan',
        cnName: '火焰弹',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 1,
        spBtlType: 0,
        mainDmg: 380,
        cd: 4,
        mp: 35
    },
    LiaoYuan: {
        id: 'LiaoYuan',
        cnName: '燎原',
        skillType: 1,
        dirType: 1,
        rangeType: 3,
        eleType: 1,
        spBtlType: 0,
        mainDmg: 150,
        subDmg: 100,
        cd: 5,
        mp: 55
    },
    ZhuoShao: {
        id: 'ZhuoShao',
        cnName: '灼烧',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 1,
        spBtlType: 0,
        mainDmg: 120,
        mainBuffId: 'ZhuoShao',
        mainBuffTime: 3,
        cd: 3,
        mp: 25
    },
    ReLi: {
        id: 'ReLi',
        cnName: '热力',
        skillType: 2,
        dirType: 2,
        rangeType: 1,
        eleType: 1,
        spBtlType: 0,
        mainBuffId: 'ReLi',
        mainBuffTime: 3,
        cd: 4,
        mp: 12
    },
    ShuiLengDan: {
        id: 'ShuiLengDan',
        cnName: '水冷弹',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 2,
        spBtlType: 0,
        mainDmg: 260,
        cd: 2,
        mp: 25
    },
    JingJie: {
        id: 'JingJie',
        cnName: '警戒',
        skillType: 2,
        dirType: 2,
        rangeType: 1,
        eleType: 2,
        spBtlType: 1,
        mainBuffId: 'JingJie',
        mainBuffTime: 1,
        cd: 2,
        mp: 10
    },
    JingZhongChangMing: {
        id: 'JingZhongChangMing',
        cnName: '警钟长鸣',
        skillType: 3,
        dirType: 2,
        rangeType: 3,
        eleType: 2,
        spBtlType: 1,
        mainBuffId: 'JingJie',
        mainBuffTime: 3,
        subBuffId: 'JingJie',
        subBuffTime: 2,
        rage: 60
    },
    YinSuQiLiu: {
        id: 'YinSuQiLiu',
        cnName: '音速气流',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 3,
        spBtlType: 0,
        mainDmg: 320,
        cd: 3,
        mp: 30
    },
    JiFengRen: {
        id: 'JiFengRen',
        cnName: '疾风刃',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 3,
        spBtlType: 0,
        mainDmg: 130,
        mainBuffId: 'GeShang',
        mainBuffTime: 3,
        cd: 5,
        mp: 40
    },
    ChaoZhongJi: {
        id: 'ChaoZhongJi',
        cnName: '超重击',
        skillType: 2,
        dirType: 2,
        rangeType: 1,
        eleType: 4,
        spBtlType: 1,
        mainBuffId: 'QiangJi',
        mainBuffTime: 1,
        cd: 2,
        mp: 6
    },
    LuoShi: {
        id: 'LuoShi',
        cnName: '落石',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 4,
        spBtlType: 0,
        mainDmg: 110,
        cd: 2,
        mp: 9
    },
    FangHuZhao: {
        id: 'FangHuZhao',
        cnName: '防护罩',
        skillType: 2,
        dirType: 2,
        rangeType: 1,
        eleType: 4,
        spBtlType: 0,
        mainBuffId: 'FangHu',
        mainBuffTime: 2,
        cd: 3,
        mp: 16
    },
    LiZiPao: {
        id: 'LiZiPao',
        cnName: '粒子炮',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 5,
        spBtlType: 0,
        mainDmg: 340,
        cd: 3,
        mp: 35
    },
    GuangLeng: {
        id: 'GuangLeng',
        cnName: '光棱',
        skillType: 1,
        dirType: 1,
        rangeType: 2,
        eleType: 5,
        spBtlType: 0,
        mainDmg: 160,
        subDmg: 240,
        cd: 4,
        mp: 33
    },
    DianZiMaiChong: {
        id: 'DianZiMaiChong',
        cnName: '电子脉冲',
        skillType: 1,
        dirType: 1,
        rangeType: 3,
        eleType: 5,
        spBtlType: 1,
        mainDmg: 20,
        subDmg: 130,
        cd: 5,
        mp: 50
    },
    MieShi: {
        id: 'MieShi',
        cnName: '蔑视',
        skillType: 2,
        dirType: 1,
        rangeType: 1,
        eleType: 5,
        spBtlType: 1,
        mainBuffId: 'ChaoFeng',
        mainBuffTime: 2,
        cd: 4,
        mp: 6
    },
    RongJie: {
        id: 'RongJie',
        cnName: '熔接',
        skillType: 1,
        dirType: 2,
        rangeType: 1,
        eleType: 1,
        spBtlType: 4,
        mainDmg: -350,
        cd: 4,
        mp: 25,
        hpLimit: 70
    },
    HuiChunShu: {
        id: 'HuiChunShu',
        cnName: '回春术',
        skillType: 1,
        dirType: 2,
        rangeType: 1,
        eleType: 3,
        spBtlType: 2,
        mainBuffId: 'HuiChun',
        mainBuffTime: 3,
        cd: 1,
        mp: 15,
        hpLimit: 90
    },
    ZhiMang: {
        id: 'ZhiMang',
        cnName: '致盲',
        skillType: 2,
        dirType: 1,
        rangeType: 1,
        eleType: 5,
        spBtlType: 0,
        mainBuffId: 'MangMu',
        mainBuffTime: 2,
        cd: 5,
        mp: 20
    },
    LingJing: {
        id: 'LingJing',
        cnName: '凌晶',
        skillType: 1,
        dirType: 1,
        rangeType: 2,
        eleType: 2,
        spBtlType: 0,
        mainDmg: 220,
        subDmg: 170,
        cd: 4,
        mp: 26
    },
    ShuangDong: {
        id: 'ShuangDong',
        cnName: '霜冻',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 2,
        spBtlType: 0,
        mainDmg: 80,
        mainBuffId: 'HanLeng',
        mainBuffTime: 4,
        cd: 3,
        mp: 23
    },
    DiZhen: {
        id: 'DiZhen',
        cnName: '地震',
        skillType: 1,
        dirType: 1,
        rangeType: 3,
        eleType: 4,
        spBtlType: 0,
        mainDmg: 90,
        subDmg: 90,
        cd: 4,
        mp: 45
    },
    BengHuai: {
        id: 'BengHuai',
        cnName: '崩坏',
        skillType: 1,
        dirType: 1,
        rangeType: 2,
        eleType: 4,
        spBtlType: 0,
        mainDmg: 300,
        subDmg: 150,
        cd: 5,
        mp: 40
    },
    DiLie: {
        id: 'DiLie',
        cnName: '地裂',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 4,
        spBtlType: 0,
        mainDmg: 250,
        mainBuffId: 'ZhuiLuo',
        mainBuffTime: 2,
        cd: 3,
        mp: 31
    },
    TaiFeng: {
        id: 'TaiFeng',
        cnName: '台风',
        skillType: 1,
        dirType: 1,
        rangeType: 3,
        eleType: 3,
        spBtlType: 0,
        mainDmg: 50,
        mainBuffId: 'ZhuiLuo',
        mainBuffTime: 2,
        subDmg: 45,
        subBuffId: 'ZhuiLuo',
        subBuffTime: 2,
        cd: 7,
        mp: 60
    },
    KongJuShu: {
        id: 'KongJuShu',
        cnName: '恐惧术',
        skillType: 2,
        dirType: 1,
        rangeType: 1,
        eleType: 6,
        spBtlType: 4,
        mainBuffId: 'KongJu',
        mainBuffTime: 2,
        cd: 7,
        mp: 34,
        hpLimit: 50
    },
    YueHuo: {
        id: 'YueHuo',
        cnName: '月火',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 5,
        spBtlType: 0,
        mainDmg: 75,
        mp: 10
    },
    ShanYao: {
        id: 'ShanYao',
        cnName: '闪耀',
        skillType: 2,
        dirType: 2,
        rangeType: 1,
        eleType: 5,
        spBtlType: 1,
        mainBuffId: 'ShanYao',
        mainBuffTime: 3,
        cd: 4,
        mp: 21
    },
    DuShang: {
        id: 'DuShang',
        cnName: '毒伤',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 6,
        spBtlType: 0,
        mainDmg: 30,
        mainBuffId: 'ZhongDu',
        mainBuffTime: 6,
        cd: 3,
        mp: 24
    },
    XiXueShu: {
        id: 'XiXueShu',
        cnName: '吸血术',
        skillType: 1,
        dirType: 1,
        rangeType: 4,
        eleType: 6,
        spBtlType: 0,
        mainDmg: 220,
        subDmg: -110,
        cd: 4,
        mp: 30
    },
    ZhongJie: {
        id: 'ZhongJie',
        cnName: '终结',
        skillType: 1,
        dirType: 1,
        rangeType: 1,
        eleType: 6,
        spBtlType: 0,
        mainDmg: 500,
        cd: 3,
        mp: 20,
        hpLimit: 20
    },
    KuangReZhiWu: {
        id: 'KuangReZhiWu',
        cnName: '狂热之舞',
        skillType: 1,
        dirType: 2,
        rangeType: 3,
        eleType: 1,
        spBtlType: 0,
        mainBuffId: 'ReLi',
        mainBuffTime: 4,
        subBuffId: 'ReLi',
        subBuffTime: 3,
        cd: 8,
        mp: 50
    },
    YuHe: {
        id: 'YuHe',
        cnName: '愈合',
        skillType: 1,
        dirType: 2,
        rangeType: 1,
        eleType: 2,
        spBtlType: 4,
        mainDmg: -420,
        cd: 5,
        mp: 30,
        hpLimit: 50
    },
    XinGuang: {
        id: 'XinGuang',
        cnName: '新光',
        skillType: 3,
        dirType: 2,
        rangeType: 3,
        eleType: 5,
        spBtlType: 0,
        mainDmg: -600,
        subDmg: -500,
        rage: 90
    },
    XieE: {
        id: 'XieE',
        cnName: '邪恶',
        skillType: 2,
        dirType: 2,
        rangeType: 1,
        eleType: 6,
        spBtlType: 0,
        mainBuffId: 'XieE',
        mainBuffTime: 3,
        cd: 5,
        mp: 28
    },
    ELingGuiChao: {
        id: 'ELingGuiChao',
        cnName: '恶灵归巢',
        skillType: 1,
        dirType: 2,
        rangeType: 3,
        eleType: 6,
        spBtlType: 1,
        mainDmg: -500,
        subBuffId: 'GeShang',
        subBuffTime: 2,
        cd: 2,
        mp: 10,
        hpLimit: 40
    },
    BaoZha: {
        id: 'BaoZha',
        cnName: '爆炸',
        skillType: 3,
        dirType: 1,
        rangeType: 3,
        eleType: 1,
        spBtlType: 0,
        mainDmg: 500,
        subDmg: 400,
        rage: 75
    },
    TaiKongWu: {
        id: 'TaiKongWu',
        cnName: '太空舞',
        skillType: 3,
        dirType: 2,
        rangeType: 1,
        eleType: 3,
        spBtlType: 0,
        mainBuffId: 'KongWu',
        mainBuffTime: 15,
        rage: 50
    },
    QiMenDunJia: {
        id: 'QiMenDunJia',
        cnName: '奇门遁甲',
        skillType: 3,
        dirType: 1,
        rangeType: 4,
        eleType: 4,
        spBtlType: 0,
        mainBuffId: 'SiMen',
        mainBuffTime: 5,
        subBuffId: 'ShengMen',
        subBuffTime: 5,
        rage: 110
    },
    YinYingJiaoSha: {
        id: 'YinYingJiaoSha',
        cnName: '阴影绞杀',
        skillType: 3,
        dirType: 1,
        rangeType: 1,
        eleType: 6,
        spBtlType: 3,
        mainDmg: 2000,
        rage: 70,
        hpLimit: 20
    },
    LiuSha: {
        id: 'LiuSha',
        cnName: '流沙',
        skillType: 2,
        dirType: 1,
        rangeType: 3,
        eleType: 4,
        spBtlType: 0,
        mainBuffId: 'LiuSha',
        mainBuffTime: 3,
        subBuffId: 'LiuSha',
        subBuffTime: 3,
        cd: 6,
        mp: 25
    },
    YuYiShengCheng: {
        id: 'YuYiShengCheng',
        cnName: '羽翼生成',
        skillType: 2,
        dirType: 2,
        rangeType: 2,
        eleType: 3,
        spBtlType: 0,
        mainBuffId: 'FeiXing',
        mainBuffTime: 4,
        subBuffId: 'FeiXing',
        subBuffTime: 4,
        cd: 3,
        mp: 8
    },
    DunQiang: {
        id: 'DunQiang',
        cnName: '盾墙',
        skillType: 2,
        dirType: 2,
        rangeType: 1,
        eleType: 4,
        spBtlType: 3,
        mainBuffId: 'DunQiang',
        mainBuffTime: 1,
        cd: 4,
        mp: 25
    },
    NingJingZhiYu: {
        id: 'NingJingZhiYu',
        cnName: '宁静之雨',
        skillType: 2,
        dirType: 1,
        rangeType: 1,
        eleType: 2,
        spBtlType: 3,
        mainBuffId: 'NingJing',
        mainBuffTime: 4,
        cd: 4,
        mp: 17
    },
    JingShenRanJin: {
        id: 'JingShenRanJin',
        cnName: '精神燃尽',
        skillType: 2,
        dirType: 1,
        rangeType: 1,
        eleType: 1,
        spBtlType: 3,
        mainBuffId: 'JingJin',
        mainBuffTime: 5,
        cd: 5,
        mp: 22
    },
    XiaZhi: {
        id: 'XiaZhi',
        cnName: '夏至',
        skillType: 3,
        dirType: 1,
        rangeType: 3,
        eleType: 1,
        spBtlType: 0,
        mainDmg: 100,
        mainBuffId: 'ZhuoShao',
        mainBuffTime: 6,
        subDmg: 60,
        subBuffId: 'ZhuoShao',
        subBuffTime: 5,
        rage: 65
    }
};
