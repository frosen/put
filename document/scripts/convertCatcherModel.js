/**
 * 转换catcher model
 */

let convert = require('./xlsToJs');

convert('../put.xls', '../../putsrc/assets/configs/CatcherModelDict.ts', 'catcher', 'catcherModelDict', 'CatcherModel', data => {
    let catcherJson = {};
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const rowData = data[rowIdx];

        console.log('>>> ', rowData[0]);

        let id = rowData[0];
        let cnName = rowData[1];
        let lvMin = Number(rowData[2]);
        let lvMax = Number(rowData[3]);

        let bioType = Number(rowData[4].substr(0, 1));
        let eleType = Number(rowData[5].substr(0, 1));
        let battleType = Number(rowData[6].substr(0, 1));
        let price = Number(rowData[7]);

        const cnNameByRank = ['', '', 'Ⅱ'];
        const rateByRank = [0, 6, 16];

        for (let index = 1; index <= 2; index++) {
            let newId = id + String(index);
            let baseData = {
                id: newId,
                cnName: cnName + cnNameByRank[index],
                lvMin,
                lvMax,
                bioType,
                eleType,
                battleType,
                rate: rateByRank[index],
                price: price * index
            };

            catcherJson[newId] = baseData;
        }
    }

    return catcherJson;
});
