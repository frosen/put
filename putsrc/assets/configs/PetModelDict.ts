/*
 * PetModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

import { PetModel } from '../scripts/DataModel';

export const PetModelDict: { [key: string]: PetModel } = {
    FaTiaoWa: {
        id: 'FaTiaoWa',
        cnName: '发条蛙',
        bioType: 3,
        eleType: 4,
        battleType: 1,
        speed: 62,
        baseStrength: 190,
        addStrength: 32,
        baseConcentration: 160,
        addConcentration: 27,
        baseDurability: 120,
        addDurability: 31,
        baseAgility: 110,
        addAgility: 14,
        baseSensitivity: 120,
        addSensitivity: 16,
        baseElegant: 100,
        addElegant: 9,
        selfSkillIds: [
            'FangHuZhao',
            'BengHuai'
        ],
        selfFeatureIds: [
            'addAtkDmg',
            'hurtGotRage',
            'baseDurability',
            'deadFangHu',
            'addHpMax',
            'hitWithEarth'
        ]
    },
    NeiRanJiShou: {
        id: 'NeiRanJiShou',
        cnName: '内燃机兽',
        bioType: 3,
        eleType: 1,
        battleType: 1,
        speed: 50,
        baseStrength: 200,
        addStrength: 30,
        baseConcentration: 200,
        addConcentration: 30,
        baseDurability: 100,
        addDurability: 30,
        baseAgility: 100,
        addAgility: 15,
        baseSensitivity: 100,
        addSensitivity: 15,
        baseElegant: 100,
        addElegant: 15,
        selfSkillIds: [
            'HuoYanDan',
            'BaoZha'
        ],
        selfFeatureIds: [
            'baseStrength',
            'addCritRate',
            'addCritDmgRate',
            'castUlti',
            'castFire',
            'hurtWithAss'
        ]
    },
    FangShengJiXieBi: {
        id: 'FangShengJiXieBi',
        cnName: '仿生机械臂',
        bioType: 3,
        eleType: 4,
        battleType: 1,
        speed: 49,
        baseStrength: 210,
        addStrength: 37,
        baseConcentration: 170,
        addConcentration: 34,
        baseDurability: 50,
        addDurability: 23,
        baseAgility: 135,
        addAgility: 21,
        baseSensitivity: 50,
        addSensitivity: 8,
        baseElegant: 120,
        addElegant: 13,
        selfSkillIds: [
            'ChaoZhongJi',
            'FangHuZhao'
        ],
        selfFeatureIds: [
            'addAtkMax',
            'beginReLi',
            'hitKill',
            'killAddHp',
            'addEvdRate',
            'baseAgility'
        ]
    },
    YaHuHanJuRen: {
        id: 'YaHuHanJuRen',
        cnName: '氩弧焊巨人',
        bioType: 3,
        eleType: 1,
        battleType: 2,
        speed: 75,
        baseStrength: 160,
        addStrength: 25,
        baseConcentration: 190,
        addConcentration: 31,
        baseDurability: 105,
        addDurability: 25,
        baseAgility: 115,
        addAgility: 19,
        baseSensitivity: 80,
        addSensitivity: 14,
        baseElegant: 50,
        addElegant: 18,
        selfSkillIds: [
            'ZhuoShao',
            'HuoYanDan'
        ],
        selfFeatureIds: [
            'addSklDmg',
            'hitWithFire',
            'castByPetCount',
            'castByCombo',
            'hurtRdcMp',
            'addSklMax'
        ]
    },
    ZiJingMieHuoQi: {
        id: 'ZiJingMieHuoQi',
        cnName: '自警灭火器',
        bioType: 3,
        eleType: 2,
        battleType: 2,
        speed: 13,
        baseStrength: 220,
        addStrength: 41,
        baseConcentration: 150,
        addConcentration: 20,
        baseDurability: 70,
        addDurability: 19,
        baseAgility: 90,
        addAgility: 13,
        baseSensitivity: 110,
        addSensitivity: 21,
        baseElegant: 90,
        addElegant: 12,
        selfSkillIds: [
            'JingJie',
            'JingZhongChangMing'
        ],
        selfFeatureIds: [
            'hitRdcRg',
            'baseSensitivity',
            'killAddAllHp',
            'hitRdcMp',
            'hitWithWater',
            'hurtWithAtk'
        ]
    },
    ShuiLengJiQiRen: {
        id: 'ShuiLengJiQiRen',
        cnName: '水冷机器人',
        bioType: 3,
        eleType: 2,
        battleType: 3,
        speed: 66,
        baseStrength: 170,
        addStrength: 27,
        baseConcentration: 180,
        addConcentration: 26,
        baseDurability: 120,
        addDurability: 28,
        baseAgility: 120,
        addAgility: 18,
        baseSensitivity: 70,
        addSensitivity: 11,
        baseElegant: 80,
        addElegant: 16,
        selfSkillIds: [
            'ShuiLengDan',
            'ShuangDong'
        ],
        selfFeatureIds: [
            'castWater',
            'addByLuck',
            'hurtByHp',
            'killRdcCD',
            'hitByHp',
            'baseConcentration'
        ]
    },
    JiXieMaoMi: {
        id: 'JiXieMaoMi',
        cnName: '机械猫咪',
        bioType: 3,
        eleType: 1,
        battleType: 3,
        speed: 70,
        baseStrength: 190,
        addStrength: 22,
        baseConcentration: 165,
        addConcentration: 36,
        baseDurability: 90,
        addDurability: 20,
        baseAgility: 140,
        addAgility: 21,
        baseSensitivity: 90,
        addSensitivity: 19,
        baseElegant: 150,
        addElegant: 21,
        selfSkillIds: [
            'ReLi',
            'JingShenRanJin'
        ],
        selfFeatureIds: [
            'addMpMax',
            'baseElegant',
            'addAtkBySkl',
            'hurtGotMp',
            'hurtWithShoot',
            'hitAddMp'
        ]
    },
    HeiFengWuRenJi: {
        id: 'HeiFengWuRenJi',
        cnName: '黑蜂无人机',
        bioType: 3,
        eleType: 3,
        battleType: 4,
        speed: 85,
        baseStrength: 180,
        addStrength: 31,
        baseConcentration: 210,
        addConcentration: 25,
        baseDurability: 70,
        addDurability: 17,
        baseAgility: 150,
        addAgility: 27,
        baseSensitivity: 60,
        addSensitivity: 7,
        baseElegant: 100,
        addElegant: 13,
        selfSkillIds: [
            'YinSuQiLiu',
            'TaiKongWu'
        ],
        selfFeatureIds: [
            'addHitRate',
            'addDmgRdcHp',
            'baseAgility',
            'hitByHp',
            'hitWithAir',
            'killAddAllHp'
        ]
    },
    CiHuaYouLing: {
        id: 'CiHuaYouLing',
        cnName: '磁化幽灵',
        bioType: 3,
        eleType: 5,
        battleType: 5,
        speed: 45,
        baseStrength: 205,
        addStrength: 18,
        baseConcentration: 190,
        addConcentration: 32,
        baseDurability: 90,
        addDurability: 29,
        baseAgility: 80,
        addAgility: 18,
        baseSensitivity: 100,
        addSensitivity: 13,
        baseElegant: 130,
        addElegant: 11,
        selfSkillIds: [
            'DianZiMaiChong',
            'ZhiMang'
        ],
        selfFeatureIds: [
            'hitWithLight',
            'castLight',
            'addDfsRate',
            'addHpRdcMp',
            'baseDurability',
            'castConDmg'
        ]
    },
    DianZiShouWei: {
        id: 'DianZiShouWei',
        cnName: '电子守卫',
        bioType: 3,
        eleType: 5,
        battleType: 1,
        speed: 36,
        baseStrength: 250,
        addStrength: 25,
        baseConcentration: 110,
        addConcentration: 25,
        baseDurability: 150,
        addDurability: 40,
        baseAgility: 70,
        addAgility: 12,
        baseSensitivity: 80,
        addSensitivity: 12,
        baseElegant: 80,
        addElegant: 12,
        selfSkillIds: [
            'MieShi',
            'ShengGuang'
        ],
        selfFeatureIds: [
            'addHpMax',
            'beginAddRage',
            'hurtAndHurt',
            'hurt',
            'addAtkMax',
            'hurtOthers'
        ]
    },
    CaoPingShouGeZhe: {
        id: 'CaoPingShouGeZhe',
        cnName: '草坪收割者',
        bioType: 3,
        eleType: 3,
        battleType: 5,
        speed: 60,
        baseStrength: 200,
        addStrength: 26,
        baseConcentration: 190,
        addConcentration: 24,
        baseDurability: 110,
        addDurability: 30,
        baseAgility: 100,
        addAgility: 17,
        baseSensitivity: 90,
        addSensitivity: 20,
        baseElegant: 90,
        addElegant: 10,
        selfSkillIds: [
            'JiFengRen',
            'TaiFeng'
        ],
        selfFeatureIds: [
            'killAddMp',
            'addEvdRate',
            'deadHurt',
            'hurtFullRage',
            'addCritDmgRate',
            'baseSensitivity'
        ]
    },
    JiXieXiuLiShi: {
        id: 'JiXieXiuLiShi',
        cnName: '机械修理师',
        bioType: 3,
        eleType: 1,
        battleType: 1,
        speed: 38,
        baseStrength: 150,
        addStrength: 21,
        baseConcentration: 260,
        addConcentration: 40,
        baseDurability: 100,
        addDurability: 25,
        baseAgility: 125,
        addAgility: 16,
        baseSensitivity: 130,
        addSensitivity: 15,
        baseElegant: 60,
        addElegant: 8,
        selfSkillIds: [
            'RongJie',
            'KuangReZhiWu'
        ],
        selfFeatureIds: [
            'addSklMax',
            'healByCombo',
            'hitWithFire',
            'baseConcentration',
            'addMpMax',
            'hurtByHp'
        ]
    },
    HuoHuoTu: {
        id: 'HuoHuoTu',
        cnName: '火火兔',
        bioType: 4,
        eleType: 1,
        battleType: 1,
        speed: 50,
        baseStrength: 230,
        addStrength: 31,
        baseConcentration: 220,
        addConcentration: 32,
        baseDurability: 50,
        addDurability: 27,
        baseAgility: 100,
        addAgility: 16,
        baseSensitivity: 100,
        addSensitivity: 10,
        baseElegant: 100,
        addElegant: 17,
        selfSkillIds: [
            'LiaoYuan',
            'HuoYanDan'
        ],
        selfFeatureIds: [
            'castFire',
            'hurtWithCast',
            'castEleRein',
            'hitAddRg',
            'castByPetCount',
            'baseStrength'
        ]
    },
    BaiLanYuYan: {
        id: 'BaiLanYuYan',
        cnName: '白蓝雨燕',
        bioType: 4,
        eleType: 3,
        battleType: 3,
        speed: 90,
        baseStrength: 120,
        addStrength: 10,
        baseConcentration: 320,
        addConcentration: 45,
        baseDurability: 60,
        addDurability: 21,
        baseAgility: 125,
        addAgility: 22,
        baseSensitivity: 130,
        addSensitivity: 17,
        baseElegant: 60,
        addElegant: 18,
        selfSkillIds: [
            'HuiChunShu',
            'YuYiShengCheng'
        ],
        selfFeatureIds: [
            'heal',
            'hurtWithAss',
            'healByHp',
            'deadHuiChun',
            'addCritRate',
            'hurtGotMp'
        ]
    }
};
