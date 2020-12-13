// ==Headers==
// @Name:               mark-server
// @Description:        mark-server
// @Version:            1.0.235
// @Author:             dodying
// @Created:            2020-07-09 15:39:26
// @Modified:           2020/11/26 13:33:37
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            body-parser,express,mysql2
// ==/Headers==

// 设置
const port = 5556;
const config = {
  host: 'localhost',
  user: 'admin',
  password: '',
  database: 'mark'
};
let connection = null;
let connectionLastTime = null;
const connectionTimeout = 5 * 60 * 1000;
const lastConnection = {
  info: {},
  result: []
};
let connecting = false;
const columns = {
  name: 'VARCHAR(511) NOT NULL UNIQUE', // 名称
  mark: 'VARCHAR(20) NOT NULL'
};

// 导入原生模块
// const path = require('path');

// 导入第三方模块
const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');

const waitInMs = require('./../_lib/waitInMs');
const wait = require('./../_lib/wait');

// Function
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
const createDatabase = async (name) => {
  let queryString = `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci`;
  await connection.query(queryString);

  queryString = `USE \`${name}\``;
  await connection.query(queryString);
};
const createTable = async (name) => {
  const queryString = 'CREATE TABLE IF NOT EXISTS `' + name + '` (' + [
    'id INT UNSIGNED NOT NULL AUTO_INCREMENT',
    ...Object.keys(columns).map(i => `\`${i}\` ${columns[i]}`),
    'PRIMARY KEY (id)',
    'INDEX (name)'
  ].join(', ') + ')';
  await connection.query(queryString);
};
const updateExistsTables = async () => {
  const queryString = 'SHOW TABLES';
  const [rows] = await connection.query(queryString);
  return rows.map(i => Object.values(i)).flat();
};

// Main
const main = async () => {
  const [status, code] = await createConnection(config);
  lastConnection.result = [status, code];
  if (code === -1) {
    console.log('Exit: Connection Failed');
    return;
  } else if (code === 0) {
    await createDatabase(config.database);
  }
  let existsTable = await updateExistsTables();

  const app = express();
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit: 1000000 }));

  let busy = false;
  app.all('*', async function (req, res, next) {
    await wait.for(() => !busy, 30 * 1000);
    busy = true;
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('X-Powered-By', ' 3.2.1');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
  });

  app.post('/query', async (req, res, next) => {
    if (!connection || new Date().getTime() - connectionLastTime >= connectionTimeout) await createConnection(config);

    const result = [];
    console.log('QUERY /', req.body);

    const category = req.body.category;
    if (!(existsTable.includes(category))) {
      await createTable(category);
      existsTable = await updateExistsTables();
    }
    for (const name of [].concat(req.body.names)) {
      const [rows] = await connection.query(`SELECT * FROM \`${category}\` WHERE name=${mysql.escape(name)}`);
      result.push(rows.length ? rows[0].mark : 'null');
    }

    console.log('RESPONSE /', result);
    res.writeHead(200, {
      'Content-Type': 'application/json;charset=utf-8'
    });

    res.end(JSON.stringify(result, null, 2));
    next();
  });

  app.post('/search', async (req, res, next) => { // TODO
    if (!connection || new Date().getTime() - connectionLastTime >= connectionTimeout) await createConnection(config);

    let result = [];
    console.log('SEARCH /', req.body);

    const category = req.body.category;
    if (!(existsTable.includes(category))) {
      await createTable(category);
      existsTable = await updateExistsTables();
    }
    const [rows] = await connection.query(`SELECT name FROM \`${category}\` WHERE name REGEXP ${mysql.escape(req.body.name)}`);
    result = rows.length ? rows.map(i => i.name) : [];

    console.log('RESPONSE /', result);
    res.writeHead(200, {
      'Content-Type': 'application/json;charset=utf-8'
    });

    res.end(JSON.stringify(result, null, 2));
    next();
  });

  app.post('/update', async (req, res, next) => {
    if (!connection || new Date().getTime() - connectionLastTime >= connectionTimeout) await createConnection(config);

    const result = true;
    console.log('UPDATE /', req.body);

    const category = req.body.category;
    if (!(existsTable.includes(category))) {
      await createTable(category);
      existsTable = await updateExistsTables();
    }
    const valuesAdd = [];
    const valuesDelete = [];
    for (const item of [].concat(req.body.items)) {
      const arr = item.split('|');
      const [name, mark] = [arr.slice(0, -1).join('|'), arr.slice(-1)[0]];
      if (arr.slice(-1)[0] === 'null') {
        valuesDelete.push(name);
      } else {
        valuesAdd.push([name, mark]);
      }
    }
    if (valuesAdd.length) {
      const values = valuesAdd.map(i => `(${i.map(j => j === 'NULL' ? 'NULL' : mysql.escape(j)).join(', ')})`).join(',\n');
      await connection.query(`INSERT INTO \`${category}\` (${Object.keys(columns).join(', ')}) values ` + values + ' ON DUPLICATE KEY UPDATE mark=VALUES(mark)');
    }
    if (valuesDelete.length) {
      await connection.query(`DELETE FROM \`${category}\` WHERE ${valuesDelete.map(i => `name=${mysql.escape(i)}`).join(' OR ')}`);
    }

    console.log('RESPONSE /', result);
    res.writeHead(200, {
      'Content-Type': 'application/json;charset=utf-8'
    });
    res.end(String(result));

    next();
  });

  app.all('*', function (req, res, next) {
    busy = false;
  });

  app.listen(port);
  console.log('Listening at http://localhost:' + port);
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  process.exit();
});
