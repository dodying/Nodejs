// ==Headers==
// @Name:               info.txt
// @Description:        info.txt
// @Version:            1.0.530
// @Author:             dodying
// @Created:            2020-01-21 12:15:39
// @Modified:           2020/11/5 12:20:00
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:entities,jszip,readline-sync
// ==/Headers==

// usage: command []file

// command:
//  reInfo [no/only:main] => 从服务器重新获取信息，生成info.txt (main按,分割)
//    eg: reInfo
//    eg: reInfo only:title,jTitle => 只更新标题
//  add main:sub => 增加标签
//  del main:sub => 移除标签
//  view [[no/only:]main] => 查看信息 (main按,分割)
//  open => 打开网站
//  "" (empty) => 重新生成 info.txt

// 设置

// 导入原生模块
const fs = require('fs');
const cp = require('child_process');
const path = require('path');

// 导入第三方模块
const JSZip = require('jszip');
const readlineSync = require('readline-sync');
const entities = require('entities');
const parseInfo = require('../js/parseInfo');
const _ = require('../config');

const req = require('../../_lib/req');

req.config.init({
  proxy: _.proxy,
  withProxy: ['://e[x-]hentai.org'],
});
const fullWidth2Half = require('../../_lib/fullWidth2Half');
const removeOtherInfo = require('../js/removeOtherInfo');
require('../../_lib/log').hack();

// Function
const digitalRomaji = {
  0: [['rei', 'zero'], ['0', '０', '零', '〇']],
  1: [['ichi', 'i'], ['1', '１', 'I', '一', '壹', '壱']],
  2: [['ni', 'ii'], ['2', '２', '二', '贰', '貮', '弐']],
  3: [['san', 'sann', 'iii'], ['3', '３', '三', '参', '參']],
  4: [['yon', 'yonn', 'shi', 'iv'], ['4', '４', '四', '肆']],
  5: [['go', 'v'], ['5', '５', '五', '伍']],
  6: [['roku', 'vi'], ['6', '６', '六', '陆', '陸']],
  7: [['nana', 'shichi', 'vii'], ['7', '７', '七', '柒', '漆']],
  8: [['hachi', 'viii'], ['8', '８', '八', '捌']],
  9: [['kyuu', 'kyu', 'ix'], ['9', '９', '九', '玖']],
  10: [['jyuu', 'jyu', 'juu', 'ju', 'x'], ['10', '１０', '十', '拾']],
};

