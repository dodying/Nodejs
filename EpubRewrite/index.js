#!/usr/bin/env node

// ==Headers==
// @Name:               EpubRewrite
// @Description:        EpubRewrite
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-02-06 10:43:07
// @Last Modified by:   dodying
// @Last Modified time: 2018-02-07 11:02:06
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            glob, async, pixl-xml, adm-zip, archiver, rimraf
// ==/Headers==

//CONFIG
const _ = {
  database: process.cwd(),
};

//native modules
const fs = require('fs');
fs.exists = a => {
  try {
    fs.statSync(a);
  } catch (err) {
    return false;
  }
  return true;
}
const path = require('path');

//3rd party modules
const glob = require('glob');
const async = require('async');
const XML = require('pixl-xml');
const AdmZip = require('adm-zip');
const archiver = require('archiver');
const rmdir = require('rimraf');

//
let books = glob.sync(path.resolve(_['database']) + '\\*.epub');
console.log(books);

async.mapSeries(books, (book, cb) => {
  let _path = 'temp_' + path.parse(book).name;
  new AdmZip(book).extractAllTo(_path, true);
  let files = glob.sync(_path + '\\**\\*');

  //删除calibre书签
  if (fs.exists(_path + '\\META-INF\\calibre_bookmarks.txt')) {
    fs.unlinkSync(_path + '\\META-INF\\calibre_bookmarks.txt');
  }

  //解析opf
  let path_opf = XML.parse(fs.readFileSync(_path + '\\META-INF\\container.xml', 'utf-8')).rootfiles.rootfile['full-path'];
  let folder_item = path.parse(_path + '\\' + path_opf).dir;
  let content_opf = XML.parse(fs.readFileSync(_path + '\\' + path_opf, 'utf-8'));
  //解析item
  let item = {
    css: [],
    ncx: [],
    image: [],
    chapter: []
  };
  for (let i of content_opf.manifest.item) {
    let subName;
    if (i['media-type'] === 'text/css') {
      subName = 'css';
    } else if (i['media-type'] === 'application/x-dtbncx+xml') {
      subName = 'ncx';
    } else if (i['media-type'].match('image/')) {
      subName = 'image';
    } else if (i['media-type'] === 'application/xhtml+xml') {
      subName = 'chapter';
    }
    item[subName].push({
      id: i.id,
      href: i.href
    });
  }

  //重写章节内容
  let css = item['css'].map(i => `<link type="text/css" rel="stylesheet" href="${i.href}" />`)[0];
  item['chapter'].forEach(i => {
    let _chapter = path.resolve(folder_item, i.href);
    let content_chapter = fs.readFileSync(_chapter, 'utf-8');
    content_chapter = content_chapter.replace(/[\r\n]/g, '');
    content_chapter = '<html xmlns="http://www.w3.org/1999/xhtml"><head>' + content_chapter.match(/<title>.*?<\/title>/)[0] + css + '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>' + content_chapter.match(/<body>.*?<\/body>/)[0] + '</html>';
    fs.writeFileSync(_chapter, content_chapter);
  });
  //重写css
  fs.writeFileSync(path.resolve(folder_item, item['css'][0].href), 'body{line-height:130%;text-align:justify;font-family:"Microsoft YaHei";font-size:22px;margin:0 auto;background-color:#CCE8CF;color:#000;}h1{text-align:center;font-weight:bold;font-size:28px;}h2{text-align:center;font-weight:bold;font-size:26px;}h3{text-align:center;font-weight:bold;font-size:24px;}p{text-indent:2em;}');

  //console.log(content_opf);
  //console.log(item);

  //压缩
  if (!fs.exists('output')) fs.mkdirSync('output');
  /**使用AdmZip压缩存在问题
  let zip = new AdmZip();
  zip.addLocalFolder('temp_' + path.parse(book).name)
  fs.writeFileSync('output\\' + path.parse(book).base, zip.toBuffer());
  **/
  var output = fs.createWriteStream('output\\' + path.parse(book).base);
  var archive = archiver('zip', {
    zlib: {
      level: 9
    } // Sets the compression level.
  });
  output.on('close', function() {
    rmdir.sync(_path);
    cb(null, book);
  });
  archive.on('error', function(err) {
    cb(null, book);
    throw err;
  });
  archive.pipe(output);
  archive.directory(_path, false);
  archive.finalize();



});
