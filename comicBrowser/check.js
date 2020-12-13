// ==Headers==
// @Name:               check
// @Description:        check
// @Version:            1.0.115
// @Author:             dodying
// @Created:            2020-07-09 15:39:26
// @Modified:           2020/11/26 13:33:49
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            body-parser,express,fs-extra,mysql2
// ==/Headers==

// 设置
const port = 5555;
const thread = 1;
const queryLimit = 2000;
const resultLimit = 20;
const rowFilterRaw = ['title', 'size', 'pages', 'web'];
let rowFilter = [...rowFilterRaw];
const validator = {
  set: function (obj, prop, value) {
    if (rowFilter.includes(prop)) {
      obj[prop] = value;
    }
    return true;
  }
};

let config = {};

let connection = null;
let connectionLastTime = null;
const connectionTimeout = 5 * 60 * 1000;
const lastConnection = {
  info: {},
  result: []
};
let connecting = false;

// 导入原生模块
// const path = require('path');

// 导入第三方模块
const fse = require('fs-extra');
const mysql = require('mysql2/promise');
const express = require('express');
const bodyParser = require('body-parser');

const waitInMs = require('./../_lib/waitInMs');

// Function
function diff (t1, t2) { // ignore case
  t1 = t1.replace(/\s+/g, ' ');
  t2 = t2.replace(/\s+/g, ' ');
  const arr1 = t1.split(/([[\](){}\s])/).filter(i => i); // 不变
  const arr2 = t2.split(/([[\](){}\s])/).filter(i => i); // 变
  const arr1Up = t1.toUpperCase().split(/([[\](){}\s])/).filter(i => i);
  const arr2Up = t2.toUpperCase().split(/([[\](){}\s])/).filter(i => i);
  const result = [];
  for (let i = 0; i < arr1Up.length; i++) {
    if (arr2Up.includes(arr1Up[i])) {
      const index = arr2Up.indexOf(arr1Up[i]);
      if (index > 0 && [' '].includes(arr1Up[i])) {
        result.push([-1, arr1[i]]);
        continue;
      } else if (index > 0) { // added
        arr2Up.splice(0, index);
        const added = arr2.splice(0, index);
        result.push([1, added.join('')]);
      }
      result.push([0, arr1[i]]);
      arr2Up.splice(0, 1);
      arr2.splice(0, 1);
    } else { // removed
      result.push([-1, arr1[i]]);
    }
  }
  if (arr2.length) result.push([1, arr2.join('')]);

  return result;
}
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
const query = async (list, column = 'title') => {
  if (!connection || new Date().getTime() - connectionLastTime >= connectionTimeout) await createConnection(config);
  rowFilter = [...rowFilterRaw].concat(column);
  list = [].concat(list);
  let out = [];
  console.time('query');
  while (list.length) {
    const now = list.splice(0, thread);
    const outNow = [];
    await new Promise((resolve, reject) => {
      for (let i = 0; i < now.length; i++) {
        const segment = [].concat(now[i]).map(i => `${column} LIKE '%${i.replace(/[%_\\']/g, '\\$&')}%'`).join(' AND ');
        connection.query(`SELECT * FROM files WHERE ${segment} LIMIT ${queryLimit}`).then((result) => {
          result = result[0];
          if (result.length > resultLimit) {
            console.log(result.length);
            const name = [].concat(now[i]).join(' ');
            result = result.sort((a, b) => {
              const la = diff(a[column], name).map(i => i[0] ? i[1].length : 0).reduce((a, b) => a + b, 0);
              const lb = diff(b[column], name).map(i => i[0] ? i[1].length : 0).reduce((a, b) => a + b, 0);
              return Math.abs(la) - Math.abs(lb);
            }).slice(0, resultLimit);
          }
          outNow[i] = result.map(i => Object.assign(new Proxy({}, validator), i));
        }).catch((err) => {
          console.log(err);
          outNow[i] = [];
        }).finally(() => {
          if (outNow.filter(i => i).length === now.length) resolve();
        });
      }
    });
    out = out.concat(outNow);
  }
  console.timeEnd('query');
  return out;
};

// Main
const main = async () => {
  config = fse.existsSync('./config.json') ? fse.readJSONSync('./config.json') : {};

  const [status, code] = await createConnection(config);
  lastConnection.result = [status, code];
  if (code !== 1) {
    console.log('Exit: Database Error');
    return;
  }

  const app = express();
  app.use(bodyParser.urlencoded({
    extended: false
  }));

  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('X-Powered-By', ' 3.2.1');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
  });

  app.get('/', async (req, res) => {
    if ('name' in req.query) {
      const lst = await query(req.query.name);
      console.log('GET /', req.query, lst);
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(lst, null, 2));
    } else {
      console.log('GET /');
      const html = `<html><body><form method="post" action="http://localhost:${port}">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>`;
      res.writeHead(200, {
        'Content-Type': 'text/html;charset=utf-8'
      });
      res.end(html);
    }
  });

  app.post('/', async (req, res) => {
    let lst;
    const column = 'column' in req.body ? req.body.column : 'title';
    if ('name' in req.body) {
      console.log('POST /', JSON.stringify(req.body, null, 2));
      lst = await query(req.body.name, column);
    } else if ('names' in req.body) {
      let names = JSON.parse(req.body.names);
      names.length = Object.keys(names).length;
      names = Array.from(names);
      names = names.map(i => i.split(','));

      console.log('POST /', JSON.stringify(names, null, 2));
      lst = await query(names, column);
    }
    console.log('RESPONSE /', lst.map(i => i.length));
    res.writeHead(200, {
      'Content-Type': 'application/json;charset=utf-8'
    });
    res.end(JSON.stringify(lst, null, 2));
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
