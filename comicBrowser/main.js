// ==Headers==
// @Name:               main
// @Description:        main
// @Version:            1.0.940
// @Author:             dodying
// @Created:            2020-01-28 21:26:56
// @Modified:           2020/7/9 16:36:15
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron,electron-reload,fs-extra,jszip,mysql2
// ==/Headers==

// 设置
const debug = false;
let windowHistory = [];
const windows = {};
let config = {};
let store = {};
let tray = null;

let connection = null;
let connectionLastTime = null;
const connectionTimeout = 5 * 60 * 1000;
const lastConnection = {
  info: {},
  result: []
};
let connecting = false;
const columns = {
  path: 'text', // 路径
  size: 'int unsigned', // 文件大小
  artist: 'varchar(511)', // 作者
  title: 'varchar(511)', // 英文标题
  title_main: 'varchar(511)', // 英文标题的主要部分
  title_number: 'varchar(511)', // 英文标题的数字部分
  title_jpn: 'varchar(511)', // 日文标题
  title_jpn_main: 'varchar(511)', // 日文标题的主要部分
  title_jpn_number: 'varchar(511)', // 日文标题的数字部分
  category: 'varchar(20)', // 类别
  web: 'varchar(50)', // 网址
  language: 'varchar(2)', // 语言
  pages: 'int unsigned', // 页数
  time_upload: 'timestamp', // 上传时间 '2020-01-02 21:14:16.000'
  uploader: 'varchar(40)', // 上传者
  rating: 'float unsigned', // 评分
  favorited: 'int unsigned', // 收藏人数
  time_download: 'timestamp', // 下载时间
  tags: 'json' // 标签
};

// 导入原生模块
const path = require('path');
const cp = require('child_process');

// 导入第三方模块
const fse = require('fs-extra');
const { app, BrowserWindow, ipcMain, Menu, shell, Tray } = require('electron');
if (debug) require('electron-reload')(path.join(__dirname, 'src'));
const mysql = require('mysql2/promise');
const JSZip = require('jszip');

const walk = require('./../_lib/walk');
const waitInMs = require('./../_lib/waitInMs');
const parseInfo = require('./js/parseInfo');
const getTitleMain = require('./js/getTitleMain');
const mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc'];

