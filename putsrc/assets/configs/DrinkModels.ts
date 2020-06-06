/*
 * DrinkModels.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

import { DrinkModel } from 'scripts/DataModel';
  
export let drinkModels: { [key: string]: DrinkModel } = {
    LingGanYaoJi: {
        id: 'LingGanYaoJi',
        cnName: '灵感药剂',
        lv: 1,
        mainAttri: 1,
        mainPercent: 15,
        subAttri: 0,
        subPercent: 0,
        aim: 1
    },
    ZhiHuiYaoJi: {
        id: 'ZhiHuiYaoJi',
        cnName: '智慧药剂',
        lv: 1,
        mainAttri: 1,
        mainPercent: 30,
        subAttri: 0,
        subPercent: 0,
        aim: 1
    },
    MoXingKaFei: {
        id: 'MoXingKaFei',
        cnName: '魔性咖啡',
        lv: 1,
        mainAttri: 2,
        mainPercent: 15,
        subAttri: 0,
        subPercent: 0,
        aim: 1
    },
    QingCaoCha: {
        id: 'QingCaoCha',
        cnName: '青草茶',
        lv: 1,
        mainAttri: 2,
        mainPercent: 30,
        subAttri: 0,
        subPercent: 0,
        aim: 1
    },
    MiJiu: {
        id: 'MiJiu',
        cnName: '米酒',
        lv: 1,
        mainAttri: 3,
        mainPercent: 15,
        subAttri: 0,
        subPercent: 0,
        aim: 1
    },
    YueGuangJiu: {
        id: 'YueGuangJiu',
        cnName: '月光酒',
        lv: 1,
        mainAttri: 3,
        mainPercent: 30,
        subAttri: 0,
        subPercent: 0,
        aim: 1
    },
    QingShuangMoShui: {
        id: 'QingShuangMoShui',
        cnName: '清爽魔水',
        lv: 1,
        mainAttri: 4,
        mainPercent: 15,
        subAttri: 0,
        subPercent: 0,
        aim: 2
    },
    MeiLiMoShui: {
        id: 'MeiLiMoShui',
        cnName: '魅力魔水',
        lv: 1,
        mainAttri: 4,
        mainPercent: 30,
        subAttri: 0,
        subPercent: 0,
        aim: 2
    }
};
