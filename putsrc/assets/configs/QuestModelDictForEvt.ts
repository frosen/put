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
        descs: [],
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
