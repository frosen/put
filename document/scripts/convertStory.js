/**
 * 转换story
 */

const Fs = require('fs');
const Path = require('path');
const htmlparser = require('htmlparser2');

const srcDir = __dirname + '/../../story/';
const dstDir = __dirname + '/../../putsrc/assets/stories/';

const storySrcFileNames = Fs.readdirSync(srcDir);

function getGain(line) {
    const result = htmlparser.parseDOM(line)[0];
    return { type: result.attribs.t, id: result.children[0].data };
}

const dataList = [];
for (let index = 0; index < storySrcFileNames.length; index++) {
    const fileName = storySrcFileNames[index];
    if (Path.extname(fileName) !== '.html') continue;

    const fileStr = Fs.readFileSync(Path.join(srcDir, fileName), 'utf-8');
    const lines = fileStr.split('\n');

    const data = [];
    const selectionData = [];

    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];
        line = line.trimStart();
        if (line.length === 0) continue;
        console.log(line);
        if (line[0] === '<') {
            if (line[1] === 'g') {
                if (!data[data.length - 1].gains) data[data.length - 1].gains = [];
                data[data.length - 1].gains.push(getGain(line));
            } else if (line[1] === 'o') {
            }
        } else {
            data[data.length] = { str: line };
        }
    }

    dataList.push({ data, name: fileName.slice(0, fileName.indexOf('.')) });
}

// console.log('>>>>', dataList);
