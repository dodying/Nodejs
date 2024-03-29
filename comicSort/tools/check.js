// ==Headers==
// @Name:               check
// @Description:        检查本地漫画
// @Version:            1.0.220
// @Author:             dodying
// @Modified:           2020/7/13 10:55:29
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            body-parser,express
// ==/Headers==

// 设置
const port = 5555;
const esPath = 'es.exe';
const excludes = [
  /\\#\.Tag\\/,
];
const thread = 5;
const esLimit = 2000;
const resultLimit = 20;

// 导入原生模块
const path = require('path');
const cp = require('child_process');

const libraryFolder = cp.execSync(`${esPath} ww:${path.basename(_.libraryFolder)}`, { encoding: 'utf-8' }).split(/[\r\n]+/)[0];

// 导入第三方模块
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('../config');
const diff = require('../../_lib/diff');

//
const escape = (text) => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '');
const stdout2lst = (stdout, name) => {
  let output = stdout.split(/[\r\n]+/).filter((i) => !i.match(path.basename(_.subFolderTag))).map((i) => i.replace(/^\s+/g, '')).filter((item, index, arr) => item && ['.cbz', '.zip'].includes(path.parse(item).ext) && arr.indexOf(item) === index && !excludes.some((filter) => item.match(filter)))
    .map((i) => {
      let obj = {};
      const match = i.match(/([\d,]+)\s+([\d/-]+)\s+([\d:]+)\s+(.*)/);
      obj = {
        size: (match[1].replace(/,/g, '') / 1024 / 1024).toFixed(2),
        // dm: match[2],
        name: path.parse(match[4]).base,
      };
      return obj;
    });
  if (output.length > resultLimit) {
    console.log(output.length);
    name = [].concat(name).join(' ');
    output = output.sort((a, b) => {
      const la = diff(a.name, name).map((i) => (i[0] ? i[1].length : 0)).reduce((a, b) => a + b, 0);
      const lb = diff(b.name, name).map((i) => (i[0] ? i[1].length : 0)).reduce((a, b) => a + b, 0);
      return Math.abs(la) - Math.abs(lb);
    }).slice(0, resultLimit);
  }
  return output;
};
const getExecCommand = (arr) => `${esPath} -sort-path -parent-path "${libraryFolder}" -max-results ${esLimit} /a-d -size -date-modified ${[].concat(arr).map((i) => `"${escape(i)}"`).join(' ')}`;
const search = async (name) => {
  const list = [].concat(name);
  let out = [];
  console.time('search');
  while (list.length) {
    const now = list.splice(0, thread);
    const outNow = [];
    await new Promise((resolve, reject) => {
      for (let i = 0; i < now.length; i++) {
        cp.exec(getExecCommand(now[i]), { maxBuffer: 1024 * 1024 * 1024 }, (err, stdout, stderr) => {
          outNow[i] = err ? [] : stdout2lst(stdout, now[i]);
          if (outNow.filter((i) => i).length === now.length) resolve();
        });
      }
    });
    out = out.concat(outNow);
  }
  console.timeEnd('search');
  return out;
};

const app = express();
app.use(bodyParser.urlencoded({
  extended: false,
}));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', ' 3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

app.get('/', async (req, res) => {
  if ('name' in req.query) {
    const lst = await search(req.query.name);
    console.log('GET /', req.query, lst);
    res.writeHead(200, {
      'Content-Type': 'application/json;charset=utf-8',
    });
    res.end(JSON.stringify(lst, null, 2));
  } else {
    console.log('GET /');
    const html = `<html><body><form method="post" action="http://localhost:${port}">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>`;
    res.writeHead(200, {
      'Content-Type': 'text/html;charset=utf-8',
    });
    res.end(html);
  }
});

app.post('/', async (req, res) => {
  let lst;
  if ('name' in req.body) {
    console.log('POST /', JSON.stringify(req.body, null, 2));
    lst = await search(req.body.name);
  } else if ('names' in req.body) {
    let names = JSON.parse(req.body.names);
    names.length = Object.keys(names).length;
    names = Array.from(names);
    names = names.map((i) => i.split(','));

    console.log('POST /', JSON.stringify(names, null, 2));
    lst = await search(names);
  }
  console.log('RESPONSE /', lst.map((i) => i.length));
  res.writeHead(200, {
    'Content-Type': 'application/json;charset=utf-8',
  });
  res.end(JSON.stringify(lst, null, 2));
});

app.listen(port);
console.log(`Listening at http://localhost:${port}`);
