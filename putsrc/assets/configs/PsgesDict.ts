/*
 * PsgesDict.ts
 * 每个story的psges的索引
 * luleyan
 */

import { Psge } from '../scripts/DataModel';

import { RuZhiBaoDao } from '../stories/RuZhiBaoDao';
import { RuZhiBaoDao2 } from '../stories/RuZhiBaoDao2';

export const PsgesDict: { [key: string]: Psge[] } = {
    RuZhiBaoDao: RuZhiBaoDao,
    RuZhiBaoDao2: RuZhiBaoDao2
};

export const CnNameDictForCheck: { [key: string]: string } = {
    RuZhiBaoDao: '入职报到',
    RuZhiBaoDao2: '入职报到2'
};
