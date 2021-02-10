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
        type: 1,
        cnName: '一个任务',
        descs: [
            '事件任务，完成后事件才能继续',
            '这是一个任务啊，测试用的 我就是想看多行什么样以及一行到底能显示多少字'
        ],
        need: {
            itemId: 'YingZhiChiLun',
            count: 20
        },
        awardReput: 0,
        awardMoney: 0,
        awardItemIds: []
    }
};
