// ==Headers==
// @Name:               Docsets2Html
// @Description:        将Dash的Docsets文件夹转换为Html
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-08-06 22:12:51
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// ==/Headers==

// 导入原生模块
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// 导入第三方模块
const SQL = require('sql.js')
const mkdirp = require('mkdirp')
const rmdir = require('rimraf')

// Function

// Main
if (!fs.existsSync('docsets')) fs.mkdirSync('docsets')
let database = fs.existsSync('data.json') ? JSON.parse(fs.readFileSync('data.json')) : {}

let init = async () => {
  let ls = fs.readdirSync(process.cwd()).filter(i => i.match(/\.docset$/) && fs.statSync(i).isDirectory())
  console.log(ls)
  for (let i of ls) {
    let infoPath = `${i}/Contents/Info.plist`
    if (!fs.existsSync(infoPath)) continue

    let infoContent = fs.readFileSync(infoPath, 'utf8')
    let apiName = infoContent.match(/<key>CFBundleName<\/key>/)
    infoContent = infoContent.substr(apiName.index)
    apiName = infoContent.match(/<string>(.*?)<\/string>/)[1]

    let searchPath = `${i}/Contents/Resources/docSet.dsidx`
    let searchDb = new SQL.Database(fs.readFileSync(searchPath))
    let searchIndex = searchDb.exec('SELECT * FROM searchIndex;')[0].values
    database[apiName] = searchIndex.map(item => item.splice(1))

    if (!fs.existsSync(`docsets/${apiName}`)) fs.mkdirSync(`docsets/${apiName}`)
    if (fs.existsSync(`${i}/icon.png`)) fs.writeFileSync(`docsets/${apiName}/icon.png`, fs.readFileSync(`${i}/icon.png`))
    if (fs.existsSync(`${i}/icon@2x.png`)) fs.writeFileSync(`docsets/${apiName}/icon@2x.png`, fs.readFileSync(`${i}/icon@2x.png`))

    let resourcesPath = i + '/Contents/Resources/Resources.db'
    let resourcesDb = new SQL.Database(fs.readFileSync(resourcesPath))
    let filepaths = resourcesDb.exec('SELECT * FROM FilePaths;')[0].values
    let files = resourcesDb.exec('SELECT * FROM Files;')[0].values
    for (let item of filepaths) {
      let itemPath = path.resolve(process.cwd(), 'docsets', apiName, item[1])
      let itemPathDir = path.parse(itemPath).dir
      if (!fs.existsSync(itemPathDir)) mkdirp.sync(itemPathDir)
      let itemData = files.filter(j => j[0] === item[0])[0][1]
      if (itemData && itemData instanceof Uint8Array) {
        try {
          fs.writeFileSync(itemPath, zlib.unzipSync(itemData))
        } catch (error) {
          fs.writeFileSync(itemPath, itemData)
        }
      }
    }

    rmdir.sync(i)
  }
}

init().then(() => {
  fs.writeFileSync('data.json', JSON.stringify(database))
  fs.writeFileSync('data.js', 'window.data=' + JSON.stringify(database))
}, (err) => {
  fs.writeFileSync('data.json', JSON.stringify(database))
  fs.writeFileSync('data.js', 'window.data=' + JSON.stringify(database))
  console.error(err)
  process.exit(err)
})
