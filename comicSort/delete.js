// ==Headers==
// @Name:               delete
// @Description:        删除漫画
// @Version:            1.0.43
// @Author:             dodying
// @Date:               2019-2-16 16:36:31
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            g2-bracket-parser,readline-sync
// ==/Headers==

// 设置
const _ = require('./config')
let libraryFolder = _.libraryFolder
const extensions = ['.cbz', '.jpg', '.zip', '.png']
const nameMatch = [
  /^(chinese|cn|中文|中国语|中国語|中国|CHINES|中国翻訳|中文化)$/i,
  /汉化|漢化|翻譯|机翻|工坊|掃圖|扫图|同好会|CE家族社|嵌字|天鵝之戀/
]

// 导入原生模块
const fs = require('fs')
const path = require('path')

let deletedPath = path.join(libraryFolder, _.subFolderDelete)
let database = path.join(libraryFolder, 'database.json')

// 导入第三方模块
const readlineSync = require('readline-sync')
const brackets = require('g2-bracket-parser')

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
if (fs.existsSync(database)) {
  try {
    database = fs.readFileSync(database, 'utf-8')
    database = JSON.parse(database)
  } catch (error) {
    database = {}
  }
} else {
  database = {}
}

process['argv'].splice(2).filter(i => extensions.includes(path.parse(i).ext)).forEach(i => {
  let p = path.resolve(process.cwd(), i)
  if (fs.existsSync(p)) {
    if (!fs.existsSync(deletedPath)) fs.mkdirSync(deletedPath)

    if (p.match('ComicLibrary') || readlineSync.keyInYNStrict('Continue to delete?')) {
      fs.unlinkSync(p)

      let { dir, name } = path.parse(p)
      let cover = path.join(dir, name + '.jpg')
      if (fs.existsSync(cover)) fs.unlinkSync(cover)

      let nameShort = nameParsed(p)
      if (nameShort in database) {
        database[nameShort].link.forEach(i => {
          let _path = path.join(libraryFolder, i)
          fs.unlinkSync(_path)

          let { dir, name } = path.parse(_path)
          let cover = path.join(dir, name + '.jpg')
          if (fs.existsSync(cover)) fs.unlinkSync(cover)
        })
      }

      try {
        fs.writeFileSync(path.resolve(deletedPath, path.parse(p).base), '')
      } catch (error) {
        console.error(error)
      }
      console.log('File Deleted:\t', p)
    }
  } else {
    console.error('NOT find:\t', p)
  }
})
