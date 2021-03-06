/**
 * 转换xls到js文件
 */

module.exports = function (xlsFile, jsFile, sheetName, dataName, className, nameClassNameOrCall, call) {
    let xlsx = require('node-xlsx');

    // 解析得到文档中的所有 sheet
    let sheets = xlsx.parse(xlsFile);

    let thisSheet = null;
    for (const sheet of sheets) {
        if (sheet.name === sheetName) {
            thisSheet = sheet;
            break;
        }
    }

    if (!thisSheet) {
        console.error('No sheet');
        return;
    }

    const realCall = typeof nameClassNameOrCall === 'function' ? nameClassNameOrCall : call;
    const realNameClassName = typeof nameClassNameOrCall === 'string' ? nameClassNameOrCall : undefined;

    let json = realCall(thisSheet.data);

    if (!json) {
        console.error('No JSON');
        return;
    }

    let Fs = require('fs');

    let jsonStr = JSON.stringify(json, null, 4);
    let jsStr = jsonStr.replace(/\"([a-zA-Z0-9]*?)\":/g, '$1:').replace(/\"/g, "'");

    let path = require('path');

    let nameClass = '';
    if (!(json instanceof Array)) {
        let names = Object.keys(json);
        let rawName = realNameClassName || className.slice(0, className.indexOf('Model')) + 'N';
        nameClass = '\n\nexport class ' + rawName + ' {\n';
        for (const name of names) nameClass += `    static ${name} = '${name}';\n`;
        nameClass += '}';
    }

    let head = `/*
 * ${path.basename(jsFile)}
 * 数据列表，从document中转义而来
 * luleyan
 */${nameClass}
${className ? '\nimport { ' + className + " } from '../scripts/DataModel';\n" : ''}
export const ${dataName}${className ? ': { [key: string]: ' + className + ' }' : ''} = `;

    Fs.writeFileSync(jsFile, head + jsStr + ';\n');

    console.log('Done!');

    return json;
};
