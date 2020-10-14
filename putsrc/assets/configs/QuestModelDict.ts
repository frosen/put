/*
 * QuestModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

import { QuestModel } from 'scripts/DataModel';
  
export const questModelDict: { [key: string]: QuestModel } = {
    LingJianHuiShou: {
        id: 'LingJianHuiShou',
        type: 1,
        cnName: '零件回收',
        descs: [
            '受伤的机械精灵偶尔会掉落一些零件，尽管大多是破铜烂铁，但其中会有一些有利用价值；',
            '尤其是硬质齿轮，那可是维护精灵和工业设备的重要材料啊；'
        ],
        need: {
            itemId: 'YingZhiChiLun',
            count: 30
        },
        awardReput: 100,
        awardMoney: 100,
        awardItemIds: []
    },
    CeShiBaoGao: {
        id: 'CeShiBaoGao',
        type: 2,
        cnName: '测试报告',
        descs: [
            '每过一段时间，我们就要对精灵的工作情况进行测试并汇总数据，方便今后工作的展开；',
            '那么，现在就去帮忙收集一份最新的数据吧；'
        ],
        need: {
            petIds: [
                'NeiRanJiShou',
                'FangShengJiXieBi',
                'YaHuHanJuRen'
            ],
            name: '测试数据',
            count: 20
        },
        awardReput: 100,
        awardMoney: 100,
        awardItemIds: []
    },
    GuiXunYuChengFa: {
        id: 'GuiXunYuChengFa',
        type: 2,
        cnName: '规训与惩罚',
        descs: [
            '内燃机兽是一种脾气暴躁的机械精灵，最近更是时常失控，四处捣乱；',
            '如果你看到失控的一定要先制服他，然后把他们的能源插件带回来以供调查；'
        ],
        need: {
            petIds: [
                'NeiRanJiShou'
            ],
            name: '能源插件',
            count: 10
        },
        awardReput: 100,
        awardMoney: 100,
        awardItemIds: []
    },
    AnQuanSongDa: {
        id: 'AnQuanSongDa',
        type: 3,
        cnName: '安全送达',
        descs: [
            '有一批不稳定状态的原料需要从车间运回基地，但如果只派精灵执行，我们又不太放心原料的安全；',
            '所以现在我们委任你控制你的精灵去把这些物资运送回来，请一定要注意安全；'
        ],
        need: {
            posId: 'GuangJiDianZhiLu',
            step: 1,
            name: '不稳定原料',
            count: 15
        },
        awardReput: 100,
        awardMoney: 100,
        awardItemIds: []
    },
    HuiYiTongZhi: {
        id: 'HuiYiTongZhi',
        type: 4,
        cnName: '会议通知',
        descs: [
            '我们的电气工程师又去车间检修电路了，打电话也不接，每次都这样，我也真是服了；',
            '现在有个重要会议他必须在场，你去找一下他，通知回来开会；'
        ],
        need: {
            posId: 'GuangJiDianZhiLu',
            step: 2,
            name: '电气工程师',
            count: 800
        },
        awardReput: 100,
        awardMoney: 50,
        awardItemIds: []
    }
};
