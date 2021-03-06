/*
 * CatcherModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

export class CatcherN {
    static PuTongXianJing1 = 'PuTongXianJing1';
    static PuTongXianJing2 = 'PuTongXianJing2';
    static GaoJiXianJing1 = 'GaoJiXianJing1';
    static GaoJiXianJing2 = 'GaoJiXianJing2';
    static MoFaXianJing1 = 'MoFaXianJing1';
    static MoFaXianJing2 = 'MoFaXianJing2';
    static JiXieXianJing1 = 'JiXieXianJing1';
    static JiXieXianJing2 = 'JiXieXianJing2';
    static BuShouJia1 = 'BuShouJia1';
    static BuShouJia2 = 'BuShouJia2';
    static YouMoCao1 = 'YouMoCao1';
    static YouMoCao2 = 'YouMoCao2';
    static CiLiPan1 = 'CiLiPan1';
    static CiLiPan2 = 'CiLiPan2';
    static ShiXiangHua1 = 'ShiXiangHua1';
    static ShiXiangHua2 = 'ShiXiangHua2';
}

import { CatcherModel } from '../scripts/DataModel';

export const CatcherModelDict: { [key: string]: CatcherModel } = {
    PuTongXianJing1: {
        id: 'PuTongXianJing1',
        cnName: '普通陷阱',
        lvMin: 1,
        lvMax: 15,
        bioType: 0,
        eleType: 0,
        btlType: 0,
        rate: 6,
        price: 100
    },
    PuTongXianJing2: {
        id: 'PuTongXianJing2',
        cnName: '普通陷阱Ⅱ',
        lvMin: 1,
        lvMax: 15,
        bioType: 0,
        eleType: 0,
        btlType: 0,
        rate: 16,
        price: 200
    },
    GaoJiXianJing1: {
        id: 'GaoJiXianJing1',
        cnName: '高级陷阱',
        lvMin: 5,
        lvMax: 15,
        bioType: 0,
        eleType: 0,
        btlType: 0,
        rate: 6,
        price: 100
    },
    GaoJiXianJing2: {
        id: 'GaoJiXianJing2',
        cnName: '高级陷阱Ⅱ',
        lvMin: 5,
        lvMax: 15,
        bioType: 0,
        eleType: 0,
        btlType: 0,
        rate: 16,
        price: 200
    },
    MoFaXianJing1: {
        id: 'MoFaXianJing1',
        cnName: '魔法陷阱',
        lvMin: 16,
        lvMax: 20,
        bioType: 2,
        eleType: 0,
        btlType: 0,
        rate: 6,
        price: 100
    },
    MoFaXianJing2: {
        id: 'MoFaXianJing2',
        cnName: '魔法陷阱Ⅱ',
        lvMin: 16,
        lvMax: 20,
        bioType: 2,
        eleType: 0,
        btlType: 0,
        rate: 16,
        price: 200
    },
    JiXieXianJing1: {
        id: 'JiXieXianJing1',
        cnName: '机械陷阱',
        lvMin: 16,
        lvMax: 20,
        bioType: 3,
        eleType: 0,
        btlType: 0,
        rate: 6,
        price: 100
    },
    JiXieXianJing2: {
        id: 'JiXieXianJing2',
        cnName: '机械陷阱Ⅱ',
        lvMin: 16,
        lvMax: 20,
        bioType: 3,
        eleType: 0,
        btlType: 0,
        rate: 16,
        price: 200
    },
    BuShouJia1: {
        id: 'BuShouJia1',
        cnName: '捕兽夹',
        lvMin: 16,
        lvMax: 20,
        bioType: 4,
        eleType: 0,
        btlType: 0,
        rate: 6,
        price: 100
    },
    BuShouJia2: {
        id: 'BuShouJia2',
        cnName: '捕兽夹Ⅱ',
        lvMin: 16,
        lvMax: 20,
        bioType: 4,
        eleType: 0,
        btlType: 0,
        rate: 16,
        price: 200
    },
    YouMoCao1: {
        id: 'YouMoCao1',
        cnName: '诱魔草',
        lvMin: 16,
        lvMax: 20,
        bioType: 2,
        eleType: 0,
        btlType: 0,
        rate: 6,
        price: 100
    },
    YouMoCao2: {
        id: 'YouMoCao2',
        cnName: '诱魔草Ⅱ',
        lvMin: 16,
        lvMax: 20,
        bioType: 2,
        eleType: 0,
        btlType: 0,
        rate: 16,
        price: 200
    },
    CiLiPan1: {
        id: 'CiLiPan1',
        cnName: '磁力盘',
        lvMin: 16,
        lvMax: 20,
        bioType: 3,
        eleType: 0,
        btlType: 0,
        rate: 6,
        price: 100
    },
    CiLiPan2: {
        id: 'CiLiPan2',
        cnName: '磁力盘Ⅱ',
        lvMin: 16,
        lvMax: 20,
        bioType: 3,
        eleType: 0,
        btlType: 0,
        rate: 16,
        price: 200
    },
    ShiXiangHua1: {
        id: 'ShiXiangHua1',
        cnName: '十香花',
        lvMin: 16,
        lvMax: 20,
        bioType: 4,
        eleType: 0,
        btlType: 0,
        rate: 6,
        price: 100
    },
    ShiXiangHua2: {
        id: 'ShiXiangHua2',
        cnName: '十香花Ⅱ',
        lvMin: 16,
        lvMax: 20,
        bioType: 4,
        eleType: 0,
        btlType: 0,
        rate: 16,
        price: 200
    }
};
