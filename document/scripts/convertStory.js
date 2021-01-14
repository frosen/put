/**
 * 转换story
 */

const Fs = require('fs');
const Path = require('path');

const srcDir = __dirname + '/../../story/';
const dstDir = __dirname + '/../../putsrc/assets/stories/';

const storySrcFileNames = Fs.readdirSync(srcDir);

for (let index = 0; index < storySrcFileNames.length; index++) {
    const fileName = storySrcFileNames[index];
    if (Path.extname(fileName) !== '.html') continue;
    console.log(fileName);
}
