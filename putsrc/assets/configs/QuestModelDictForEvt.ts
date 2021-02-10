/*
 * QuestModelDictForEvt.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

export class EQN {
    static YiGeRenWu = 'YiGeRenWu';
}

import { QuestModel } from '../scripts/DataModel';

export const QuestModelDictForEvt: { [key: string]: QuestModel } = {
    YiGeRenWu: {
        id: 'YiGeRenWu',
        type: 2,
        cnName: '一个任务',
        descs: [
            '事件任务，完成后事件才能继续',
            '这是一个任务啊，测试用的'
        ],
        need: {
            petIds: [
                'NeiRanJiShou'
            ],
            name: '原件',
            count: 20
        },
        awardReput: 0,
        awardMoney: 0,
        awardItemIds: []
    }
};
