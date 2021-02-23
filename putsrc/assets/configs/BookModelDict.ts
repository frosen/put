/*
 * BookModelDict.ts
 *
 * luleyan
 */

export class BookN {
    static castAirBook = 'castAirBook';
}

import { BookModel } from '../scripts/DataModel';
import { FtN } from './FeatureModelDict';

export const BookModelDict: { [key: string]: BookModel } = {
    [BookN.castAirBook]: {
        id: BookN.castAirBook,
        featureId: FtN.castAir,
        cnName: '苍之手卷',
        price: 1
    }
};
