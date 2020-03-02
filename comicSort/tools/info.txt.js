// ==Headers==
// @Name:               info.txt
// @Description:        info.txt
// @Version:            1.0.396
// @Author:             dodying
// @Created:            2020-01-21 12:15:39
// @Modified:           2020-3-2 15:22:20
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:entities,fs-extra,jszip,readline-sync,request-promise,socks5-https-client
// ==/Headers==

// usage: command []file

// command:
//  reInfo ?no/only:main => re-get info from server
//  add main:sub
//  del main:sub
//  view ?main
//  "" (empty) re-generate info.txt

// 设置
const _ = require('./../config')

// 导入原生模块
const path = require('path')
const cp = require('child_process')
const parseInfo = require('./../js/parseInfo')

// 导入第三方模块
const JSZip = require('jszip')
const fse = require('fs-extra')
const request = require('request-promise')
const Agent = require('socks5-https-client/lib/Agent')
const readlineSync = require('readline-sync')
const entities = require('entities')

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

let req = async (url, option = {}) => {
  let requestOption = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36'
    },
    timeout: 30 * 1000,
    resolveWithFullResponse: true
  }
  if (_.proxy.match(/^http:/i)) {
    requestOption.proxy = _.proxy
  } else if (_.proxy.match(/^socks5:/i)) {
    requestOption.agentClass = Agent
    let match = _.proxy.match(/^socks5:\/\/([\d.]+):(\w+)/i)
    requestOption.agentOptions = {
      socksHost: match[1],
      socksPort: match[2]
    }
  }

  let result
  try {
    result = await request(Object.assign(requestOption, option))
  } catch (error) {
    console.log(url)
    result = await req(url, option)
  }
  return result
}

function fullWidth2Half (str) { // 全角字符转半角
  // info: https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms
  // refer: https://www.cnblogs.com/html55/p/10298569.html
  let result = ''
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 12288) {
      result += String.fromCharCode(str.charCodeAt(i) - 12256)
      continue
    }
    if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375) result += String.fromCharCode(str.charCodeAt(i) - 65248)
    else result += String.fromCharCode(str.charCodeAt(i))
  }
  return result
}

function reEscape (text) {
  // refer https://github.com/lodash/lodash/blob/master/escapeRegExp.js
  return text.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
}

let infoGroup = ['[]', '()', '{}', '【】']
let removeOtherInfo = (text, reverse = false) => {
  if (reverse) text = text.split('').reverse().join('')
  let group = reverse ? infoGroup.map(i => i.split('').reverse().join('')) : infoGroup
  group = group.map(i => i.split('').map(j => reEscape(j)))
  let re = group.map(i => `${i[0]}.*?${i[1]}`).join('|')
  re = new RegExp(`^(${re})`)
  let matched = text.match(re)
  while (matched) {
    text = text.replace(re, '').trim()
    matched = text.match(re)
  }
  if (reverse) text = text.split('').reverse().join('')
  return text
}
let digitalRomaji = {
  0: [['rei', 'zero'], ['0', '０', '零', '〇']],
  1: [['ichi', 'i'], ['1', '１', '一', '壹', '壱']],
  2: [['ni', 'ii'], ['2', '２', '二', '贰', '貮', '弐']],
  3: [['san', 'sann', 'iii'], ['3', '３', '三', '参', '參']],
  4: [['yon', 'yonn', 'shi', 'iv'], ['4', '４', '四', '肆']],
  5: [['go', 'v'], ['5', '５', '五', '伍']],
  6: [['roku', 'vi'], ['6', '６', '六', '陆', '陸']],
  7: [['nana', 'shichi', 'vii'], ['7', '７', '七', '柒', '漆']],
  8: [['hachi', 'viii'], ['8', '８', '八', '捌']],
  9: [['kyuu', 'kyu', 'ix'], ['9', '９', '九', '玖']],
  10: [['jyuu', 'jyu', 'juu', 'ju', 'x'], ['10', '１０', '十', '拾']]
}