const changeTitle = (text, titleJp) => {
  const title = fullWidth2Half(text).replace(/^\(.*?\)( |)/, '').replace(/[\\/:*?"<>]/g, '-').replace(/\s+/g, ' ')
    .trim();

  // 去除标题中首尾的信息，如作者，组织，原作，语言，翻译组
  let mainTitleJp = removeOtherInfo(titleJp);
  mainTitleJp = removeOtherInfo(mainTitleJp, true);

  let digitalRomajiJpRe = Object.values(digitalRomaji).map((i) => i[1].join('|')).join('|');
  digitalRomajiJpRe = new RegExp(`(${digitalRomajiJpRe})(\\W+|$)`);

  if (!mainTitleJp.match(digitalRomajiJpRe)) return title;

  let mainTitle = removeOtherInfo(title);
  mainTitle = removeOtherInfo(mainTitle, true);
  mainTitle = mainTitle.replace(/[|~].*/, '').replace(/\s+/g, ' ').trim();

  const index = title.indexOf(mainTitle);
  const prefix = title.substr(0, index).trim();
  const suffix = title.substr(index + mainTitle.length).trim();

  const mianTitleArr = mainTitle.split(/\s+/).reverse();
  for (let i = 0; i < mianTitleArr.length; i++) {
    const text = mianTitleArr[i];

    let re = digitalRomaji[10][0].join('|');
    re = new RegExp(`(${re})`, 'i');
    if (text.match(re)) {
      const arr = text.split(re).filter((i) => i);
      if (arr.length > 1) {
        let digitalRomajiRe = Object.values(digitalRomaji).map((i) => i[0].join('|')).join('|');
        digitalRomajiRe = new RegExp(`(\\W+|^)(${digitalRomajiRe})(\\W+|$)`, 'i');
        if (arr.every((j) => j.match(digitalRomajiRe))) {
          mianTitleArr.splice(i, 1, ...arr.reverse());
          i--;
          continue;
        }
      }
    }

    let matched = false;
    for (const j in digitalRomaji) {
      let re = digitalRomaji[j][0].join('|');
      re = new RegExp(`^(${re})(\\W+|$)`, 'i');
      if (!text.match(re)) continue;
      matched = true;
      mianTitleArr[i] = text.replace(re, `${digitalRomaji[j][1][0]}$2`);

      if (i > 0 && mianTitleArr[i].match(/^\d+$/) && mianTitleArr[i - 1].match(/^(\d+)(\W+)$/)) {
        const number1 = mianTitleArr[i] * 1;
        const re0 = mianTitleArr[i - 1].match(/^(\d+)(\W+)$/);
        const number0 = re0[1] * 1;
        mianTitleArr[i - 1] = number1 < 10 && number0 < 10 ? number1.toString() + number0.toString() : (number1 + number0).toString();
        mianTitleArr[i - 1] += re0[2];
        mianTitleArr.splice(i, 1);
        i--;
      }
      break;
    }
    if (!matched) break;
  }
  mainTitle = mianTitleArr.reverse().join(' ');

  return `${prefix} ${mainTitle} ${suffix}`;
};

// Main
const main = async () => {
  const [command, ...files] = process.argv.slice(2);
  // command = 'add misc: multi-work series';
  // command = 'reInfo';
  // files = require('./../../_lib/walk')('F:\\H\\###ComicLibrary1', {
  //   nodir: true,
  //   matchFile: /.cbz$/,
  //   recursive: false
  // });
  console.log({ command, files });

  const mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc'];
  const mainInfo = ['title', 'jTitle', 'web'];
  const otherInfo = ['Category', 'Uploader', 'Posted', 'Parent', 'Visible', 'Language', 'File Size', 'Length', 'Favorited', 'Rating'];
  const toDeleteInfo = ['page', 'length', 'genre', 'lang', 'bw', 'rating', 'tags'];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`${i}:\t${file}`);
    process.title = `${i}:\t${file}`;

    // 读取数据
    const targetData = fs.readFileSync(file);
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
      console.warn('Warn:\t压缩档内不存在info.txt');
      return new Error('no info.txt');
    }

    // 读取info.txt
    const infoFile = fileList.find((item) => item.match(/(^|\/)info\.txt$/));
    const data = await zip.files[infoFile].async('text');
    const info = parseInfo(data);

    // 如果info不存在tags(EHD v1.23之前下载的)
    if (command.match(/^reInfo/) && info.web.match(/e(-|x)hentai.org/)) {
      const url = info.web.replace(/^.*hentai.org/, 'https://e-hentai.org');
      const pram = url.split('/');
      const res = await req({
        method: 'POST',
        uri: 'https://e-hentai.org/api.php',
        body: JSON.stringify({
          method: 'gdata',
          gidlist: [[pram[4] * 1, pram[5]]],
          namespace: 1,
        }),
      });
      let json;
      try {
        json = JSON.parse(res.body);
      } catch (error) {
        console.log(res.body);
        process.exit();
      }
      // console.log(json);
      json = json.gmetadata[0];

      const infoNew = {};

      // infoNew.title = json.title
      infoNew.jTitle = entities.decode(json.title_jpn);
      infoNew.title = entities.decode(json.title);
      infoNew.title = changeTitle(infoNew.title, infoNew.jTitle);
      infoNew.Category = json.category;
      infoNew.Uploader = json.uploader;

      const date = new Date(json.posted * 1000);
      infoNew.Posted = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

      infoNew.Visible = json.expunged ? 'No' : 'Yes';
      infoNew.Length = `${json.filecount} pages`;
      infoNew['File Size'] = `${Math.round(json.filesize * 100 / 1024 / 1024) / 100} MB`;
      infoNew.Rating = json.rating;

      for (const tag of json.tags) {
        let [main, sub] = tag.split(':');
        if (!sub) [main, sub] = ['misc', main];
        if (!(main in infoNew)) infoNew[main] = [];
        infoNew[main].push(sub);
      }

      if (command.match(/reInfo\s+(no|only):\s*(.*)/)) {
        let [, mode, keys] = command.match(/reInfo\s+(no|only):\s*(.*)/);
        keys = keys.split(',').map((i) => i.trim());
        const withTags = keys.includes('tags');
        for (const i in infoNew) {
          const keysIncludes = keys.includes(i);
          const tagIncludes = withTags && mainTag.includes(i);
          if (mode === 'no' && (keysIncludes || tagIncludes)) {
            delete infoNew[i];
          } else if (mode === 'only' && !keysIncludes && !tagIncludes) {
            delete infoNew[i];
          }
        }
      }

      // for (let i in infoNew) {
      //   if (info[i] !== infoNew[i]) console.log({ i, old: info[i], new: infoNew[i] })
      // }

      Object.assign(info, infoNew);
    } else if (command.match(/^add\s/)) {
      const [, main, sub] = command.match(/^add\s+(\w.*?):\s*(.*)/);
      console.log({ main, sub });
      if (!(main in info)) info[main] = [];
      info[main].push(sub);
      info[main] = info[main].filter((item, index, array) => array.indexOf(item) === index);
    } else if (command.match(/^del\s/)) {
      const [, main, sub] = command.match(/^del\s+(\w.*?):\s*(.*)/);
      console.log({ main, sub });
      if (main in info && info[main].indexOf(sub) >= 0) info[main].splice(info[main].indexOf(sub), 1);
    } else if (command.match(/^view/)) {
      toDeleteInfo.forEach((i) => delete info[i]);

      if (command.match(/view\s+(no|only):\s*(.*)/)) {
        let [, mode, keys] = command.match(/view\s+(no|only):\s*(.*)/);
        keys = keys.split(',').map((i) => i.trim());
        const withTags = keys.includes('tags');
        for (const i in info) {
          const keysIncludes = keys.includes(i);
          const tagIncludes = withTags && mainTag.includes(i);
          if (mode === 'no' && (keysIncludes || tagIncludes)) {
            delete info[i];
          } else if (mode === 'only' && !keysIncludes && !tagIncludes) {
            delete info[i];
          }
        }
      }

      console.clear();
      console.log(info);
      readlineSync.keyInPause();
      continue;
    } else if (command.match(/^open/)) {
      console.log(info.web.replace(/#\d+$/, ''));
      cp.spawnSync('cmd.exe', ['/c', 'start', info.web.replace(/#\d+$/, '')]);
      continue;
    } else if (command === '') {
      info.title = changeTitle(info.title, info.jTitle);
    }

    const infoArr = [];

    mainInfo.forEach((i) => infoArr.push(info[i]));
    infoArr.push('');

    otherInfo.forEach((i) => infoArr.push(`${i}: ${info[i]}`));
    infoArr.push('');

    infoArr.push('Tags:');
    mainTag.forEach((main) => {
      if (main in info && info[main].length) infoArr.push(`> ${main}: ${info[main].sort().join(', ')}`);
    });
    infoArr.push('');

    infoArr.push(info.summary || '', '');

    for (let i = 0; i < info.page.length; i++) {
      const pageThis = info.page[i];
      if (!pageThis) continue;
      infoArr.push(`Page ${i}: ${pageThis.url}`, `Image ${i}: ${pageThis.name}`, '');
    }

    infoArr.push(`Downloaded at ${info.downloadTime}`, '', 'Generated by E-Hentai Downloader. https://github.com/ccloli/E-Hentai-Downloader');

    try {
      zip.file(infoFile, infoArr.join('\r\n'));
      const content = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9,
        },
      });
      fs.writeFileSync(file, content);
    } catch (error) {
      console.log(error);
    }

    try {
      const mtime = new Date(info.downloadTime);
      fs.utimesSync(file, mtime, mtime);
    } catch (error) {}

    // fs.renameSync(file, path.join(path.dirname(file), '###ok/' + path.basename(file)));
  }
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit();
});
