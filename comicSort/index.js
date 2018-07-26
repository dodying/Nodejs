// ==Headers==
// @Name:               comicSort
// @Description:        comicSort
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2017-12-03 08:31:33
// @Last Modified by:   dodying
// @Last Modified time: 2018-06-02 01:49:59
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            readline-sync,async,jszip,image-size,tracer,colors,glob,mkdirp,request,request-promise
// ==/Headers==

// 设置
const _ = {
  '7z': 'D:\\GreenSoftware\\_Basis\\7-Zip\\7z.exe', // 7z路径 (仅删除宣传图与压缩info.txt所需)
  proxy: 'http://127.0.0.1:2346', // 代理
  globRecursive: true, // 是否递归comicFolder
  comicFolder: 'F:\\Temp', // 需要整理的文件夹
  libraryFolder: 'F:\\ComicLibrary', // 整理到那个文件夹
  jTitle: false, // 是否重命名为日本名称
  delIntroPic: true, // 是否删除宣传图
  introPic: [],
  checkImageSize: true, // 是否检测图片大小
  rate: 1, // 图片宽高比的分界，大于则为双页
  size: 780, // 小图的宽度
  cover: true, // 是否创建同名封面
  subFolder: [ // 子文件夹
    '0.Series',
    '1.Cosplay',
    '2.Image Set',
    '3.Game CG',
    '4.Doujinshi',
    '5.Harem',
    '6.Incest',
    '7.Story arc',
    '8.Anthology',
    '9.Artist',
    '10.Other'
  ],
  subFolderDelete: 'X.Deleted',
  specialFolder: '#Star', // 特殊的子文件夹,
  specialRule: [{
    mode: 1, // 0: 任一匹配 1:所有条件匹配
    artist: 'example',
    folder: 'Path to Directory' // empty or undefined means move to specialFolder, else move to a folder named this under specialFolder
  }],
  parody: [{
    name: 'example',
    filter: 'example'
  }],
  removeCharacter: [
    'teitoku', // 提督
    'producer' // 制作人
  ]
}

// 导入原生模块
const fs = require('fs')
const path = require('path')
const cp = require('child_process')

