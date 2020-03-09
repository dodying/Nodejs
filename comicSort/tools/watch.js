// ==Headers==
// @Name:               watch
// @Description:        监控libraryFolder变化
// @Version:            1.0.189
// @Author:             dodying
// @Modified:           2020-3-6 14:02:03
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            g2-bracket-parser,readline-sync
// ==/Headers==

// 设置
const _ = require('./../config')
const nameMatch = [
  /^(chinese|cn|中文|中国语|中国語|中国|CHINES|中国翻訳|中文化)$/i,
  /汉化|漢化|翻譯|机翻|工坊|掃圖|扫图|同好会|CE家族社|嵌字|天鵝之戀/
]

// 导入原生模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const readlineSync = require('readline-sync')
const brackets = require('g2-bracket-parser')

const walk = require('./../../_lib/walk')

// Function
let nameParsed = name => {
  name = path.parse(name).name
  let parsed = brackets(name, {
    brackets: {
      '[': { 'start': '[', 'end': ']', 'length': 1 },
      '{': { 'start': '{', 'end': '}', 'length': 1 },
      '(': { 'start': '(', 'end': ')', 'length': 1 },
      '"': { 'start': '"', 'end': '"', 'length': 1 },
      '\'': { 'start': '\'', 'end': '\'', 'length': 1 },
      '<': { 'start': '<', 'end': '>', 'length': 1 },
      '（': { 'start': '（', 'end': '）', 'length': 1 },
      '【': { 'start': '【', 'end': '】', 'length': 1 }
    },
    ignoreMissMatch: true
  })
  let length
  for (let content of parsed) {
    if (nameMatch.some(i => content.match.content.match(i))) {
      length = content.match.bracketStart
      break
    }
  }
  if (length) name = name.substr(0, length)
  name = name.trim()
  return name
}

// Main

let database
let databaseFile = path.resolve(_.libraryFolder, 'database.json')
const main = async () => {
  if (fs.existsSync(databaseFile)) {
    database = fs.readFileSync(databaseFile)
    try {
      database = JSON.parse(database)
    } catch (error) {
      database = null
    }
  }
  if (!database) {
    database = {}
    let files = walk(_.libraryFolder, {
      ignoreDir: path.basename(_.subFolderTag),
      ignoreFile: /\.(jpg|png|url)$/i,
      fullpath: false,
      nodir: true
    })
    for (let file of files) {
      let name = nameParsed(file)
      if (name in database) {
        console.log({ name, file })
        readlineSync.keyInPause()
      }
      database[name] = { file: file, link: [] }
    }
    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2))
  }

  let databaseNew = {}
  Object.keys(database).sort().forEach(i => {
    databaseNew[i] = {
      file: database[i].file,
      link: database[i].link.filter((item, index, array) => array.indexOf(item) === index)
    }
  })
  database = databaseNew
  fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2))

  console.log('Ready')

  fs.watch(_.libraryFolder, { recursive: true }, (event, filename) => {
    if (typeof filename !== 'string') return
    let filepath = path.join(_.libraryFolder, filename)
    let name = nameParsed(filename)
    if (!fs.existsSync(filepath)) {
      if (name in database) {
        if (filepath.match(_.subFolderTag)) {

        } else {
          delete database[name]
        }
      }
    } else if (!['.cbz', '.zip'].includes(path.parse(filename).ext)) {
      return
    } else {
      console.log({ event, name, filename })
      if (!(name in database)) database[name] = { file: null, link: [] }
      if (filepath.match(_.subFolderTag)) {
        if (!database[name].link.includes(filename)) database[name].link.push(filename)
      } else {
        database[name].file = filename
      }
    }

    fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2))
  })
}

main().then(async () => {
  fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2))
  //
}, async err => {
  fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2))
  console.error(err)
  process.exit()
})
