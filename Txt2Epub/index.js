#!/usr/bin/env node

// ==Headers==
// @Name:               Txt2Epub
// @Description:        Txt2Epub
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-02-06 19:39:26
// @Last Modified by:   dodying
// @Last Modified time: 2018-02-09 13:18:40
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            glob, archiver, rimraf
// ==/Headers==
/* eslint-disable camelcase */

// CONFIG
const _ = {
  folder: process.cwd(),
  output: 'E:\\Desktop',
  author: 'novelDownloader',
  cover: 'cover.jpg', // folder目录下
  css: 'body{line-height:130%;text-align:justify;font-family:"Microsoft YaHei";font-size:22px;margin:0 auto;background-color:#CCE8CF;color:#000;}h1{text-align:center;font-weight:bold;font-size:28px;}h2{text-align:center;font-weight:bold;font-size:26px;}h3{text-align:center;font-weight:bold;font-size:24px;}p{text-indent:2em;}',
  nocover: 'E:\\Desktop\\_\\GitHub\\Nodejs\\Txt2Epub\\nocover.jpg'
}

// native modules
const fs = require('fs')
/* eslint-disable node/no-deprecated-api */
fs.exists = path => {
  try {
    fs.statSync(path)
  } catch (err) {
    return false
  }
  return true
}
const path = require('path')

// 3rd party modules
const glob = require('glob')
const archiver = require('archiver')
const rmdir = require('rimraf')

// 获取目录下的txt文件
let books = glob.sync(path.resolve(_['folder']) + '\\*.txt').sort()
console.log(books)
// 根据目录获取书名
let bookName = path.parse(path.resolve(_['folder'])).base
// 根据时间生成uuid
let uuid = 'nd' + new Date().getTime().toString()
// 生成临时文件夹
let _path = path.resolve(_['folder'], 'temp')
fs.mkdirSync(_path)
// file: mimetype
fs.writeFileSync(path.resolve(_path, 'mimetype'), 'application/epub+zip')
// folder: META-INF
fs.mkdirSync(path.resolve(_path, 'META-INF'))
// file: META-INF/container.xml
fs.writeFileSync(path.resolve(_path, 'META-INF', 'container.xml'), '<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" /></rootfiles></container>')
// folder: OEBPS
let path_oebps = path.resolve(_path, 'OEBPS')
fs.mkdirSync(path_oebps)
// file: OEBPS/stylesheet.css
fs.writeFileSync(path.resolve(path_oebps, 'stylesheet.css'), _['css'])
// file: OEBPS/cover.jpg
let cover = path.resolve(_['folder'], _['cover'])
if (!fs.exists(cover)) cover = _['nocover']
fs.writeFileSync(path.resolve(path_oebps, 'cover.jpg'), fs.readFileSync(cover))
//
var content_opf = '<?xml version="1.0" encoding="UTF-8"?><package version="2.0" unique-identifier="' + uuid + '" xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:title>' + bookName + '</dc:title><dc:creator>' + _['author'] + '</dc:creator><dc:identifier id="' + uuid + '">urn:uuid:' + uuid + '</dc:identifier><dc:language>zh-CN</dc:language><meta name="cover" content="cover-image" /></metadata><manifest>'
var toc_ncx = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:uuid:' + uuid + '"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>' + bookName + '</text></docTitle><navMap><navPoint id="navpoint-1" playOrder="1"><navLabel><text>首页</text></navLabel><content src="' + '0'.padStart(books.lenght, '0') + '.html"/></navPoint>'
var item = '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="cover" href="' + '0'.padStart(books.lenght, '0') + '.html" media-type="application/xhtml+xml"/><item id="css" href="stylesheet.css" media-type="text/css"/>'
var itemref = '<itemref idref="cover" linear="yes"/>'

for (let i = 0; i < books.length; i++) {
  let chapterName = path.parse(books[i]).name
  let chapterOrder = String(i + 1).padStart(books.length, '0')
  let chapterContent = fs.readFileSync(books[i], 'utf-8').replace(/[\r\n]+/g, '</p><p>').replace(/<p>\s+/g, '<p>')
  toc_ncx += '<navPoint id="chapter' + chapterOrder + '" playOrder="' + (i + 2) + '"><navLabel><text>' + chapterName + '</text></navLabel><content src="' + chapterOrder + '.html"/></navPoint>'
  item += '<item id="chapter' + chapterOrder + '" href="' + chapterOrder + '.html" media-type="application/xhtml+xml"/>'
  itemref += '<itemref idref="chapter' + chapterOrder + '" linear="yes"/>'
  fs.writeFileSync(path.resolve(path_oebps, chapterOrder + '.html'), '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>' + chapterName + '</title><link type="text/css" rel="stylesheet" media="all" href="stylesheet.css" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body><h3>' + chapterName + '</h3><div><p>' + chapterContent + '</p></div></body></html>')
}
content_opf = content_opf + item + '<item id="cover-image" href="cover.jpg" media-type="image/jpeg"/></manifest><spine toc="ncx">' + itemref + '</spine><guide><reference href="' + '0'.padStart(books.lenght, '0') + '.html" type="cover" title="Cover"/></guide></package>'
toc_ncx += '</navMap></ncx>'
fs.writeFileSync(path.resolve(path_oebps, 'content.opf'), content_opf)
fs.writeFileSync(path.resolve(path_oebps, 'toc.ncx'), toc_ncx)
fs.writeFileSync(path.resolve(path_oebps, '0'.padStart(books.lenght, '0') + '.html'), '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>' + bookName + '</title><link type="text/css" rel="stylesheet" href="stylesheet.css" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body><h1>' + bookName + '</h1><h2>本电子书由用户脚本' + _['author'] + '制作</h2></body></html>')

// 生成Epub
if (!fs.exists(_['output'])) fs.mkdirSync(_['output'])
var output = fs.createWriteStream(path.resolve(_['output'], bookName + '.epub'))
var archive = archiver('zip', {
  zlib: {
    level: 9
  } // Sets the compression level.
})
output.on('close', function () {
  rmdir.sync(_path)
})
archive.on('error', function (err) {
  throw err
})
archive.pipe(output)
archive.directory(_path, false)
archive.finalize()
