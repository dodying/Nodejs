#!/usr/bin/env node

// ==Headers==
// @Name:               checkExistSever
// @Description:        checkExistSever
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-02-16 12:49:33
// @Last Modified by:   dodying
// @Last Modified time: 2018-02-18 17:15:13
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            express,body-parser
// ==/Headers==

//CONFIG
const libraryFolder = 'E:\\F\\';
const esPath = 'D:\\GreenSoftware\\Everything\\es.exe';

//native modules
const fs = require('fs');
const cp = require('child_process');

//3rd party modules
const express = require('express');
const bodyParser = require('body-parser');

//
const escape = text => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '');

const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', function(req, res) {
  console.log('GET /')
  let html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
  res.writeHead(200, {
    'Content-Type': 'text/html;charset=utf-8'
  });
  res.end(html);
});

app.post('/', function(req, res) {
  let parm = req.body.name;
  //let lst = cp.execSync(`${esPath} -p "${libraryFolder}" /a-d -name "${escape(parm)}"`).toString().split(/[\r\n]+/).filter(i => i);
  cp.exec(`${esPath} -p "${libraryFolder}" /a-d -name "${escape(parm)}"`, (error, stdout, stderr) => {
    let lst = stdout.split(/[\r\n]+/).filter(i => i);
    console.log('POST /', req.body, lst);
    res.writeHead(200, {
      'Content-Type': 'application/json;charset=utf-8'
    });
    res.end(JSON.stringify(lst));
  });
});

port = 3000;
app.listen(port);
console.log('Listening at http://localhost:' + port)
