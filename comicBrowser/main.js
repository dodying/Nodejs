// ==Headers==
// @Name:               main
// @Description:        main
// @Version:            1.0.692
// @Author:             dodying
// @Created:            2020-01-28 21:26:56
// @Modified:           2020-3-4 13:32:07
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron,electron-reload,fs-extra,jszip,mysql2
// ==/Headers==

// 设置
var debug = false
var windowHistory = []
var windows = {}
var config = {}
var connection = null
let tray = null
var lastConnection = {
  info: {},
  result: []
}
let connecting = false

// 导入原生模块
const path = require('path')

// 导入第三方模块
const fse = require('fs-extra')
const { app, BrowserWindow, ipcMain, Menu, shell, Tray } = require('electron')
if (debug) require('electron-reload')(path.join(__dirname, 'src'))
const mysql = require('mysql2/promise')
const JSZip = require('jszip')

const walk = require('./../comicSort/js/walk')
const parseInfo = require('./../comicSort/js/parseInfo')
const getTitleMain = require('./js/getTitleMain')
const EHT = JSON.parse(fse.readFileSync(path.join(__dirname, './../comicSort', 'EHT.json'), 'utf-8')).data
const mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc']

// Function
let openWindow = (url) => {
  // let id = new Date().getTime()
  // while (id in windows) id = new Date().getTime()
  if (!url.match(/^https?:/)) url = path.resolve(__dirname, url)
  console.debug('open', url)
  let win, id

  return new Promise((resolve, reject) => {
    win = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      // autoHideMenuBar: true,
      // darkTheme: true,
      frame: false,
      icon: './src/icon.png',
      webPreferences: {
        nodeIntegration: true
      }
    })
    id = win.id
    windows[id] = win

    windows[id].on('maximize', () => {
      resolve(id)
    })

    windows[id].once('ready-to-show', () => {
      windows[id].show()
      resolve(id)
    })

    windows[id].on('closed', function () {
      delete windows[id]
      win = null

      for (let i = 0; i < windowHistory.length;) {
        let id = windowHistory[i]
        if (id in windows) {
          windows[id].show()
          break
        } else {
          windowHistory.splice(0, 1)
        }
      }
    })

    windows[id].on('focus', function () {
      windowHistory.unshift(id)
    })

    windows[id].loadURL(url)

    windows[id].maximize()
    if (debug) windows[id].openDevTools()
  })
}
let createConnection = async (obj) => {
  /* eslint-disable no-unmodified-loop-condition */
  while (connecting) {
    await waitInMs(200)
  }
  connecting = true
  let isInfoSame = lastConnection.info.host === obj.host
  isInfoSame = isInfoSame && lastConnection.info.user === obj.user
  isInfoSame = isInfoSame && lastConnection.info.password === obj.password
  if (lastConnection.result[1] === 1 && isInfoSame) {
    connecting = false
    return lastConnection.result
  }

  lastConnection.info = {
    host: obj.host,
    user: obj.user,
    password: obj.password
  }

  console.log('re-connection')

  try {
    connection = await mysql.createConnection({
      host: obj.host,
      user: obj.user,
      password: obj.password
    })
  } catch (error) {
    connection = null
    connecting = false
    return ['Connection Failed, please check info', -1]
  }

  let [rows] = await connection.query('SHOW DATABASES')

  if (rows.filter(i => i.Database === obj.database).length) {
    await connection.query(`USE ${obj.database}`)
    connecting = false
    return ['Connection Success, and you can update', 1]
  } else {
    connecting = false
    return ['Connection Success, but you need to init', 0]
  }
}
let updateTableTags = async (obj) => {
  let [rows] = await connection.query('SHOW TABLES')
  if (rows.filter(i => i[`Tables_in_${obj.database}`] === 'tags').length) {
    await connection.query('DROP TABLE tags')
  }

  await connection.query('CREATE TABLE `tags` (`id` int unsigned not null auto_increment primary key, `tag` varchar(255), `main` varchar(255), `sub` varchar(255), `cname` varchar(255), `info` text)')

  console.time('EHT')
  let queryString = `insert into tags (tag, main, sub, cname, info) values `
  let arr = []
  for (let mainObj of EHT) {
    let main = mainObj.namespace
    for (let sub in mainObj.data) {
      arr.push([`${main}:${sub}`, main, sub, mainObj.data[sub].name, mainObj.data[sub].intro])
    }
  }

  arr = arr.map(i => `(${i.map(j => connection.escape(j)).join(', ')})`).join(',')
  await connection.query(queryString + arr)
  console.timeEnd('EHT')
}
let updateTableFiles = async (obj) => {
  console.time('walk')
  let files = walk(obj.libraryFolder)
  files = files.filter(i => ['.cbz', '.zip'].includes(path.extname(i))).map(i => path.relative(obj.libraryFolder, i))
  console.timeEnd('walk')

  console.time('query')
  let [rows] = await connection.query(`select path from files`)
  let existedInfo = rows.map(i => i.path).map(i => i.toUpperCase())
  console.timeEnd('query')

  console.debug('Total Files:\t', files.length)
  files = files.filter(i => !existedInfo.includes(i.toUpperCase()))
  console.debug('New Files\t', files.length, '\nExisted Files:\t', existedInfo.length)

  console.time('INSERT INTO')
  let column = ['path', 'size', 'title', 'title_main', 'title_jpn', 'title_jpn_main', 'category', 'web', 'language', 'pages', 'time_upload', 'uploader', 'rating', 'favorited', 'time_download', 'tags', 'artist']
  let queryString = `INSERT INTO files (${column.join(', ')}) values `
  let arr = []
  for (let file of files) {
    if (arr.length >= 100) {
      let arr1 = arr.map(i => `(${i.map(j => j === 'NULL' ? 'NULL' : connection.escape(j)).join(', ')})`).join(',\n')
      await connection.query(queryString + arr1)
      arr = []
    }

    let fullpath = path.join(obj.libraryFolder, file)
    let size = fse.statSync(fullpath).size

    // 读取数据
    let targetData = fse.readFileSync(fullpath)
    let jszip = new JSZip()
    let zip
    try {
      zip = await jszip.loadAsync(targetData)
    } catch (error) {
      // console.error(`Error:\t无法读取文件 "${file}"`)
      let title = path.parse(fullpath).name
      arr.push([
        file, size,
        title, getTitleMain(title),
        title, getTitleMain(title),
        ...'1'.repeat(column.length - 6).split('').map(i => 'NULL')
      ])
      continue
    }

    // 查看列表
    let fileList = Object.keys(zip.files)

    // 检测有无info.txt
    if (fileList.filter(item => item.match(/(^|\/)info\.txt$/)).length === 0) {
      console.warn('压缩档内不存在info.txt: ', file)
      return new Error('no info.txt')
    }

    // 读取info.txt
    let infoFile = fileList.find(item => item.match(/(^|\/)info\.txt$/))
    let data = await zip.files[infoFile].async('text')
    let info = parseInfo(data)

    //
    let tags = {}
    for (let i of mainTag) {
      if (i in info) tags[i] = info[i]
    }
    let artist = tags.artist ? tags.artist.sort().slice(0, 3).join(', ') : tags.group ? tags.group.sort().slice(0, 3).join(', ') : ''
    arr.push([
      file, size,
      info.title, getTitleMain(info.title),
      info.jTitle, getTitleMain(info.jTitle),
      info.Category, info.web, info.lang,
      isNaN(parseInt(info.length)) ? 0 : parseInt(info.length),
      info.Posted, info.Uploader,
      isNaN(parseFloat(info.Rating)) ? 0 : parseFloat(info.Rating),
      isNaN(parseInt(info.Favorited)) ? 0 : parseInt(info.Favorited),
      info.downloadTime,
      JSON.stringify(tags),
      artist
    ])
  }
  if (arr.length) {
    arr = arr.map(i => `(${i.map(j => j === 'NULL' ? 'NULL' : connection.escape(j)).join(', ')})`).join(',\n')
    await connection.query(queryString + arr)
  }
  console.timeEnd('INSERT INTO')

  console.time('DELETE INTO')
  queryString = `DELETE FROM files WHERE `
  arr = []
  for (let file of existedInfo) {
    if (arr.length >= 100) {
      let arr1 = arr.map(i => `path=${connection.escape(i)}`).join(' OR ')
      await connection.query(queryString + arr1)
      arr = []
    }

    let fullpath = path.join(obj.libraryFolder, file)
    if (!fse.existsSync(fullpath)) arr.push(file)
  }
  if (arr.length) {
    let arr1 = arr.map(i => `path=${connection.escape(i)}`).join(' OR ')
    await connection.query(queryString + arr1)
  }
  console.timeEnd('DELETE INTO')
}
let rebuildTrayMenu = () => {
  let menuItem = [
    {
      label: '显示/隐藏最后窗口',
      click: (menuItem, browserWindow, event) => {
        let win = windows[windowHistory[0]]
        if (win.isVisible()) {
          win.hide()
        } else {
          win.show()
        }
      }
    },
    {
      label: '显示所有窗口',
      click: (menuItem, browserWindow, event) => {
        for (let id in windows) {
          windows[id].show()
          rebuildTrayMenu()
        }
      }
    },
    { type: 'separator' }
  ]

  for (let id in windows) {
    if (windows[id].isVisible()) continue
    menuItem.push({
      label: `${id}: ${windows[id].getTitle().substr(0, 40)}`,
      click: (menuItem, browserWindow, event) => {
        windows[id].show()
        rebuildTrayMenu()
      }
    })
  }

  menuItem.push(
    { type: 'separator' },
    {
      label: '保存并退出',
      click: (menuItem, browserWindow, event) => {
        saveLastTabs()
        for (let id in windows) windows[id].close()
      }
    },
    {
      label: '退出',
      click: (menuItem, browserWindow, event) => {
        for (let id in windows) windows[id].close()
      }
    }
  )

  let contextMenu = Menu.buildFromTemplate(menuItem)
  tray.setContextMenu(contextMenu)
}
let saveLastTabs = () => {
  let urls = []
  for (let id in windows) {
    let url = windows[id].webContents.getURL()
    urls.push(url.replace('file:///E:/Desktop/_/GitHub/Nodejs/comicBrowser/', './'))
  }
  config.lastTabs = urls
  fse.writeJSONSync('./config.json', config, { spaces: 2 })
  console.log('last tabs wrote')
}
function waitInMs (time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

ipcMain.on('open', async (event, urls) => {
  for (let url of [].concat(urls)) {
    await openWindow(url)
  }
  event.returnValue = true
})

ipcMain.on('open-external', async (event, url, name) => {
  if (name === 'path') {
    let fullpath = path.resolve(config.libraryFolder, url)
    await shell.openItem(fullpath)
  } else if (name === 'item') {
    let fullpath = path.resolve(config.libraryFolder, url)
    await shell.showItemInFolder(fullpath)
  } else if (name === 'delete') {
    let fullpath = path.resolve(config.libraryFolder, url)
    if (fse.existsSync(fullpath)) fse.unlinkSync(fullpath)
    let cover = path.resolve(path.dirname(fullpath), path.parse(fullpath).name + '.jpg')
    if (fse.existsSync(cover)) fse.unlinkSync(cover)

    if (!('delete' in config)) config.delete = []
    config.delete.push(url)
    if (config.lastViewPosition && url in config.lastViewPosition) delete config.lastViewPosition[url]
    if (config.lastViewTime && url in config.lastViewTime) delete config.lastViewTime[url]
    if (config.history && config.history.includes(url)) config.history.splice(config.history.indexOf(url), 1)
    fse.writeJSONSync('./config.json', config, { spaces: 2 })
  } else if (!name) {
    await shell.openExternal(url)
  }
})

ipcMain.on('config', (event, todo = 'get', obj, value) => {
  let configThis
  if (todo === 'set') {
    obj = obj || {}
    configThis = Object.assign(config, obj)
    fse.writeJSONSync('./config.json', configThis, { spaces: 2 })
    config = configThis
  } else if (todo === 'get') {
    config = fse.readJSONSync('./config.json')
    configThis = config
    if (obj) configThis = obj in configThis ? configThis[obj] : value
  }
  event.returnValue = configThis
})

ipcMain.on('clear', (event) => {
  delete config.history
  delete config.delete
  for (let i of ['star', 'lastViewPosition', 'lastViewTime']) {
    for (let file in config[i]) {
      let fullpath = path.resolve(config.libraryFolder, file)
      if (!fse.existsSync(fullpath)) delete config[i][file]
    }
  }
  fse.writeJSONSync('./config.json', config, { spaces: 2 })
})

ipcMain.on('database-connect', async (event, obj, todo) => {
  obj = obj || config

  // todo: test,delete,init,update
  // code: -1,0,1
  let [status, code] = await createConnection(obj)
  lastConnection.result = [status, code]
  // console.debug({ status, code, obj, todo, connection })
  if (todo === 'test' || code === -1 || !todo) {
    event.returnValue = [status, code]
  } else if (todo === 'delete') {
    if (code === 1) {
      await connection.query(`DROP DATABASE ${obj.database}`)
      event.returnValue = ['Delete Success', code]
    } else {
      event.returnValue = ['No Such Database', code]
    }
  } else if (todo === 'init') {
    let queryString = `CREATE DATABASE ${obj.database} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci`
    await connection.query(queryString)

    queryString = `USE ${obj.database}`
    await connection.query(queryString)

    // queryString = 'CREATE TABLE `tags` (`id` int unsigned not null auto_increment primary key, `tag` varchar(255), `main` varchar(255), `sub` varchar(255), `cname` varchar(255), `info` text)'
    // await connection.query(queryString)

    queryString = 'CREATE TABLE `files` (' + [
      'id int unsigned not null auto_increment',
      'path text', // 路径
      'size int unsigned', // 文件大小
      'title varchar(511)', // 英文标题
      'title_main varchar(511)', // 英文标题的主要内容
      'title_jpn varchar(511)', // 日文标题
      'title_jpn_main varchar(511)', // 日文标题的主要内容
      'category varchar(20)', // 类别
      'web varchar(50)', // 网址
      'language varchar(2)', // 语言
      'pages int unsigned', // 页数
      'time_upload timestamp', // 上传时间 '2020-01-02 21:14:16.000'
      'uploader varchar(40)', // 上传者
      'rating float unsigned', // 评分
      'favorited int unsigned', // 收藏人数
      'time_download timestamp', // 下载时间
      'tags json', // 标签
      'artist varchar(511)', // 作者
      'PRIMARY KEY (id)'
      // 'INDEX index_path (path(255))'
    ].join(', ') + ')'
    // SELECT MAX(LENGTH(path)) FROM files
    await connection.query(queryString)
    event.returnValue = ['Init Success', code]
  } else if (todo === 'update' && code === 0) {
    event.returnValue = ['You need to init', code]
  } else if (todo === 'update' && code === 1) {
    // await updateTableTags(obj)
    await updateTableFiles(obj)
    event.returnValue = ['Update Success', code]
  }
})

ipcMain.on('log', (event, ...args) => {
  console.debug(...args)
})

ipcMain.on('database-query', async (event, str) => {
  console.debug('database-query', str)
  let result = [
    []
  ]
  try {
    result = await connection.query(str)
  } catch (error) {
  }
  event.returnValue = result
})

ipcMain.on('query-by-condition', async (event, condition) => {
  if (!connection) await createConnection(config)
  console.log('query-by-condition', condition)
  let query = 'SELECT * FROM files WHERE '
  let typeLib = {
    'tags': 'json',
    'path': 'text',
    'title': 'text',
    'title_main': 'text',
    'title_jpn': 'text',
    'title_jpn_main': 'text',
    'size': 'number',
    'rating': 'number',
    'category': 'text',
    'web': 'text',
    'language': 'text',
    'pages': 'number',
    'time_upload': 'datetime',
    'uploader': 'text',
    'favorited': 'number',
    'time_download': 'datetime',
    'artist': 'text'
  }
  let querySegment = []
  let order = ['path', 'time_upload', 'time_download']
  for (let i of condition) {
    let [not, column, comparison, value, value1] = i
    let type = typeLib[column]
    let str

    if (type === 'datetime') {
      value = value ? mysql.escape(value) : 'CURDATE()'

      if (['=', '!=', '>', '>=', '<', '<='].includes(comparison)) {
        str = `DATE(${column}) ${comparison} ${value}`
      } else if (['today', 'yesteday', 'the day before yesterday'].includes(comparison)) {
        let sep = ['today', 'yesteday', 'the day before yesterday'].indexOf(comparison)
        str = `DATE(${column}) = DATE_SUB(${value}, INTERVAL ${sep} DAY)`
      } else if (['tomorrow', 'the day after tomorrow'].includes(comparison)) {
        let sep = ['today', 'tomorrow', 'the day after tomorrow'].indexOf(comparison)
        str = `DATE(${column}) = DATE_ADD(${value}, INTERVAL ${sep} DAY)`
      } else if (['this_week'].includes(comparison)) {
        str = `YEARWEEK(${column}, 1) = YEARWEEK(${value}, 1)`
      } else if (['this_year'].includes(comparison)) {
        str = `MONTH(${column}) = MONTH(${value}) AND YEAR(${column}) = YEAR(${value})`
      } else if (['BETWEEN AND', 'NOT BETWEEN AND'].includes(comparison)) {
        value1 = value1 ? mysql.escape(value1) : 'CURDATE()'
        str = `DATE(${column}) ${comparison === 'NOT BETWEEN AND' ? 'NOT ' : ''}BETWEEN ${value} AND ${value1}`
      }
    } else if (type === 'boolean') {
      comparison = comparison === '1' ? '=' : '!='
      value = 1
      str = `${column} ${comparison} ${value}`
    } else if (type === 'json') {
      // unused method:
      // equal: JSON_CONTAINS(tags, '"mind break"', '$.female')
      let [column, path] = comparison.split(':')

      if (path === '*') {
        // WHERE tags like '%mind break%'
        str = `${column} LIKE ${mysql.escape(`%${value.replace(/\\/g, '\\\\')}%`)}`
      } else {
        // WHERE JSON_EXTRACT(tags, '$.female[*]') like '%mind break%'
        str = `JSON_EXTRACT(${column}, '$.${path}[*]') LIKE ${mysql.escape(`%${value.replace(/\\/g, '\\\\')}%`)}`
      }
    } else if (['=', '!=', '>', '>=', '<', '<='].includes(comparison)) {
      if (type === 'text') value = mysql.escape(value)
      str = `${column} ${comparison} ${value}`
    } else if (['LIKE', 'NOT LIKE'].includes(comparison)) {
      // https://www.runoob.com/mysql/mysql-like-clause.html
      // % 多个字符
      // _ 单个字符
      // [] 【^】
      str = `${column} ${comparison} ${mysql.escape(`%${value.replace(/\\/g, '\\\\')}%`)}`
      // str=`INSTR(${column}, ${mysql.escape(`${value}`)})`
      // str=`NOT(INSTR(${column}, ${mysql.escape(`${value}`)}))`
    } else if (['REGEXP', 'NOT REGEXP'].includes(comparison)) {
      str = `${column} ${comparison} ${mysql.escape(`${value}`)}`
    } else if (['Duplicate'].includes(comparison)) {
      let str1 = `SELECT ${column} FROM files WHERE ${column} != "" GROUP BY ${column} HAVING COUNT(${column}) > 1`
      str = `${column} IN (${str1})`
      order = [column, 'artist']
    }
    if (not) str = `NOT(${str})`
    querySegment.push(str)
  }
  query += querySegment.join(' AND ')
  query += ' ORDER BY ' + order.join(', ')
  console.log('database-query', query)
  let result = [[]]
  try {
    result = await connection.query(query)
  } catch (error) {
    console.log(error)
  }
  event.returnValue = result
})

ipcMain.on('save-last-tabs', (event) => {
  saveLastTabs()
})

ipcMain.on('hide-tab', (event, id) => {
  windows[id].hide()
  rebuildTrayMenu()
})

ipcMain.on('hide-all-tabs', (event) => {
  for (let id in windows) windows[id].hide()
  rebuildTrayMenu()
})

ipcMain.on('close-all-tabs', (event, id) => {
  for (let id in windows) windows[id].close()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('ready', async function () {
  let urls = ['./src/index.html']

  config = fse.existsSync('./config.json') ? fse.readJSONSync('./config.json') : {}

  for (let url of urls) {
    await openWindow(url)
  }

  tray = new Tray('./src/icon.png')
  rebuildTrayMenu()
  tray.on('click', () => {
    let win = windows[windowHistory[0]]
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
    }
    rebuildTrayMenu()
  })
})