const changeTitle = (text, titleJp) => {
  let title = fullWidth2Half(text).replace(/^\(.*?\)( |)/, '').replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/, ' ').trim()

  // 去除标题中首尾的信息，如作者，组织，原作，语言，翻译组
  let mainTitleJp = removeOtherInfo(titleJp)
  mainTitleJp = removeOtherInfo(mainTitleJp, true)

  let digitalRomajiJpRe = Object.values(digitalRomaji).map(i => i[1].join('|')).join('|')
  digitalRomajiJpRe = new RegExp(`(${digitalRomajiJpRe})(\\W+|$)`)

  if (!mainTitleJp.match(digitalRomajiJpRe)) return title

  let mainTitle = removeOtherInfo(title)
  mainTitle = removeOtherInfo(mainTitle, true)
  mainTitle = mainTitle.replace(/[|~].*/, '').replace(/\s+/, ' ').trim()

  let index = title.indexOf(mainTitle)
  let prefix = title.substr(0, index).trim()
  let suffix = title.substr(index + mainTitle.length).trim()

  let mianTitleArr = mainTitle.split(/\s+/).reverse()
  for (let i = 0; i < mianTitleArr.length; i++) {
    let text = mianTitleArr[i]

    let re = digitalRomaji[10][0].join('|')
    re = new RegExp(`(${re})`, 'i')
    if (text.match(re)) {
      let arr = text.split(re).filter(i => i)
      if (arr.length > 1) {
        let digitalRomajiRe = Object.values(digitalRomaji).map(i => i[0].join('|')).join('|')
        digitalRomajiRe = new RegExp(`(\\W+|^)(${digitalRomajiRe})(\\W+|$)`, 'i')
        if (arr.every(j => j.match(digitalRomajiRe))) {
          mianTitleArr.splice(i, 1, ...arr.reverse())
          i--
          continue
        }
      }
    }

    let matched = false
    for (let j in digitalRomaji) {
      let re = digitalRomaji[j][0].join('|')
      re = new RegExp(`^(${re})(\\W+|$)`, 'i')
      if (!text.match(re)) continue
      matched = true
      mianTitleArr[i] = text.replace(re, digitalRomaji[j][1][0] + '$2')

      if (i > 0 && mianTitleArr[i].match(/^\d+$/) && mianTitleArr[i - 1].match(/^(\d+)(\W+)$/)) {
        let number1 = mianTitleArr[i] * 1
        let re0 = mianTitleArr[i - 1].match(/^(\d+)(\W+)$/)
        let number0 = re0[1] * 1
        mianTitleArr[i - 1] = number1 < 10 && number0 < 10 ? number1.toString() + number0.toString() : (number1 + number0).toString()
        mianTitleArr[i - 1] += re0[2]
        mianTitleArr.splice(i, 1)
        i--
      }
      break
    }
    if (!matched) break
  }
  mainTitle = mianTitleArr.reverse().join(' ')

  return `${prefix} ${mainTitle} ${suffix}`
}

