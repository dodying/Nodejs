#!/usr/bin/env node

// ==Headers==
// @Name:               checkExistSever
// @Description:        checkExistSever
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-02-16 12:49:33
// @Last Modified by:   dodying
// @Last Modified time: 2018-06-06 18:08:43
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            express,body-parser,async
// ==/Headers==

// CONFIG
const libraryFolder = 'F:\\'
const esPath = 'D:\\GreenSoftware\\_Enhancer\\Everything\\es.exe'

// native modules
const cp = require('child_process')

// 3rd party modules
const express = require('express')
const bodyParser = require('body-parser')
const async = require('async')

//
const escape = text => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '')

const app = express()
app.use(bodyParser.urlencoded({
  extended: false
}))

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

app.get('/', function (req, res) {
  if ('name' in req.query) {
    cp.exec(`${esPath} -size -p "${libraryFolder}" /a-d -name "${escape(req.query.name)}" -n 20`, (err, stdout, stderr) => {
      if (err) throw err
      let lst = stdout.split(/[\r\n]+/).map(i => i.replace(/^\s+/g, '')).filter(i => i)
      console.log('GET /', req.query, lst)
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      })
      res.end(JSON.stringify(lst, null, 2))
    })
  } else {
    console.log('GET /')
    let html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>'
    res.writeHead(200, {
      'Content-Type': 'text/html;charset=utf-8'
    })
    res.end(html)
  }
})

app.post('/', function (req, res) {
  if ('name' in req.body) {
    cp.exec(`${esPath} -size -p "${libraryFolder}" /a-d -name "${escape(req.body.name)}" -n 20`, (err, stdout, stderr) => {
      if (err) throw err
      let lst = stdout.split(/[\r\n]+/).map(i => i.replace(/^\s+/g, '')).filter(i => i)
      console.log('POST /', req.body, lst)
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      })
      res.end(JSON.stringify(lst, null, 2))
    })
  } else if ('names' in req.body) {
    let body = JSON.parse(req.body.names)
    console.log('POST /', JSON.stringify(body, null, 2))
    async.mapLimit(body, 3, (name, cb) => {
      name = name.split(',').map(i => `-name "${escape(i)}"`).join(' ')
      cp.exec(`${esPath} -size -p "${libraryFolder}" /a-d ${name} -n 20`, (err, stdout, stderr) => {
        if (err) throw err
        let lst = stdout.split(/[\r\n]+/).map(i => i.replace(/^\s+/g, '')).filter(i => i)
        cb(null, lst)
      })
    }, (err, results) => {
      if (err) console.error(err)
      let obj = {}
      results.forEach((i, j) => {
        obj[j] = i
      })
      obj = JSON.stringify(obj, null, 2)
      console.log('RESPONSE /', obj)
      res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8'
      })
      res.end(obj)
    })
  }
})

let port = 3000
app.listen(port)
console.log('Listening at http://localhost:' + port)