// 导入第三方模块
const logger = require('tracer').console({
  format: '{{timestamp}} <L{{line}}:{{pos}}>:\t{{message}}',
  dateformat: 'HH:MM:ss'
})
const colors = require('colors')
colors.setTheme({
  info: 'green',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
})
const readlineSync = require('readline-sync')
const async = require('async')
const JSZip = require('jszip')
const request = require('request-promise')
const sizeOf = require('image-size')
const glob = require('glob')
const mkdirp = require('mkdirp')
const emojireg = /\u{2139}|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|\u{2328}|\u{23CF}|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|\u{24C2}|[\u{25AA}-\u{25AB}]|\u{25B6}|\u{25C0}|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|\u{260E}|\u{2611}|[\u{2614}-\u{2615}]|\u{2618}|\u{261D}|\u{2620}|[\u{2622}-\u{2623}]|\u{2626}|\u{262A}|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2648}-\u{2653}]|\u{2660}|\u{2663}|\u{2666}|\u{2668}|\u{267B}|\u{267F}|[\u{2692}-\u{2697}]|\u{2699}|[\u{269B}-\u{269C}]|[\u{26A0}-\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26B0}-\u{26B1}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|\u{26C8}|\u{26CE}|\u{26CF}|\u{26D1}|[\u{26D3}-\u{26D4}]|[\u{26E9}-\u{26EA}]|[\u{26F0}-\u{26F5}]|[\u{26F7}-\u{26FA}]|\u{26FD}|\u{2702}|\u{2705}|[\u{2708}-\u{2709}]|[\u{270A}-\u{270B}]|[\u{270C}-\u{270D}]|\u{270F}|\u{2712}|\u{2714}|\u{2716}|\u{271D}|\u{2721}|\u{2728}|[\u{2733}-\u{2734}]|\u{2744}|\u{2747}|\u{274C}|\u{274E}|[\u{2753}-\u{2755}]|\u{2757}|\u{2763}|[\u{2795}-\u{2797}]|\u{27A1}|\u{27B0}|\u{27BF}|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|\u{2B50}|\u{2B55}|\u{3030}|\u{303D}|\u{3297}|\u{3299}|\u{1F004}|\u{1F0CF}|[\u{1F170}-\u{1F171}]|\u{1F17E}|\u{1F17F}|\u{1F18E}|[\u{1F191}-\u{1F19A}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F201}-\u{1F202}]|\u{1F21A}|\u{1F22F}|[\u{1F232}-\u{1F23A}]|[\u{1F250}-\u{1F251}]|[\u{1F300}-\u{1F320}]|\u{1F321}|[\u{1F324}-\u{1F32C}]|[\u{1F32D}-\u{1F32F}]|[\u{1F330}-\u{1F335}]|\u{1F336}|[\u{1F337}-\u{1F37C}]|\u{1F37D}|[\u{1F37E}-\u{1F37F}]|[\u{1F380}-\u{1F393}]|[\u{1F396}-\u{1F397}]|[\u{1F399}-\u{1F39B}]|[\u{1F39E}-\u{1F39F}]|[\u{1F3A0}-\u{1F3C4}]|\u{1F3C5}|[\u{1F3C6}-\u{1F3CA}]|[\u{1F3CB}-\u{1F3CE}]|[\u{1F3CF}-\u{1F3D3}]|[\u{1F3D4}-\u{1F3DF}]|[\u{1F3E0}-\u{1F3F0}]|[\u{1F3F3}-\u{1F3F5}]|\u{1F3F7}|[\u{1F3F8}-\u{1F3FF}]|[\u{1F400}-\u{1F43E}]|\u{1F43F}|\u{1F440}|\u{1F441}|[\u{1F442}-\u{1F4F7}]|\u{1F4F8}|[\u{1F4F9}-\u{1F4FC}]|\u{1F4FD}|\u{1F4FF}|[\u{1F500}-\u{1F53D}]|[\u{1F549}-\u{1F54A}]|[\u{1F54B}-\u{1F54E}]|[\u{1F550}-\u{1F567}]|[\u{1F56F}-\u{1F570}]|[\u{1F573}-\u{1F579}]|\u{1F57A}|\u{1F587}|[\u{1F58A}-\u{1F58D}]|\u{1F590}|[\u{1F595}-\u{1F596}]|\u{1F5A4}|\u{1F5A5}|\u{1F5A8}|[\u{1F5B1}-\u{1F5B2}]|\u{1F5BC}|[\u{1F5C2}-\u{1F5C4}]|[\u{1F5D1}-\u{1F5D3}]|[\u{1F5DC}-\u{1F5DE}]|\u{1F5E1}|\u{1F5E3}|\u{1F5E8}|\u{1F5EF}|\u{1F5F3}|\u{1F5FA}|[\u{1F5FB}-\u{1F5FF}]|\u{1F600}|[\u{1F601}-\u{1F610}]|\u{1F611}|[\u{1F612}-\u{1F614}]|\u{1F615}|\u{1F616}|\u{1F617}|\u{1F618}|\u{1F619}|\u{1F61A}|\u{1F61B}|[\u{1F61C}-\u{1F61E}]|\u{1F61F}|[\u{1F620}-\u{1F625}]|[\u{1F626}-\u{1F627}]|[\u{1F628}-\u{1F62B}]|\u{1F62C}|\u{1F62D}|[\u{1F62E}-\u{1F62F}]|[\u{1F630}-\u{1F633}]|\u{1F634}|[\u{1F635}-\u{1F640}]|[\u{1F641}-\u{1F642}]|[\u{1F643}-\u{1F644}]|[\u{1F645}-\u{1F64F}]|[\u{1F680}-\u{1F6C5}]|[\u{1F6CB}-\u{1F6CF}]|\u{1F6D0}|[\u{1F6D1}-\u{1F6D2}]|[\u{1F6E0}-\u{1F6E5}]|\u{1F6E9}|[\u{1F6EB}-\u{1F6EC}]|\u{1F6F0}|\u{1F6F3}|[\u{1F6F4}-\u{1F6F6}]|[\u{1F6F7}-\u{1F6F8}]|[\u{1F910}-\u{1F918}]|[\u{1F919}-\u{1F91E}]|\u{1F91F}|[\u{1F920}-\u{1F927}]|[\u{1F928}-\u{1F92F}]|\u{1F930}|[\u{1F931}-\u{1F932}]|[\u{1F933}-\u{1F93A}]|[\u{1F93C}-\u{1F93E}]|[\u{1F940}-\u{1F945}]|[\u{1F947}-\u{1F94B}]|\u{1F94C}|[\u{1F950}-\u{1F95E}]|[\u{1F95F}-\u{1F96B}]|[\u{1F980}-\u{1F984}]|[\u{1F985}-\u{1F991}]|[\u{1F992}-\u{1F997}]|\u{1F9C0}|[\u{1F9D0}-\u{1F9E6}]/gu
const incestTags = {
  grandmother: ['grandmother'],
  mother: ['mother', 'aunt'],
  sister: ['sister', 'cousin', 'brother'],
  daughter: ['daughter', 'niece', 'father'],
  granddaughter: ['granddaughter', 'grandfather']
}

