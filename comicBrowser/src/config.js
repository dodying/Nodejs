// ==Headers==
// @Name:               config
// @Description:        config
// @Version:            1.0.80
// @Author:             dodying
// @Created:            2020-02-05 13:44:47
// @Modified:           2020-3-9 16:52:20
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron
// ==/Headers==

// 设置

// 导入原生模块

// 导入第三方模块
const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

// Function
const funcConfig = () => {
  const CONFIG = ipcRenderer.sendSync('config')
  const elems = $('div[name="config"]').find('input:not([type="button"]):not([type="file"]),select,textarea').toArray()

  elems.forEach(i => {
    const key = i.getAttribute('id').replace('config-', '')
    if (!(key in CONFIG)) return
    const value = CONFIG[key]
    if (i.type === 'text' || i.type === 'hidden' || i.type === 'select-one' || i.type === 'number' || i.type === 'textarea') {
      i.value = value
    } else if (i.type === 'checkbox') {
      i.checked = value
    } else if (i.type === 'radio') {
      i.checked = (i.value === value)
    }
  })

  $('#config-btnSave').on('click', () => {
    const config = {}
    elems.forEach(i => {
      const key = i.getAttribute('id').replace('config-', '')
      let value
      if (i.type === 'number') {
        value = (i.value || i.placeholder) * 1
        if (isNaN(value)) return
      } else if (i.type === 'text' || i.type === 'hidden' || i.type === 'textarea') {
        value = i.value || i.placeholder
      } else if (i.type === 'checkbox') {
        value = i.checked
      } else if (i.type === 'select-one') {
        value = i.value
      } else if (i.type === 'radio') {
        if (!i.checked) return
        value = i.value
      }
      config[key] = value
    })
    ipcRenderer.send('config', 'set', config)
  })
}

// Main
const main = async () => {
  funcConfig()

  // 数据库-按钮
  $('div[name="config"]').find('[name="database"]>input[type="button"][name^="database-"]').on('click', (e) => {
    $('div[name="config"]').find('[name="database"]>input[type="button"][name^="database-"]').attr('disabled', 'disabled')
    $('div[name="config"]').find('[name="database"]>[name="database-result"]').text('请求进行中')

    const name = $(e.target).attr('name').replace('database-', '')
    const obj = {
      host: $('#config-host').val(),
      user: $('#config-user').val(),
      password: $('#config-password').val(),
      database: $('#config-database').val(),
      libraryFolder: $('#config-libraryFolder').val()
    }

    const result = ipcRenderer.sendSync('database-connect', obj, name)
    $('div[name="config"]').find('[name="database"]>[name="database-result"]').text(result[0])
    $('div[name="config"]').find('[name="database"]>input[type="button"][name^="database-"]').removeAttr('disabled')
  })

  // 打开新窗口
  $('#config-btnCancel').on('click', (e) => {
    ipcRenderer.send('open', './src/index.html')
    electron.remote.getCurrentWindow().close()
  })
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
