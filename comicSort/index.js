// ==Headers==
// @Name:               comicSort
// @Description:        将通过 [E-Hentai Downloader](https://github.com/ccloli/E-Hentai-Downloader) 下载的本子分类
// @Version:            1.0.598
// @Author:             dodying
// @Modified:           2021-08-05 20:38:45
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra,image-size,jszip
// ==/Headers==

// 设置
const _ = require('./config');

_.introPicName = _.introPicName.map((i) => {
  if (i instanceof RegExp && i.source.match(/^\^/)) {
    const source = i.source.replace(/^\^/, '^(|\\d+.)');
    return new RegExp(source, i.flags);
  }
  return i;
});

// 导入原生模块
const path = require('path');

// 导入第三方模块
const JSZip = require('jszip');
const sizeOf = require('image-size');
const fse = require('fs-extra');

const waitInMs = require('../_lib/waitInMs');
const walk = require('../_lib/walk');

const replaceWithDict = require('../_lib/replaceWithDict');
const parseInfo = require('./js/parseInfo');
const findData = require('./js/findData');

const EHT = JSON.parse(fse.readFileSync(path.join(__dirname, 'EHT.json'), 'utf-8')).data;
findData.init(EHT);
const tags = ['language', 'reclass', 'artist', 'group', 'parody', 'character', 'female', 'male', 'misc'];
const tagsChs = tags.map((i) => `${i}:chs`);

