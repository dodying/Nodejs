// ==Headers==
// @Name:               update
// @Description:        update
// @Version:            1.0.136
// @Author:             dodying
// @Created:            2020-07-09 14:13:04
// @Modified:           2020/11/26 13:33:53
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra,jszip,mysql2,sane
// ==/Headers==

// 设置
let config = {};

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

// 导入第三方模块
const fse = require('fs-extra');
const mysql = require('mysql2/promise');
const JSZip = require('jszip');
// const sane = require('sane');

const walk = require('./../_lib/walk');
const waitInMs = require('./../_lib/waitInMs');
const parseInfo = require('./js/parseInfo');
const getTitleMain = require('./js/getTitleMain');
const mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc'];

// Function
const updateTableFilesNew = async (obj, files) => {
  if (!connection || new Date().getTime() - connectionLastTime >= connectionTimeout) await createConnection(config);

  let queryString, arr;

  const filesLocal = files;

  const [rows] = await connection.query('select path from files');
  const filesDatabase = rows.map(i => i.path);

  const filesLocalUpperCase = filesLocal.map(i => i.toUpperCase());
  // const filesDatabaseUpperCase = filesDatabase.map(i => i.toUpperCase());
  const filesDeleted = filesDatabase.filter(i => filesLocalUpperCase.includes(i.toUpperCase())); // 移除已存在
  const filesNew = filesLocal;

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

  const column = Object.keys(columns);
  queryString = `INSERT INTO files (${column.join(', ')}) values `;
  arr = [];
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
    if (connection && connection.end && typeof connection.end === 'function') connection.end();
  } catch (error) {
    console.log({ err: error, msg: error.message });
  }
  try {
    connection = await mysql.createConnection({
      host: obj.host,
      user: obj.user,
      password: obj.password
    });
    connectionLastTime = new Date().getTime();
  } catch (error) {
    if (error.message.match('Too many connections')) {
      connecting = false;
      return createConnection(obj);
    } else {
      console.log({ err: error, msg: error.message });
      connection = null;
      connecting = false;
      connectionLastTime = null;
      return ['Connection Failed, please check info', -1];
    }
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

  let queryString, arr;

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

  console.time('INSERT INTO');
  const column = Object.keys(columns);
  queryString = `INSERT INTO files (${column.join(', ')}) values `;
  arr = [];
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
};

// Main
const main = async () => {
  config = fse.existsSync('./config.json') ? fse.readJSONSync('./config.json') : {};

  const [status, code] = await createConnection(config);
  lastConnection.result = [status, code];

  const args = process.argv.splice(2);
  let result;
  if (args.includes('test') || args.length === 0 || code === -1) {
    result = [status, code];
  } else if (args.includes('delete')) {
    if (code === 1) {
      await connection.query(`DROP DATABASE ${config.database}`);
      result = ['Delete Success', code];
    } else {
      result = ['No Such Database', code];
    }
  } else if (args.includes('init')) {
    let queryString = `CREATE DATABASE ${config.database} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci`;
    await connection.query(queryString);

    queryString = `USE ${config.database}`;
    await connection.query(queryString);

    queryString = 'CREATE TABLE `files` (' + [
      'id int unsigned not null auto_increment',
      ...Object.keys(columns).map(i => `${i} ${columns[i]}`),
      'PRIMARY KEY (id)'
    ].join(', ') + ')';
    await connection.query(queryString);
    result = ['Init Success', code];
  } else if (code === 0) {
    result = ['You need to init', code];
  } else if (args.includes('update')) {
    await updateTableFiles(config);
    result = ['Update Success', code];
  } else if (args.includes('sort')) {
    // 移除重复值
    await connection.query('CREATE TABLE same_web LIKE files;');
    await connection.query('INSERT INTO same_web SELECT * FROM files WHERE web IN (SELECT web FROM files WHERE web != "" GROUP BY web HAVING COUNT(web) > 1);');
    await connection.query('CREATE TABLE same_path LIKE files;');
    await connection.query('INSERT INTO same_path SELECT * FROM same_web WHERE path IN (SELECT path FROM same_web WHERE path != "" GROUP BY path HAVING COUNT(path) > 1);');
    await connection.query('CREATE TABLE max_id LIKE files;');
    await connection.query('INSERT INTO max_id SELECT * FROM same_path WHERE id NOT IN ( SELECT MAX(id) FROM same_path GROUP BY path HAVING COUNT(path) > 1 );');
    await connection.query('DELETE FROM files AS t1 WHERE EXISTS ( SELECT * FROM MAX_id AS T2 where T1.id = T2.id );');
    await connection.query('DROP TABLE max_id;');
    await connection.query('DROP TABLE same_path;');
    await connection.query('DROP TABLE same_web;');

    // 排序
    await connection.query('CREATE TABLE files1 LIKE files;');
    await connection.query('INSERT INTO files1 (path,size,artist,title,title_main,title_number,title_jpn,title_jpn_main,title_jpn_number,category,web,language,pages,time_upload,uploader,rating,favorited,time_download,tags) SELECT path,size,artist,title,title_main,title_number,title_jpn,title_jpn_main,title_jpn_number,category,web,language,pages,time_upload,uploader,rating,favorited,time_download,tags FROM files ORDER BY path;');
    await connection.query('DROP TABLE files;');
    await connection.query('RENAME TABLE files1 TO files;');
  } else if (args.includes('watch')) {
    await new Promise((resolve, reject) => {
      let lastFiles, lastTime;
      const watcher = fse.watch(config.libraryFolder, { recursive: true }, (type, filename) => {
        // if (type === 'rename') {
        if (lastFiles === filename && new Date().getTime() - lastTime <= 5 * 1000) return;
        if (!filename || !['.cbz', '.zip'].includes(path.extname(filename))) return;
        const fullname = path.resolve(config.libraryFolder, filename);
        if (!fse.existsSync(fullname)) return;
        lastFiles = filename;
        console.log(filename);
        updateTableFilesNew(config, [filename]);
        lastTime = new Date().getTime();
        // }
      });

      // const watcher = sane(config.libraryFolder);
      // watcher.on('ready', function () { console.log('ready'); });
      // watcher.on('change', function (filepath, root, stat) {
      //   if (!['.cbz', '.zip'].includes(path.extname(filepath))) return;
      // });
      // watcher.on('add', function (filepath, root, stat) {

      // });
      // watcher.on('delete', function (filepath, root) {

      // });

      process.stdin.on('data', (data) => {
        data = data.toString().trim();
        if (data.match(/^(q|quit|exit)$/i)) {
          watcher.close();
          process.stdin.destroy();
          resolve();
        }
      });
    });
  }

  if (result) console.log(result);
  if (connection) connection.destroy();
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  process.exit();
});
