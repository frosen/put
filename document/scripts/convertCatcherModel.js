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

        let rankMin = Number(rowData[4]);
        let rankMax = Number(rowData[5]);

        let bioType = Number(rowData[6].substr(0, 1));
        let eleType = Number(rowData[7].substr(0, 1));
        let battleType = Number(rowData[8].substr(0, 1));

        const cnNameByRank = ['', '', 'Ⅱ'];
        const rateByRank = [0, 10, 30];

        for (let index = 1; index <= 2; index++) {
            let newId = id + String(index);
            let baseData = {
                id: newId,
                cnName: cnName + cnNameByRank[index],
                lvMin,
                lvMax,
                rankMin,
                rankMax,
                bioType,
                eleType,
                battleType,
                rate: rateByRank[index]
            };

            catcherJson[newId] = baseData;
        }
    }

    return catcherJson;
});
