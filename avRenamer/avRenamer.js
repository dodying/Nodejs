/*
 * @Author: dodying
 * @Date:   2017-11-17 22:01:03
 * @Description:  avRenamer
 * @Last Modified by:   dodying
 * @Last Modified time: 2017-12-02 23:26:43
 */

//设置
const useProfile = 'e';

const _ = {
  proxy: 'http://127.0.0.1:9666', //代理
  timeout: 30 * 1000, //请求延迟
  /**
   * [folder description]
   * @type {String}
   * 要整理的目录(只整理根目录)
   * 绝对路径
   * __dirname：    获得当前执行文件所在目录的完整目录名
   * process.cwd()：获得当前执行node命令时候的文件夹目录名
   * ./：           文件所在目录 path.resolve('./')
   */
  folder: 'H:\\',
  rename: false, //整理目录下的文件名是否需要处理
  folderNew: '', //整理后存放的目录，形同folder
  /**
   * [folderWith description]
   * @type {String}
   * 建立层次文件夹
   * 参考lib.data
   * 留空表示不建立
   */
  folderWith: 'actor',
  emptyStr: '---', //某属性为空时，使用的替代字符
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
  imageRetry: 3, //下载图片重试次数（仅timeou重试）
  strRemove: ['（ブルーレイディスク）'],
  strReplace: [
    [],
    []
  ],
  nfo: true, //是否生成nfo文件(kodi格式)
  //http://actress.dmm.co.jp/-/search/=/searchstr=%s/
  actorUrl: 'file:///F:/Actor/', //nfo文件用，演员图片的地址，留空不添加
  useLib: 'javlib'
};

const profile = {
  Censored: {
    folder: 'H:\\H\\Censored\\',
    rename: false,
    image: 2,
    useLib: 'javlib'
  },
  Uncensored: {
    folder: 'H:\\H\\Uncensored\\',
    rename: false,
    image: 1,
    useLib: 'javbus'
  },
  d: {
    folder: 'D:\\1\\Censored\\',
    rename: true,
    image: 2,
    useLib: 'javlib'
  },
  e: {
    folder: 'E:\\1\\Censored\\',
    rename: true,
    image: 2,
    useLib: 'javlib'
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
const cheerio = require('cheerio');
const async = require('async');
const Jimp = require("jimp");
const sizeOf = require('image-size');
const logger = require('tracer').console({
  format: "{{timestamp}} <{{file}}:L{{line}}:{{pos}}>: {{message}}",
  dateformat: "HH:MM:ss"
});
const colors = require('colors');
colors.setTheme({
  info: 'green',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});
const argv = require('optimist').argv;


//
if (argv._[0] || useProfile) Object.assign(_, profile[argv._[0] || useProfile]);
if (Object.keys(argv).length > 2) Object.assign(_, argv);
const data = {};
_.folderNew = path.resolve(_.folder, _.folderNew);
if (!fs.exists(_.folderNew)) fs.mkdirSync(_.folderNew);
const header = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
};
const lib = {
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
      rating: $ => (a = $('#video_review .text>.score')) !== null && a.text().match(/[\d.]+/) ? a.text().match(/[\d.]+/)[0] : 0,
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
      premiered: $ => $('.info>p:contains("發行日期")').text().match(/[\d-]+/)[0],
      runtime: $ => $('.info>p:contains("長度")').text().match(/\d+/)[0],
      director: '.info>p:contains("導演")>a:nth-child(2)',
      studio: '.info>p:contains("製作商")>a:nth-child(2)',
      //label: '.info>p:contains("發行商")>a:nth-child(2)',
      genre: '.info>p:contains("類別")+p>.genre',
      actor: '.star-box',
    }
  }
}[_.useLib];

const replaceWithDict = (text, a, b = []) => {
  for (let i = 0; i < a.length; i++) {
    text = text.replace(new RegExp(a[i], 'gi'), b[i] || '').trim();
  }
  return text;
}

String.prototype.replaceWithDict = function(a, b = []) {
  return replaceWithDict(this.toString(), a, b);
}

const getNum = text => { //尝试修改名称
  text = text.match(/[^h_0-9].*/)[0];
  text = text.replace(/^tk|tk$/g, '').replace(/00([0-9]{3})/, '$1').replace(/([a-z]+)([0-9]+)/, '$1-$2');
  text = text.toUpperCase();
  return text;
}

