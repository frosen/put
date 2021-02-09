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
    return { gType: result.attribs.t, id: result.children[0].data };
}

function getSelection(line) {
    const result = htmlparser.parseDOM(line)[0];
    return { main: result.attribs.main === '1', str: result.attribs.str, id: result.attribs.id };
}

function getQuest(line) {
    const result = htmlparser.parseDOM(line)[0];
    const attris = result.attribs;
    const content = result.children[0].data;

    let need = {};
    let type = Number(attris.t);
    if (type === 1) {
        need.itemId = attris.aimid;
    } else if (type === 2) {
        need.petIds = attris.aimid.split('/');
        need.name = attris.aimname;
    } else if (type === 3) {
        const posData = attris.aimid.split('-');
        need.posId = posData[0];
        need.step = Number(posData[1]);
        need.name = attris.aimname;
    } else if (type === 4) {
        const posData = attris.aimid.split('-');
        need.posId = posData[0];
        need.step = Number(posData[1]);
        need.name = attris.aimname;
    } else if (type === 5) {
        need.ttlId = attris.aimid;
        need.data = Number(attris.aimname) || attris.aimname;
    } else {
        throw 'error quest type: ' + JSON.stringify(attris);
    }
    need.count = Number(attris.cnt);

    return {
        quest: {
            id: content,
            type: attris.t,
            cnName: attris.cnname,
            descs: [],
            need,
            awardReput: 0,
            awardMoney: 0,
            awardItemIds: 0
        },
        psge: { questId: content, tip: attris.tip }
    };
}

function getCPK(line) {
    const result = htmlparser.parseDOM(line)[0];
    return result.children[0].data;
}

const PTYPE = {
    head: 1,
    normal: 2,
    selection: 3,
    quest: 4,
    evt: 5,
    nameInput: 6,
    end: 7
};

const dataList = [];
const questDatas = [];
const cpkDict = {};
const idList = []; // 用于检测是否有重复的id

for (let index = 0; index < storySrcFileNames.length; index++) {
    const fileName = storySrcFileNames[index];
    if (Path.extname(fileName) !== '.html') continue;

    const fileStr = Fs.readFileSync(Path.join(srcDir, fileName), 'utf-8');
    const lines = fileStr.split('\n');

    const datas = [];
    const optionsList = [[]];

    datas[datas.length] = { pType: PTYPE.head };

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];
        line = line.trimStart();
        if (line.length === 0) continue;

        line = line.replace(/<s \/>/g, ' ');

        if (line[0] === '<') {
            if (line[1] === 'g') {
                // gain
                if (!datas[datas.length - 1].gains) datas[datas.length - 1].gains = [];
                datas[datas.length - 1].gains.push(getGain(line));
            } else if (line[1] === 'o') {
                // option
                const slcParam = getSelection(line);
                const curOptions = optionsList[optionsList.length - 1];
                if (curOptions.length === 0) {
                    datas[datas.length] = { pType: PTYPE.selection, slcId: slcParam.id };
                    idList.push(slcParam.id);
                }
                curOptions.push({ slcIdx: datas.length - 1, go: datas.length, data: slcParam });
                optionsList.push([]);
            } else if (line[1] === '/' && line[2] === 'o') {
                // </option>
                optionsList.pop();
                const curOptions = optionsList[optionsList.length - 1];
                const lastOption = curOptions[curOptions.length - 1];
                const lastData = datas[datas.length - 1];
                if (lastData.pType !== PTYPE.normal) throw '选择里面没有文字：' + JSON.stringify(lastData);
                lastOption.endNPsgeIdx = datas.length - 1;
            } else if (line[1] === 'q') {
                const { quest, psge } = getQuest(line);
                questDatas.push(quest);
                datas[datas.length] = { pType: PTYPE.quest, questId: psge.questId, tip: psge.tip };
                idList.push(psge.questId);
            } else if (line[1] === 'e') {
            } else if (line[1] === 'c') {
                const cpk = getCPK(line);
                if (cpkDict.hasOwnProperty(cpk)) throw 'cpk重复: ' + String(cpk);
                cpkDict[cpk] = datas.length - 1;
            } else {
                throw 'Wrong html label';
            }
        } else {
            const curOptions = optionsList[optionsList.length - 1];
            if (curOptions.length === 1) throw '只有一个选项: ' + line;
            else if (curOptions.length > 8) throw '选项太多了吧' + line;
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
                    const endNPsgeData = datas[option.endNPsgeIdx];
                    // 所有option结束后的第一个psge
                    if (option.data.main) endNPsgeData.go = datas.length;
                    // selectionPsge的索引
                    else endNPsgeData.go = curOptions[0].slcIdx;
                }

                curOptions.length = 0;
            }

            datas[datas.length] = { pType: PTYPE.normal, str: '       ' + line };
        }
    }

    datas[datas.length] = { pType: PTYPE.end };

    for (let index = 0; index < datas.length; index++) {
        const data = datas[index];
        data.idx = index;
    }

    dataList.push({ datas, name: fileName.slice(0, fileName.indexOf('.')) });
}

