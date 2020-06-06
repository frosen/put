/**
 * 转换pet model
 */

let convert = require('./xlsToJs');

convert('../put.xls', '../../putsrc/assets/configs/DrinkModels.ts', 'drink', 'drinkModels', 'DrinkModel', data => {
    let drinkJson = {};
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const rowData = data[rowIdx];

        console.log('>>> ', rowData[0]);

        let id = rowData[0];
        let cnName = rowData[1];
        let lv = Number(rowData[2]);
        let mainAttri = Number(rowData[3].substr(0, 1));
        let mainPercent = Number(rowData[4]);
        let subAttri = Number((rowData[5] || '0').substr(0, 1));
        let subPercent = Number(rowData[6] || '0');
        let aim = Number(rowData[7].substr(0, 1));

        let baseData = {
            id,
            cnName,
            lv,
            mainAttri,
            mainPercent,
            subAttri,
            subPercent,
            aim
        };

        drinkJson[id] = baseData;
    }

    return drinkJson;
});
