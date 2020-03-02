// ==Headers==
// @Name:               config
// @Description:        config
// @Version:            1.0.78
// @Author:             dodying
// @Created:            2020-02-05 13:44:47
// @Modified:           2020-2-9 16:13:08
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
  let CONFIG = ipcRenderer.sendSync('config')
  let elems = $('div[name="config"]').find('input:not([type="button"]):not([type="file"]),select,textarea').toArray()

  elems.forEach(i => {
    let key = i.getAttribute('id').replace('config-', '')
    let value
    if (!(key in CONFIG)) return
    value = CONFIG[key]
    if (i.type === 'text' || i.type === 'hidden' || i.type === 'select-one' || i.type === 'number' || i.type === 'textarea') {
      i.value = value
    } else if (i.type === 'checkbox') {
      i.checked = value
    } else if (i.type === 'radio') {
      i.checked = (i.value === value)
    }
  })

  $('#config-btnSave').on('click', () => {
    let config = {}
    elems.forEach(i => {
      let key = i.getAttribute('id').replace('config-', '')
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

    let name = $(e.target).attr('name').replace('database-', '')
    let obj = {
      host: $('#config-host').val(),
      user: $('#config-user').val(),
      password: $('#config-password').val(),
      database: $('#config-database').val(),
      libraryFolder: $('#config-libraryFolder').val()
    }

    let result = ipcRenderer.sendSync('database-connect', obj, name)
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
