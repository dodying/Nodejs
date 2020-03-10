// ==Headers==
// @Name:               delete
// @Description:        删除漫画
// @Version:            1.0.146
// @Author:             dodying
// @Modified:           2020-1-21 12:23:03
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            iconv-lite,readline-sync
// ==/Headers==

// usage: []file

// 设置
const _ = require('./../config');
const extensions = ['.cbz', '.jpg', '.zip', '.png'];
const libraryFolderName = 'ComicLibrary';
const esPath = 'es.exe';

// 导入原生模块
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const iconv = require('iconv-lite');

const libraryFolder = cp.execSync(`${esPath} ww:${libraryFolderName}`, { encoding: 'utf-8' }).split(/[\r\n]+/)[0];

const deletedPath = path.join(libraryFolder, _.subFolderDelete);
if (!fs.existsSync(deletedPath)) fs.mkdirSync(deletedPath);

// 导入第三方模块
const readlineSync = require('readline-sync');

// Function
const getExecCommand = text => `${esPath} -sort-path /a-d -size -date-modified "${text}"`;
const stdout2lst = stdout => {
  return stdout.split(/[\r\n]+/).map(i => i.trim()).filter(i => i).map(i => i.match(/([\d,]+)\s+([\d/-]+)\s+([\d:]+)\s+(.*)/)[4]);
};

// Main
const main = async () => {
  const list = process.argv.splice(2).filter(i => extensions.includes(path.parse(i).ext));
  for (const i of list) {
    const fullpath = path.resolve(process.cwd(), i);
    const name = path.parse(fullpath).name;

    if (!fullpath.match('ComicLibrary') && !readlineSync.keyInYNStrict('Continue to delete?')) continue;

    let sameList = cp.execSync(getExecCommand(name));
    sameList = iconv.decode(sameList, 'gbk');
    sameList = stdout2lst(sameList);
    for (const j of sameList) {
      if (!fs.existsSync(j)) continue;
      console.log((`\nFile:\t${j}`));
      const confirm = readlineSync.keyInYNStrict('Delete it?');
      if (path.parse(j).name === name && confirm) fs.unlinkSync(j);
    }

    try {
      fs.writeFileSync(path.resolve(deletedPath, name + '.cbz'), '');
    } catch (error) {
      console.error(error);
    }
  }
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  readlineSync.keyInPause();
  process.exit();
});
