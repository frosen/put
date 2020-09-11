/*
 * PetModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

import { PetModel } from 'scripts/DataModel';
  
export const petModelDict: { [key: string]: PetModel } = {
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
        baseDurability: 110,
        addDurability: 14,
        baseAgility: 220,
        addAgility: 31,
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
            'deadFangHu'
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
        addDurability: 15,
        baseAgility: 200,
        addAgility: 30,
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
            'castUlti'
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
        baseDurability: 135,
        addDurability: 21,
        baseAgility: 150,
        addAgility: 23,
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
            'killAddHp'
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
        baseDurability: 115,
        addDurability: 19,
        baseAgility: 205,
        addAgility: 25,
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
            'castByCombo'
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
        baseDurability: 90,
        addDurability: 13,
        baseAgility: 170,
        addAgility: 19,
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
            'hitRdcMp'
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
        addDurability: 18,
        baseAgility: 220,
        addAgility: 28,
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
            'killRdcCD'
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
        baseDurability: 140,
        addDurability: 21,
        baseAgility: 190,
        addAgility: 20,
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
            'hurtGotMp'
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
        baseDurability: 150,
        addDurability: 27,
        baseAgility: 170,
        addAgility: 17,
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
            'hitByHp'
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
        baseDurability: 80,
        addDurability: 18,
        baseAgility: 190,
        addAgility: 29,
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
            'addHpRdcMp'
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
        baseDurability: 70,
        addDurability: 12,
        baseAgility: 250,
        addAgility: 40,
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
            'hurt'
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
        baseDurability: 100,
        addDurability: 17,
        baseAgility: 210,
        addAgility: 30,
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
            'hurtFullRage'
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
        baseDurability: 125,
        addDurability: 16,
        baseAgility: 200,
        addAgility: 25,
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
            'baseConcentration'
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
        baseDurability: 100,
        addDurability: 16,
        baseAgility: 150,
        addAgility: 27,
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
            'hitAddRg'
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
        baseDurability: 125,
        addDurability: 22,
        baseAgility: 160,
        addAgility: 21,
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
            'deadHuiChun'
        ]
    }
};
