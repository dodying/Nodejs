// ==Headers==
// @Name:               pornImageDownloader
// @Description:        下载不可描述图
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-06-20 15:52:36
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:
// ==/Headers==

// 设置
const _ = {
  folder: 'image'
}

// 导入原生模块
const fs = require('fs')
const path = require('path')
const cp = require('child_process')

// 导入第三方模块

// Function

// Main
let amount = 100
let folderPath = path.resolve(process.cwd(), _.folder)
if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath)
while (amount > 0) {
  amount--
  let url = cp.execSync('downloadheader http://19960707.ml/q.php?.jpg').toString()
  url = url.match(/Location:\s+(.*)/i)[1]
  let arr = url.split('/')
  let name = arr[arr.length - 1]
  let target = path.resolve(folderPath, name)
  if (fs.existsSync(target)) {
    let content = cp.execSync(`downloadheader ${url}`).toString()
    content = content.match(/Content-Length:\s+(\d+)/)[1] * 1
    let fileSize = fs.statSync(target).size
    if (fileSize < content) {
      try {
        cp.execSync(`wget "${url}" -O "${target}"`, { stdio: [0, 1, 2] })
      } catch (err) { }
    }
  } else {
    try {
      cp.execSync(`wget "${url}" -O "${target}"`, { stdio: [0, 1, 2] })
    } catch (err) { }
  }
}
