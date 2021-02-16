/**
 * 转换story
 */

const Fs = require('fs');
const Path = require('path');
const htmlparser = require('htmlparser2');

const srcDir = __dirname + '/../story/';
const dstDir = __dirname + '/../../putsrc/assets/stories/';
const indexPath = __dirname + '/../../putsrc/assets/configs/PsgesDict.ts';

// 解析-----------------------------------------------------------------

function getCnName(line) {
    const result = htmlparser.parseDOM(line)[0];
    return result.children[0].data;
}

function getGain(line) {
    const result = htmlparser.parseDOM(line)[0];
    const rzt = { gType: Number(result.attribs.t), id: result.children[0].data };
    if (result.attribs.cnt) {
        rzt.cnt = Number(result.attribs.cnt);
    }
    return rzt;
}

function getSelection(line) {
    const result = htmlparser.parseDOM(line)[0];
    return { main: result.attribs.main === '1', str: result.attribs.str, id: result.attribs.id };
}

// tip 一行不能超过22个字 空格算换行
function checkTip(tip) {
    const tips = tip.split(' ');
    for (const tip of tips) {
        if (tip.length > 22) throw 'tip有误，tip一行不能超过22个字 空格算换行：' + tip;
    }
}

function getQuest(line, evtCNName) {
    if (!evtCNName) throw 'no evtCNName before: ' + line;
    const result = htmlparser.parseDOM(line)[0];
    const attris = result.attribs;
    const content = result.children[0].data.trim();

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
    } else {
        throw 'error quest type: ' + JSON.stringify(attris);
    }
    need.count = Number(attris.cnt);

    checkTip(attris.tip);

    return {
        quest: {
            id: content,
            type,
            cnName: attris.cnname,
            descs: ['“' + evtCNName + '”事件展开的任务，完成后事件才能继续', attris.tip || '?'],
            need,
            awardReput: 0,
            awardMoney: 0,
            awardItemIds: []
        },
        psge: { questId: content, tip: attris.tip }
    };
}

function getEvt(line) {
    const result = htmlparser.parseDOM(line)[0];
    const attris = result.attribs;
    const content = result.children[0].data.trim();

    checkTip(attris.tip);

    return {
        evtId: content,
        tip: attris.tip
    };
}

function getOwn(line) {
    const result = htmlparser.parseDOM(line)[0];
    const attris = result.attribs;
    const content = result.children[0].data.trim();

    checkTip(attris.tip);

    return {
        ttlId: content,
        tip: attris.tip
    };
}

function getMark(line) {
    const result = htmlparser.parseDOM(line)[0];
    return result.children[0].data;
}

// -----------------------------------------------------------------

const storySrcFileNames = Fs.readdirSync(srcDir);

const PTYPE = {
    head: 1,
    normal: 2,
    selection: 3,
    quest: 4,
    evt: 5,
    own: 6,
    end: 99
};

const dataList = [];

const slcIds = [];
const questDatas = [];
const marks = [];

