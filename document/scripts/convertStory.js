/**
 * 转换story
 */

const Fs = require('fs');
const Path = require('path');
const htmlparser = require('htmlparser2');

const srcDir = __dirname + '/../story/';
const dstDir = __dirname + '/../../putsrc/assets/stories/';
const indexPath = __dirname + '/../../putsrc/assets/configs/PsgesDict.ts';

const storySrcFileNames = Fs.readdirSync(srcDir);

function getGain(line) {
    const result = htmlparser.parseDOM(line)[0];
    return { type: result.attribs.t, id: result.children[0].data };
}

function getSelection(line) {
    const result = htmlparser.parseDOM(line)[0];
    return { main: result.attribs.main === '1', str: result.attribs.str, id: result.attribs.id };
}

const dataList = [];
for (let index = 0; index < storySrcFileNames.length; index++) {
    const fileName = storySrcFileNames[index];
    if (Path.extname(fileName) !== '.html') continue;

    const fileStr = Fs.readFileSync(Path.join(srcDir, fileName), 'utf-8');
    const lines = fileStr.split('\n');

    const datas = [];
    const optionsList = [[]];

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];
        line = line.trimStart();
        if (line.length === 0) continue;

        line = line.replace(/<s \/>/g, ' ');

        if (line[0] === '<') {
            if (line[1] === 'g') {
                if (!datas[datas.length - 1].gains) datas[datas.length - 1].gains = [];
                datas[datas.length - 1].gains.push(getGain(line));
            } else if (line[1] === 'o') {
                const slcParam = getSelection(line);
                const curOptions = optionsList[optionsList.length - 1];
                if (curOptions.length === 0) {
                    datas[datas.length] = { id: slcParam.id, type: 2 };
                }
                curOptions.push({ slcIdx: datas.length - 1, go: datas.length, data: slcParam });
                optionsList.push([]);
            } else if (line[1] === '/' && line[2] === 'o') {
                optionsList.pop();
                const curOptions = optionsList[optionsList.length - 1];
                const lastOption = curOptions[curOptions.length - 1];
                const lastData = datas[datas.length - 1];
                if (lastData.type !== 1) throw '选择里面没有文字：' + String(lastData);
                lastOption.end = datas.length - 1;
            }
        } else {
            const curOptions = optionsList[optionsList.length - 1];
            if (curOptions.length === 1) throw '只有一个选项: ' + line;
            else if (curOptions.length > 1) {
                let id = '/';
                let main = true;
                let mainCnt = 0;
                for (const option of curOptions) {
                    const optionData = option.data;
                    if (id === '/') id = optionData.id;
                    else if (id !== optionData.id) throw 'param不一致: ' + id;

                    if (optionData.main === false) main = false;
                    else if (main === false) throw 'main一定要在非main上面' + id;

                    if (optionData.main) mainCnt++;
                }

                const slcDataIndex = curOptions[0].slcIdx;
                const slcData = datas[slcDataIndex];

                slcData.mainCnt = mainCnt;

                const finalOptions = [];
                for (const option of curOptions) {
                    finalOptions.push({ str: option.data.str, go: option.go });
                }
                slcData.options = finalOptions;

                for (const option of curOptions) {
                    const endData = datas[option.end];
                    if (option.data.main) endData.go = datas.length;
                    else endData.go = curOptions[0].slcIdx;
                }

                curOptions.length = 0;
            }

            datas[datas.length] = { str: line, type: 1 };
        }
    }

    for (let index = 0; index < datas.length; index++) {
        const data = datas[index];
        data.idx = index;
    }

    dataList.push({ datas, name: fileName.slice(0, fileName.indexOf('.')) });
}

// -----------------------------------------------------------------

const head = `/*
* AAA.ts
* 故事，从document/story中转义而来
* luleyan
*/

export const AAA: any[] = `;

for (const { name, datas } of dataList) {
    const curHead = head.replace(/AAA/g, name);
    const jsonStr = JSON.stringify(datas, null, 4)
        .replace(/\"([a-zA-Z0-9]*?)\":/g, '$1:')
        .replace(/\"/g, "'");
    const finalStr = curHead + jsonStr;
    // console.log(finalStr);
}

const indexHead = `/*
* PsgesDict.ts
* 每个story的psges的索引
* luleyan
*/

import { Psge } from '../scripts/DataModel';

AAA
export const PsgesDict: { [key: string]: Psge[] } = {
BBB};
`;
const importStr = "import { AAA } from '../stories/AAA';\n";
const lineStr = '    AAA: AAA\n';

let importStrs = '';
let lineStrs = '';
for (const { name } of dataList) {
    importStrs += importStr.replace(/AAA/g, name);
    lineStrs += lineStr.replace(/AAA/g, name);
}

const finalIndexStr = indexHead.replace('AAA', importStrs).replace('BBB', lineStrs);
console.log(finalIndexStr);
