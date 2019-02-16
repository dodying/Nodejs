// ==Headers==
// @Name:               Docsets2Html
// @Description:        将Dash的Docsets文件夹转换为Html
// @Version:            1.0.4
// @Author:             dodying
// @Date:               2019-2-12 10:40:49
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra,sql.js
// ==/Headers==

// 导入原生模块
const path = require('path')
const zlib = require('zlib')

// 导入第三方模块
const SQL = require('sql.js')
const fse = require('fs-extra')

// Function

// Main
if (!fse.existsSync('docsets')) fse.mkdirSync('docsets')
let database = fse.existsSync('data.json') ? JSON.parse(fse.readFileSync('data.json')) : {}

let init = async () => {
  let ls = fse.readdirSync(process.cwd()).filter(i => i.match(/\.docset$/) && fse.statSync(i).isDirectory())
  console.log(ls)
  for (let i of ls) {
    let infoPath = `${i}/Contents/Info.plist`
    if (!fse.existsSync(infoPath)) continue

    let infoContent = fse.readFileSync(infoPath, 'utf8')
    let apiName = infoContent.match(/<key>CFBundleName<\/key>/)
    infoContent = infoContent.substr(apiName.index)
    apiName = infoContent.match(/<string>(.*?)<\/string>/)[1]

    let searchPath = `${i}/Contents/Resources/docSet.dsidx`
    let searchDb = new SQL.Database(fse.readFileSync(searchPath))
    let searchIndex = searchDb.exec('SELECT * FROM searchIndex;')[0].values
    database[apiName] = searchIndex.map(item => item.splice(1))

    if (!fse.existsSync(`docsets/${apiName}`)) fse.mkdirSync(`docsets/${apiName}`)
    if (fse.existsSync(`${i}/icon.png`)) fse.writeFileSync(`docsets/${apiName}/icon.png`, fse.readFileSync(`${i}/icon.png`))
    if (fse.existsSync(`${i}/icon@2x.png`)) fse.writeFileSync(`docsets/${apiName}/icon@2x.png`, fse.readFileSync(`${i}/icon@2x.png`))

    let resourcesPath = i + '/Contents/Resources/Resources.db'
    let resourcesDb = new SQL.Database(fse.readFileSync(resourcesPath))
    let filepaths = resourcesDb.exec('SELECT * FROM FilePaths;')[0].values
    let files = resourcesDb.exec('SELECT * FROM Files;')[0].values
    for (let item of filepaths) {
      let itemPath = path.resolve(process.cwd(), 'docsets', apiName, item[1])
      let itemPathDir = path.parse(itemPath).dir
      if (!fse.existsSync(itemPathDir)) fse.mkdirsSync(itemPathDir)
      let itemData = files.filter(j => j[0] === item[0])[0][1]
      if (itemData && itemData instanceof Uint8Array) {
        try {
          fse.writeFileSync(itemPath, zlib.unzipSync(itemData))
        } catch (error) {
          fse.writeFileSync(itemPath, itemData)
        }
      }
    }

    fse.removeSync(i)
  }
}

init().then(() => {
  fse.writeFileSync('data.json', JSON.stringify(database))
  fse.writeFileSync('data.js', 'window.data=' + JSON.stringify(database))
}, (err) => {
  fse.writeFileSync('data.json', JSON.stringify(database))
  fse.writeFileSync('data.js', 'window.data=' + JSON.stringify(database))
  console.error(err)
  process.exit(err)
})