// Function
const openWindow = (url) => {
  if (!url.match(/^https?:/)) url = path.resolve(__dirname, url);
  console.debug('open', url);
  let win, id;

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
    });
    id = win.id;
    windows[id] = win;

    windows[id].on('maximize', () => {
      if (resolve) resolve(id);
      resolve = null;
    });

    if (config.alwaysMaximize) {
      windows[id].on('unmaximize', () => {
        windows[id].maximize();
      });

      windows[id].on('restore', () => {
        windows[id].maximize();
      });
    }

    if (config.hideOnMinimize) {
      windows[id].on('minimize', () => {
        windows[id].hide();
        rebuildTrayMenu();
      });
    }

    windows[id].once('ready-to-show', () => {
      windows[id].show();
      if (resolve) resolve(id);
      resolve = null;
    });

    windows[id].on('closed', function () {
      delete windows[id];
      win = null;

      for (let i = 0; i < windowHistory.length; i++) {
        const id = windowHistory[i];
        if (id in windows) {
          if (!windows[id].isVisible()) continue;
          windows[id].show();
          break;
        } else {
          windowHistory.splice(0, 1);
          i--;
        }
      }
    });

    windows[id].on('focus', function () {
      windowHistory.unshift(id);
      windowHistory = Array.from(new Set(windowHistory));
    });

    windows[id].loadURL(url);

    windows[id].maximize();
    if (debug) windows[id].openDevTools();
  });
};
const createConnection = async (obj) => {
  /* eslint-disable no-unmodified-loop-condition */
  while (connecting) {
    await waitInMs(200);
  }
  connecting = true;
  let isInfoSame = lastConnection.info.host === obj.host;
  isInfoSame = isInfoSame && lastConnection.info.user === obj.user;
  isInfoSame = isInfoSame && lastConnection.info.password === obj.password;
  if (lastConnection.result[1] === 1 && isInfoSame && new Date().getTime() - connectionLastTime < connectionTimeout) {
    connecting = false;
    return lastConnection.result;
  }

  lastConnection.info = {
    host: obj.host,
    user: obj.user,
    password: obj.password
  };

  console.log('re-connection');

  try {
    connection = await mysql.createConnection({
      host: obj.host,
      user: obj.user,
      password: obj.password
    });
    connectionLastTime = new Date().getTime();
  } catch (error) {
    connection = null;
    connecting = false;
    connectionLastTime = null;
    return ['Connection Failed, please check info', -1];
  }

  const [rows] = await connection.query('SHOW DATABASES');

  if (rows.filter(i => i.Database === obj.database).length) {
    await connection.query(`USE ${obj.database}`);
    connecting = false;
    return ['Connection Success, and you can update', 1];
  } else {
    connecting = false;
    connectionLastTime = null;
    return ['Connection Success, but you need to init', 0];
  }
};
const updateTableFiles = async (obj) => {
  console.log('database-update');

  console.time('walk');
  let filesLocal = walk(obj.libraryFolder);
  filesLocal = filesLocal.filter(i => ['.cbz', '.zip'].includes(path.extname(i))).map(i => path.relative(obj.libraryFolder, i));
  console.timeEnd('walk');

  console.time('query');
  const [rows] = await connection.query('select path from files');
  const filesDatabase = rows.map(i => i.path);
  console.timeEnd('query');

  console.debug('Total Files:\t', filesLocal.length, '\nExisted Files:\t', filesDatabase.length);
  const filesLocalUpperCase = filesLocal.map(i => i.toUpperCase());
  const filesDatabaseUpperCase = filesDatabase.map(i => i.toUpperCase());
  const filesDeleted = filesDatabase.filter(i => !filesLocalUpperCase.includes(i.toUpperCase()));
  const filesNew = filesLocal.filter(i => !filesDatabaseUpperCase.includes(i.toUpperCase()));
  console.debug('New Files\t', filesNew.length, '\nDeleted Files:\t', filesDeleted.length);

  console.time('INSERT INTO');
  const column = Object.keys(columns);
  let queryString = `INSERT INTO files (${column.join(', ')}) values `;
  let arr = [];
  for (const file of filesNew) {
    if (arr.length >= 100) {
      const arr1 = arr.map(i => `(${i.map(j => j === 'NULL' ? 'NULL' : connection.escape(j)).join(', ')})`).join(',\n');
      await connection.query(queryString + arr1);
      arr = [];
    }

    const fullpath = path.join(obj.libraryFolder, file);
    const size = fse.statSync(fullpath).size;

    // 读取数据
    const targetData = fse.readFileSync(fullpath);
    const jszip = new JSZip();
    let zip;
    try {
      zip = await jszip.loadAsync(targetData);
    } catch (error) {
      // console.error(`Error:\t无法读取文件 "${file}"`)
      const title = path.parse(fullpath).name;
      arr.push([
        file, size, 'NULL',
        title, ...getTitleMain(title),
        title, ...getTitleMain(title),
        ...'1'.repeat(column.length - 9).split('').map(i => 'NULL')
      ]);
      continue;
    }

    // 查看列表
    const fileList = Object.keys(zip.files);

    // 检测有无info.txt
    if (fileList.filter(item => item.match(/(^|\/)info\.txt$/)).length === 0) {
      console.warn('压缩档内不存在info.txt: ', file);
      return new Error('no info.txt');
    }

    // 读取info.txt
    const infoFile = fileList.find(item => item.match(/(^|\/)info\.txt$/));
    const data = await zip.files[infoFile].async('text');
    const info = parseInfo(data);

    //
    const tags = {};
    for (const i of mainTag) {
      if (i in info) tags[i] = info[i];
    }
    let artist = tags.artist ? tags.artist : tags.group ? tags.group : [];
    artist = artist.map(i => i.split('|')[0].trim()).sort().slice(0, 3).join(', ');
    arr.push([
      file, size, artist,
      info.title, ...getTitleMain(info.title),
      info.jTitle, ...getTitleMain(info.jTitle),
      info.Category, info.web, info.lang,
      isNaN(parseInt(info.length)) ? 0 : parseInt(info.length),
      info.Posted, info.Uploader,
      isNaN(parseFloat(info.Rating)) ? 0 : parseFloat(info.Rating),
      isNaN(parseInt(info.Favorited)) ? 0 : parseInt(info.Favorited),
      info.downloadTime,
      JSON.stringify(tags)
    ]);
  }
  if (arr.length) {
    arr = arr.map(i => `(${i.map(j => j === 'NULL' ? 'NULL' : connection.escape(j)).join(', ')})`).join(',\n');
    await connection.query(queryString + arr);
  }
  console.timeEnd('INSERT INTO');

  console.time('DELETE INTO');
  queryString = 'DELETE FROM files WHERE ';
  arr = [];
  for (const file of filesDeleted) {
    if (arr.length >= 100) {
      const arr1 = arr.map(i => `path=${connection.escape(i)}`).join(' OR ');
      await connection.query(queryString + arr1);
      arr = [];
    }

    arr.push(file);
  }
  if (arr.length) {
    const arr1 = arr.map(i => `path=${connection.escape(i)}`).join(' OR ');
    await connection.query(queryString + arr1);
  }
  console.timeEnd('DELETE INTO');
};
const rebuildTrayMenu = () => {
  const menuItem = [
    {
      label: '显示/隐藏最后窗口',
      click: (menuItem, browserWindow, event) => {
        for (let i = 0; i < windowHistory.length;) {
          const id = windowHistory[i];
          if (id in windows) {
            if (windows[id].isVisible()) {
              windows[id].hide();
            } else {
              windows[id].show();
            }
            break;
          } else {
            windowHistory.splice(0, 1);
          }
        }
        rebuildTrayMenu();
      }
    },
    {
      label: '显示所有窗口',
      click: (menuItem, browserWindow, event) => {
        for (const id in windows) {
          windows[id].show();
        }
        rebuildTrayMenu();
      }
    },
    {
      label: '隐藏所有窗口',
      click: (menuItem, browserWindow, event) => {
        for (const id in windows) {
          windows[id].hide();
        }
        rebuildTrayMenu();
      }
    },
    { type: 'separator' }
  ];

  for (const id in windows) {
    if (windows[id].isVisible()) continue;
    menuItem.push({
      label: `${id}: ${windows[id].getTitle().substr(0, 40)}`,
      click: (menuItem, browserWindow, event) => {
        windows[id].show();
        rebuildTrayMenu();
      }
    });
  }

  menuItem.push(
    { type: 'separator' },
    {
      label: '保存并退出',
      click: (menuItem, browserWindow, event) => {
        saveLastTabs();
        for (const id in windows) windows[id].close();
      }
    },
    {
      label: '退出',
      click: (menuItem, browserWindow, event) => {
        for (const id in windows) windows[id].close();
      }
    }
  );

  const contextMenu = Menu.buildFromTemplate(menuItem);
  tray.setContextMenu(contextMenu);
};
const saveLastTabs = () => {
  const urls = [];
  const separator = __dirname.replace(/\\/g, '/');
  for (const id in windows) {
    let url = windows[id].webContents.getURL();
    const arr = url.split(separator);
    if (arr.length > 1) url = '.' + arr.slice(1).join(separator);
    urls.push(url);
  }
  config.lastTabs = urls;
  console.log('last tabs wrote');
};

