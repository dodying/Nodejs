// ==Headers==
// @Name:               delete
// @Description:        删除漫画
// @Version:            1.0.100
// @Author:             dodying
// @Date:               2019-2-16 17:42:04
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            readline-sync
// ==/Headers==

// 设置
const _ = require('./config')
const extensions = ['.cbz', '.jpg', '.zip', '.png']
const libraryFolderName = 'ComicLibrary'
const esPath = 'es.exe'
const excludes = [
  /\\#\.Tag\\/
]

// 导入原生模块
const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const libraryFolder = cp.execSync(`${esPath} ww:${libraryFolderName}`, { encoding: 'utf-8' }).split(/[\r\n]+/)[0]

const deletedPath = path.join(libraryFolder, _.subFolderDelete)
if (!fs.existsSync(deletedPath)) fs.mkdirSync(deletedPath)

// 导入第三方模块
const readlineSync = require('readline-sync')

// Function
const getExecCommand = text => `${esPath} -sort-path -parent-path "${libraryFolder}" /a-d  -size -date-modified "${text}"`
const stdout2lst = stdout => {
  return stdout.split(/[\r\n]+/).map(i => i.trim()).filter(i => i).map(i => i.match(/([\d,]+)\s+([\d/-]+)\s+([\d:]+)\s+(.*)/)[4])
}

// Main
const main = async () => {
  let list = process.argv.splice(2).filter(i => extensions.includes(path.parse(i).ext))
  for (let i of list) {
    let fullpath = path.resolve(process.cwd(), i)
    let name = path.parse(fullpath).name

    if (!fullpath.match('ComicLibrary') && !readlineSync.keyInYNStrict('Continue to delete?')) continue

    let sameList = cp.execSync(getExecCommand(name), { encoding: 'utf-8' })
    sameList = stdout2lst(sameList)
    for (let j of sameList) {
      if (path.parse(j).name === name) fs.unlinkSync(fullpath)
    }

    try {
      fs.writeFileSync(path.resolve(deletedPath, path.parse(fullpath).base), '')
      console.log('File Deleted:\t', fullpath)
    } catch (error) {
      console.error(error)
    }
  }
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