for (let index = 0; index < storySrcFileNames.length; index++) {
    const fileName = storySrcFileNames[index];
    if (Path.extname(fileName) !== '.html') continue;

    const fileStr = Fs.readFileSync(Path.join(srcDir, fileName), 'utf-8');
    const oriLines = fileStr.split('\n');

    // 去掉空行，<s />视为空格
    let lines = [];
    for (let index = 0; index < oriLines.length; index++) {
        let line = oriLines[index];
        if (line.length === 0) continue;
        line = line.trim();
        line = line.replace(/<s \/>/g, ' ');
        lines.push(line);
    }

    const datas = [];
    const optionsList = [[]];

    let evtCNName;
    let endEvt;

    const idList = []; // 用于检测是否有重复的id
    const endEvtIdList = [];

    datas[datas.length] = { pType: PTYPE.head };

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line[0] === '<') {
            if (line[1] === 'n') {
                evtCNName = getCnName(line);
            } else if (line[1] === 'g') {
                // gain
                if (!datas[datas.length - 1].gains) datas[datas.length - 1].gains = [];
                datas[datas.length - 1].gains.push(getGain(line));
            } else if (line[1] === 'o') {
                // option
                const slcParam = getSelection(line);
                const curOptions = optionsList[optionsList.length - 1];
                if (curOptions.length === 0) {
                    datas[datas.length] = { pType: PTYPE.selection, slcId: slcParam.id };
                    slcIds.push(slcParam.id);
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
                if (lastData.pType === PTYPE.normal) {
                    lastOption.endNPsgeIdx = datas.length - 1;
                } else if (lastData.pType === PTYPE.end) {
                    lastOption.endNPsgeIdx = -1;
                } else throw '选择里面最后一个psge只能是normal或者end，但现在是：' + JSON.stringify(lastData);
            } else if (line[1] === 'q') {
                // <quest>
                let realLine = line;
                while (true) {
                    if (realLine.includes('</quest>')) break;
                    index++;
                    realLine += ' ' + lines[index];
                }
                const { quest, psge } = getQuest(realLine, evtCNName);
                questDatas.push(quest);
                datas[datas.length] = { pType: PTYPE.quest, questId: psge.questId, tip: psge.tip };
                idList.push(psge.questId);
            } else if (line[1] === 'e') {
                if (line[2] === 'v') {
                    // <evt>
                    let realLine = line;
                    while (true) {
                        if (realLine.includes('</evt>')) break;
                        index++;
                        realLine += lines[index];
                    }
                    const { evtId, tip } = getEvt(realLine);
                    if (index === lines.length - 1 || lines[index + 1].slice(0, 4) === '<end') {
                        endEvt = { evtId, tip }; // 如果是最后一个evt，则和end结合
                        endEvtIdList.push(evtId);
                    } else {
                        datas[datas.length] = { pType: PTYPE.evt, evtId, tip };
                    }
                    idList.push(evtId);
                } else if (line[2] === 'n') {
                    // <end>
                    const endPsge = { pType: PTYPE.end };
                    if (endEvt) {
                        endPsge.evtId = endEvt.evtId;
                        endPsge.tip = endEvt.tip;
                        endEvt = undefined;
                    }
                    datas[datas.length] = endPsge;
                }
            } else if (line[1] === 't') {
                // <ttlown>
                let realLine = line;
                while (true) {
                    if (realLine.includes('</ttlown>')) break;
                    index++;
                    realLine += ' ' + lines[index];
                }
                const { ttlId, tip } = getOwn(realLine);
                datas[datas.length] = { pType: PTYPE.own, ttlId, tip };
                idList.push(ttlId);
            } else if (line[1] === 'm') {
                // <mark>
                const mark = getMark(line);
                datas[datas.length - 1].mark = mark;
                marks.push(mark);
                idList.push(mark);
            } else {
                throw 'Wrong html label';
            }
        } else {
            const curOptions = optionsList[optionsList.length - 1];
            if (curOptions.length === 1) throw '只有一个选项: ' + line;
            else if (curOptions.length > 8) throw '选项太多了吧: ' + line;
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
                    // 大于0是normal psge，小于0是end psge
                    if (option.endNPsgeIdx >= 0) {
                        const endNPsgeData = datas[option.endNPsgeIdx];
                        // 所有option结束后的第一个psge
                        if (option.data.main) endNPsgeData.go = datas.length;
                        // selectionPsge的索引
                        else endNPsgeData.go = curOptions[0].slcIdx;
                    }
                }

                curOptions.length = 0;
            }

            datas[datas.length] = { pType: PTYPE.normal, str: '       ' + line };
        }
    }

    const endPsge = { pType: PTYPE.end };
    if (endEvt) {
        endPsge.evtId = endEvt.evtId;
        endPsge.tip = endEvt.tip;
    }
    datas[datas.length] = endPsge;

    // 赋值idx
    for (let index = 0; index < datas.length; index++) {
        const data = datas[index];
        data.idx = index;
    }

    // 检测
    if (!evtCNName) throw '必有evtName 且这个名字需要与对应事件名相同: ' + fileName;

    // 检测id是否有重复，但不同分支的尾事件有可能是同一个
    idList.sort();
    for (let index = 0; index < idList.length - 1; index++) {
        if (idList[index] === idList[index + 1]) {
            const id = idList[index];
            if (endEvtIdList.includes(id)) {
                console.warn('重复id，但不同分支的尾事件有可能是同一个，请确认：' + id);
            } else {
                throw '重复id（包括questId，evtId，slcId，mark）：' + id;
            }
        }
    }

    dataList.push({ datas, name: fileName.slice(0, fileName.indexOf('.')), evtCNName });
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

SSS
MMM
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

export const CnNameDictForCheck: { [key: string]: string } = {
CCC};
`;
const importStr = "import { AAA } from '../stories/AAA';\n";
const lineStr = '    AAA: AAA';
const checkLineStr = "    AAA: 'BBB'";

(async () => {
    if (Fs.existsSync(dstDir)) {
        await runExec(`rm -rf ${dstDir}*`);
    }
    await runExec(`mkdir -p ${dstDir}`);

    for (let index = 0; index < dataList.length; index++) {
        const { name, datas } = dataList[index];

        let slcStr = 'export class ' + name + 'SLCN {\n';
        for (const slcId of slcIds) {
            slcStr += `    static ${slcId} = '${slcId}';\n`;
        }
        slcStr += '};\n';

        let markStr = 'export class ' + name + 'MKN {\n';
        for (const mark of marks) {
            markStr += `    static ${mark} = '${mark}';\n`;
        }
        markStr += '};\n';

        const curHead = head.replace(/AAA/g, name).replace('SSS', slcStr).replace('MMM', markStr);
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
    let checkLineStrs = '';
    for (let index = 0; index < dataList.length; index++) {
        const { name, evtCNName } = dataList[index];

        importStrs += importStr.replace(/AAA/g, name);

        lineStrs += lineStr.replace(/AAA/g, name);
        if (index < dataList.length - 1) lineStrs += ',\n';
        else lineStrs += '\n';

        checkLineStrs += checkLineStr.replace(/AAA/g, name).replace(/BBB/g, evtCNName);
        if (index < dataList.length - 1) checkLineStrs += ',\n';
        else checkLineStrs += '\n';
    }

    const finalIndexStr = indexHead.replace('AAA', importStrs).replace('BBB', lineStrs).replace('CCC', checkLineStrs);
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