// 检测id是否有重复
idList.sort();
for (let index = 0; index < idList.length - 1; index++) {
    if (idList[index] === idList[index + 1]) {
        throw '重复id（包括questId，evtId和slcId）：' + idList[index];
    }
}

// 保存成文件 -----------------------------------------------------------------

function runExec(command, needExit = true, options = { cwd: __dirname }) {
    return new Promise((resolve, reject) => {
        // console.log('cmd: ', command);
        let workerProcess = require('child_process').exec(command, options, (error, stdout, stderr) => {
            if (!error) {
                // console.log('成功', stdout);
                return resolve(stdout);
            } else {
                console.log('失败:::', command, error, stdout, stderr);
                if (needExit) process.exit(-1);
                else return resolve(null);
            }
        });

        workerProcess.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        workerProcess.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
    });
}

const head = `/*
 * AAA.ts
 * 故事，从document/story中转义而来
 * luleyan
 */

export const AAA: any[] = `;

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

(async () => {
    if (Fs.existsSync(dstDir)) {
        await runExec(`rm -rf ${dstDir}*`);
    }
    await runExec(`mkdir -p ${dstDir}`);

    for (const { name, datas } of dataList) {
        const curHead = head.replace(/AAA/g, name);
        const jsonStr = JSON.stringify(datas, null, 4)
            .replace(/\"([a-zA-Z0-9]*?)\":/g, '$1:')
            .replace(/\"/g, "'");
        const finalStr = curHead + jsonStr;

        const filePath = dstDir + name + '.ts';
        Fs.writeFileSync(filePath, finalStr);
        console.log('生成故事 ' + filePath);
    }

    if (Fs.existsSync(indexPath)) {
        await runExec(`rm -rf ${indexPath}`);
    }

    let importStrs = '';
    let lineStrs = '';
    for (const { name } of dataList) {
        importStrs += importStr.replace(/AAA/g, name);
        lineStrs += lineStr.replace(/AAA/g, name);
    }

    const finalIndexStr = indexHead.replace('AAA', importStrs).replace('BBB', lineStrs);
    Fs.writeFileSync(indexPath, finalIndexStr);

    console.log('生成索引 ' + indexPath);

    console.log('Done!');
})();

// 生成quest -----------------------------------------------------------------

let convert = require('./xlsToJs');

convert(
    '../put.xls',
    '../../putsrc/assets/configs/QuestModelDictForEvt.ts',
    'quest',
    'QuestModelDictForEvt',
    'QuestModel',
    'EQN',
    () => {
        const dict = {};
        for (const data of questDatas) {
            dict[data.id] = data;
        }
        return dict;
    }
);

// 生成cpk -----------------------------------------------------------------

console.log(cpkDict);
