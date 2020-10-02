/**
 * 转换quest model
 */

let convert = require('./xlsToJs');

convert('../put.xls', '../../putsrc/assets/configs/QuestModelDict.ts', 'quest', 'questModelDict', 'QuestModel', data => {
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
            need.count = Number(rowData[5]);
        } else if (type === 2 || type === 3) {
            need.petIds = rowData[3].split(',');
            need.name = rowData[4];
            need.count = Number(rowData[5]);
        } else if (type === 4) {
            const posData = rowData[3].split('-');
            need.posId = posData[0];
            need.step = Number(posData[1]);
            need.name = rowData[4];
            need.count = Number(rowData[5]);
        } else if (type === 5) {
            const posData = rowData[3].split('-');
            need.posId = posData[0];
            need.step = Number(posData[1]);
            need.name = rowData[4];
            need.time = Number(rowData[5]);
        } else {
            throw 'error type';
        }

        let awardReput = Number(rowData[6]);
        let awardMoney = Number(rowData[7]);
        let awardItem = rowData[8].split(',');

        let desc = rowData[9] + '\n' + rowData[10];

        let baseData = {
            id,
            type,
            cnName,
            desc,
            need,

            awardReput,
            awardMoney,
            awardItem
        };

        questJson[id] = baseData;
    }

    return questJson;
});