ipcMain.on('open', async (event, urls) => {
  for (const url of [].concat(urls)) {
    await openWindow(url);
  }
  event.returnValue = true;
});

ipcMain.on('open-external', async (event, url, name) => {
  if (name === 'path') {
    const fullpath = path.resolve(config.libraryFolder, url);
    await shell.openItem(fullpath);
  } else if (name === 'item') {
    const fullpath = path.resolve(config.libraryFolder, url);
    await shell.showItemInFolder(fullpath);
  } else if (name === 'delete') {
    const fullpath = path.resolve(config.libraryFolder, url);
    if (fse.existsSync(fullpath)) fse.unlinkSync(fullpath);
    const cover = path.resolve(path.dirname(fullpath), path.parse(fullpath).name + '.jpg');
    if (fse.existsSync(cover)) fse.unlinkSync(cover);

    if (!('delete' in store)) store.delete = [];
    store.delete.push(url);
    if (store.lastViewPosition && url in store.lastViewPosition) delete store.lastViewPosition[url];
    if (store.lastViewTime && url in store.lastViewTime) delete store.lastViewTime[url];
    if (store.history && store.history.includes(url)) store.history.splice(store.history.indexOf(url), 1);
  } else if (name === 'everything') {
    if (config.everything && fse.existsSync(config.everything)) cp.execFileSync(config.everything, ['-search', url]);
  } else if (!name) {
    await shell.openExternal(url);
  }
});

