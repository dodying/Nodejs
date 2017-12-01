//设置
const _ = {
  proxy: 'http://127.0.0.1:9666',
  header: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive'
  },
  /**
   * [folder description]
   * @type {String}
   * 要整理的目录(只整理根目录)
   * __dirname：    获得当前执行文件所在目录的完整目录名
   * process.cwd()：获得当前执行node命令时候的文件夹目录名
   * ./：           文件所在目录 path.resolve('./')
   */
  folder: 'D:\\1\\Censored\\',
  folderNew: '', //整理后存放的目录
  /**
   * [folderWith description]
   * @type {String}
   * 建立层次文件夹
   * 参考lib.data
   * 留空表示不建立
   */
  folderWith: 'actor',
  emptyStr: '---',
  /**
   * [name description]
   * @type {String}
   * 重命名规则
   * ${x}
   * $1 表示原文件名开头用方括号号引用的内容
   * $2 表示原文件名末尾用方括号引用的内容
   */
  name: '$1{num}$2', //参考lib.data
  /**
   * [image description]
   * @type {Number}
   * 0 不下载图片
   * 1 下载图片
   * 2 下载图片且裁剪
   */
  image: 2,
  imageDelay: 500, //下载图片的延迟
  strRemove: ['（ブルーレイディスク）'],
  strReplace: [
    [],
    []
  ],
  nfo: true, //是否生成nfo文件(kodi格式)
  actorUrl: 'file:///F:/Actor/', //nfo文件用，演员图片的地址，留空不添加
  useLib: 'javlib',
  lib: {
    'javlib': {
      search: 'http://www.javlibrary.com/cn/vl_searchbyid.php?keyword={q}',
      infoPageCheck: '#video_id',
      result: '.video',
      cover: '#video_jacket_img',
      data: {
        title: '.post-title',
        num: '#video_id .text',
        premiered: '#video_date .text',
        runtime: '#video_length .text',
        director: '#video_director .text',
        studio: '#video_maker .text',
        //label: '#video_label .text',
        rating: '#video_review .text>.score',
        genre: '#video_genres .text>.genre',
        actor: '#video_cast .text>.cast a',
      }
    },
    'javbus': {
      search: 'https://www.javbus.com/search/{q}',
      infoPageCheck: '.movie',
      result: '.item',
      cover: '.bigImage img',
      data: {
        title: 'h3',
        num: '.info>p:contains("識別碼")>span:nth-child(2)',
        premiered: '.info>p:contains("發行日期")>span:nth-child(2)',
        runtime: '.info>p:contains("長度")>span:nth-child(2)',
        director: '.info>p:contains("導演")>a:nth-child(2)',
        studio: '.info>p:contains("製作商")>a:nth-child(2)',
        //label: '.info>p:contains("發行商")>a:nth-child(2)',
        genre: '.info>p:contains("類別")+p>.genre',
        actor: '.star-box',
      }
    }
  }
};

//导入原生模块
const fs = require('fs');
fs.exists = path => {
  try {
    fs.statSync(path);
  } catch (err) {
    return false;
  }
  return true;
}
const path = require('path');
const Url = require('url');