const EHT = JSON.parse(fs.readFileSync('EHT.json', 'utf-8')).dataset

// Function
const mapSeriesSync = (coll, iteratee) => {
  return new Promise((resolve, reject) => {
    async.mapSeries(coll, iteratee, (err, result) => {
      resolve([err, result])
    })
  })
}
const moveFile = (oldpath, newpath, date = undefined) => {
  fs.writeFileSync(newpath, fs.readFileSync(oldpath))
  if (date && (date instanceof Date || !isNaN(Number(date)))) {
    fs.utimesSync(newpath, date, date)
  } else {
    let stat = fs.statSync(oldpath)
    fs.utimesSync(newpath, stat.atime, stat.mtime)
  }
  fs.unlinkSync(oldpath)
}
const unique = arr => [...(new Set(arr))]
const escape = text => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '').replace(emojireg, '')
const escape2 = text => text.replace(/[:*?"<>|]/g, '-').replace(/\.$/, '').replace(emojireg, '')
const parseInfo = text => {
  text = text.replace(/(Downloaded at|Generated by).*/g, '').replace(/([\r\n]){2,}/g, '\r\n').replace(/[\r\n]+$/g, '').replace(/\r\n> /g, '\r\n')
  let a = text.split(/\r\n/)
  let b = {}
  let info = {
    title: a[0],
    jTitle: (a[1].match(/^http/)) ? a[0] : a[1],
    page: []
  }
  let tags = ['language', 'reclass', 'artist', 'group', 'parody', 'character', 'female', 'male', 'misc']
  for (let i of a) {
    if (i.match(/^http/)) {
      info.web = i
      break
    }
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].match(/^Page \d+:/)) {
      let re = a[i].match(/^Page (\d+):\s+(.*)$/)
      info.page[re[1] * 1] = {
        url: re[2],
        id: re[2].split('/')[4]
      }
      a.splice(i, 1)
      i--
    } else if (a[i].match(/^Image \d+:/)) {
      let re = a[i].match(/^Image (\d+):\s+(.*)$/)
      info.page[re[1] * 1].name = re[2]
      a.splice(i, 1)
      i--
    }
  }
  for (let i of a) {
    let t = i.split(': ')
    if (t.length > 1) {
      b[t[0]] = tags.includes(t[0]) ? t[1].split(', ').sort() : t[1]
    }
  }

  Object.assign(info, b)
  if ('parody' in b) info.series = b.parody
  if (a.indexOf('Uploader Comment:') >= 0) info.summary = a.slice(a.indexOf('Uploader Comment:')).join('\r\n')
  info.genre = b.Category.match('FREE HENTAI') ? b.Category.match('FREE HENTAI (.*?) GALLERY')[1] : b.Category
  info.lang = b.Language.match('Chinese') ? 'zh' : b.Language.match('English') ? 'en' : 'ja'
  info.bw = !('misc' in b && b.misc.indexOf('full color') >= 0)
  if ('Rating' in b) info.rating = b.Rating
  info.tags = [].concat(b.male, b.female, b.misc).filter(i => i).sort()
  return info
}
const combineText = (arr, textOnly = true) => {
  return arr instanceof Array ? arr.map(i => {
    if (i.type === 0) {
      return i.text
    } else if (!textOnly && i.type === 2) {
      return `"url("${i.src.replace(/http.?:/g, '')}")"`
    } else {
      return null
    }
  }).filter(i => i).join('\\A') : ''
}
const findData = (main, sub, textOnly = true) => {
  let data = EHT.filter(i => i.name === main)
  if (data.length === 0 || data[0].tags.length === 0) return {}
  if (sub === undefined) {
    return {
      name: main,
      cname: combineText(data[0].cname, textOnly),
      info: combineText(data[0].info, textOnly)
    }
  }
  let data1 = data[0].tags.filter(i => i.name === sub.replace(/_/g, ' '))
  if (data1.length === 0) {
    if (sub.match(' \\| ')) {
      let arr = sub.split(' | ').map(i => i.replace(/_/g, ' '))
      data1 = data[0].tags.filter(i => arr.includes(i.name))
    }
  }
  return data1.length ? {
    name: main === 'misc' ? sub : main + ':' + sub,
    cname: combineText(data1[0].cname, textOnly),
    info: combineText(data1[0].info, textOnly)
  } : {}
}
const sortFileBySpecialRule = info => {
  let rule = _.specialRule
  for (let i = 0; i < rule.length; i++) {
    let folder = rule[i].folder || ''
    let mode = rule[i].mode || 0
    let filter
    if (mode === 0) {
      filter = false
      for (let j in rule[i]) {
        if (['mode', 'folder'].includes(j)) continue
        if (typeof info[j] === 'undefined') break
        let _rule = rule[i][j]
        let _info = [].concat(info[j])
        if (typeof _rule === 'string') {
          if (_info.some(k => k.match('|'))) {
            let _info2 = []
            _info.forEach(k => {
              _info2 = _info2.concat(k.split('|'))
            })
            _info2 = _info2.map(k => k.trim())
            if (_info2.includes(_rule)) {
              filter = true
              break
            }
          }
          if (_info.includes(_rule)) {
            filter = true
            break
          }
        } else if (_rule instanceof RegExp) {
          if (_rule.exec(_info.join(', '))) {
            filter = true
            break
          }
        } else if (_rule instanceof Function) {
          if (_rule(_info)) {
            filter = true
            break
          }
        }
      }
    } else if (mode === 1) {
      filter = true
      for (let j in rule[i]) {
        if (['mode', 'folder'].includes(j)) continue
        if (typeof info[j] === 'undefined') {
          filter = false
          break
        }
        let _rule = rule[i][j]
        let _info = [].concat(info[j])
        if (typeof _rule === 'string') {
          if (_info.some(k => k.match('|'))) {
            let _info2 = []
            _info.forEach(k => {
              _info2 = _info2.concat(k.split('|'))
            })
            _info2 = _info2.map(k => k.trim())
            if (!_info2.includes(_rule)) {
              filter = false
              break
            }
            continue
          }
          if (!_info.includes(_rule)) {
            filter = false
            break
          }
        } else if (_rule instanceof RegExp) {
          if (!_rule.exec(_info.join(', '))) {
            filter = false
            break
          }
        } else if (_rule instanceof Function) {
          if (!_rule(_info)) {
            filter = false
            break
          }
        }
      }
    }
    if (filter) return path.resolve(_.libraryFolder, _.specialFolder, escape2(folder))
  }
  return false
}
const sortFile = info => {
  if (sortFileBySpecialRule(info)) {
    return sortFileBySpecialRule(info)
  } else if (info.tags.includes('multi-work series')) {
    return _.subFolder[0]
  } else if (info.genre.match(/^COSPLAY$/i)) {
    return _.subFolder[1]
  } else if (info.genre.match(/^(IMAGESET|IMAGE SET)$/i) || (info.tags.includes('artbook'))) {
    return _.subFolder[2]
  } else if (info.genre.match(/^(GAMECG|GAME CG SET|ARTISTCG|ARTIST CG SET)$/i)) {
    return _.subFolder[3]
  } else if (info.genre.match(/^DOUJINSHI$/i) && info.parody) {
    let parody = info.parody.map(i => {
      let j
      for (j = 0; j < _.parody.length; j++) {
        if (i.match(_.parody[j].filter)) break
      }
      return j < _.parody.length ? _.parody[j].name : i
    })
    parody = unique(parody)
    if (parody.length > 1) {
      return _.subFolder[4] + '/###Various'
    } else {
      let value = parody[0]
      value = escape(findData('parody', value).cname || value)
      if (info.character) {
        let character = info.character.filter(i => !(_.removeCharacter.includes(i)))
        let value2 = character.length > 1 ? '###Various' : escape(findData('character', character[0]).cname || character[0])
        return _.subFolder[4] + '/' + value + '/' + value2
      } else {
        return _.subFolder[4] + '/' + value
      }
    }
  } else if ('female' in info && info.female.includes('harem')) {
    return _.subFolder[5]
  } else if (info.tags.includes('incest') || info.tags.includes('inseki')) {
    let tags = []
    for (let i in incestTags) {
      if (info.tags.some(tag => incestTags[i].includes(tag))) tags.push(i)
    }
    return _.subFolder[6] + (tags.length ? '/' + tags.sort().join(', ') : '')
  } else if (info.tags.includes('story arc')) {
    return _.subFolder[7]
  } else if ((info.tags.includes('anthology')) || (info.artist && info.artist.length > 2)) {
    return _.subFolder[8]
  } else if (info.artist || info.group) {
    let value = [].concat(info.artist, info.group).filter(i => i)[0]
    value = findData('artist', value).cname || findData('group', value).cname || value
    value = escape(value)
    return _.subFolder[9] + '/' + value
  } else {
    return _.subFolder[10]
  }
}
const moveByInfo = (info, target) => {
  info.file = target
  let targetFolderNew = sortFile(info)
  targetFolderNew = path.resolve(_.libraryFolder, targetFolderNew)
  if (!fs.existsSync(targetFolderNew)) mkdirp.sync(targetFolderNew)
  let nameNew = escape(_.jTitle ? info.jTitle : info.title)
  let targetNew = path.resolve(targetFolderNew, nameNew + '.cbz')
  if (targetNew === target) {
    let targetShort = path.relative(_.comicFolder, target)
    logger.log('文件未移动: ', colors.info(targetShort))
  } else {
    let targetShort = path.relative(_.libraryFolder, targetFolderNew)
    let atime
    if (_.cover) {
      let targetCover = path.resolve(_.comicFolder, path.parse(target).name + '.jpg')
      if (fs.existsSync(targetCover)) {
        atime = fs.statSync(targetCover).atime
        moveFile(targetCover, path.resolve(targetFolderNew, nameNew + '.jpg'))
      }
    }
    moveFile(target, targetNew, atime)
    logger.log(' ==> ', colors.info(targetShort))
  }
}