// Function
const color = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m',
};
const colors = {
  info: (text) => color.FgGreen + text + color.Reset,
  help: (text) => color.FgCyan + text + color.Reset,
  warn: (text) => color.FgYellow + text + color.Reset,
  debug: (text) => color.FgBlue + text + color.Reset,
  error: (text) => color.FgRed + text + color.Reset,
};
const moveFile = (oldpath, newpath, date = undefined) => {
  const info = date && (date instanceof Date || !isNaN(Number(date))) ? { atime: date, mtime: date } : fse.statSync(oldpath);
  let tempFile;
  try {
    if (!fse.existsSync(path.dirname(newpath))) fse.mkdirsSync(path.dirname(newpath));
    if (path.relative(oldpath, newpath) === '') return;
    if (fse.existsSync(newpath)) fse.unlinkSync(newpath);
    if (path.parse(oldpath).root === path.parse(newpath).root) {
      fse.renameSync(oldpath, newpath);
    } else {
      do {
        tempFile = path.resolve(path.parse(newpath).root, String(new Date().getTime()));
      } while (fse.existsSync(tempFile));
      fse.writeFileSync(tempFile, fse.readFileSync(oldpath));
      fse.renameSync(tempFile, newpath);
      fse.unlinkSync(oldpath);
    }
    fse.utimesSync(newpath, info.atime, info.mtime);
  } catch (error) {
    if (tempFile && fse.existsSync) fse.unlinkSync(tempFile);
    if (error.code === 'EBUSY') {
      console.error(colors.error('File Locked: ') + oldpath);
    } else {
      console.error(error);
    }
  }
};
const unique = (arr) => [...(new Set(arr))];
const escape = (text) => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '').replace(/\p{Extended_Pictographic}/gu, '');
const escape2 = (text) => text.replace(/[:*?"<>|]/g, '-').replace(/\.$/, '').replace(/\p{Extended_Pictographic}/gu, '');
const sortFileBySpecialRule = (info, rules, root, first) => {
  const result = [];
  for (let rule of rules) {
    if (!rule.length) rule = Object.keys(rule).map((key) => [key, rule[key]]); // 兼容旧版本
    // console.log({ rule })
    let folder = rule.find((arr) => arr[0] === 'folder');
    folder = folder ? folder[1] : '';
    let mode = rule.find((arr) => arr[0] === 'mode');
    mode = mode ? mode[1] : '0';

    rule = rule.filter((arr) => !['folder', 'mode'].includes(arr[0]));
    // console.log({ rule })

    const checkFunction = (arr) => {
      let [key, value] = [].concat(arr);
      if (arr.length === 1) [key, value] = ['artist', key];
      let infoThis = info[key];
      if (!infoThis) {
        return typeof value === 'function' ? value([]) : [0, false, null, undefined].includes(value);
      }
      if (typeof infoThis === 'string') infoThis = [].concat(infoThis);
      infoThis = [].concat(...infoThis.map((i) => i.split('|'))).map((i) => i.trim());
      // console.log({ infoThis, key, value })

      if (typeof value === 'string') {
        if (infoThis.includes(value)) return true;
      } else if (value instanceof RegExp) {
        if (infoThis.some((i) => i.match(value))) return true;
      } else if (typeof value === 'function') {
        if (value(infoThis)) return true;
      }
      return false;
    };

    const checked = mode === '0' ? rule.some(checkFunction) : rule.every(checkFunction);
    if (checked) {
      if (typeof folder === 'function') {
        folder = folder(info);
      } else if (folder.match(/\{.*\}/)) {
        folder = replaceWithDict(folder, info, {
          ifNotString: (key, value) => {
            if (tagsChs.includes(key)) {
              const main = key.split(':chs')[0];
              value = main in info ? info[main].map((i) => findData(main, i).cname || i) : '';
            }
            if (value instanceof Array) return value.sort().join(',');
          },
        });
      }
      folder = (root ? `${root}/` : '') + escape2(folder);
      if (first) {
        return folder;
      }
      result.push(folder);
    }
  }
  return result.join('/');
};
const sortFile = (info) => {
  if (!info.pageCount) {
    let subdir = escape(info.title).match(/[^()[\]_~!\s]/g);
    if (subdir.length < 2) subdir = [subdir[0] || '#', subdir[0] || '#'];
    subdir = subdir.slice(0, 2).map(i => i.match(/\w/i) ? i.toUpperCase() : '#');
    return _.subFolderDelete + '/' + subdir.join('/');
  } if (sortFileBySpecialRule(info, _.specialRule, _.specialFolder, true)) {
    return sortFileBySpecialRule(info, _.specialRule, _.specialFolder, true);
  } if (['multi-work series', 'soushuuhen', 'compilation'].some(i => info.tags.includes(i))) {
    if (info.artist || info.group) {
      let value = [].concat(info.artist, info.group).filter(i => i)[0];
      value = findData('artist', value).cname || findData('group', value).cname || value;
      value = escape(value);
      return _.subFolder[0] + '/' + value;
    } 
      return _.subFolder[0];
    
  } if (info.genre.match(/^COSPLAY$/i)) {
    return _.subFolder[1];
  } if (info.genre.match(/^(IMAGESET|IMAGE SET)$/i) || ['artbook', 'variant set'].some(i => info.tags.includes(i)) || info.title.match(/\b(pixiv|artist)\b/i)) {
    return _.subFolder[2];
  } if (info.genre.match(/^(game|artist) ?cg( set)?$/i)) {
    return _.subFolder[3];
  } if (info.genre.match(/^DOUJINSHI$/i) && info.parody) {
    if (info.parody.length > 1) {
      return _.subFolder[4] + '/' + escape(info.parody.map(i => findData('parody', i).cname || i).sort().join(', '));
      // return _.subFolder[4] + '/Various'
    } 
      let value = info.parody[0];
      value = escape(findData('parody', value).cname || value);
      if (info.character) {
        const character = info.character.filter(i => !(_.removeCharacter.includes(i)));
        const name = character.length >= 4 ? '###' + character.length : escape(character.map(i => findData('character', i).cname || i).sort().join(', '));
        return _.subFolder[4] + '/' + value + '/' + name;
      } 
        return _.subFolder[4] + '/' + value;
      
    
  } if ('female' in info && info.female.includes('harem')) {
    return _.subFolder[5];
  } else if (info.tags.includes('incest') || info.tags.includes('inseki')) {
    const tags = [];
    for (const i in _.incestTags) {
      if (info.tags.some(tag => _.incestTags[i].includes(tag))) tags.push(i);
    }
    return _.subFolder[6] + (tags.length ? '/' + tags.sort().join(', ') : '');
  } else if (info.tags.includes('story arc')) {
    return _.subFolder[7];
  } else if ((info.tags.includes('anthology')) || (info.artist && info.artist.length > 2)) {
    return _.subFolder[8];
  } else if (info.artist || info.group) {
    let value = [].concat(info.artist, info.group).filter(i => i)[0];
    const valueRaw = value;
    value = findData('artist', value).cname || findData('group', value).cname || value;
    if (value === valueRaw) value = value.replace(/[a-z]+/gi, all => all.slice(0, 1).toUpperCase() + all.slice(1).toLowerCase());
    value = escape(value);

    return _.subFolder[9] + '/' + value;
  } else {
    return _.subFolder[10];
  }
};
const moveByInfo = (info, target) => {
  info.file = target;

  let targetFolderNew;
  if (_.moveFile) {
    targetFolderNew = sortFile(info);
    const common = sortFileBySpecialRule(info, _.commonRule, '', false);
    targetFolderNew = path.resolve(_.libraryFolder, targetFolderNew, common);
    if (!fse.existsSync(targetFolderNew)) fse.mkdirsSync(targetFolderNew);
  } else {
    targetFolderNew = path.parse(target).dir;
  }

  let nameNew = escape(replaceWithDict(_.title || '{title}', info));
  nameNew = nameNew.replace(/\u200B/g, '').trim();

  let targetNew = path.resolve(targetFolderNew, `${nameNew}.cbz`);

  if (targetNew.length >= 250 && _.cutLongTitle) { // 文件名 > 250
    nameNew = nameNew.substr(0, 250 - targetFolderNew.length);
    targetNew = path.resolve(targetFolderNew, `${nameNew}.cbz`);
  }

  const targetShort = path.relative(_.libraryFolder, targetFolderNew);
  let atime;
  if (_.cover) {
    const targetCover = path.resolve(_.comicFolder, `${path.parse(target).name}.jpg`);
    const targetCoverNew = path.resolve(targetFolderNew, `${nameNew}.jpg`);
    if (fse.existsSync(targetCover)) {
      atime = fse.statSync(targetCover).atime;
      moveFile(targetCover, targetCoverNew);
    }
  }

  moveFile(target, targetNew, atime);

  console.log(' ==> ', colors.info(targetShort), path.parse(target).name === nameNew ? '' : colors.warn(nameNew));
};

// Main
const main = async () => {
  let lst;
  const lstIgnore = [];

  // 读取列表
  const task = async () => {
    let d = new Date();
    d = d.toLocaleString('zh-CN', {
      hour12: false,
    });
    process.title = d;
    lst = walk(_.comicFolder, {
      matchFile: /.(cbz|zip)$/,
      fullpath: false,
      nodir: true,
      recursive: _.globRecursive,
    });
    lst = lst.filter((i) => !lstIgnore.includes(i));
    if (lst.length) console.log('当前任务数: ', colors.info(lst.length));

    // 开始处理
    for (const i of lst) {
      const error = await (async () => {
        const index = lst.indexOf(i);
        process.title = `${(index / lst.length * 100).toFixed(2)}%: ${i}`;
        console.log(colors.info(`${index}: ${i}`));

        // 处理路径
        const target = path.resolve(_.comicFolder, i);

        // 读取数据
        let targetData;
        try {
          targetData = fse.readFileSync(target);
        } catch (error) {
          console.error(error);
          return error;
        }
        const jszip = new JSZip();
        let zip;
        try {
          zip = await jszip.loadAsync(targetData);
        } catch (error) {
          if (error.message === 'End of data reached (data length = 0, asked index = 4). Corrupted zip ?') {
            moveByInfo({ title: path.parse(target).name }, target);
            return;
          }
          console.error(error);
          return error;
        }

        // 查看列表
        let fileList = Object.keys(zip.files);

        // 检测有无info.txt
        if (fileList.filter((item) => item.match(/(^|\/)info\.txt$/)).length === 0) {
          console.warn(colors.warn('压缩档内不存在info.txt: '), target);
          return new Error('no info.txt');
        }

        // 读取info.txt
        const infoFile = fileList.find((item) => item.match(/(^|\/)info\.txt$/));
        const data = await zip.files[infoFile].async('text');
        const info = parseInfo(data);
        info.pageCount = fileList.filter((i) => !i.match(/(info.txt|\/)$/)).length;
        if (info.parody && info.parody.includes('original')) info.parody.splice(info.parody.indexOf('original'), 1);
        if (info.parody && info.parody.length === 0) delete info.parody;
        if (info.parody && info.parody.some((i) => _.parody.some((j) => i.match(j.filter)))) {
          info.parody = info.parody.map((i) => {
            for (let j = 0; j < _.parody.length; j++) {
              if (i.match(_.parody[j].filter)) return _.parody[j].name;
            }
            return i;
          });
          info.parody = unique(info.parody);
        }

        // 检测图片及大小
        if ((_.delIntroPic || _.checkImageSize || _.checkImageRatio) && info.web.match(/e(-|x)hentai.org/)) {
          const imgs = fileList.filter((item) => item.match(/\.(jpg|png|gif)$/));
          for (let j = 0; j < imgs.length; j++) { // 跳过封面
            if (_.delIntroPic) { // 检查是否删除图片
              const name = path.parse(imgs[j]).base;
              const filter = info.page.filter((p) => p.name === name);
              if ((filter.length && _.introPic.includes(filter[0].id)) || _.introPicName.some((k) => name.match(k))) {
                console.log(colors.error('Reason: '), 'IntroPic (Name or ID matched)');
                console.log(colors.error('Deleted: '), colors.info(imgs[j]));
                zip.remove(imgs[j]);
                continue;
              }
            }
            if (_.checkImageSize) { // 检查图片文件大小
              const img = await zip.files[imgs[j]].async('nodebuffer');

              if (img.length <= 8) {
                console.log(colors.error('Reason: '), 'File Size = 0');
                console.log(colors.error('Deleted: '), colors.info(imgs[j]));
                zip.remove(imgs[j]);
                continue;
              }
            }
            if (_.checkImageRatio && !info.tags.includes('tankoubon') && !info.tags.includes('anthology')) { // 检查图片宽高
              const img = await zip.files[imgs[j]].async('nodebuffer');

              let size;
              try {
                size = sizeOf(img);
              } catch (error) {
                continue;
              }

              if (size.width < 50 || size.height < 50) {
                console.log(colors.error('Reason: '), 'Width or Height < 50');
                console.log(colors.error('Deleted: '), colors.info(imgs[j]));
                zip.remove(imgs[j]);
                continue;
              }

              const rate = size.width / size.height;
              if (rate > _.rate && size.width === _.size) {
                console.log('Size:', colors.info(size.width, '*', size.height), '  Pages:', colors.info(info.length), '  Genre:', colors.info(info.genre));
                console.log('Page', j, ':', colors.warn(imgs[j]));
                const web = info.web.replace('http:', 'https:').replace(/(g.|)e-hentai/, 'exhentai').replace(/#\d+$/, '');
                console.info('Url:', colors.info(web));

                fse.appendFileSync('error.txt', `${web}\n`);
                return new Error('no accepted size');
              }
            }
          }
        }

        if (fileList.length !== Object.keys(zip.files).length) {
          fileList = Object.keys(zip.files);
          const content = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
              level: 9,
            },
          });
          fse.writeFileSync(target, content);
        }

        const img = data.match(/Image\s+1:\s+(.*)/);
        let firstImg;
        if (img && fileList.find((item) => item.match(new RegExp(img[1])))) {
          firstImg = fileList.find((item) => item.match(new RegExp(img[1])));
        } else {
          firstImg = fileList.find((item) => item.match(/\.(jpg|png|gif|webp)$/));
        }
        // 解压封面
        if (_.cover && firstImg) {
          const u8a = await zip.files[firstImg].async('uint8array');
          const targetCover = path.resolve(_.comicFolder, `${path.parse(target).name}.jpg`);
          fse.writeFileSync(targetCover, u8a);
          // 设置最后修改时间
          const { date } = zip.files[firstImg];
          fse.utimesSync(targetCover, date, date);
        }

        // 如果info不存在tags(EHD v1.23之前下载的)
        if (!data.match(/Tags:/) && info.web.match(/e(-|x)hentai.org/)) {
          lstIgnore.push(i);
          console.log('Please use tools\\info.txt.js reInfo');
          return;
        }

        // 整理
        moveByInfo(info, target);
      })();
      if (error) lstIgnore.push(i);
    }

    if (lst.length) console.log(colors.info('任务完成'));

    if (_.loop) {
      await waitInMs(5 * 1000);
      await task();
    }
  };

  await task();
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit();
});
