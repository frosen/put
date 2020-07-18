/*
 * MaterialModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

import { MaterialModel } from 'scripts/DataModel';
  
export let materialModelDict: { [key: string]: MaterialModel } = {
    YingZhiChiLun: {
        id: 'YingZhiChiLun',
        cnName: '硬质齿轮',
        lvMax: 1
    },
    WuLuCao: {
        id: 'WuLuCao',
        cnName: '无露草',
        lvMax: 1
    },
    LingQiSuiPian: {
        id: 'LingQiSuiPian',
        cnName: '灵器碎片',
        lvMax: 1
    }
};