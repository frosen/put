/**
 * 转换xls到js文件
 */

module.exports = function(xlsFile, jsFile, sheetName, call) {
    let xlsx = require('node-xlsx');

    // 解析得到文档中的所有 sheet
    let sheets = xlsx.parse(xlsFile);

    let thisSheet = null;
    for (const sheet of sheets) {
        if (sheet.name == sheetName) {
            thisSheet = sheet;
            break;
        }
    }

    if (!thisSheet) {
        console.error('No sheet');
        return;
    }

    let json = call(thisSheet.data);

    if (!json) {
        console.error('No JSON');
        return;
    }

    let Fs = require('fs');

    let jsonStr = JSON.stringify(json, null, 4);
    let jsStr = jsonStr.replace(/\"([a-zA-Z0-9]*?)\":/g, '$1:').replace(/\"/g, "'");
    Fs.writeFileSync(jsFile, 'module.exports = ' + jsStr + ';');

    console.log('Done!');
};