ipcMain.on('config', (event, todo = 'get', name, value) => {
  let configThis;
  if (todo === 'set') {
    const obj = name || {};
    configThis = Object.assign(config, obj);
    fse.writeJSONSync('./config.json', configThis, { spaces: 2 });
    config = configThis;
  } else if (todo === 'get') {
    // config = fse.existsSync('./config.json') ? fse.readJSONSync('./config.json') : {};
    configThis = config;
    if (name) configThis = name in configThis ? configThis[name] : value;
  }
  event.returnValue = configThis;
});

ipcMain.on('store', (event, todo = 'get', name, value) => {
  let storeThis;
  if (todo === 'set') {
    const obj = name || {};
    storeThis = Object.assign(store, obj);
    fse.writeJSONSync('./store.json', storeThis, { spaces: 2 });
    store = storeThis;
  } else if (todo === 'get') {
    // store = fse.existsSync('./store.json') ? fse.readJSONSync('./store.json') : {};
    storeThis = store;
    if (name) storeThis = name in storeThis ? storeThis[name] : value;
  }
  event.returnValue = storeThis;
});

ipcMain.on('clear', (event) => {
  delete store.history;
  delete store.delete;
  delete store.resultList;
  for (const i of ['lastViewPosition', 'lastViewTime']) {
    for (const file in store[i]) {
      const fullpath = path.resolve(config.libraryFolder, file);
      if (!fse.existsSync(fullpath)) delete store[i][file];
    }
  }
  for (const i of ['star']) {
    store[i] = Array.from(new Set(store[i]));
    for (let j = 0; j < store[i].length; j++) {
      const file = store[i][j];
      const fullpath = path.resolve(config.libraryFolder, file);
      if (!fse.existsSync(fullpath)) {
        store[i].splice(j, 1);
        j--;
      }
    }
  }

  event.returnValue = true;
});

ipcMain.on('database-connect', async (event, obj, todo) => {
  obj = obj || config;

  // todo: test,delete,init,update
  // code: -1,0,1
  const [status, code] = await createConnection(obj);
  lastConnection.result = [status, code];
  // console.debug({ status, code, obj, todo, connection })
  if (todo === 'test' || code === -1 || !todo) {
    event.returnValue = [status, code];
  } else if (todo === 'delete') {
    if (code === 1) {
      await connection.query(`DROP DATABASE ${obj.database}`);
      event.returnValue = ['Delete Success', code];
    } else {
      event.returnValue = ['No Such Database', code];
    }
  } else if (todo === 'init') {
    let queryString = `CREATE DATABASE ${obj.database} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci`;
    await connection.query(queryString);

    queryString = `USE ${obj.database}`;
    await connection.query(queryString);

    queryString = 'CREATE TABLE `files` (' + [
      'id int unsigned not null auto_increment',
      ...Object.keys(columns).map(i => `${i} ${columns[i]}`),
      'PRIMARY KEY (id)'
    ].join(', ') + ')';
    await connection.query(queryString);
    event.returnValue = ['Init Success', code];
  } else if (code === 0) {
    event.returnValue = ['You need to init', code];
  } else if (todo === 'update') {
    await updateTableFiles(obj);
    event.returnValue = ['Update Success', code];
  }
});

