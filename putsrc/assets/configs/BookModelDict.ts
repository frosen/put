/*
 * BookModelDict.ts
 *
 * luleyan
 */

export class BookN {
    castAirBook = 'castAirBook';
}

import { BookModel } from '../scripts/DataModel';

export const BookModelDict: { [key: string]: BookModel } = {
    castAirBook: {
        id: 'castAirBook',
        cnName: '苍之手卷',
        price: 1
    }
};