//导入第三方模块
const readlineSync = require('readline-sync');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const binaryParser = require('superagent-binary-parser');
const cheerio = require('cheerio');
const async = require('async');
const EventProxy = require('eventproxy');
const ep = new EventProxy();
const Jimp = require("jimp");
const sizeOf = require('image-size');
const logger = require('tracer').console();
const colors = require('colors');
colors.setTheme({
  info: 'green',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

//
const data = {};
const lib = _.lib[_.useLib];
_.folderNew = path.resolve(_.folder, _.folderNew);
if (!fs.exists(_.folderNew)) fs.mkdirSync(_.folderNew);

const replaceWithDict = (text, a, b = []) => {
  for (let i = 0; i < a.length; i++) {
    text = text.replace(new RegExp(a[i], 'gi'), b[i] || '').trim();
  }
  return text;
};

String.prototype.replaceWithDict = function(a, b = []) {
  return replaceWithDict(this.toString(), a, b);
};

const getNum = text => {
  text = text.match(/[^h_0-9].*/)[0];
  text = text.replace(/^tk|tk$/g, '').replace(/00([0-9]{3})/, '$1').replace(/([a-z]+)([0-9]+)/, '$1-$2');
  text = text.toUpperCase();
  return text;
};

const getInfo = (i, html) => {
  const $ = cheerio.load(html);
  let info = Object.assign({}, lib.data);
  for (let i in info) {
    if ($(info[i]).length === 0) {
      delete info[i];
    } else {
      info[i] = $(info[i]).length === 1 ? $(info[i]).text().trim() : $(info[i]).map((i, _this) => $(_this).text()).get().sort();
    }
  }
  info.title = info.title.replace(info.num, '').trim();
  for (let i in info) {
    let text;
    if (typeof info[i] === 'string') {
      info[i] = info[i].replaceWithDict(_.strRemove).replaceWithDict(_.strReplace[0], _.strReplace[1]);
    } else if (typeof info[i] === 'object' && 'length' in info[i]) {
      for (let j = 0; j < info[i].length; j++) {
        if (typeof info[i][j] === 'string')
          info[i][j] = info[i][j].replaceWithDict(_.strRemove).replaceWithDict(_.strReplace[0], _.strReplace[1]);
      }
    }
  }
  info.cover = $(lib.cover).attr('src');
  info.rating = info.rating ? info.rating.match(/[\d\.]+/)[0] : 0;
  Object.assign(data[i], info);
  ep.emit('getData');
};

const rename = i => {
  let result, re = /{(.*?)}/g,
    name = _.name,
    ext = i.match(/\.\w{2,4}$/)[0],
    t = i.replace(ext, '');
  while ((result = re.exec(name)) != null) {
    name = name.replace(new RegExp(result[0], 'gi'), data[i][result[1]] || _.emptyStr);
  };
  if (name.match(/\$1/)) name = name.replace(/\$1/g, t.match(/^\[.*?\]/) ? t.match(/^\[.*?\]/)[0] : '');
  if (name.match(/\$2/)) {
    let a = t.match(/\[.*?\]/g);
    name = name.replace(/\$2/g, t.match(/\[.*?\]$/) ? a = a[a.length - 1] : '');
  }
  name = name.replace(/[\\/:*?"<>|]/g, '-');
  data[i].name = name;
  let folderWith = data[i][_.folderWith],
    folder = typeof folderWith === 'string' ? folderWith : typeof folderWith === 'undefined' ? _.emptyStr : folderWith.join(','),
    targetPath = path.resolve(_.folderNew, _.folderWith ? folder : '').replace(/[*?"<>|]/g, '-'),
    target = path.resolve(targetPath, name + ext),
    targetOld = path.resolve(_.folder, i);
  data[i].path = targetPath;
  if (!fs.exists(targetPath)) fs.mkdirSync(targetPath);
  if (!fs.exists(target)) fs.renameSync(targetOld, target);
};

const nfoFile = i => {
  let d = data[i],
    t = '',
    target = path.resolve(d.path, d.name + '.nfo');
  if (fs.exists(target)) return;
  t += `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n`;
  t += `<movie>\r\n`;
  t += `  <title>${d.num} ${d.title}</title>\r\n`;
  t += `  <originaltitle>${d.title}</originaltitle>\r\n`;
  t += `  <sorttitle>${d.num}</sorttitle>\r\n`;
  if (d.rating) t += `  <rating>${d.rating}</rating>\r\n`;
  t += `  <year>2017</year>\r\n`;
  t += `  <runtime>${d.runtime}</runtime>\r\n`;
  t += `  <thumb>${d.cover}</thumb>\r\n`;
  t += `  <premiered>${d.premiered}</premiered>\r\n`;
  t += `  <studio>${d.studio}</studio>\r\n`;
  t += `  <director>${d.director}</director>\r\n`;
  if (d.genre) {
    [].concat(d.genre).forEach(i => {
      t += `  <genre>${i}</genre>\r\n`;
      t += `  <tag>${i}</tag>\r\n`;
    });
  }
  if (d.actor) {
    [].concat(d.actor).forEach(i => {
      t += `  <actor>\r\n`;
      t += `    <name>${i}</name>\r\n`;
      t += `    <role>${i}</role>\r\n`;
      if (_.actorUrl) t += `    <thumb>${Url.resolve(_.actorUrl,i)}.jpg</thumb>\r\n`;
      t += `  </actor>\r\n`;
    });
  }
  t += `  <uniqueid default="true" type="unknown">${d.num}</uniqueid>\r\n`;
  t += `</movie>`;
  fs.writeFileSync(target, t);
};

fs.readdir(_.folder, function(err, lst) {
  lst = lst.filter(i => fs.statSync(path.resolve(_.folder, i)).isFile());
  lst = lst.map(i => {
    let ext = i.match(/\.\w{2,4}$/)[0],
      t = i.replace(/\.\w{2,4}$/, '').replace(/^\[.*?\]|\[.*?\]$/g, '') + ext,
      tryNum = getNum(t.replace(/\.\w{2,4}$/, '')) + ext;
    if (t === tryNum) return i;
    logger.log(`Rename ${colors.info(i)} ==> ${colors.info(tryNum)} ? or ${colors.info('put in')} ${colors.warn('(without Extension)')}`);
    input = readlineSync.question();
    tryNum = input ? input + ext : tryNum;
    if (i !== tryNum) {
      let target = path.resolve(_.folder, tryNum),
        targetOld = path.resolve(_.folder, i);
      if (!fs.exists(target)) {
        fs.renameSync(targetOld, target);
        return tryNum;
      }
    }
    return i;
  });
  for (let i = 0; i < lst.length; i++) {
    data[lst[i]] = {};
  }
  logger.log(`Work list: ${colors.info(lst.join(', '))}`);

  ep.after('getData', lst.length, () => {
    logger.log(colors.info('All info request completed.'));
    async.mapSeries(lst, function(i, callback) {
      if (data[i].num !== undefined) {
        rename(i);
        if (_.nfo) nfoFile(i);
        if (_.image) { //下载图片
          let url = Url.resolve(data[i].url, data[i].cover),
            target = path.resolve(data[i].path, data[i].name + '.jpg'),
            targetBanner = _.image === 2 ? target.replace('.jpg', '-banner.jpg') : target;
          if (fs.exists(targetBanner)) return;
          superagent.get(url).set('header', _.header).proxy(_.proxy).parse(binaryParser).buffer().then(res => {
            fs.writeFileSync(targetBanner, res.body);
            if (_.image === 2) {
              let size = sizeOf(targetBanner);
              Jimp.read(targetBanner, function(err, image) {
                if (err) {
                  logger.error(`File: ${colors.info(target)}\nInfo: ${colors.error(err)}`);
                } else {
                  image.crop(size.width * 0.475, 0, size.width * 0.525, size.height).write(target);
                }
              });
            }
          }, err => {
            logger.error(`Url: ${colors.info(url)}\nInfo: ${colors.error(err)}`);
          });
        }
      }
      setTimeout(() => {
        callback(null, i);
      }, _.imageDelay);
    });
  });
  async.mapLimit(lst, 3, (i, callback) => { //搜索番号
    let keyword = i.replace(/\.\w{2,4}$/, '').replace(/^\[.*?\]|\[.*?\]$/g, '');
    let url = lib.search.replace('{q}', keyword);
    superagent.get(url).set('header', _.header).proxy(_.proxy).then(res => {
      const $ = cheerio.load(res.text);
      if ($(lib.infoPageCheck).length) {
        callback(null, i);
        data[i].url = res.redirects.length ? res.redirects[res.redirects.length - 1] : url;
        getInfo(i, res.text);
      } else if ($(lib.result).filter(`:contains("${keyword}")`).length) {
        let url_0 = $(lib.result).filter(`:contains("${keyword}")`).find('a').attr('href');
        let url_1 = Url.resolve(url, url_0);
        superagent.get(url_1).set('header', _.header).proxy(_.proxy).then(res_1 => {
          callback(null, i);
          data[i].url = res_1.redirects.length ? res_1.redirects[res_1.redirects.length - 1] : url_1;
          getInfo(i, res_1.text);
        }, err => {
          callback(null, i);
          logger.error(`Request: ${colors.info(url_1)}\nInfo: ${colors.error(err)}`);
          ep.emit('getData');
        });
      } else {
        logger.warn(`Not find the movie: ${colors.warn(keyword)}`);
        ep.emit('getData');
      }
    }, err => {
      callback(null, i);
      logger.error(`Request: ${colors.info(url)}\nInfo: ${colors.error(err)}`);
      ep.emit('getData');
    });
  });
});
