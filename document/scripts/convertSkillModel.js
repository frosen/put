/**
 * 转换pet model
 */

let convert = require('./xlsToJs');

function getEnum(str) {
    return Number(String(str).substr(0, 1));
}

convert('../put.xls', '../../putsrc/assets/configs/SkillModelDict.js', 'skill', function(data) {
    let sklJson = {};
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const rowData = data[rowIdx];

        let id = rowData[0];
        let cnName = rowData[1];
        let skillType = getEnum(rowData[2]);
        let dirType = getEnum(rowData[4]);
        let aimType = getEnum(rowData[5]);
        if (!aimType) {
            console.log(`${cnName}没有设置目标，所以停止`);
            break;
        }
        let eleType = getEnum(rowData[3]);
        let spBattleType = getEnum(rowData[6]);

        let mainDmg = Number(rowData[7]) || 0;
        let mainBuffId = rowData[8] || '';
        let mainBuffTime = Number(rowData[9]) || 0;

        let subDmg = Number(rowData[10]) || 0;
        let subBuffId = rowData[11] || '';
        let subBuffTime = Number(rowData[12]) || 0;

        let cd = Number(rowData[13]) || 0;
        let mp = Number(rowData[14]) || 0;
        let rage = Number(rowData[15]) || 0;

        let hpLimit = Number(rowData[16]) || 0;

        sklJson[id] = {
            id,
            cnName,
            skillType,
            dirType,
            aimType,
            eleType,
            spBattleType,
            mainDmg,
            mainBuffId,
            mainBuffTime,
            subDmg,
            subBuffId,
            subBuffTime,
            cd,
            mp,
            rage,
            hpLimit
        };
    }
    return sklJson;
});