// Main
if (fs.existsSync('config.js')) Object.assign(_, require('./config'))

const main = async () => {
  // 读取列表
  let lst = glob.sync((_.globRecursive ? '**/' : '') + '*.@(zip|cbz)', {
    cwd: _.comicFolder.replace(/\\/g, '/')
  })
  if (lst.length) logger.log('当前任务数: ', colors.info(lst.length))

  // 开始处理
  let result = await mapSeriesSync(lst, async i => {
    // 处理路径
    let target = path.resolve(_.comicFolder, i)
    let targetDir = path.parse(target).dir
    logger.log(colors.info(i))

    // 读取数据
    let targetData = fs.readFileSync(target)
    let jszip = new JSZip()
    let zip
    try {
      zip = await jszip.loadAsync(targetData)
    } catch (error) {
      if (error.message === 'End of data reached (data length = 0, asked index = 4). Corrupted zip ?') {
        moveFile(target, path.resolve(_.libraryFolder, _.subFolderDelete, path.parse(target).base))
        logger.log(' ==> ', _.subFolderDelete)
      } else {
        logger.error(error)
      }

      return
    }

    // 查看列表
    let fileList = Object.keys(zip.files)

    // 检测有无info.txt
    if (fileList.filter(item => item.match(/(^|\/)info\.txt$/)).length === 0) {
      logger.warn(colors.warn('压缩档内不存在info.txt: '), target)
      return i
    }

    // 读取info.txt
    let infoFile = fileList.find(item => item.match(/(^|\/)info\.txt$/))
    let data = await zip.files[infoFile].async('text')
    let info = parseInfo(data)

    // 检测图片及大小
    if ((_.delIntroPic || _.checkImageSize) && info.web.match(/e(-|x)hentai.org/)) {
      let imgs = fileList.filter(item => item.match(/\.(jpg|png|gif)$/))
      for (let j = 0; j < imgs.length; j++) {
        let deleted = false
        if (_.delIntroPic) {
          let name = path.parse(imgs[j]).base
          let filter = info.page.filter(p => p.name === name)
          if (filter.length && _.introPic.includes(filter[0].id)) {
            logger.log(colors.error('Deleted: '), colors.info(imgs[j]))
            cp.execSync(`${_['7z']} d -tzip -mx9 "${target}" "${imgs[j]}"`, {
              cwd: targetDir
            })
            deleted = true
          }
        }
        if (_.checkImageSize && !info.tags.includes('tankoubon') && !info.tags.includes('anthology') && !deleted) {
          let img = await zip.files[imgs[j]].async('nodebuffer')
          let size = sizeOf(img)
          let rate = size.width / size.height
          if (rate > _.rate && size.width === _.size) {
            logger.log('Size:', colors.info(size.width, '*', size.height), '  Pages:', colors.info(Object.keys(info.page).length), '  Genre:', colors.info(info.genre))
            logger.log('Page:', colors.warn(imgs[j]))
            let web = info.web.replace('http:', 'https:').replace(/(g.|)e-hentai/, 'exhentai').replace(/#\d+$/, '') + '#2'
            if (readlineSync.keyInYNStrict('Open ' + colors.info(web))) {
              cp.execSync(`start "" "${web}"`)
              if (readlineSync.keyInYNStrict('Delete ' + colors.info(target))) fs.unlinkSync(target)
              return
            } else {
              if (readlineSync.keyInYNStrict('Sort this file: ' + colors.info(target))) {
                break
              } else {
                return
              }
            }
          }
        }
      }
    }

    // 解压封面
    if (_.cover) {
      let img = data.match(/Image\s+1:\s+(.*)/)
      let firstImg
      if (img && fileList.find(item => item.match(new RegExp(img[1])))) {
        firstImg = fileList.find(item => item.match(new RegExp(img[1])))
      } else {
        firstImg = fileList.find(item => item.match(/\.(jpg|png|gif)$/))
      }
      let u8a = await zip.files[firstImg].async('uint8array')
      let targetCover = path.resolve(_.comicFolder, path.parse(target).name + '.jpg')
      fs.writeFileSync(targetCover, u8a)
      // 设置最后修改时间
      let date = zip.files[firstImg].date
      fs.utimesSync(targetCover, date, date)
    }

    // 如果info不存在tags(EHD v1.23之前下载的)
    if (!data.match(/Tags:/) && info.web.match(/e(-|x)hentai.org/)) {
      let url = info.web.replace(/^.*hentai.org/, 'https://e-hentai.org')
      let pram = url.split('/')
      let res = await request('https://e-hentai.org/api.php', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36'
        },
        timeout: 30 * 1000,
        resolveWithFullResponse: true,
        proxy: _.proxy,
        body: JSON.stringify({
          method: 'gdata',
          gidlist: [[pram[4] * 1, pram[5]]],
          namespace: 1
        })
      })
      let json = JSON.parse(res.body)
      let infoStr = '\r\nTags:\r\n'
      let tagsList = json.gmetadata[0].tags
      let tags = {}
      tagsList.forEach(i => {
        let a = i.split(':')
        let key = a.length === 2 ? a[0] : 'misc'
        if (!tags[key]) tags[key] = []
        tags[key].push(a[1] || a[0])
      })
      for (let i in tags) {
        infoStr += `> ${i}: ${tags[i].join(', ')}\r\n`
      }
      data += '\r\n' + infoStr

      let infoFileDir = path.resolve(targetDir, path.parse(infoFile).dir)
      mkdirp.sync(infoFileDir)
      let infoFilePath = path.resolve(infoFileDir, 'info.txt')
      fs.writeFileSync(infoFilePath, data)

      cp.execSync(`${_['7z']} a -tzip -mx9 "${target}" "${infoFile}"`, {
        cwd: targetDir
      })

      fs.unlinkSync(infoFilePath)
      fs.rmdirSync(infoFileDir)
      return i
    }

    // 整理
    moveByInfo(info, target)
    return i
  })
  if (result[0]) logger.error(result[0])
  if (lst.length) logger.log(colors.info('任务完成'))
}

main().then(() => {
  //
}, (err) => {
  logger.error(err)
})
