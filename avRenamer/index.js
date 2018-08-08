#!/usr/bin/env node

// ==Headers==
// @Name:               avRenamer
// @Description:        将文件夹下的不可描述视频按规则分类并命名
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2017-12-02 23:26:18
// @Last Modified by:   dodying
// @Last Modified time: 2018-03-14 16:21:10
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// ==/Headers==

// 设置
const CONFIG = require('./config')

// 导入原生模块
const fs = require('fs')
const path = require('path')
const Url = require('url')

// 导入第三方模块
const readlineSync = require('readline-sync')
const request = require('request-promise')
const Agent = require('socks5-http-client/lib/Agent')
const Agent2 = require('socks5-https-client/lib/Agent')
const cheerio = require('cheerio')
const async = require('async')
const Jimp = require('jimp')
const sizeOf = require('image-size')
const logger = require('tracer').console({
  format: '{{timestamp}} <{{file}}:L{{line}}:{{pos}}>: {{message}}',
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
const argv = require('optimist').argv

//
if (argv._[0] || CONFIG.useProfile) Object.assign(CONFIG, CONFIG.profile[argv._[0] || CONFIG.useProfile])
if (Object.keys(argv).length > 2) Object.assign(CONFIG, argv)
const data = {}
CONFIG.folderNew = path.resolve(CONFIG.folder, CONFIG.folderNew)
if (!fs.existsSync(CONFIG.folderNew)) fs.mkdirSync(CONFIG.folderNew)
const lib = {
  // 'javlib': {
  //   search: 'http://www.javlibrary.com/cn/vl_searchbyid.php?keyword={q}',
  //   infoPageCheck: '#video_id',
  //   result: '.video',
  //   cover: '#video_jacket_img',
  //   data: {
  //     title: '.post-title',
  //     num: '#video_id .text',
  //     premiered: '#video_date .text',
  //     runtime: '#video_length .text',
  //     director: '#video_director .text',
  //     studio: '#video_maker .text',
  //     // label: '#video_label .text',
  //     rating: $ => {
  //       let a = $('#video_review .text>.score')
  //       return a !== null && a.text().match(/[\d.]+/) ? a.text().match(/[\d.]+/)[0] : 0
  //     },
  //     genre: '#video_genres .text>.genre',
  //     actor: '#video_cast .text>.cast a'
  //   }
  // },
  'javbus': {
    search: 'https://www.javbus.com/search/{q}',
    infoPageCheck: '.movie',
    result: '.item',
    cover: '.bigImage img',
    data: {
      title: 'h3',
      num: '.info>p:contains("識別碼")>span:nth-child(2)',
      premiered: $ => $('.info>p:contains("發行日期")').text().match(/[\d-]+/)[0],
      runtime: $ => $('.info>p:contains("長度")').text().match(/\d+/)[0],
      director: '.info>p:contains("導演")>a:nth-child(2)',
      studio: '.info>p:contains("製作商")>a:nth-child(2)',
      // label: '.info>p:contains("發行商")>a:nth-child(2)',
      genre: '.info>p:contains("類別")+p>.genre',
      actor: '.star-box'
    }
  }
}[CONFIG.useLib]

const replaceWithDict = (text, a, b = []) => {
  for (let i = 0; i < a.length; i++) {
    text = text.replace(new RegExp(a[i], 'gi'), b[i] || '').trim()
  }
  return text
}

/* eslint-disable no-extend-native */
String.prototype.replaceWithDict = function (a, b = []) {
  return replaceWithDict(this.toString(), a, b)
}

const req = options => {
  if (typeof options === 'string') options = {url: options}
  options = Object.assign({
    method: 'GET',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
      'User-Agent': CONFIG.userAgent,
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive'
    },
    timeout: CONFIG.timeout * 1000,
    resolveWithFullResponse: true,
    simple: false
  }, options)
  if (CONFIG.proxySocks) {
    options.agentClass = options.url.match(/^http:/) ? Agent : Agent2
    options.agentOptions = {
      socksHost: CONFIG.proxySocksHost || 'localhost',
      socksPort: CONFIG.proxySocksPort
    }
    if (CONFIG.proxySocksUsername && CONFIG.proxySocksPassword) {
      options.agentOptions.socksUsername = CONFIG.proxySocksUsername
      options.agentOptions.socksPassword = CONFIG.proxySocksPassword
    }
  } else if (CONFIG.proxyHTTP) {
    options.proxy = CONFIG.proxyHTTP
  }
  return request(options)
}

const getNum = text => { // 尝试修改名称
  text = text.replace(/mp4$/i, '')
  text = text.match(/[^h_0-9].*/)[0]
  text = text.replace(/^tk|tk$/g, '').replace(/00([0-9]{3})/g, '$1').replace(/([a-z]+)([0-9]+)/gi, '$1-$2').replace(/([a-z]+-[0-9]+)(R|C|)/i, '$1')
  text = text.toUpperCase()
  return text
}

const search = async i => { // 搜索番号
  let keyword = i.replace(/\.\w{2,4}$/, '').replace(/^\[.*?\]|\[.*?\]$/g, '')
  let url = lib.search.replace('{q}', keyword)
  let res = await req(url)
  let $ = cheerio.load(res.body)
  if ($(lib.infoPageCheck).length) {
    return res
  } else if ($(lib.result).filter(`:contains("${keyword}")`).length) {
    let url1 = $(lib.result).filter(`:contains("${keyword}")`).find('a').attr('href')
    url1 = Url.resolve(url, url1)
    res = await req(url1)
    return res
  } else {
    logger.warn(`Not find the movie: ${colors.warn(keyword)}`)
    return new Error(`Not find the movie: ${keyword}`)
  }
}

const getInfo = (i, html) => { // 生成信息
  const $ = cheerio.load(html)
  let info = Object.assign({}, lib.data)
  for (let i in info) {
    if (typeof info[i] === 'string') {
      if ($(info[i]).length === 0) {
        delete info[i]
      } else {
        info[i] = $(info[i]).length === 1 ? $(info[i]).text().trim() : $(info[i]).map((i, _this) => $(_this).text()).get().sort()
      }
    } else if (typeof info[i] === 'function') {
      info[i] = info[i]($)
    }
  }
  info.title = info.title.replace(info.num, '').trim()
  for (let i in info) {
    // let text
    if (typeof info[i] === 'string') {
      info[i] = info[i].replaceWithDict(CONFIG.strRemove).replaceWithDict(CONFIG.strReplace[0], CONFIG.strReplace[1])
    } else if (typeof info[i] === 'object' && 'length' in info[i]) {
      for (let j = 0; j < info[i].length; j++) {
        if (typeof info[i][j] === 'string') { info[i][j] = info[i][j].replaceWithDict(CONFIG.strRemove).replaceWithDict(CONFIG.strReplace[0], CONFIG.strReplace[1]) }
      }
    }
  }
  info.cover = $(lib.cover).attr('src')
  Object.assign(data[i], info)
}

const rename = i => { // 重命名
  let result
  let re = /{(.*?)}/g
  let name = CONFIG.name
  let ext = i.match(/\.\w{2,4}$/)[0]
  let t = i.replace(ext, '')
  while ((result = re.exec(name)) != null) {
    name = name.replace(new RegExp(result[0], 'gi'), data[i][result[1]] || CONFIG.emptyStr)
  };
  if (name.match(/\$1/)) name = name.replace(/\$1/g, t.match(/^\[.*?\]/) ? t.match(/^\[.*?\]/)[0] : '')
  if (name.match(/\$2/)) {
    let a = t.match(/\[.*?\]/g)
    name = name.replace(/\$2/g, t.match(/\[.*?\]$/) ? a = a[a.length - 1] : '')
  }
  name = name.replace(/[\\/:*?"<>|]/g, '-')
  data[i].name = name
  let folderWith = data[i][CONFIG.folderWith]
  let folder = typeof folderWith === 'string' ? folderWith : typeof folderWith === 'undefined' ? CONFIG.emptyStr : folderWith.join(',')
  let targetPath = path.resolve(CONFIG.folderNew, CONFIG.folderWith ? folder : '').replace(/[*?"<>|]/g, '-')
  let target = path.resolve(targetPath, name + ext)
  let targetOld = path.resolve(CONFIG.folder, i)
  data[i].path = targetPath
  if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath)
  if (!fs.existsSync(target)) fs.renameSync(targetOld, target)
}

const nfoFile = i => { // 生成NFO文件
  let d = data[i]
  let t = ''
  let target = path.resolve(d.path, d.name + '.nfo')
  if (fs.existsSync(target)) return
  t += `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n`
  t += `<movie>\r\n`
  t += `  <title>${d.num} ${d.title}</title>\r\n`
  t += `  <originaltitle>${d.title}</originaltitle>\r\n`
  t += `  <sorttitle>${d.num}</sorttitle>\r\n`
  if (d.rating) t += `  <rating>${d.rating}</rating>\r\n`
  if (d.premiered.match(/\d{4}/)) t += `  <year>${d.premiered.match(/\d{4}/)[0]}</year>\r\n`
  t += `  <runtime>${d.runtime}</runtime>\r\n`
  t += `  <thumb>${d.cover}</thumb>\r\n`
  t += `  <premiered>${d.premiered}</premiered>\r\n`
  t += `  <studio>${d.studio}</studio>\r\n`
  if (d.director) t += `  <director>${d.director}</director>\r\n`
  if (d.genre) {
    [].concat(d.genre).forEach(i => {
      t += `  <genre>${i}</genre>\r\n`
      t += `  <tag>${i}</tag>\r\n`
    })
  }
  if (d.actor) {
    [].concat(d.actor).forEach(i => {
      t += `  <actor>\r\n`
      t += `    <name>${i}</name>\r\n`
      t += `    <role>${i}</role>\r\n`
      t += `  </actor>\r\n`
    })
  }
  t += `  <uniqueid default="true" type="unknown">${d.num}</uniqueid>\r\n`
  t += `</movie>`
  fs.writeFileSync(target, t)
}

const downloadImage = async i => { // 下载图片
  let url = Url.resolve(data[i].url, data[i].cover)
  let target = path.resolve(data[i].path, data[i].name + '.jpg')
  let targetBanner = CONFIG.image === 2 ? target.replace('.jpg', '-banner.jpg') : target
  let res = await req({
    url: url,
    encoding: null
  })

  fs.writeFileSync(targetBanner, res.body)
  if (CONFIG.image === 2) {
    let size = sizeOf(targetBanner)
    let image = await Jimp.read(targetBanner)
    await image.crop(size.width * 0.475, 0, size.width * 0.525, size.height).write(target)
  }
}

let lst = fs.readdirSync(CONFIG.folder)
lst = lst.filter(i => fs.statSync(path.resolve(CONFIG.folder, i)).isFile())
if (CONFIG.rename) {
  lst = lst.map(i => {
    let ext = i.match(/\.\w{2,4}$/)[0]
    let t = i.replace(/\.\w{2,4}$/, '').replace(/^\[.*?\]|\[.*?\]$/g, '').toUpperCase() + ext
    let tryNum = getNum(t.replace(/\.\w{2,4}$/, '')) + ext
    if (t === tryNum) return i
    logger.log(`Rename ${colors.info(i)} ==> ${colors.info(tryNum)} ? or ${colors.info('put in')} ${colors.warn('(without Extension)')}`)
    let input = readlineSync.question()
    tryNum = input ? input + ext : tryNum
    if (i !== tryNum) {
      let target = path.resolve(CONFIG.folder, tryNum)
      let targetOld = path.resolve(CONFIG.folder, i)
      if (!fs.existsSync(target)) {
        fs.renameSync(targetOld, target)
        return tryNum
      }
    }
    return i
  })
}
for (let i = 0; i < lst.length; i++) {
  data[lst[i]] = {}
}
logger.log(`Work list: ${colors.info(lst.join(', '))}`)

async.mapSeries(lst, async i => {
  logger.log(colors.info(`Start Search: ${i}`))
  let res = await search(i.toUpperCase())
  if (res instanceof Error) {
    return i
    // throw res
  } else {
    data[i].url = res.request.href
    getInfo(i, res.body)
    return i
  }
}, (err, results) => {
  if (err) {
    console.error({
      error: err
    })
    return
  }
  logger.log(colors.info('All info request completed.'))
  async.mapSeries(lst, async i => {
    logger.log(colors.info(`Deal with ${data[i].num || i} Info: ${JSON.stringify(data[i])}`))
    if (data[i].num !== undefined) {
      rename(i)
      if (CONFIG.nfo) nfoFile(i)
      if (CONFIG.image) {
        await downloadImage(i)
        return i
      }
    }
  }, (err, results) => {
    if (err) {
      console.error({
        error: err
      })
      return
    }
    logger.log(colors.info('All task completed.'))
    process.exit()
  })
})
