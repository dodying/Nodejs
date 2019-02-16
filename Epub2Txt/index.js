#!/usr/bin/env node

// ==Headers==
// @Name:               Epub2Txt
// @Description:        将 EPUB 转换为 TXT 格式
// @Version:            1.0.14
// @Author:             dodying
// @Date:               2019-2-12 10:43:15
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            adm-zip,fs-extra,glob,pixl-xml
// ==/Headers==

// 设置
const _ = {
  database: process.cwd()
}

// 导入原生模块
const path = require('path')

// 导入第三方模块
const glob = require('glob')
const XML = require('pixl-xml')
const AdmZip = require('adm-zip')
const fse = require('fs-extra')

//

// Main
const main = async () => {
  let books = glob.sync('*.epub', {
    cwd: path.resolve(_['database'])
  })
  console.log(books)
  for (let book of books) {
    let bookName = path.parse(book).name
    let _path = 'temp_' + bookName
    new AdmZip(book).extractAllTo(_path, true)
    // let files = glob.sync(_path + '\\**\\*')

    // 解析opf
    let opfPath = XML.parse(fse.readFileSync(_path + '\\META-INF\\container.xml', 'utf-8')).rootfiles.rootfile['full-path']
    let itemPath = path.parse(_path + '\\' + opfPath).dir
    let opfContent = XML.parse(fse.readFileSync(_path + '\\' + opfPath, 'utf-8'))
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

    if (!fse.existsSync('output')) fse.mkdirSync('output')
    if (!fse.existsSync(path.resolve('output', bookName))) fse.mkdirSync(path.resolve('output', bookName))
    // 读取并转换chapter内容
    item.chapter.forEach(i => {
      let chapterContent = fse.readFileSync(path.resolve(itemPath, i.href), 'utf-8').replace(/[\r\n]/g, '')
      let chapterName = chapterContent.match(/<title>(.*?)<\/title>/)[1].trim()
      chapterContent = chapterContent.match(/<body>(.*?)<\/body>/)[1].replace(/(<.?p>|<.?div>|<.?h\d+>)/g, '\r\n').replace(/[\r\n]+(\s+|)/g, '\r\n  ').trim()
      fse.writeFileSync(path.resolve('output', bookName, chapterName + '.txt'), chapterContent)
    })

    fse.removeSync(_path)
  }
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
