// ==Headers==
// @Name:               comicSort
// @Description:        将通过 [E-Hentai Downloader](https://github.com/ccloli/E-Hentai-Downloader) 下载的本子分类
// @Version:            1.0.441
// @Author:             dodying
// @Modified:           2020/6/19 11:54:54
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra,image-size,jszip,request-promise,socks5-https-client
// ==/Headers==

// 设置
const _ = require('./config');
_.introPicName = _.introPicName.map(i => {
  if (i instanceof RegExp && i.source.match(/^\^/)) {
    const source = i.source.replace(/^\^/, '^(|\\d+.)');
    return new RegExp(source, i.flags);
  } else {
    return i;
  }
});

// 导入原生模块
const path = require('path');
const cp = require('child_process');

// 导入第三方模块
const JSZip = require('jszip');
const request = require('request-promise');
const sizeOf = require('image-size');
const fse = require('fs-extra');
const Agent = require('socks5-https-client/lib/Agent');

const waitInMs = require('./../_lib/waitInMs');
const walk = require('./../_lib/walk');

const replaceWithDict = require('./js/replaceWithDict');
const parseInfo = require('./js/parseInfo');
const findData = require('./js/findData');
const EHT = JSON.parse(fse.readFileSync(path.join(__dirname, 'EHT.json'), 'utf-8')).data;
findData.init(EHT);
const tags = ['language', 'reclass', 'artist', 'group', 'parody', 'character', 'female', 'male', 'misc'];
const tagsChs = tags.map(i => `${i}:chs`);

