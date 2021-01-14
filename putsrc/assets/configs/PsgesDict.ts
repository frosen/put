/*
 * PsgesDict.ts
 * 每个story的psges的索引
 * luleyan
 */

import { Psge } from '../scripts/DataModel';

import { RuZhiBaoDao } from '../stories/RuZhiBaoDao';

export const PsgesDict: { [key: string]: Psge[] } = {
    RuZhiBaoDao: RuZhiBaoDao
};
