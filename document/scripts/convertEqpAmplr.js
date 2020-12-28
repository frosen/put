/**
 * 转换eqp amplr model
 */

let convert = require('./xlsToJs');

convert(
    '../put.xls',
    '../../putsrc/assets/configs/EqpAmplrModelDict.ts',
    'eqpAmplr',
    'EqpAmplrModelDict',
    'EqpAmplrModel',
    data => {
        let drinkJson = {};
        for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
            const rowData = data[rowIdx];

            console.log('>>> ', rowData[0]);

            let id = rowData[0];
            let cnName = rowData[1];
            let lv = Number(rowData[2]);
            let price = Number(rowData[3]);

            let baseData = {
                id,
                cnName,
                lvMax: lv,
                price
            };

            drinkJson[id] = baseData;
        }

        return drinkJson;
    }
);
