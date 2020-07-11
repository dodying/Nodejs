// ==Headers==
// @Name:               check
// @Description:        check
// @Version:            1.0.94
// @Author:             dodying
// @Created:            2020-07-09 15:39:26
// @Modified:           2020/7/9 21:48:07
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            body-parser,express,fs-extra,mysql2
// ==/Headers==

// 设置
const port = 5555;
const thread = 1;
const rowFilter = ['title', 'size', 'pages', 'web'];
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
const query = async (list) => {
  if (!connection || new Date().getTime() - connectionLastTime >= connectionTimeout) await createConnection(config);
  list = [].concat(list);
  let out = [];
  console.time('query');
  while (list.length) {
    const now = list.splice(0, thread);
    const outNow = [];
    await new Promise((resolve, reject) => {
      for (let i = 0; i < now.length; i++) {
        const segment = [].concat(now[i]).map(i => `title LIKE '%${i.replace(/[%_\\']/g, '\\$&')}%'`).join(' AND ');
        connection.query(`SELECT * FROM files WHERE ${segment}`).then((result) => {
          outNow[i] = result[0].map(i => Object.assign(new Proxy({}, validator), i));
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
    if ('name' in req.body) {
      console.log('POST /', JSON.stringify(req.body, null, 2));
      lst = await query(req.body.name);
    } else if ('names' in req.body) {
      let names = JSON.parse(req.body.names);
      names.length = Object.keys(names).length;
      names = Array.from(names);
      names = names.map(i => i.split(','));

      console.log('POST /', JSON.stringify(names, null, 2));
      lst = await query(names);
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