const request = url => {
  return new Promise((resolve, reject) => {
    superagent.get(url).set('header', header).proxy(_.proxy).timeout(_.timeout).end((err, res) => {
      if (err) {
        logger.error(`Request: ${colors.info(url)}\nInfo: ${colors.error(err)}`);
        reject(err);
      } else {
        res.urlTrue = res.redirects.length ? res.redirects[res.redirects.length - 1] : url;
        resolve(res);
      }
    });
  });
}

const search = i => { //搜索番号
  let keyword = i.replace(/\.\w{2,4}$/, '').replace(/^\[.*?\]|\[.*?\]$/g, '');
  let url = lib.search.replace('{q}', keyword);
  return new Promise((resolve, reject) => {
    request(url).then((res) => {
      const $ = cheerio.load(res.text);
      if ($(lib.infoPageCheck).length) {
        resolve(res);
      } else if ($(lib.result).filter(`:contains("${keyword}")`).length) {
        let url_1 = $(lib.result).filter(`:contains("${keyword}")`).find('a').attr('href');
        url_1 = Url.resolve(url, url_1);
        return request(url_1);
      } else {
        logger.warn(`Not find the movie: ${colors.warn(keyword)}`);
        reject(new Error(`Not find the movie: ${keyword}`));
      }
    }, err => {
      reject(err);
    }).then((res) => {
      resolve(res);
    }, err => {
      reject(err);
    });
  });
};

const getInfo = (i, html) => { //生成信息
  const $ = cheerio.load(html);
  let info = Object.assign({}, lib.data);
  for (let i in info) {
    if (typeof info[i] === 'string') {
      if ($(info[i]).length === 0) {
        delete info[i];
      } else {
        info[i] = $(info[i]).length === 1 ? $(info[i]).text().trim() : $(info[i]).map((i, _this) => $(_this).text()).get().sort();
      }
    } else if (typeof info[i] === 'function') {
      info[i] = info[i]($);
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
  Object.assign(data[i], info);
}

const rename = i => { //重命名
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
}

const nfoFile = i => { //生成NFO文件
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
  if (d.director) t += `  <director>${d.director}</director>\r\n`;
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
}

const downloadImage = i => { //下载图片
  let url = Url.resolve(data[i].url, data[i].cover),
    target = path.resolve(data[i].path, data[i].name + '.jpg'),
    targetBanner = _.image === 2 ? target.replace('.jpg', '-banner.jpg') : target;
  return new Promise((resolve, reject) => {
    superagent.get(url).set('header', header).proxy(_.proxy).timeout(_.timeout).retry(_.imageRetry).responseType('blob').end((err, res) => {
      if (err) {
        logger.error(`Request: ${colors.info(url)}\nInfo: ${colors.error(err)}`);
        return reject(err);
      }
      fs.writeFileSync(targetBanner, res.body);
      if (_.image === 2) {
        let size = sizeOf(targetBanner);
        Jimp.read(targetBanner, (err, image) => {
          if (err) {
            logger.error(`File: ${colors.info(target)}\nInfo: ${colors.error(err)}`);
            reject(err);
          } else {
            image.crop(size.width * 0.475, 0, size.width * 0.525, size.height).write(target);
            resolve();
          }
        });
      }

    });
  });
}

fs.readdir(_.folder, (err, lst) => {
  lst = lst.filter(i => fs.statSync(path.resolve(_.folder, i)).isFile());
  if (_.rename) {
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
  }
  for (let i = 0; i < lst.length; i++) {
    data[lst[i]] = {};
  }
  logger.log(`Work list: ${colors.info(lst.join(', '))}`);

  async.mapSeries(lst, (i, callback) => {
    search(i).then((res) => {
      data[i].url = res.urlTrue;
      getInfo(i, res.text);
      callback(null, i);
    }, err => {
      callback(null, i);
    });
  }, (err, results) => {
    if (err) {
      logger.error(colors.error(err));
      return;
    }
    logger.log(colors.info('All info request completed.'));
    async.mapSeries(lst, (i, callback) => {
      if (data[i].num !== undefined) {
        rename(i);
        if (_.nfo) nfoFile(i);
        if (_.image) {
          downloadImage(i).then(() => {
            callback(null, i);
          }, err => {
            callback(null, i);
          });
        } else {
          callback(null, i);
        }
      } else {}
    }, (err, results) => {
      if (err) {
        logger.error(colors.error(err));
        return;
      }
      logger.log(colors.info('All task completed.'));

    });
  });
});
