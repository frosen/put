/*
 * DrinkModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

export class DrinkN {
    static LingGanYaoJi1 = 'LingGanYaoJi1';
    static LingGanYaoJi2 = 'LingGanYaoJi2';
    static LingGanYaoJi3 = 'LingGanYaoJi3';
    static ZhiHuiYaoJi1 = 'ZhiHuiYaoJi1';
    static ZhiHuiYaoJi2 = 'ZhiHuiYaoJi2';
    static ZhiHuiYaoJi3 = 'ZhiHuiYaoJi3';
    static MoXingKaFei1 = 'MoXingKaFei1';
    static MoXingKaFei2 = 'MoXingKaFei2';
    static MoXingKaFei3 = 'MoXingKaFei3';
    static QingCaoCha1 = 'QingCaoCha1';
    static QingCaoCha2 = 'QingCaoCha2';
    static QingCaoCha3 = 'QingCaoCha3';
    static MiJiu1 = 'MiJiu1';
    static MiJiu2 = 'MiJiu2';
    static MiJiu3 = 'MiJiu3';
    static YueGuangJiu1 = 'YueGuangJiu1';
    static YueGuangJiu2 = 'YueGuangJiu2';
    static YueGuangJiu3 = 'YueGuangJiu3';
    static QingShuangMoShui1 = 'QingShuangMoShui1';
    static QingShuangMoShui2 = 'QingShuangMoShui2';
    static QingShuangMoShui3 = 'QingShuangMoShui3';
    static MeiLiMoShui1 = 'MeiLiMoShui1';
    static MeiLiMoShui2 = 'MeiLiMoShui2';
    static MeiLiMoShui3 = 'MeiLiMoShui3';
}

import { DrinkModel } from '../scripts/DataModel';

export const DrinkModelDict: { [key: string]: DrinkModel } = {
    LingGanYaoJi1: {
        id: 'LingGanYaoJi1',
        cnName: '灵感药剂',
        lvMax: 10,
        rank: 1,
        mainAttri: 1,
        mainPercent: 10,
        subAttri: 0,
        subPercent: 0,
        dura: 10800000,
        price: 100
    },
    LingGanYaoJi2: {
        id: 'LingGanYaoJi2',
        cnName: '灵感药剂Ⅱ',
        lvMax: 11,
        rank: 2,
        mainAttri: 1,
        mainPercent: 12,
        subAttri: 0,
        subPercent: 0,
        dura: 21600000,
        price: 200
    },
    LingGanYaoJi3: {
        id: 'LingGanYaoJi3',
        cnName: '灵感药剂Ⅲ',
        lvMax: 13,
        rank: 3,
        mainAttri: 1,
        mainPercent: 13,
        subAttri: 0,
        subPercent: 0,
        dura: 32400000,
        price: 300
    },
    ZhiHuiYaoJi1: {
        id: 'ZhiHuiYaoJi1',
        cnName: '智慧药剂',
        lvMax: 10,
        rank: 1,
        mainAttri: 1,
        mainPercent: 20,
        subAttri: 0,
        subPercent: 0,
        dura: 10800000,
        price: 100
    },
    ZhiHuiYaoJi2: {
        id: 'ZhiHuiYaoJi2',
        cnName: '智慧药剂Ⅱ',
        lvMax: 11,
        rank: 2,
        mainAttri: 1,
        mainPercent: 22,
        subAttri: 0,
        subPercent: 0,
        dura: 21600000,
        price: 200
    },
    ZhiHuiYaoJi3: {
        id: 'ZhiHuiYaoJi3',
        cnName: '智慧药剂Ⅲ',
        lvMax: 13,
        rank: 3,
        mainAttri: 1,
        mainPercent: 23,
        subAttri: 0,
        subPercent: 0,
        dura: 32400000,
        price: 300
    },
    MoXingKaFei1: {
        id: 'MoXingKaFei1',
        cnName: '魔性咖啡',
        lvMax: 10,
        rank: 1,
        mainAttri: 2,
        mainPercent: 10,
        subAttri: 0,
        subPercent: 0,
        dura: 10800000,
        price: 100
    },
    MoXingKaFei2: {
        id: 'MoXingKaFei2',
        cnName: '魔性咖啡Ⅱ',
        lvMax: 11,
        rank: 2,
        mainAttri: 2,
        mainPercent: 12,
        subAttri: 0,
        subPercent: 0,
        dura: 21600000,
        price: 200
    },
    MoXingKaFei3: {
        id: 'MoXingKaFei3',
        cnName: '魔性咖啡Ⅲ',
        lvMax: 13,
        rank: 3,
        mainAttri: 2,
        mainPercent: 13,
        subAttri: 0,
        subPercent: 0,
        dura: 32400000,
        price: 300
    },
    QingCaoCha1: {
        id: 'QingCaoCha1',
        cnName: '青草茶',
        lvMax: 10,
        rank: 1,
        mainAttri: 2,
        mainPercent: 20,
        subAttri: 0,
        subPercent: 0,
        dura: 10800000,
        price: 100
    },
    QingCaoCha2: {
        id: 'QingCaoCha2',
        cnName: '青草茶Ⅱ',
        lvMax: 11,
        rank: 2,
        mainAttri: 2,
        mainPercent: 22,
        subAttri: 0,
        subPercent: 0,
        dura: 21600000,
        price: 200
    },
    QingCaoCha3: {
        id: 'QingCaoCha3',
        cnName: '青草茶Ⅲ',
        lvMax: 13,
        rank: 3,
        mainAttri: 2,
        mainPercent: 23,
        subAttri: 0,
        subPercent: 0,
        dura: 32400000,
        price: 300
    },
    MiJiu1: {
        id: 'MiJiu1',
        cnName: '米酒',
        lvMax: 10,
        rank: 1,
        mainAttri: 3,
        mainPercent: 10,
        subAttri: 0,
        subPercent: 0,
        dura: 10800000,
        price: 100
    },
    MiJiu2: {
        id: 'MiJiu2',
        cnName: '米酒Ⅱ',
        lvMax: 11,
        rank: 2,
        mainAttri: 3,
        mainPercent: 12,
        subAttri: 0,
        subPercent: 0,
        dura: 21600000,
        price: 200
    },
    MiJiu3: {
        id: 'MiJiu3',
        cnName: '米酒Ⅲ',
        lvMax: 13,
        rank: 3,
        mainAttri: 3,
        mainPercent: 13,
        subAttri: 0,
        subPercent: 0,
        dura: 32400000,
        price: 300
    },
    YueGuangJiu1: {
        id: 'YueGuangJiu1',
        cnName: '月光酒',
        lvMax: 10,
        rank: 1,
        mainAttri: 3,
        mainPercent: 20,
        subAttri: 0,
        subPercent: 0,
        dura: 10800000,
        price: 100
    },
    YueGuangJiu2: {
        id: 'YueGuangJiu2',
        cnName: '月光酒Ⅱ',
        lvMax: 11,
        rank: 2,
        mainAttri: 3,
        mainPercent: 22,
        subAttri: 0,
        subPercent: 0,
        dura: 21600000,
        price: 200
    },
    YueGuangJiu3: {
        id: 'YueGuangJiu3',
        cnName: '月光酒Ⅲ',
        lvMax: 13,
        rank: 3,
        mainAttri: 3,
        mainPercent: 23,
        subAttri: 0,
        subPercent: 0,
        dura: 32400000,
        price: 300
    },
    QingShuangMoShui1: {
        id: 'QingShuangMoShui1',
        cnName: '清爽魔水',
        lvMax: 10,
        rank: 1,
        mainAttri: 4,
        mainPercent: 10,
        subAttri: 0,
        subPercent: 0,
        dura: 10800000,
        price: 100
    },
    QingShuangMoShui2: {
        id: 'QingShuangMoShui2',
        cnName: '清爽魔水Ⅱ',
        lvMax: 11,
        rank: 2,
        mainAttri: 4,
        mainPercent: 12,
        subAttri: 0,
        subPercent: 0,
        dura: 21600000,
        price: 200
    },
    QingShuangMoShui3: {
        id: 'QingShuangMoShui3',
        cnName: '清爽魔水Ⅲ',
        lvMax: 13,
        rank: 3,
        mainAttri: 4,
        mainPercent: 13,
        subAttri: 0,
        subPercent: 0,
        dura: 32400000,
        price: 300
    },
    MeiLiMoShui1: {
        id: 'MeiLiMoShui1',
        cnName: '魅力魔水',
        lvMax: 10,
        rank: 1,
        mainAttri: 4,
        mainPercent: 20,
        subAttri: 0,
        subPercent: 0,
        dura: 10800000,
        price: 100
    },
    MeiLiMoShui2: {
        id: 'MeiLiMoShui2',
        cnName: '魅力魔水Ⅱ',
        lvMax: 11,
        rank: 2,
        mainAttri: 4,
        mainPercent: 22,
        subAttri: 0,
        subPercent: 0,
        dura: 21600000,
        price: 200
    },
    MeiLiMoShui3: {
        id: 'MeiLiMoShui3',
        cnName: '魅力魔水Ⅲ',
        lvMax: 13,
        rank: 3,
        mainAttri: 4,
        mainPercent: 23,
        subAttri: 0,
        subPercent: 0,
        dura: 32400000,
        price: 300
    }
};
