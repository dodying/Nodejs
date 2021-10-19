// ==Headers==
// @Name:               changeTime
// @Description:        changeTime
// @Version:            1.0.390
// @Author:             dodying
// @Created:            2020-01-21 09:57:28
// @Modified:           2020/7/13 11:15:11
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra,jszip,readline-sync
// ==/Headers==

// usage: command []files

// command:
//   1. now
//   2. dl
//   3. old

// 修改文件时间 btime=上传时间 mtime=下载时间
// 修改文件夹时间 btime=最新一本的上传时间 mtime=最后检查（现在）/下载时间
// 空文件夹 远古

// 设置

// 导入原生模块
const path = require('path');
const cp = require('child_process');

// 导入第三方模块
const fse = require('fs-extra');
const JSZip = require('jszip');
// const readlineSync = require('readline-sync')

const walk = require('../../_lib/walk');
const timeFormat = require('../../_lib/timeFormat');
const parseInfo = require('../js/parseInfo');

// Function
const changeTime = async (file, btime, mtime) => {
  try {
    btime = timeFormat(btime);
    mtime = timeFormat(mtime);
    const info = fse.statSync(file);
    console.log(file);

    if (btime !== timeFormat(info.birthtimeMs)) {
      console.log({ btime });
      cp.execFileSync('powershell', [`(Get-Item -LiteralPath '${file}').CreationTime`, '=', '"', btime, '"']);
    }

    if (mtime !== timeFormat(info.mtimeMs)) {
      console.log({ mtime });
      cp.execFileSync('powershell', [`(Get-Item -LiteralPath '${file}').LastWriteTime`, '=', '"', mtime, '"']);
    }

    // readlineSync.keyInPause()
  } catch (error) {
    console.error(error);
  }
  // await waitInMs(20)
};

// Main
const main = async () => {
  let [command, ...files] = process.argv.slice(2);
  // console.log({ command, files })

  files = files.map((file) => (fse.statSync(file).isDirectory() ? [file].concat(walk(file)) : [file]));
  files = [].concat(...files).filter((item, index, array) => array.indexOf(item) === index);

  const folders = files.filter((file) => fse.statSync(file).isDirectory()).sort((a, b) => (a.split('\\').length > b.split('\\').length ? -1 : a.split('\\').length === b.split('\\').length ? 0 : 1)).map((i) => i.replace(/\\+$/, ''));
  files = files.filter((file) => fse.statSync(file).isFile() && ['.jpg', '.cbz'].includes(path.extname(file))).sort((a, b) => (path.extname(a) === '.cbz' ? -1 : 1));

  for (const file of files) {
    if (path.extname(file) === '.jpg') {
      const info = path.parse(file);
      const cbzFile = path.join(info.dir, `${info.name}.cbz`);
      if (!fse.existsSync(cbzFile)) continue;
      const cbzFileInfo = fse.statSync(cbzFile);
      await changeTime(file, cbzFileInfo.birthtime, cbzFileInfo.mtime);
      continue;
    }

    // 读取数据
    const targetData = fse.readFileSync(file);
    const jszip = new JSZip();
    let zip;
    try {
      zip = await jszip.loadAsync(targetData);
    } catch (error) {
      console.error(`Error:\t无法读取文件 "${file}"`);
      // readlineSync.keyInPause('Press any key to Continue')
      continue;
    }

    // 查看列表
    const fileList = Object.keys(zip.files);

    // 检测有无info.txt
    if (fileList.filter((item) => item.match(/(^|\/)info\.txt$/)).length === 0) {
      console.warn('压缩档内不存在info.txt: ', file);
      return new Error('no info.txt');
    }

    // 读取info.txt
    const infoFile = fileList.find((item) => item.match(/(^|\/)info\.txt$/));
    const data = await zip.files[infoFile].async('text');
    const info = parseInfo(data);

    await changeTime(file, info.Posted, info.downloadTime);
  }

  for (const folder of folders) {
    const files = fse.readdirSync(folder).map((file) => path.join(folder, file)).filter((file) => ['.cbz'].includes(path.extname(file)));
    if (files.length === 0) {
      await changeTime(folder, '2010-01-01 00:00:00', '2010-01-01 00:00:00');
      continue;
    }

    const infos = files.map((file) => fse.statSync(file));
    const btime = infos.map((info) => info.birthtimeMs).sort().reverse()[0];
    let mtime;

    if (command === 'now') {
      mtime = new Date();
    } else if (command === 'dl') {
      mtime = infos.map((info) => info.mtimeMs).sort().reverse()[0];
    } else if (command === 'old') {
      mtime = '2010-01-01 00:00:00';
    } else {
      mtime = btime;
    }
    await changeTime(folder, btime, mtime);
  }
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit();
});
