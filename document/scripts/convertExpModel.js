/**
 * 转换pet model
 */

let convert = require('./xlsToJs');

convert('../put.xls', '../../putsrc/assets/configs/ExpModels.js', 'exp', function(data) {
    let expJson = [0];
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const rowData = data[rowIdx];
        let lv = rowData[0];
        let exp = rowData[2];
        expJson[lv] = exp;
    }
    return expJson;
});
