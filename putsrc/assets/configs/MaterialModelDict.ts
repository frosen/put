/*
 * MaterialModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

export class MaterialN {
    static YingZhiChiLun = 'YingZhiChiLun';
    static WuLuCao = 'WuLuCao';
    static LingQiSuiPian = 'LingQiSuiPian';
}

import { MaterialModel } from '../scripts/DataModel';

export const MaterialModelDict: { [key: string]: MaterialModel } = {
    YingZhiChiLun: {
        id: 'YingZhiChiLun',
        cnName: '硬质齿轮',
        lvMax: 1,
        price: 100
    },
    WuLuCao: {
        id: 'WuLuCao',
        cnName: '无露草',
        lvMax: 1,
        price: 100
    },
    LingQiSuiPian: {
        id: 'LingQiSuiPian',
        cnName: '灵器碎片',
        lvMax: 1,
        price: 100
    }
};
