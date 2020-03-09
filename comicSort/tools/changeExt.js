// ==Headers==
// @Name:               changeExt
// @Description:        修改本子后缀名
// @Version:            1.0.67
// @Author:             dodying
// @Modified:           2020-3-6 14:00:53
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            readline-sync
// ==/Headers==

// usage: extWithDot

// 设置
const _ = require('./../config')

// 导入原生模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const readlineSync = require('readline-sync')

const walk = require('./../../_lib/walk')

// Main
const main = async () => {
  let exts = ['.zip', '.cbz']
  let toExt = exts.includes(process.argv[2]) ? process.argv[2] : '.zip'
  let files = walk(_.libraryFolder, {
    ignoreDir: path.basename(_.subFolderTag),
    ignoreFile: /\.(jpg|png|url)$/i
  }).reverse()

  for (let file of files) {
    if (fs.statSync(file).isFile()) {
      let { dir, name, ext } = path.parse(file)
      if (!exts.includes(ext)) continue
      let nameNew = path.join(dir, name + toExt)
      if (nameNew !== file) {
        if (!fs.existsSync(nameNew) || readlineSync.keyInYNStrict(`Name:\t${name}\nWarn:\tExists\nAsk:\tOverwrite?`)) {
          fs.renameSync(file, path.join(dir, name + toExt))
        }
      }
    } else if (fs.statSync(file).isDirectory()) {
      let list = fs.readdirSync(file).map(i => fs.statSync(path.join(file, i)).mtime).sort()
      if (!list.length) continue
      let time = list[list.length - 1]
      fs.utimesSync(file, time, time)
    }
  }
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
