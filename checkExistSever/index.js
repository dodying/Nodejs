#!/usr/bin/env node

// ==Headers==
// @Name:               checkExistSever
// @Description:        checkExistSever
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-02-16 12:49:33
// @Last Modified by:   dodying
// @Last Modified time: 2018-04-05 19:30:18
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            express,body-parser
// ==/Headers==

//CONFIG
const libraryFolder = 'F:\\';
const esPath = 'D:\\GreenSoftware\\_Enhancer\\Everything\\es.exe';

//native modules
const cp = require('child_process');

//3rd party modules
const express = require('express');
const bodyParser = require('body-parser');
const async = require('async');

//
const escape = text => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '');

const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', function(req, res) {
  console.log('GET /');
  let html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
  res.writeHead(200, {
    'Content-Type': 'text/html;charset=utf-8'
  });
  res.end(html);
});

app.post('/', function(req, res) {
  if ('name' in req.body) {
    cp.exec(`${esPath} -size -p "${libraryFolder}" /a-d -name "${escape(req.body.name)}" -n 20`, (error, stdout, stderr) => {
      let lst = stdout.split(/[\r\n]+/).filter(i => i);
      console.log('POST /', req.body, lst);
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(lst));
    });
  } else if ('names' in req.body) {
    console.log('POST /', req.body);
    async.mapSeries(JSON.parse(req.body.names), (name, cb) => {
      name = name.split(',').map(i => `-name "${escape(i)}"`).join(' ');
      cp.exec(`${esPath} -size -p "${libraryFolder}" /a-d ${name} -n 20`, (error, stdout, stderr) => {
        let lst = stdout.split(/[\r\n]+/).filter(i => i);
        cb(null, lst);
      });
    }, (err, results) => {
      if (err) console.error(err);
      let obj = {};
      results.forEach((i, j) => {
        obj[j] = i;
      });
      console.log('POST /', obj);
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      });
      res.end(JSON.stringify(obj));
    });

  }
});

port = 3000;
app.listen(port);
console.log('Listening at http://localhost:' + port)
