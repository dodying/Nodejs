// ==Headers==
// @Name:               main
// @Description:        main
// @Version:            1.0.29
// @Author:             dodying
// @Created:            2020-01-28 21:26:56
// @Modified:           2020-2-27 14:36:21
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron,electron-reload
// ==/Headers==

// 设置

// 导入原生模块
// const fs = require('fs')
const path = require('path')

// 导入第三方模块
const { app, BrowserWindow } = require('electron')
// require('electron-reload')(path.join(__dirname, 'src'))

// Function
var mainWindow = null
app.allowRendererProcessReuse = false

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(path.resolve(__dirname, './src/index.html'))

  mainWindow.maximize()
  // mainWindow.openDevTools()

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
})
