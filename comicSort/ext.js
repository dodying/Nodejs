// ==Headers==
// @Name:               ext
// @Description:        修改本子后缀名
// @Version:            1.0.54
// @Author:             dodying
// @Date:               2019-2-16 16:35:52
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            readline-sync
// ==/Headers==

// 设置
const _ = require('./config')

// 导入原生模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const readlineSync = require('readline-sync')

// Function
let walk = function (dir, option = {}) {
  if (!option.dir) option.dir = dir
  option.ignore = [].concat(option.ignore)

  let output = []
  let list = fs.readdirSync(dir)
  list.forEach(function (file) {
    if (option.ignore.some(i => file.match(i))) return
    let _path = path.join(dir, file)
    let name = option.fullpath ? _path : path.relative(option.dir, _path)
    if (fs.existsSync(_path) && fs.statSync(_path).isDirectory()) {
      if (!option.ignoreDir) output.push(name)
      output = output.concat(walk(_path, option))
    } else {
      output.push(name)
    }
  })
  return output
}

// Main
const main = async () => {
  let exts = ['.zip', '.cbz']
  let toExt = exts.includes(process.argv[2]) ? process.argv[2] : '.zip'
  let files = walk(_.libraryFolder, { ignore: [_.subFolderTag, /\.(jpg|png|url)$/i], fullpath: true }).reverse()

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
