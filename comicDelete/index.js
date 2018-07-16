// ==Headers==
// @Name:               comicDelete
// @Description:        comicDelete
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-06-18 15:47:59
// @Last Modified by:   dodying
// @Last Modified time: 2018-06-18 15:47:59
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            trash,readline-sync
// ==/Headers==

// 设置
const deletedPath = 'F:\\ComicLibrary\\X.Deleted'

// 导入原生模块
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

// 导入第三方模块
// let trash = require('trash');
const readlineSync = require('readline-sync')

// Function

// Main

process['argv'].splice(2).forEach(async i => {
  let p = path.resolve(process.cwd(), i)
  if (fs.exists(p)) {
    console.log(p)
    if (p.match('F:\\\\ComicLibrary') || readlineSync.keyInYN('Continue to delete?')) {
      // await trash(p);
      fs.unlinkSync(p)
      fs.writeFileSync(path.resolve(deletedPath, path.parse(p).base), '')
      console.log('File Deleted:\t', p)
    }
  } else {
    console.error('NOT find:\t', p)
  }
})
// readlineSync.keyInPause('Press Any Key to Exit');
