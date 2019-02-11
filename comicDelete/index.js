#!/usr/bin/env node

// ==Headers==
// @Name:               comicDelete
// @Description:        删除漫画
// @Version:            1.0.2
// @Author:             dodying
// @Date:               2019-2-10 10:59:27
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            readline-sync
// ==/Headers==

// 设置
let deletedPath = 'F:\\H\\###ComicLibrary\\X.Deleted'
const extensions = ['.cbz', '.jpg', '.zip', '.png']

// 导入原生模块
const fs = require('fs')
const path = require('path')
let deletedPathFolderName = path.parse(path.parse(deletedPath).dir).base
let deletedPathName = path.parse(deletedPath).base

// 导入第三方模块
const readlineSync = require('readline-sync')

// Function

// Main

process['argv'].splice(2).filter(i => extensions.includes(path.parse(i).ext)).forEach(i => {
  let p = path.resolve(process.cwd(), i)
  if (fs.existsSync(p)) {
    if (!fs.existsSync(deletedPath)) {
      if (p.match('ComicLibrary')) {
        let deletedPathFolder = p
        while (path.parse(deletedPathFolder).base !== deletedPathFolderName) {
          deletedPathFolder = path.parse(deletedPathFolder).dir
        }
        deletedPath = path.join(deletedPathFolder, deletedPathName)
      } else {
        console.error('NOT find deletedPath:\t', deletedPath)
      }
    }
    console.log(p)
    if (p.match('ComicLibrary') || readlineSync.keyInYNStrict('Continue to delete?')) {
      fs.unlinkSync(p)

      let { dir, name } = path.parse(p)
      let cover = path.join(dir, name + '.jpg')
      if (fs.existsSync(cover)) fs.unlinkSync(cover)

      try {
        fs.writeFileSync(path.resolve(deletedPath, path.parse(p).base), '')
      } catch (error) {
        console.error(error)
      }
      console.log('File Deleted:\t', p)
    }
  } else {
    console.error('NOT find:\t', p)
  }
})
