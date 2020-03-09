// ==Headers==
// @Name:               changeTime
// @Description:        changeTime
// @Version:            1.0.386
// @Author:             dodying
// @Created:            2020-01-21 09:57:28
// @Modified:           2020-3-6 14:07:30
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra,jszip,readline-sync
// ==/Headers==

// usage: command []files

// command:
//   1. now
//   2. dl
//   3. old

// 修改文件时间 btime=上传时间 mtime=下载时间
// 修改文件夹时间 btime=最新一本的上传时间 mtime=最后检查（现在）/下载时间
// 空文件夹 远古

// 设置

// 导入原生模块
const path = require('path')
const cp = require('child_process')

// 导入第三方模块
const fse = require('fs-extra')
const JSZip = require('jszip')
// const readlineSync = require('readline-sync')

const walk = require('./../../_lib/walk')
const parseInfo = require('./../js/parseInfo')

// Function
const color = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m'
}
const colors = {
  info: text => color.FgGreen + text + color.Reset,
  help: text => color.FgCyan + text + color.Reset,
  warn: text => color.FgYellow + text + color.Reset,
  debug: text => color.FgBlue + text + color.Reset,
  error: text => color.FgRed + text + color.Reset
}

const timeFormat = (time, format = 'yyyy-MM-dd HH:mm:ss') => {
  let date = new Date(time)
  let obj = {
    yyyy: date.getFullYear().toString(),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    dd: date.getDate().toString().padStart(2, '0'),

    HH: date.getHours().toString().padStart(2, '0'),
    mm: date.getMinutes().toString().padStart(2, '0'),
    ss: date.getSeconds().toString().padStart(2, '0')
  }
  let re = new RegExp(`(${Object.keys(obj).join('|')})`, 'g')
  return format.replace(re, (matched, p1) => obj[p1])
}
const changeTime = async (file, btime, mtime) => {
  try {
    btime = timeFormat(btime)
    mtime = timeFormat(mtime)
    let info = fse.statSync(file)
    console.log(file)

    if (btime !== timeFormat(info.birthtimeMs)) {
      console.log({ btime })
      cp.execFileSync('powershell', [`(Get-Item -LiteralPath '${file}').CreationTime`, '=', '"', btime, '"'])
    }

    if (mtime !== timeFormat(info.mtimeMs)) {
      console.log({ mtime })
      cp.execFileSync('powershell', [`(Get-Item -LiteralPath '${file}').LastWriteTime`, '=', '"', mtime, '"'])
    }

    // readlineSync.keyInPause()
  } catch (error) {
    console.error(error)
  }
  // await waitInMs(20)
}

// Main
const main = async () => {
  let [command, ...files] = process.argv.slice(2)
  // console.log({ command, files })

  files = files.map(file => fse.statSync(file).isDirectory() ? [file].concat(walk(file)) : [file])
  files = [].concat(...files).filter((item, index, array) => array.indexOf(item) === index)

  let folders = files.filter(file => fse.statSync(file).isDirectory()).sort((a, b) => a.split('\\').length > b.split('\\').length ? -1 : a.split('\\').length === b.split('\\').length ? 0 : 1).map(i => i.replace(/\\+$/, ''))
  files = files.filter(file => fse.statSync(file).isFile() && ['.jpg', '.cbz'].includes(path.extname(file))).sort((a, b) => path.extname(a) === '.cbz' ? -1 : 1)

  for (let file of files) {
    if (path.extname(file) === '.jpg') {
      let info = path.parse(file)
      let cbzFile = path.join(info.dir, info.name + '.cbz')
      if (!fse.existsSync(cbzFile)) continue
      let cbzFileInfo = fse.statSync(cbzFile)
      await changeTime(file, cbzFileInfo.birthtime, cbzFileInfo.mtime)
      continue
    }

    // 读取数据
    let targetData = fse.readFileSync(file)
    let jszip = new JSZip()
    let zip
    try {
      zip = await jszip.loadAsync(targetData)
    } catch (error) {
      console.error(`Error:\t无法读取文件 "${file}"`)
      // readlineSync.keyInPause('Press any key to Continue')
      continue
    }

    // 查看列表
    let fileList = Object.keys(zip.files)

    // 检测有无info.txt
    if (fileList.filter(item => item.match(/(^|\/)info\.txt$/)).length === 0) {
      console.warn(colors.warn('压缩档内不存在info.txt: '), file)
      return new Error('no info.txt')
    }

    // 读取info.txt
    let infoFile = fileList.find(item => item.match(/(^|\/)info\.txt$/))
    let data = await zip.files[infoFile].async('text')
    let info = parseInfo(data)

    await changeTime(file, info.Posted, info.downloadTime)
  }

  for (let folder of folders) {
    let files = fse.readdirSync(folder).map(file => path.join(folder, file)).filter(file => ['.cbz'].includes(path.extname(file)))
    if (files.length === 0) {
      await changeTime(folder, '2010-01-01 00:00:00', '2010-01-01 00:00:00')
      continue
    }

    let infos = files.map(file => fse.statSync(file))
    let btime = infos.map(info => info.birthtimeMs).sort().reverse()[0]
    let mtime

    if (command === 'now') {
      mtime = new Date()
    } else if (command === 'dl') {
      mtime = infos.map(info => info.mtimeMs).sort().reverse()[0]
    } else if (command === 'old') {
      mtime = '2010-01-01 00:00:00'
    } else {
      mtime = btime
    }
    await changeTime(folder, btime, mtime)
  }
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
