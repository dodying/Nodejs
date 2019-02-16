// ==Headers==
// @Name:               browser
// @Description:        打开puppeteer
// @Version:            1.0.1
// @Author:             dodying
// @Date:               2019-1-26 15:07:40
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            puppeteer
// ==/Headers==

// 设置
const _ = require('./config')

// 导入原生模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const puppeteer = require('puppeteer')

// Function

// Main

async function main () {
  let browser = await puppeteer.launch({
    headless: false,
    userDataDir: `${__dirname}\\User Data`,
    defaultViewport: null,
    timeout: 0,
    args: [
      `--disable-extensions-except=${__dirname}\\Extensions\\Proxy-SwitchyOmega`
    ]
  })
  browser.on('disconnected', () => {
    process.exit()
  })
}

main().then(async () => {
  //
}, async err => {
  logger.error(err)
  process.exit()
})
