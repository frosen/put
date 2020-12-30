/**
 * getRandomFeature.js
 * 随机获取特性
 * luleyan
 */

let path = require('path');
let fs = require('fs');

let featurePath = path.join(__dirname, '../../putsrc/assets/configs/FeatureModelDict.ts');
let beginKey = 'random get feature';
let endKey = '// boss feature';

const featureStr = fs.readFileSync(featurePath, 'utf-8');
const beginIdx = featureStr.indexOf(beginKey) + beginKey.length;
const endIdx = featureStr.indexOf(endKey, beginIdx) - 1;
const realFeatureStr = featureStr.slice(beginIdx, endIdx);
const featureLines = realFeatureStr.split('\n');
const realLines = featureLines.filter(v => v.indexOf('static ') !== -1);

const featureKeys = [];
const lineBeginKey = 'static ';
const lineEndKey = ' = ';
for (let index = 0; index < realLines.length; index++) {
    const line = realLines[index];
    const beginLineIdx = line.indexOf(lineBeginKey) + lineBeginKey.length;
    const endLineIdx = line.indexOf(lineEndKey);
    const feature = line.slice(beginLineIdx, endLineIdx);
    featureKeys.push(feature);
}

for (let index = 0; index < featureKeys.length; index += 3) {
    console.log('>> ', featureKeys[index], '    >> ', featureKeys[index + 1], '    >> ', featureKeys[index + 2]);
}

console.log('\n\nselect:\n');

const selectDict = {};
while (true) {
    const idx = Math.floor(Math.random() * featureKeys.length);
    selectDict[featureKeys[idx]] = true;
    if (Object.keys(selectDict).length === 6) break;
}

const selectKeys = Object.keys(selectDict);
for (let index = 0; index < selectKeys.length; index++) {
    const selectKey = selectKeys[index];
    console.log(selectKey);
}
