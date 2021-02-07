/*
 * QuestModelDict.ts
 * QuestModelDictForEvt和QuestModelDictForQuester
 * luleyan
 */

import { QuestModel } from '../scripts/DataModel';
import { QuestModelDictForEvt } from './QuestModelDictForEvt';
import { QuestModelDictForQuester } from './QuestModelDictForQuester';

export const QuestModelDict: { [key: string]: QuestModel } = Object.assign({}, QuestModelDictForEvt, QuestModelDictForQuester);
