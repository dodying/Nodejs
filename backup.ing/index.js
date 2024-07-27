// ==Headers==
// @Name:               index
// @Description:        index
// @Version:            1.0.86
// @Author:             dodying
// @Created:            2023-10-25 20:01:56
// @Modified:           2023-11-09 19:16:59
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            eastasianwidth
// ==/Headers==

// 导入原生模块
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 导入第三方模块
const eaw = require('eastasianwidth');

// 设置
const createConnection = require('../_lib/createConnection');
const walkEverything = require('../_lib/walkEverything');

const roots = [
  {
    path: 'F:\\H\\',
    query: '', // everything query
    dest: '',
  },
];
const mysqlConfig = {
  host: process.env.MYSQl_HOST,
  user: 'root',
  password: '',
  database: 'backup',
  multipleStatements: true,
  maxPreparedStatements: 16000,
};
createConnection.set(mysqlConfig);

// Function
function printThisLine(text, remain = 'left') {
  if (!process.stdout?.clearLine) return;
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  const total = eaw.length(text);
  if (total > process.stdout.columns) {
    const lengthMax = process.stdout.columns - 3;
    let text1 = text;
    let length = lengthMax;
    if (remain !== 'left') text1 = text1.split('').reverse().join('');
    text1 = text1.substring(0, length);
    let lengthView = eaw.length(text1);
    while (lengthView > lengthMax) {
      length = length - Math.ceil((lengthView - lengthMax) / 2);
      text1 = text1.substring(0, length);
      lengthView = eaw.length(text1);
    }
    text1 = `${text1}...`;
    if (remain !== 'left') text1 = text1.split('').reverse().join('');
    process.stdout.write(text1);
  } else {
    process.stdout.write(text);
  }
}
async function getSha256(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const rs = fs.createReadStream(file);
    rs.on('error', reject);
    rs.on('data', (chunk) => hash.update(chunk));
    rs.on('end', () => resolve(hash.digest('hex')));
  });
}

// Main
const main = async () => {
  const connectionWrapper = await createConnection();
  const { escape, escapeId } = connectionWrapper;
  if (connectionWrapper.code !== 1) { // 创建数据库
    console.trace(`Database Error: ${connectionWrapper.status}`);
    if (connectionWrapper.code === 0) {
      const queryString = `CREATE DATABASE IF NOT EXISTS ${escapeId(mysqlConfig.database)} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci`;
      await connectionWrapper.connection.query(queryString);
      main();
      return;
    }
    process.exit();
  }

  { // 创建表
    const [results] = await connectionWrapper.connection.query('SHOW TABLES');
    const tables = results.map((i) => Object.values(i)[0]);

    if (!tables.includes('files')) {
      await connectionWrapper.connection.query(
        `CREATE TABLE IF NOT EXISTS files (${[
          'path VARCHAR(300) NOT NULL',
          'remotepath VARCHAR(300) NOT NULL',
          'size CHAR(12) NOT NULL',
          'dm CHAR(18) NOT NULL',
          `sizeAsha256 CHAR(${12 + 1 + 64}) NOT NULL`,
          "status ENUM('local', 'upload', 'uploaded') DEFAULT 'local'",
          'PRIMARY KEY (path)',
        ].join(', ')})`,
      );
    }
  }

  {
    console.time('plain');
    let exists;
    {
      const [results] = await connectionWrapper.connection.query('SELECT * FROM files');
      // TODO
      exists = [];
    }

    let files = [];
    for (const root of roots) files = [].concat(files, (await walkEverything(['file:', root.query].join(' '), { root: root.path, raw: true, columns: ['path', 'size', 'date_modified'] })).results);
    debugger;

    const sqlArr = [];
    { // 新文件
      let count = 0;
      const existsMap = Object.fromEntries(Object.entries(exists.map((i) => i.path)).map((i) => i.reverse()));
      for (const file of files) {
        count = count + 1;
        const filepath = `${file.path}\\${file.name}`;

        const findIndex = parseInt(existsMap[filepath] || -1, 10);
        if (findIndex >= 0) {
          const find = exists.splice(findIndex, 1, null)[0];
          if (find.size === file.size && find.dm === file.date_modified) continue;
        }

        printThisLine(`(${((count / files.length) * 100).toFixed(2)}%) ${count}/${files.length}: ${filepath}`);
        try {
          sqlArr.push(Object.values({
            path: filepath,
            remotepath: '',
            size: file.size,
            dm: file.date_modified,
            sizeAsha256: `${file.size}-${await getSha256(filepath)}`,
            status: 'local',
          }));
        } catch (error) { /* noop */ }
      }
    }
    printThisLine('');

    exists = exists.filter((i) => i);
    while (exists.length) { // 已删除文件
      const arr = exists.splice(0, 1e5);
      Array.prototype.push.apply(sqlArr, arr.map((i) => `DELETE FROM files WHERE path = '${i.path.replace(/'/g, '\'\'')}';`));
    }

    console.timeEnd('plain');
  }
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit(1);
});
