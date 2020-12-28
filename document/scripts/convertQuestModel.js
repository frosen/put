/**
 * 转换quest model
 */

let convert = require('./xlsToJs');

convert('../put.xls', '../../putsrc/assets/configs/QuestModelDict.ts', 'quest', 'QuestModelDict', 'QuestModel', data => {
    let questJson = {};
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const rowData = data[rowIdx];

        console.log('>>> ', rowData[0]);

        let id = rowData[0];
        let type = Number(rowData[1].substr(0, 1));
        let cnName = rowData[2];
        let need = {};
        if (type === 1) {
            need.itemId = rowData[3];
        } else if (type === 2) {
            need.petIds = rowData[3].split('/');
            need.name = rowData[4];
        } else if (type === 3) {
            const posData = rowData[3].split('-');
            need.posId = posData[0];
            need.step = Number(posData[1]);
            need.name = rowData[4];
        } else if (type === 4) {
            const posData = rowData[3].split('-');
            need.posId = posData[0];
            need.step = Number(posData[1]);
            need.name = rowData[4];
        } else {
            throw 'error type';
        }
        need.count = Number(rowData[5]);

        let awardReput = Number(rowData[6]);
        let awardMoney = Number(rowData[7]);
        let awardItemIds = rowData[8] ? rowData[8].split(',') : [];

        let descs = [rowData[9], rowData[10]];

        let baseData = {
            id,
            type,
            cnName,
            descs,
            need,

            awardReput,
            awardMoney,
            awardItemIds
        };

        questJson[id] = baseData;
    }

    return questJson;
});
