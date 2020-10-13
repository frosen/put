/**
 * 转换drink model
 */

let convert = require('./xlsToJs');

convert('../put.xls', '../../putsrc/assets/configs/DrinkModelDict.ts', 'drink', 'drinkModelDict', 'DrinkModel', data => {
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
        let price = Number(rowData[7]);

        const cnNameByRank = ['', '', 'Ⅱ', 'Ⅲ'];
        const lvByRank = [0, 0, 1, 3];
        const attrByRank = [0, 0, 2, 3];
        const duraHByRank = [0, 3, 6, 9];

        for (let index = 1; index <= 3; index++) {
            let newId = id + String(index);
            let baseData = {
                id: newId,
                cnName: cnName + cnNameByRank[index],
                lvMax: lv + lvByRank[index],
                rank: index,
                mainAttri,
                mainPercent: mainPercent > 0 ? mainPercent + attrByRank[index] : 0,
                subAttri,
                subPercent: subPercent > 0 ? subPercent + attrByRank[index] : 0,
                dura: duraHByRank[index] * 60 * 60 * 1000,
                price: price * index
            };

            drinkJson[newId] = baseData;
        }
    }

    return drinkJson;
});
