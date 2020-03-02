// ==Headers==
// @Name:               copyInfo
// @Description:        copyInfo
// @Version:            1.0.345
// @Author:             dodying
// @Created:            2020-01-18 15:55:20
// @Modified:           2020-3-2 14:54:06
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            clipboardy,fs-extra,jszip,readline-sync
// ==/Headers==

// usage: text []file

// 设置
const _ = require('./../config')

// 导入原生模块
const path = require('path')

// 导入第三方模块
const JSZip = require('jszip')
const fse = require('fs-extra')
const readlineSync = require('readline-sync')
const clipboardy = require('clipboardy')
const parseInfo = require('./../js/parseInfo')
const findData = require('./../js/findData')
const EHT = JSON.parse(fse.readFileSync(path.join(__dirname, '../', 'EHT.json'), 'utf-8')).data
findData.init(EHT)

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

const escape = text => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '').replace(_.emojiRegExp, '')
// const escape2 = text => text.replace(/[:*?"<>|]/g, '-').replace(/\.$/, '').replace(_.emojiRegExp, '')

// Main
const main = async () => {
  const [text, ...files] = process.argv.slice(2)
  console.log({ text, files })

  let textLib = {
    'Series': `\n[ ['folder', './../0.Series/【】[\${artist:chs}]\${jTitle:main}'], ['mode', 1], ['title', /\${title:main}/i], ['\${artist}'] ],`,
    '[Group]Series': `\n[ ['folder', './../0.Series/【】[\${group:chs}]\${jTitle:main}'], ['mode', 1], ['title', /\${title:main}/i], ['group', '\${group}'] ],`,

    'Series-Parody': `\n[ ['folder', './../0.Series/【同人-\${parody:chs}】[\${artist:chs}]\${jTitle:main}'], ['mode', 1], ['title', /\${title:main}/i], ['\${artist}'], ['parody', '\${parody}'] ],`,
    '[Group]Series-Parody': `\n[ ['folder', './../0.Series/【同人-\${parody:chs}】[\${group:chs}]\${jTitle:main}'], ['mode', 1], ['title', /\${title:main}/i], ['group', '\${group}'], ['parody', '\${parody}'] ],`,

    'Series-Parody-NoTitle': `\n[ ['folder', './../0.Series/【#同人-\${parody:chs}】\${artist:chs}'], ['mode', 1], ['parody', '\${parody}'], ['\${artist}'] ],`,
    '[Group]Series-Parody-NoTitle': `\n[ ['folder', './../0.Series/【#同人-\${parody:chs}】\${group:chs}'], ['mode', 1], ['parody', '\${parody}'], ['group', '\${group}'] ],`,

    'Artist': `\n[ ['folder', '#Artist/\${artist:chs}'], ['\${artist}'] ],`,
    '[Group]Artist': `\n[ ['folder', '#Artist/\${group:chs}'], ['group', '\${group}'] ],`
  }

  let parodyAlias = [
    ['出包王女', 'ToLove'],
    ['刀剑神域', 'SAO'],
    ['地下城与勇士', 'DNF'],
    ['东方Project', '东方'],
    ['化物语', '物语'],
    ['舰队Collection', '舰C'],
    ['路人女主的养成方法', '路人女主'],
    ['魔法科高中的劣等生', '魔劣'],
    ['偶像大师', 'im@'],
    ['轻音少女', '轻音'],
    ['少女与战车', '战车女'],
    ['圣诞之吻', '圣吻'],
    ['食戟之灵', '食戟'],
    ['我的妹妹不可能那么可爱', '俺妹'],
    ['我的朋友很少', '友少'],
    ['无限斯特拉托斯', 'IS'],
    ['在地下城寻求邂逅是否搞错了什么', '地下城邂逅'],
    ['Love Live! Sunshine!!', 'LLSS'],
    ['LoveLive!', 'LL'],
    ['VOCALOID', 'V家'],
    [/^Fate\//i, 'Fate'],
    [/光之美少女/, '光美'],
    ['精灵宝可梦', 'PM'],
    ['Free! 男子游泳部', 'Free'],
    ['请问您今天要来点兔子吗？', '点兔'],
    [/高达/, '高达'],
    ['我的青春恋爱物语果然有问题', '俺春物']
  ]

  let varsRe = /\${(.*?)}/
  let kanaRe = /^[あアいイうウえエおオかカきキくクけケこコさサしシすスせセそソたタちチつツてテとトなナにニぬヌねネのノはハひヒふフへヘほホまマみミむムめメもモやヤゆユよヨらラりリるルれレろロわワをヲんンがガぎギぐグげゲごゴざザじジずズぜゼぞゾだダぢヂづヅでデどドばバびビぶブべベぼボぱパぴピぷプぺペぽポゃャゅュょョ]/
  let ignoreInfoRe = /\[.*?\]|\(.*?\)|\{.*?\}|【.*?】/g
  let numberEndRe = /((vol|ch)\.?\s*|第|)(\d+|\d+-\d+)(話|)$/i
  let symbolRe = /[[\]{};:'",.<>/?`~!@#$%^&*()\-_=+]+$/
  let emojiRe = _.emojiRegExp

  let mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc']
  let toDeleteInfo = ['page']

  let output = []

  for (let file of files) {
    let textCopy = text

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

    toDeleteInfo.forEach(i => delete info[i])

    mainTag.forEach(i => {
      if (info[i]) {
        let arr = []
        for (let j of info[i]) {
          let value = findData(i, j, true).cname
          if (value && value.match(kanaRe)) value = null

          if (i === 'artist' && info[i].length === 1) {
            let nameJpn = info.jTitle.match(/\[(.*?)\]/)[1]
            if (nameJpn.match(/\(.*?\)/)) nameJpn = nameJpn.match(/\((.*?)\)/)[1]
            value = nameJpn
          }
          if (value && value.match(kanaRe)) value = null

          if (!value) {
            value = j.split('|')[0].trim()
            value = value.split(' ').map(i => `${i[0] ? i[0].toUpperCase() : ''}${i.slice(1)}`).join(' ')
            value = value.split('-').map(i => `${i[0] ? i[0].toUpperCase() : ''}${i.slice(1)}`).join('-')
          }
          arr.push(value)
        }
        info[i + ':chs'] = arr

        arr = []
        for (let j of info[i]) {
          let value = j.split('|')[0].trim()
          arr.push(value)
        }
        info[i] = arr
      }
    })

    info['title:main'] = info.title
    while ([ignoreInfoRe, numberEndRe, symbolRe].some(re => info['title:main'].match(re))) {
      info['title:main'] = info['title:main'].replace(ignoreInfoRe, '').trim().replace(numberEndRe, '').trim().replace(symbolRe, '').trim()
    }
    info['title:main'] = escape(info['title:main'])

    info['jTitle:main'] = info.title
    while ([ignoreInfoRe, numberEndRe, symbolRe].some(re => info['jTitle:main'].match(re))) {
      info['jTitle:main'] = info['jTitle:main'].replace(ignoreInfoRe, '').trim().replace(numberEndRe, '').trim().replace(symbolRe, '').trim()
    }
    info['jTitle:main'] = escape(info['jTitle:main'])

    // info['title:main'] = escape(info.title.replace(ignoreInfoRe, '').trim().replace(numberEndRe, '').trim().replace(symbolRe, '').trim())
    // info['jTitle:main'] = escape(info.jTitle.replace(ignoreInfoRe, '').trim().replace(numberEndRe, '').trim().replace(symbolRe, '').replace(emojiRe, '').trim())

    if (info['jTitle:main'].match(kanaRe)) info['jTitle:main'] = info['title:main']

    if (info['parody:chs']) {
      for (let i = 0; i < info['parody:chs'].length; i++) {
        for (let rule of parodyAlias) {
          let parody = info['parody:chs'][i]
          let matched = typeof rule[0] === 'string' ? parody === rule[0] : parody.match(rule[0])
          if (matched) info['parody:chs'][i] = rule[1]
        }
      }
      console.log(info['parody:chs'])
      // process.exit()
    }
    console.log(info)

    if (!textCopy) {
      textCopy = ''
      if (!info.artist || (info.artist.length >= 2 && info.group && info.group.length === 1)) textCopy += '[Group]'
      textCopy += 'Series'
      if (info.parody) {
        if (info.parody.length >= 2) info['parody:chs'] = 'Various'
        textCopy += '-Parody'
      }
    }
    if (textCopy in textLib) textCopy = textLib[textCopy]

    let result
    while ((result = textCopy.match(varsRe))) {
      let value
      let [raw, key] = result
      if (key in info) {
        value = info[key]
      } else {
        value = readlineSync.question(`${key}:\t`)
        info[key] = value
      }
      if (value && value instanceof Array) value = value.sort().join(',')
      textCopy = textCopy.split(raw).join(value)
    }
    output.push(textCopy)
  }

  clipboardy.writeSync(output.join('\n'))
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