let tagFolder;
if (_.makeTags && _.makeTags.length) tagFolder = path.resolve(_.libraryFolder, _.subFolderTag);
const req = (url, option = {}) => {
  const requestOption = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36'
    },
    timeout: 30 * 1000,
    resolveWithFullResponse: true
  };
  if (_.proxy.match(/^http:/i)) {
    requestOption.proxy = _.proxy;
  } else if (_.proxy.match(/^socks5:/i)) {
    requestOption.agentClass = Agent;
    const match = _.proxy.match(/^socks5:\/\/([\d.]+):(\w+)/i);
    requestOption.agentOptions = {
      socksHost: match[1],
      socksPort: match[2]
    };
  }
  return request(Object.assign(requestOption, option));
};

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
  BgWhite: '\x1b[47m'
};
const colors = {
  info: text => color.FgGreen + text + color.Reset,
  help: text => color.FgCyan + text + color.Reset,
  warn: text => color.FgYellow + text + color.Reset,
  debug: text => color.FgBlue + text + color.Reset,
  error: text => color.FgRed + text + color.Reset
};
const symlinkSync = (target, link) => {
  let { dir: parentPath, base } = path.parse(link);
  let children = fse.readdirSync(parentPath);
  const rawPath = parentPath;
  let order = 1;
  while (children.length >= 500) {
    parentPath = rawPath + '-' + order;
    if (!fse.existsSync(parentPath)) {
      fse.mkdirsSync(parentPath);
      break;
    }
    order++;
    children = fse.readdirSync(parentPath);
  }

  link = path.join(parentPath, base);
  try {
    if (fse.existsSync(link)) fse.unlinkSync(link);
  } catch (error) {
  }

  fse.symlinkSync(path.relative(parentPath, target), link);
};
const moveFile = (oldpath, newpath, date = undefined) => {
  const info = date && (date instanceof Date || !isNaN(Number(date))) ? { atime: date, mtime: date } : fse.statSync(oldpath);
  try {
    if (!fse.existsSync(path.dirname(newpath))) fse.mkdirsSync(path.dirname(newpath));
    if (path.relative(oldpath, newpath) === '') {

    } else if (path.parse(oldpath).root === path.parse(newpath).root) {
      fse.renameSync(oldpath, newpath);
    } else {
      fse.writeFileSync(newpath, fse.readFileSync(oldpath));
      fse.unlinkSync(oldpath);
    }
    fse.utimesSync(newpath, info.atime, info.mtime);
  } catch (error) {
    if (error.code === 'EBUSY') {
      console.error(colors.error('File Locked: ') + oldpath);
    } else {
      console.error(error);
    }
  }
};
const unique = arr => [...(new Set(arr))];
const escape = text => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '').replace(_.emojiRegExp, '');
const escape2 = text => text.replace(/[:*?"<>|]/g, '-').replace(/\.$/, '').replace(_.emojiRegExp, '');
const sortFileBySpecialRule = info => {
  const rules = _.specialRule;
  for (let rule of rules) {
    if (!rule.length) rule = Object.keys(rule).map(key => [key, rule[key]]); // 兼容旧版本
    // console.log({ rule })
    let folder = rule.find(arr => arr[0] === 'folder');
    folder = folder ? folder[1] : '';
    let mode = rule.find(arr => arr[0] === 'mode');
    mode = mode ? mode[1] : '0';

    rule = rule.filter(arr => !['folder', 'mode'].includes(arr[0]));
    // console.log({ rule })

    const checkFunction = arr => {
      let [key, value] = [].concat(arr);
      if (arr.length === 1) [key, value] = ['artist', key];
      let infoThis = info[key];
      if (!infoThis) {
        return typeof value === 'function' ? value([]) : [0, false, null, undefined].includes(value);
      }
      if (typeof infoThis === 'string') infoThis = [].concat(infoThis);
      infoThis = [].concat(...infoThis.map(i => i.split('|'))).map(i => i.trim());
      // console.log({ infoThis, key, value })

      if (typeof value === 'string') {
        if (infoThis.includes(value)) return true;
      } else if (value instanceof RegExp) {
        if (infoThis.some(i => i.match(value))) return true;
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
        folder = replaceWithDict(folder, info, (key, value) => {
          if (tagsChs.includes(key)) {
            const main = key.split(':chs')[0];
            value = main in info ? info[main].map(i => findData(main, i).cname || i) : '';
          }
          if (value instanceof Array) return value.sort().join(',');
        });
      }
      return path.resolve(_.libraryFolder, _.specialFolder, escape2(folder));
    }
  }
  return false;
};
const sortFile = info => {
  if (sortFileBySpecialRule(info)) {
    return sortFileBySpecialRule(info);
  } else if (info.tags.includes('multi-work series')) {
    if (info.artist || info.group) {
      let value = [].concat(info.artist, info.group).filter(i => i)[0];
      value = findData('artist', value).cname || findData('group', value).cname || value;
      value = escape(value);
      return _.subFolder[0] + '/' + value;
    } else {
      return _.subFolder[0];
    }
  } else if (info.genre.match(/^COSPLAY$/i)) {
    return _.subFolder[1];
  } else if (info.genre.match(/^(IMAGESET|IMAGE SET)$/i) || (info.tags.includes('artbook'))) {
    return _.subFolder[2];
  } else if (info.genre.match(/^(game|artist) ?cg( set)?$/i)) {
    return _.subFolder[3];
  } else if (info.genre.match(/^DOUJINSHI$/i) && info.parody) {
    if (info.parody.length > 1) {
      return _.subFolder[4] + '/' + escape(info.parody.map(i => findData('parody', i).cname || i).sort().join(', '));
      // return _.subFolder[4] + '/Various'
    } else {
      let value = info.parody[0];
      value = escape(findData('parody', value).cname || value);
      if (info.character) {
        const character = info.character.filter(i => !(_.removeCharacter.includes(i)));
        const name = character.length >= 4 ? '###' + character.length : escape(character.map(i => findData('character', i).cname || i).sort().join(', '));
        return _.subFolder[4] + '/' + value + '/' + name;
      } else {
        return _.subFolder[4] + '/' + value;
      }
    }
  } else if ('female' in info && info.female.includes('harem')) {
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

    if (_.artistTags) {
      const parentPath = path.resolve(_.libraryFolder, _.subFolder[9]);
      if (fse.existsSync(parentPath)) {
        const siblingFolders = fse.readdirSync(parentPath);
        const siblingFoldersFilter = siblingFolders.filter(i => i.replace(/^\[.*\]/, '') === value);
        value = siblingFoldersFilter.length ? siblingFoldersFilter[0] : value;
      }
    }

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
    targetFolderNew = path.resolve(_.libraryFolder, targetFolderNew);
    if (!fse.existsSync(targetFolderNew)) fse.mkdirsSync(targetFolderNew);
  } else {
    targetFolderNew = path.parse(target).dir;
  }

  let nameNew = escape(_.jTitle ? info.jTitle : info.title);
  nameNew = nameNew.replace(/\u200B/g, '').trim();

  let targetNew = path.resolve(targetFolderNew, nameNew + '.cbz');

  if (targetNew.length > 260 && _.cutLongTitle) { // 文件名 > 260
    nameNew = nameNew.substr(0, 260 - targetFolderNew.length - 4);
    targetNew = path.resolve(targetFolderNew, nameNew + '.cbz');
  }

  const createSymlinkByInfo = (nameNew) => {
    for (const main in info) {
      const data = EHT.filter(i => i.namespace === main);
      if (data.length === 0) continue;
      for (const sub of info[main]) {
        const text = `${main}: ${sub}`;
        if (_.makeTags.some(i => text.match(i))) {
          const folder = path.resolve(tagFolder, findData(main).cname || main, escape(findData(main, sub).cname || sub));
          if (!fse.existsSync(folder)) fse.mkdirsSync(folder);
          symlinkSync(path.resolve(targetFolderNew, nameNew), path.resolve(folder, nameNew));
        }
      }
    }
  };

  const targetShort = path.relative(_.libraryFolder, targetFolderNew);
  let atime;
  if (_.cover) {
    const targetCover = path.resolve(_.comicFolder, path.parse(target).name + '.jpg');
    const targetCoverNew = path.resolve(targetFolderNew, nameNew + '.jpg');
    if (fse.existsSync(targetCover)) {
      atime = fse.statSync(targetCover).atime;
      if (_.makeTags.length) createSymlinkByInfo(nameNew + '.jpg');
      moveFile(targetCover, targetCoverNew);
    }
  }

  if (_.makeTags.length) createSymlinkByInfo(nameNew + '.cbz');
  moveFile(target, targetNew, atime);

  console.log(' ==> ', colors.info(targetShort), path.parse(target).name === nameNew ? '' : colors.warn(nameNew));
};
const deleteInZip = (file, zip, dir) => {
  console.log(colors.error('Deleted: '), colors.info(file));
  try {
    cp.execSync(`${_['7z']} d -tzip -mx9 "${zip}" "${file}"`, { cwd: dir });
    return true;
  } catch (error) {
    console.error(colors.error('Delete error, skipped'));
    return false;
  }
};

// Main
const main = async () => {
  let lst;
  const lstIgnore = [];

  // 读取列表
  const task = async () => {
    let d = new Date();
    d = d.toLocaleString('zh-CN', {
      hour12: false
    });
    process.title = d;
    lst = walk(_.comicFolder, {
      matchFile: /.(cbz|zip)$/,
      ignoreDir: path.basename(_.subFolderTag),
      fullpath: false,
      nodir: true,
      recursive: _.globRecursive
    });
    lst = lst.filter(i => !lstIgnore.includes(i));
    if (lst.length) console.log('当前任务数: ', colors.info(lst.length));

    // 开始处理
    for (const i of lst) {
      const error = await (async () => {
        const index = lst.indexOf(i);
        process.title = index + ': ' + i;
        console.log(colors.info(process.title));

        // 处理路径
        const target = path.resolve(_.comicFolder, i);
        const targetDir = path.parse(target).dir;

        // 读取数据
        const targetData = fse.readFileSync(target);
        const jszip = new JSZip();
        let zip;
        try {
          zip = await jszip.loadAsync(targetData);
        } catch (error) {
          if (error.message === 'End of data reached (data length = 0, asked index = 4). Corrupted zip ?') {
            moveFile(target, path.resolve(_.libraryFolder, _.subFolderDelete, path.parse(target).base));
            console.log(' ==> ', _.subFolderDelete);
            return;
          } else {
            console.error(error);
            return error;
          }
        }

        // 查看列表
        const fileList = Object.keys(zip.files);

        // 检测有无info.txt
        if (fileList.filter(item => item.match(/(^|\/)info\.txt$/)).length === 0) {
          console.warn(colors.warn('压缩档内不存在info.txt: '), target);
          return new Error('no info.txt');
        }

        // 读取info.txt
        const infoFile = fileList.find(item => item.match(/(^|\/)info\.txt$/));
        let data = await zip.files[infoFile].async('text');
        const info = parseInfo(data);
        if (info.parody && info.parody.includes('original')) info.parody.splice(info.parody.indexOf('original'), 1);
        if (info.parody && info.parody.length === 0) delete info.parody;
        if (info.parody && info.parody.some(i => _.parody.some(j => i.match(j.filter)))) {
          info.parody = info.parody.map(i => {
            for (let j = 0; j < _.parody.length; j++) {
              if (i.match(_.parody[j].filter)) return _.parody[j].name;
            }
            return i;
          });
          info.parody = unique(info.parody);
        }

        // 检测图片及大小
        if ((_.delIntroPic || _.checkImageSize || _.checkImageRatio) && info.web.match(/e(-|x)hentai.org/)) {
          const imgs = fileList.filter(item => item.match(/\.(jpg|png|gif)$/));
          for (let j = 0; j < imgs.length; j++) { // 跳过封面
            if (_.delIntroPic) { // 检查是否删除图片
              const name = path.parse(imgs[j]).base;
              const filter = info.page.filter(p => p.name === name);
              if ((filter.length && _.introPic.includes(filter[0].id)) || _.introPicName.some(k => name.match(k))) {
                console.log(colors.error('Reason: '), 'IntroPic (Name or ID matched)');
                if (deleteInZip(imgs[j], target, targetDir)) {
                  continue;
                } else {
                  return new Error('can delete file in zip');
                }
              }
            }
            if (_.checkImageSize) { // 检查图片文件大小
              const img = await zip.files[imgs[j]].async('nodebuffer');

              if (img.length <= 8) {
                console.log(colors.error('Reason: '), 'File Size = 0');
                if (deleteInZip(imgs[j], target, targetDir)) {
                  continue;
                } else {
                  return new Error('can delete file in zip');
                }
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
                if (deleteInZip(imgs[j], target, targetDir)) {
                  continue;
                } else {
                  return new Error('can delete file in zip');
                }
              }

              const rate = size.width / size.height;
              if (rate > _.rate && size.width === _.size) {
                console.log('Size:', colors.info(size.width, '*', size.height), '  Pages:', colors.info(info.length), '  Genre:', colors.info(info.genre));
                console.log('Page', j, ':', colors.warn(imgs[j]));
                const web = info.web.replace('http:', 'https:').replace(/(g.|)e-hentai/, 'exhentai').replace(/#\d+$/, '');
                console.info('Url:', colors.info(web));

                fse.appendFileSync('error.txt', web + '\n');
                return new Error('no accepted size');
              }
            }
          }
        }

        // 解压封面
        if (_.cover) {
          const img = data.match(/Image\s+1:\s+(.*)/);
          let firstImg;
          if (img && fileList.find(item => item.match(new RegExp(img[1])))) {
            firstImg = fileList.find(item => item.match(new RegExp(img[1])));
          } else {
            firstImg = fileList.find(item => item.match(/\.(jpg|png|gif|webp)$/));
          }
          if (!firstImg) {
            moveFile(target, path.resolve(_.libraryFolder, _.subFolderDelete, escape(info.title) + '.cbz'));
            console.log(' ==> ', _.subFolderDelete);
            return;
          }
          const u8a = await zip.files[firstImg].async('uint8array');
          const targetCover = path.resolve(_.comicFolder, path.parse(target).name + '.jpg');
          fse.writeFileSync(targetCover, u8a);
          // 设置最后修改时间
          const date = zip.files[firstImg].date;
          fse.utimesSync(targetCover, date, date);
        }

        // 如果info不存在tags(EHD v1.23之前下载的)
        if (!data.match(/Tags:/) && info.web.match(/e(-|x)hentai.org/)) {
          const url = info.web.replace(/^.*hentai.org/, 'https://e-hentai.org');
          const pram = url.split('/');
          const res = await req('https://e-hentai.org/api.php', {
            method: 'POST',
            body: JSON.stringify({
              method: 'gdata',
              gidlist: [[pram[4] * 1, pram[5]]],
              namespace: 1
            })
          });
          const json = JSON.parse(res.body);
          let infoStr = '\r\nTags:\r\n';
          const tagsList = json.gmetadata[0].tags;
          const tags = {};
          tagsList.forEach(i => {
            const a = i.split(':');
            const key = a.length === 2 ? a[0] : 'misc';
            if (!tags[key]) tags[key] = [];
            tags[key].push(a[1] || a[0]);
          });
          for (const i in tags) {
            infoStr += `> ${i}: ${tags[i].join(', ')}\r\n`;
          }
          data += '\r\n' + infoStr;

          const infoFileDir = path.resolve(targetDir, path.parse(infoFile).dir);
          fse.mkdirsSync(infoFileDir);
          const infoFilePath = path.resolve(infoFileDir, 'info.txt');
          fse.writeFileSync(infoFilePath, data);

          cp.execSync(`${_['7z']} a -tzip -mx9 "${target}" "${infoFile}"`, {
            cwd: targetDir
          });

          fse.unlinkSync(infoFilePath);
          fse.removeSync(infoFileDir);
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
}, async err => {
  console.error(err);
  process.exit();
});
