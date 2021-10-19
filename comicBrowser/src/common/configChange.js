// ==Headers==
// @Name:               configChange
// @Description:        configChange
// @Version:            1.0.1
// @Author:             dodying
// @Created:            2020-03-15 20:00:07
// @Modified:           2020-3-15 20:01:16
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron
// ==/Headers==

const { ipcRenderer } = require('electron');

const main = async function configChange(func, name = 'config') {
  const value = ipcRenderer.sendSync(name);
  const noSave = await func(value);
  if (!noSave) ipcRenderer.sendSync(name, 'set', value);
};
module.exports = main;
