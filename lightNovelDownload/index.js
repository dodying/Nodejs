// ==Headers==
// @Name:               ligntNovelDownload
// @Description:        轻小说下载器，[来源](https://epubln.blogspot.com)
// @Version:            1.0.228
// @Author:             dodying
// @Date:               2019-2-12 15:52:44
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            cheerio,fs-extra
// ==/Headers==

// 导入原生模块
// const path = require('path')
// const url = require('url')

// 导入第三方模块
const fse = require('fs-extra');
// const cheerio = require('cheerio');
const req = require('../_lib/req');

req.config.init({
  proxy: 'socks5://127.0.0.1:1088',
  request: {
    timeout: 60 * 1000,
    followAllRedirects: false,
    strictSSL: true,
  },
  autoProxy: true,
  withProxy: ['blogspot.com'],
  logLevel: ['warn', 'error'],
});
require('../_lib/log').hack();

// Main
const database = fse.existsSync('./database.json') ? fse.readJSONSync('./database.json') : { items: [], files: [], manual: [] };
const doExit = (exit = true) => {
  if (typeof database === 'object' && database instanceof Object) {
    fse.writeFileSync('./database.json', JSON.stringify(database, (key, value) => {
      if (typeof value === 'object' && value instanceof Array) {
        return Array.from(new Set(value));
      }
      return value;
    }, 2));
  }
  if (exit) process.exit();
};
const main = async () => {
  let link = 'https://epubln.blogspot.com';
  // let link = 'https://epubln.blogspot.com/search?max-results=50';
  // let link = 'https://epubln.blogspot.com/search/?q=a';
  // let link = 'https://epubln.blogspot.com/2020/03/';

  setInterval(() => {
    doExit(false);
  }, 1000 * 60 * 10);

  while (link) {
    console.log(`Index:\t${link}`);
    const res = await req(link);
    const { $ } = res;
    const items = $('[rel=\'bookmark\']').map((index, item) => ({
      href: item.attribs.href,
      title: item.attribs.title.replace('Permanent Link to', '').replace('Permalink to', '').trim(),
    })).toArray();
    for (const i of items) {
      if (database.items.filter((j) => j === i.href).length === 0) {
        console.log(`Page:\t${i.href}`);
        const res1 = await req(i.href);
        const $1 = res1.$;
        let links = $1('.cover a[href]').map((index, item) => item.attribs.href).toArray().filter((item, index, array) => item && !item.match(/blogspot.com|blogger/) && array.indexOf(item) === index);
        if (links.length === 1) links = links[0];
        database.files.push({
          href: links,
          refer: i.href,
          title: i.title,
        });
        database.items.push(i.href);
      }
    }

    link = $('#Blog1_blog-pager-older-link').eq(0).attr('href');
  }
};

try {
  process.once('SIGINT', () => {
    doExit(false);
    console.log('SIGINT');
    process.exit();
  });

  main().then(async () => {
    doExit();
  }, async (err) => {
    console.error(err);

    doExit();
  });
} catch (error) {
  console.error(error);
  doExit();
}
