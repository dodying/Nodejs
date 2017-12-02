/*
 * @Author: dodying
 * @Date:   2017-12-02 21:20:29
 * @Description:  actressPicDownloader
 * @Last Modified by:   dodying
 * @Last Modified time: 2017-12-02 23:09:59
 */

//设置
const folder = "F:\\Actor";
const proxy = 'http://127.0.0.1:9666';
const timeout = 30 * 1000;


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
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const cheerio = require('cheerio');
const async = require('async');

//
const header = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
};
const tasks = [
  'http://www.dmm.co.jp/digital/videoa/-/ranking/=/term=monthly/type=actress/page=1/',
  'http://www.dmm.co.jp/digital/videoa/-/ranking/=/term=monthly/type=actress/page=2/',
  'http://www.dmm.co.jp/digital/videoa/-/ranking/=/term=monthly/type=actress/page=3/',
  'http://www.dmm.co.jp/digital/videoa/-/ranking/=/term=monthly/type=actress/page=4/',
  'http://www.dmm.co.jp/digital/videoa/-/ranking/=/term=monthly/type=actress/page=5/',
  'http://www.dmm.co.jp/mono/dvd/-/ranking/=/mode=actress/term=monthly/rank=1_20/',
  'http://www.dmm.co.jp/mono/dvd/-/ranking/=/mode=actress/term=monthly/rank=21_40/',
  'http://www.dmm.co.jp/mono/dvd/-/ranking/=/mode=actress/term=monthly/rank=41_60/',
  'http://www.dmm.co.jp/mono/dvd/-/ranking/=/mode=actress/term=monthly/rank=61_80/',
  'http://www.dmm.co.jp/mono/dvd/-/ranking/=/mode=actress/term=monthly/rank=81_100/',
  //以下存在编码问题
  //'http://www.dmm.co.jp/rental/ppr/-/ranking/=/article=actress/t=month/page=1/',
  //'http://www.dmm.co.jp/rental/ppr/-/ranking/=/article=actress/t=month/page=2/',
  //'http://www.dmm.co.jp/rental/ppr/-/ranking/=/article=actress/t=month/page=3/',
  //'http://www.dmm.co.jp/rental/ppr/-/ranking/=/article=actress/t=month/page=4/',
  //'http://www.dmm.co.jp/rental/ppr/-/ranking/=/article=actress/t=month/page=5/'
];
const data = {};

const request = url => {
  return new Promise((resolve, reject) => {
    superagent.get(url).set('header', header).proxy(proxy).timeout(timeout).retry(3).end((err, res) => {
      if (err) {
        console.error(`Request: ${url}\nInfo: ${err}`);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

const downloadImage = (url, name) => {
  let target = path.resolve(folder, name + '.jpg');
  return new Promise((resolve, reject) => {
    if (fs.exists(target)) return resolve();
    superagent.get(url).set('header', header).proxy(proxy).timeout(timeout).retry(3).responseType('blob').end((err, res) => {
      if (err) {
        console.error(`Request: ${url}\nInfo: ${err}`);
        reject(err);
      } else {
        fs.writeFileSync(target, res.body);
        resolve();
      }
    });
  });
};

const Arr2Obj = (a, b) => {
  let c = {};
  for (let i = 0; i < a.length; i++) {
    c[a[i]] = b[i];
  }
  return c;
};

async.mapLimit(tasks, 3, (i, callback) => {
  request(i).then(res => {
    let $ = cheerio.load(res.text);
    let actress = $('.bd-b>.data>p>a').map((i, _this) => $(_this).text()).get();
    let images = $('.bd-b>a>img').map((i, _this) => $(_this).attr('src')).get();
    Object.assign(data, Arr2Obj(actress, images));
    callback(null, i);
  });
}, (err, results) => {
  if (err) {
    console.error(err);
  } else {
    async.mapLimit(Object.keys(data), 20, (i, callback) => {
      downloadImage(data[i], i).then(() => {
        callback(null, i);
      })
    })
  }
});