// Main
const main = async () => {
  let [command, ...files] = process.argv.slice(2)
  // console.log({ command, files })

  let mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc']
  let mainInfo = ['title', 'jTitle', 'web']
  let otherInfo = ['Category', 'Uploader', 'Posted', 'Parent', 'Visible', 'Language', 'File Size', 'Length', 'Favorited', 'Rating']
  let toDeleteInfo = ['page', 'length', 'genre', 'lang', 'bw', 'rating', 'tags']

  for (let file of files) {
    console.log(file)
    let targetDir = path.parse(file).dir

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

    // 如果info不存在tags(EHD v1.23之前下载的)
    if (command.match(/^reInfo/) && info.web.match(/e(-|x)hentai.org/)) {
      let url = info.web.replace(/^.*hentai.org/, 'https://e-hentai.org')
      let pram = url.split('/')
      let res = await req('https://e-hentai.org/api.php', {
        method: 'POST',
        body: JSON.stringify({
          method: 'gdata',
          gidlist: [[pram[4] * 1, pram[5]]],
          namespace: 1
        })
      })
      let json
      try {
        json = JSON.parse(res.body)
      } catch (error) {
        console.log(res.body)
        process.exit()
      }
      json = json.gmetadata[0]

      let infoNew = {}

      // infoNew.title = json.title
      infoNew.title = entities.decode(changeTitle(json.title, json.title_jpn))
      infoNew.jTitle = entities.decode(json.title_jpn)
      infoNew.Category = json.category
      infoNew.Uploader = json.uploader

      let date = new Date(json.posted * 1000)
      infoNew.Posted = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

      infoNew.Visible = json.expunged ? 'No' : 'Yes'
      infoNew.Length = json.filecount + ' pages'
      infoNew['File Size'] = Math.round(json.filesize * 100 / 1024 / 1024) / 100 + ' MB'
      infoNew.Rating = json.rating

      for (let tag of json.tags) {
        let [main, sub] = tag.split(':')
        if (!sub) [main, sub] = ['misc', main]
        if (!(main in infoNew)) infoNew[main] = []
        infoNew[main].push(sub)
      }

      if (command.match(/reInfo\s+(no|only):\s*(.*)/)) {
        let [, mode, keys] = command.match(/reInfo\s+(no|only):\s*(.*)/)
        keys = keys.split(',').map(i => i.trim())
        let withTags = keys.includes('tags')
        for (let i in infoNew) {
          let keysIncludes = keys.includes(i)
          let tagIncludes = withTags && mainTag.includes(i)
          if (mode === 'no' && (keysIncludes || tagIncludes)) {
            delete infoNew[i]
          } else if (mode === 'only' && !keysIncludes && !tagIncludes) {
            delete infoNew[i]
          }
        }
      }

      // for (let i in infoNew) {
      //   if (info[i] !== infoNew[i]) console.log({ i, old: info[i], new: infoNew[i] })
      // }

      Object.assign(info, infoNew)
    } else if (command.match(/^add\s/)) {
      let [, main, sub] = command.match(/^add\s+(\w.*?):\s*(.*)/)
      console.log({ main, sub })
      if (!(main in info)) info[main] = []
      info[main].push(sub)
      info[main] = info[main].filter((item, index, array) => array.indexOf(item) === index)
    } else if (command.match(/^del\s/)) {
      let [, main, sub] = command.match(/^del\s+(\w.*?):\s*(.*)/)
      console.log({ main, sub })
      if (main in info && info[main].indexOf(sub) >= 0) info[main].splice(info[main].indexOf(sub), 1)
    } else if (command.match(/^view/)) {
      toDeleteInfo.forEach(i => delete info[i])

      if (command.match(/view\s+(no|only):\s*(.*)/)) {
        let [, mode, keys] = command.match(/view\s+(no|only):\s*(.*)/)
        keys = keys.split(',').map(i => i.trim())
        let withTags = keys.includes('tags')
        for (let i in info) {
          let keysIncludes = keys.includes(i)
          let tagIncludes = withTags && mainTag.includes(i)
          if (mode === 'no' && (keysIncludes || tagIncludes)) {
            delete info[i]
          } else if (mode === 'only' && !keysIncludes && !tagIncludes) {
            delete info[i]
          }
        }
      }

      console.clear()
      console.log(info)
      readlineSync.keyInPause()
      continue
    }

    let infoArr = []

    mainInfo.forEach(i => infoArr.push(info[i]))
    infoArr.push('')

    otherInfo.forEach(i => infoArr.push(`${i}: ${info[i]}`))
    infoArr.push('')

    infoArr.push('Tags:')
    mainTag.forEach(main => {
      if (main in info && info[main].length) infoArr.push(`> ${main}: ${info[main].sort().join(', ')}`)
    })
    infoArr.push('')

    infoArr.push(info.summary || '', '')

    for (let i = 0; i < info.page.length; i++) {
      let pageThis = info.page[i]
      if (!pageThis) continue
      infoArr.push(`Page ${i}: ${pageThis.url}`, `Image ${i}: ${pageThis.name}`, '')
    }

    infoArr.push(`Downloaded at ${info.downloadTime}`, '', 'Generated by E-Hentai Downloader. https://github.com/ccloli/E-Hentai-Downloader')

    let infoFileDir = path.resolve(targetDir, path.parse(infoFile).dir)
    fse.mkdirsSync(infoFileDir)
    let infoFilePath = path.resolve(infoFileDir, 'info.txt')
    fse.writeFileSync(infoFilePath, infoArr.join('\r\n'))

    cp.execSync(`${_['7z']} a -tzip -mx9 "${file}" "${infoFile}"`, {
      cwd: targetDir
    })

    fse.unlinkSync(infoFilePath)
    if (infoFileDir !== targetDir) fse.removeSync(infoFileDir)

    let mtime = new Date(info.downloadTime)
    fse.utimesSync(file, mtime, mtime)
  }
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
