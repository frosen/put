/**
 * 转换pet model
 */

let convert = require('./xlsToJs');

function getEnum(str) {
    return Number(String(str).substr(0, 1));
}

let sklJson = convert(
    '../put.xls',
    '../../putsrc/assets/configs/SkillModelDict.ts',
    'skill',
    'SkillModelDict',
    'SkillModel',
    function (data) {
        let sklJson = {};
        for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
            const rowData = data[rowIdx];

            let id = rowData[0];
            let cnName = rowData[1];
            let skillType = getEnum(rowData[2]);
            let dirType = getEnum(rowData[4]);
            let rangeType = getEnum(rowData[5]);
            if (!rangeType) {
                console.log(`${cnName}没有设置目标，所以停止`);
                break;
            }
            let eleType = getEnum(rowData[3]);
            let spBtlType = getEnum(rowData[6]);

            let mainDmg = Number(rowData[7]) || 0;
            let mainBuffId = rowData[8] || '';
            let mainBuffTime = Number(rowData[9]) || 0;

            let subDmg = Number(rowData[10]) || 0;
            let subBuffId = rowData[11] || '';
            let subBuffTime = Number(rowData[12]) || 0;

            let cd = Number(rowData[13]);
            let mp = Number(rowData[14]) || 0;
            let rage = Number(rowData[15]) || 0;

            let hpLimit = Number(rowData[16]) || 0;

            if (skillType === 3) {
                if (rage === 0) console.log('绝杀技需要斗志', cnName);
            } else {
                if (isNaN(Number(rowData[13]))) console.log('普通招式需要冷却', cnName);
                if (mp === 0) console.log('普通招式需要灵能消耗', cnName);
                if (typeof cd !== 'number') console.log('普通招式需要冷却', cnName);
            }

            if (rangeType !== 1) {
                if (subDmg || subBuffId) {
                } else console.log('rangeType为', rangeType, '但是没有subDmg或者subBuffId', cnName);
            }

            if (mainBuffId && mainBuffTime === 0) console.log('mainBuffId需要mainBuffTime', cnName);
            if (subBuffId && subBuffTime === 0) console.log('subBuffId需要subBuffTime', cnName);

            const skl = {
                id,
                cnName,
                skillType,
                dirType,
                rangeType,
                eleType,
                spBtlType
            };

            if (mainDmg) skl.mainDmg = mainDmg;
            if (mainBuffId) skl.mainBuffId = mainBuffId;
            if (mainBuffTime) skl.mainBuffTime = mainBuffTime;
            if (subDmg) skl.subDmg = subDmg;
            if (subBuffId) skl.subBuffId = subBuffId;
            if (subBuffTime) skl.subBuffTime = subBuffTime;
            if (cd) skl.cd = cd;
            if (mp) skl.mp = mp;
            if (rage) skl.rage = rage;
            if (hpLimit) skl.hpLimit = hpLimit;

            sklJson[id] = skl;
        }
        return sklJson;
    }
);

if (sklJson) {
    convert('../put.xls', '../../putsrc/assets/configs/SkillIdsByEleType.ts', 'skill', 'SkillIdsByEleType', null, function (d) {
        let skillIds = [];
        for (const sklId in sklJson) {
            if (!sklJson.hasOwnProperty(sklId)) continue;
            const sklData = sklJson[sklId];

            let eleType = sklData.eleType;
            if (eleType === 0) continue;

            if (skillIds[eleType] === undefined) {
                skillIds[eleType] = [];
            }

            skillIds[eleType].push(sklId);
        }

        return skillIds;
    });
}