ipcMain.on('log', (event, ...args) => {
  console.debug(...args);
});

ipcMain.on('database-query', async (event, str) => {
  if (!connection || new Date().getTime() - connectionLastTime >= connectionTimeout) await createConnection(config);
  console.debug('database-query', '\n\x1b[32m', str, '\x1b[0m');
  let result = [
    []
  ];
  try {
    result = await connection.query(str);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.debug('database-query-end', result[0].length);
  event.returnValue = result;
});

ipcMain.on('query-by-condition', async (event, condition) => {
  if (!connection || new Date().getTime() - connectionLastTime >= connectionTimeout) await createConnection(config);
  // console.log('query-by-condition', condition)
  let query = 'SELECT * FROM files WHERE ';
  const querySegment = [];
  let order = ['path', 'time_upload', 'time_download'];
  for (const i of condition) {
    let [not, column, comparison, value, value1] = i;
    const type = columns[column];
    let str;

    if (column === 'command') {
      continue;
    } else if (type === 'timestamp') {
      value = value ? mysql.escape(value) : 'CURDATE()';

      if (['=', '!=', '>', '>=', '<', '<='].includes(comparison)) {
        str = `DATE(${column}) ${comparison} ${value}`;
      } else if (['today', 'yesteday', 'the day before yesterday'].includes(comparison)) {
        const sep = ['today', 'yesteday', 'the day before yesterday'].indexOf(comparison);
        str = `DATE(${column}) = DATE_SUB(${value}, INTERVAL ${sep} DAY)`;
      } else if (['tomorrow', 'the day after tomorrow'].includes(comparison)) {
        const sep = ['today', 'tomorrow', 'the day after tomorrow'].indexOf(comparison);
        str = `DATE(${column}) = DATE_ADD(${value}, INTERVAL ${sep} DAY)`;
      } else if (['this_week'].includes(comparison)) {
        str = `YEARWEEK(${column}, 1) = YEARWEEK(${value}, 1)`;
      } else if (['this_year'].includes(comparison)) {
        str = `MONTH(${column}) = MONTH(${value}) AND YEAR(${column}) = YEAR(${value})`;
      } else if (['BETWEEN AND', 'NOT BETWEEN AND'].includes(comparison)) {
        value1 = value1 ? mysql.escape(value1) : 'CURDATE()';
        str = `DATE(${column}) ${comparison === 'NOT BETWEEN AND' ? 'NOT ' : ''}BETWEEN ${value} AND ${value1}`;
      }
    } else if (type === 'json') {
      // unused method:
      // equal: JSON_SEARCH(tags, 'one', 'mind break', null, '$.female[*]')
      const [column, path] = comparison.split(':');
      if (value.match(/^[><=!]+\d+$/)) {
        str = `JSON_LENGTH(JSON_EXTRACT(${column},'$.${path}[*]'))${value}`;
      } else {
        if (value.match(/^\/(.*)\/$/)) {
          value = value.match(/^\/(.*)\/$/)[1];
          comparison = 'REGEXP';
        } else {
          value = `%${value.replace(/[%_\\]/g, '\\$&')}%`;
          comparison = 'LIKE';
        }

        if (path === '*') {
          // WHERE tags like '%mind break%'
          str = `${column} ${comparison} ${mysql.escape(value)}`;
        } else {
          // WHERE JSON_EXTRACT(tags, '$.female[*]') like '%mind break%'
          str = `JSON_EXTRACT(${column}, '$.${path}[*]') ${comparison} ${mysql.escape(value)}`;
        }
      }
    } else if (['=', '!=', '>', '>=', '<', '<='].includes(comparison)) {
      if (type === 'text' || type.match('varchar')) value = mysql.escape(value);
      str = `${column} ${comparison} ${value}`;
    } else if (['LIKE', 'NOT LIKE'].includes(comparison)) {
      // https://www.runoob.com/mysql/mysql-like-clause.html
      // % 多个字符
      // _ 单个字符
      // [] 【^】
      str = `${column} ${comparison} ${mysql.escape(`%${value.replace(/[%_\\]/g, '\\$&')}%`)}`;
      // str=`INSTR(${column}, ${mysql.escape(`${value}`)})`
      // str=`NOT(INSTR(${column}, ${mysql.escape(`${value}`)}))`
    } else if (['START WITH'].includes(comparison)) {
      str = `${column} LIKE ${mysql.escape(`${value.replace(/[%_\\]/g, '\\$&')}%`)}`;
    } else if (['END WITH'].includes(comparison)) {
      str = `${column} LIKE ${mysql.escape(`%${value.replace(/[%_\\]/g, '\\$&')}`)}`;
    } else if (['REGEXP', 'NOT REGEXP'].includes(comparison)) {
      str = `${column} ${comparison} ${mysql.escape(`${value}`)}`;
    } else if (['Duplicate'].includes(comparison)) {
      const str1 = `SELECT ${column} FROM files WHERE ${column} != "" GROUP BY ${column} HAVING COUNT(${column}) > 1`;
      str = `${column} IN (${str1})`;
      order = [column, 'artist'];
    }
    if (not) str = `NOT(${str})`;
    querySegment.push(str);
  }
  query += querySegment.join(' AND ');
  query += ' ORDER BY ' + order.join(', ');
  if (condition.filter(i => !i[0] && i[1] === 'command').length) query = condition.filter(i => !i[0] && i[1] === 'command').map(i => i[3]).join('\n');
  console.debug('database-query', '\n\x1b[32m', query, '\x1b[0m');
  let result = [[]];
  try {
    result = await connection.query(query);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.debug('database-query-end', result[0].length);
  event.returnValue = result;
});

ipcMain.on('save-last-tabs', (event) => {
  saveLastTabs();
});

ipcMain.on('hide-tab', (event, id) => {
  windows[id].hide();
  rebuildTrayMenu();
});

ipcMain.on('hide-all-tabs', (event) => {
  for (const id in windows) windows[id].hide();
  rebuildTrayMenu();
});

ipcMain.on('close-all-tabs', (event, id) => {
  for (const id in windows) windows[id].close();
});

app.on('window-all-closed', function () {
  fse.writeJSONSync('./config.json', config, { spaces: 2 });
  fse.writeJSONSync('./store.json', store, { spaces: 2 });
  if (process.platform !== 'darwin') app.quit();
});

// Main
const main = async () => {
  config = fse.existsSync('./config.json') ? fse.readJSONSync('./config.json') : {};

  app.on('ready', async function () {
    const urls = ['./src/index.html'];

    store = fse.existsSync('./store.json') ? fse.readJSONSync('./store.json') : {};

    for (const url of urls) {
      await openWindow(url);
    }

    tray = new Tray('./src/icon.png');
    rebuildTrayMenu();
    tray.on('click', () => {
      for (let i = 0; i < windowHistory.length;) {
        const id = windowHistory[i];
        if (id in windows) {
          if (windows[id].isVisible()) {
            windows[id].hide();
          } else {
            windows[id].show();
          }
          break;
        } else {
          windowHistory.splice(0, 1);
        }
      }
      rebuildTrayMenu();
    });
  });
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  process.exit();
});
