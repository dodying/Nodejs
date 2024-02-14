// ==Headers==
// @Name:               main
// @Description:        main
// @Version:            1.0.69
// @Author:             dodying
// @Created:            2023-07-22 20:17:04
// @Modified:           2023-07-24 21:56:43
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron,electron-reload
// ==/Headers==

// 导入原生模块
const fs = require('fs');
const path = require('path');

// 导入第三方模块
const {
  app, BrowserWindow,
  Tray,
  // protocol,
} = require('electron');
// require('electron-reload')(path.join(__dirname, 'src'));

// Function
let tray, mainWindow;
const gotTheLock = app.requestSingleInstanceLock({});

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
    // console.log({
    //   event, commandLine, workingDirectory, additionalData,
    // });
    if (mainWindow) {
      let file = '';
      if (commandLine.length > 2 && fs.existsSync(commandLine.slice(-1)[0])) file = path.resolve(commandLine.slice(-1)[0]);
      console.log({ file });

      // mainWindow.loadURL(path.resolve(__dirname, `./src/index.html?${new URLSearchParams({ file }).toString()}`));
      mainWindow.webContents.send('file', file);
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.allowRendererProcessReuse = false;

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('ready', () => {
    // protocol.registerFileProtocol('file', (request, callback) => {
    //   const pathname = decodeURI(request.url.replace('file:///', ''));
    //   console.log(callback);
    //   callback(pathname);
    // });
    mainWindow = new BrowserWindow({
      width: 600,
      height: 800,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webSecurity: false,
      },
    });

    let file = '';
    if (process.argv.length > 2 && fs.existsSync(process.argv.slice(-1)[0])) file = path.resolve(process.argv.slice(-1)[0]);
    mainWindow.loadURL(path.resolve(__dirname, `./src/index.html?${new URLSearchParams({ file }).toString()}`));

    // mainWindow.openDevTools()

    {
      mainWindow.on('minimize', () => { mainWindow.hide(); });
      mainWindow.on('close', (e) => { e.preventDefault(); mainWindow.hide(); });
      tray = new Tray(path.resolve(__dirname, './img/video.png'));
      tray.on('click', () => {
        app.exit();
        // if (mainWindow.isVisible()) {
        //   mainWindow.hide();
        // } else {
        //   mainWindow.show();
        // }
      });
    }

    // mainWindow.once('ready-to-show', () => {
    //   mainWindow.show();
    // });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });
}
