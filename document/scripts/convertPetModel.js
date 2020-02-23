/**
 * 转换pet model
 */

let convert = require('./xlsToJs');

convert('../put.xls', '../../putsrc/assets/configs/PetModels.js', 'pet', function(data) {
    let petJson = [];
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const rowData = data[rowIdx];

        let id = rowData[0];
        let cnName = rowData[1];
        let bioTypeX = rowData[2];

        if (!bioTypeX) {
            console.log(`${cnName}没有固定属性，所以停止`);
            break;
        }
        let bioType = Number(rowData[2].substr(0, 1));
        let eleType = Number(rowData[3].substr(0, 1));
        let battleType = Number(rowData[4].substr(0, 1));
        let speed = Number(rowData[5]);

        let baseStrength = Number(rowData[6]);
        if (!baseStrength) {
            console.log(`${cnName}没有一级属性，所以停止`);
            break;
        }
        let addStrength = Number(rowData[7]);

        let baseConcentration = Number(rowData[8]);
        let addConcentration = Number(rowData[9]);

        let baseDurability = Number(rowData[12]);
        let addDurability = Number(rowData[13]);

        let baseAgility = Number(rowData[10]);
        let addAgility = Number(rowData[11]);

        let baseSensitivity = Number(rowData[14]);
        let addSensitivity = Number(rowData[15]);

        let baseElegant = Number(rowData[16]);
        let addElegant = Number(rowData[17]);

        let petData = {
            id,
            cnName,
            bioType,
            eleType,
            battleType,
            speed,
            baseStrength,
            addStrength,
            baseConcentration,
            addConcentration,
            baseDurability,
            addDurability,
            baseAgility,
            addAgility,
            baseSensitivity,
            addSensitivity,
            baseElegant,
            addElegant
        };
        petJson.push(petData);
    }
    return petJson;
});