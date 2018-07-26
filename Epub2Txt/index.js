#!/usr/bin/env node

// ==Headers==
// @Name:               EpubRewrite
// @Description:        EpubRewrite
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-02-06 10:43:07
// @Last Modified by:   dodying
// @Last Modified time: 2018-02-07 10:59:33
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            glob, async, pixl-xml, adm-zip, rimraf
// ==/Headers==

// CONFIG
const _ = {
  database: process.cwd()
}

// native modules
const fs = require('fs')
const path = require('path')

// 3rd party modules
const glob = require('glob')
const async = require('async')
const XML = require('pixl-xml')
const AdmZip = require('adm-zip')
const rmdir = require('rimraf')

//
let books = glob.sync('*.epub', {
  cwd: path.resolve(_['database'])
})
console.log(books)

async.mapSeries(books, (book, cb) => {
  let bookName = path.parse(book).name
  let _path = 'temp_' + bookName
  new AdmZip(book).extractAllTo(_path, true)
  // let files = glob.sync(_path + '\\**\\*')

  // 解析opf
  let opfPath = XML.parse(fs.readFileSync(_path + '\\META-INF\\container.xml', 'utf-8')).rootfiles.rootfile['full-path']
  let itemPath = path.parse(_path + '\\' + opfPath).dir
  let opfContent = XML.parse(fs.readFileSync(_path + '\\' + opfPath, 'utf-8'))
  // 解析item
  let item = {
    css: [],
    ncx: [],
    image: [],
    chapter: []
  }
  for (let i of opfContent.manifest.item) {
    let subName
    if (i['media-type'] === 'text/css') {
      subName = 'css'
    } else if (i['media-type'] === 'application/x-dtbncx+xml') {
      subName = 'ncx'
    } else if (i['media-type'].match('image/')) {
      subName = 'image'
    } else if (i['media-type'] === 'application/xhtml+xml') {
      subName = 'chapter'
    }
    item[subName].push({
      id: i.id,
      href: i.href
    })
  }

  if (!fs.existsSync('output')) fs.mkdirSync('output')
  if (!fs.existsSync(path.resolve('output', bookName))) fs.mkdirSync(path.resolve('output', bookName))
  // 读取并转换chapter内容
  item.chapter.forEach(i => {
    let chapterContent = fs.readFileSync(path.resolve(itemPath, i.href), 'utf-8').replace(/[\r\n]/g, '')
    let chapterName = chapterContent.match(/<title>(.*?)<\/title>/)[1].trim()
    chapterContent = chapterContent.match(/<body>(.*?)<\/body>/)[1].replace(/(<.?p>|<.?div>|<.?h\d+>)/g, '\r\n').replace(/[\r\n]+(\s+|)/g, '\r\n  ').trim()
    fs.writeFileSync(path.resolve('output', bookName, chapterName + '.txt'), chapterContent)
  })

  rmdir.sync(_path)
  cb(null, book)
})
