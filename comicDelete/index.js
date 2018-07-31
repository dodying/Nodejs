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
// @Require:            readline-sync
// ==/Headers==

// 设置
const deletedPath = 'F:\\ComicLibrary\\X.Deleted'

// 导入原生模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const readlineSync = require('readline-sync')

// Function

// Main

process['argv'].splice(2).forEach(i => {
  let p = path.resolve(process.cwd(), i)
  if (fs.existsSync(p)) {
    console.log(p)
    if (p.match('F:\\\\ComicLibrary') || readlineSync.keyInYNStrict('Continue to delete?')) {
      fs.unlinkSync(p)
      fs.writeFileSync(path.resolve(deletedPath, path.parse(p).base), '')
      console.log('File Deleted:\t', p)
    }
  } else {
    console.error('NOT find:\t', p)
  }
})
