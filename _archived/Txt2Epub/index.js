#!/usr/bin/env node

// ==Headers==
// @Name:               Txt2Epub
// @Description:        将 TXT 转换为 EPUB 格式
// @Version:            1.0.8
// @Author:             dodying
// @Modified:           2020-1-29 20:35:10
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            archiver,fs-extra,glob
// ==/Headers==
/* eslint-disable camelcase */

// 设置
const _ = {
  folder: process.cwd(),
  output: 'E:\\Desktop',
  author: 'novelDownloader',
  cover: 'cover.jpg', // folder目录下
  css: 'body{line-height:130%;text-align:justify;font-family:"Microsoft YaHei";font-size:22px;margin:0 auto;background-color:#CCE8CF;color:#000;}h1{text-align:center;font-weight:bold;font-size:28px;}h2{text-align:center;font-weight:bold;font-size:26px;}h3{text-align:center;font-weight:bold;font-size:24px;}p{text-indent:2em;}',
  nocover: 'E:\\Desktop\\_\\GitHub\\Nodejs\\Txt2Epub\\nocover.jpg',
};

// 导入原生模块
const path = require('path');

// 导入第三方模块
const glob = require('glob');
const archiver = require('archiver');
const fse = require('fs-extra');

// 获取目录下的txt文件
const books = glob.sync('*.txt', {
  cwd: path.resolve(_.folder),
}).sort();
console.log(books);
// 根据目录获取书名
const bookName = path.parse(path.resolve(_.folder)).base;
// 根据时间生成uuid
const uuid = `nd${new Date().getTime().toString()}`;
// 生成临时文件夹
const _path = path.resolve(_.folder, 'temp');
fse.mkdirSync(_path);
// file: mimetype
fse.writeFileSync(path.resolve(_path, 'mimetype'), 'application/epub+zip');
// folder: META-INF
fse.mkdirSync(path.resolve(_path, 'META-INF'));
// file: META-INF/container.xml
fse.writeFileSync(path.resolve(_path, 'META-INF', 'container.xml'), '<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" /></rootfiles></container>');
// folder: OEBPS
const path_oebps = path.resolve(_path, 'OEBPS');
fse.mkdirSync(path_oebps);
// file: OEBPS/stylesheet.css
fse.writeFileSync(path.resolve(path_oebps, 'stylesheet.css'), _.css);
// file: OEBPS/cover.jpg
let cover = path.resolve(_.folder, _.cover);
if (!fse.existsSync(cover)) cover = _.nocover;
fse.writeFileSync(path.resolve(path_oebps, 'cover.jpg'), fse.readFileSync(cover));
//
let content_opf = `<?xml version="1.0" encoding="UTF-8"?><package version="2.0" unique-identifier="${uuid}" xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:title>${bookName}</dc:title><dc:creator>${_.author}</dc:creator><dc:identifier id="${uuid}">urn:uuid:${uuid}</dc:identifier><dc:language>zh-CN</dc:language><meta name="cover" content="cover-image" /></metadata><manifest>`;
let toc_ncx = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:uuid:${uuid}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>${bookName}</text></docTitle><navMap><navPoint id="navpoint-1" playOrder="1"><navLabel><text>首页</text></navLabel><content src="${'0'.padStart(books.length, '0')}.html"/></navPoint>`;
let item = `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="cover" href="${'0'.padStart(books.length, '0')}.html" media-type="application/xhtml+xml"/><item id="css" href="stylesheet.css" media-type="text/css"/>`;
let itemref = '<itemref idref="cover" linear="yes"/>';

for (let i = 0; i < books.length; i++) {
  const chapterName = path.parse(books[i]).name;
  const chapterOrder = String(i + 1).padStart(books.length, '0');
  const chapterContent = fse.readFileSync(books[i], 'utf-8').replace(/[\r\n]+/g, '</p><p>').replace(/<p>\s+/g, '<p>');
  toc_ncx = `${toc_ncx}<navPoint id="chapter${chapterOrder}" playOrder="${i + 2}"><navLabel><text>${chapterName}</text></navLabel><content src="${chapterOrder}.html"/></navPoint>`;
  item = `${item}<item id="chapter${chapterOrder}" href="${chapterOrder}.html" media-type="application/xhtml+xml"/>`;
  itemref = `${itemref}<itemref idref="chapter${chapterOrder}" linear="yes"/>`;
  fse.writeFileSync(path.resolve(path_oebps, `${chapterOrder}.html`), `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${chapterName}</title><link type="text/css" rel="stylesheet" media="all" href="stylesheet.css" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body><h3>${chapterName}</h3><div><p>${chapterContent}</p></div></body></html>`);
}
content_opf = `${content_opf + item}<item id="cover-image" href="cover.jpg" media-type="image/jpeg"/></manifest><spine toc="ncx">${itemref}</spine><guide><reference href="${'0'.padStart(books.length, '0')}.html" type="cover" title="Cover"/></guide></package>`;
toc_ncx = `${toc_ncx}</navMap></ncx>`;
fse.writeFileSync(path.resolve(path_oebps, 'content.opf'), content_opf);
fse.writeFileSync(path.resolve(path_oebps, 'toc.ncx'), toc_ncx);
fse.writeFileSync(path.resolve(path_oebps, `${'0'.padStart(books.length, '0')}.html`), `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${bookName}</title><link type="text/css" rel="stylesheet" href="stylesheet.css" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body><h1>${bookName}</h1><h2>本电子书由用户脚本${_.author}制作</h2></body></html>`);

// 生成Epub
if (!fse.existsSync(_.output)) fse.mkdirSync(_.output);
const output = fse.createWriteStream(path.resolve(_.output, `${bookName}.epub`));
const archive = archiver('zip', {
  zlib: {
    level: 9,
  }, // Sets the compression level.
});
output.on('close', () => {
  fse.removeSync(_path);
});
archive.on('error', (err) => {
  throw err;
});
archive.pipe(output);
archive.directory(_path, false);
archive.finalize();
