// ==Headers==
// @Name:               main
// @Description:        main
// @Version:            1.0.99
// @Author:             dodying
// @Created:            2020-02-09 16:15:40
// @Modified:           2020-3-3 21:21:09
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==
/* global electron, ipcRenderer, Mousetrap */

(async () => {
  $('body').on('mousemove', (e) => {
    const leftPercent = Math.round(e.clientX / $('body').prop('clientWidth') * 100)
    const topPercent = Math.round(e.clientY / $('body').prop('clientHeight') * 100)
    if (leftPercent >= 90 && topPercent <= 10) {
      if ($('.title-bar-btns').length) {
        $('.title-bar-btns:hidden').show()
      } else {
        $('<div class="title-bar-btns"></div>').html([
          '<button name="min">_</button>',
          '<button name="max">□</button>',
          '<button name="close">×</button>'
        ].join('')).css({
          position: 'fixed',
          top: '0px',
          right: '0px'
        }).appendTo('body')
        $('.title-bar-btns:visible').on('mouseup', 'button', (e) => {
          e.preventDefault()

          const name = $(e.target).attr('name')
          const button = e.button
          if (name === 'min' && button === 0) {
            electron.remote.getCurrentWindow().minimize()
          } else if (name === 'min' && button === 2) {
            ipcRenderer.send('hide-tab', electron.remote.getCurrentWindow().id)
          } else if (name === 'max' && button === 0) {
            if (electron.remote.getCurrentWindow().isMaximized()) {
              electron.remote.getCurrentWindow().unmaximize()
            } else {
              electron.remote.getCurrentWindow().maximize()
            }
          } else if (name === 'max' && button === 2) {
            electron.remote.getCurrentWindow().setFullScreen(!electron.remote.getCurrentWindow().isFullScreen())
          } else if (name === 'close' && button === 0) {
            electron.remote.getCurrentWindow().close()
          } else if (name === 'close' && button === 2) {
            ipcRenderer.send('close-all-tabs')
          }

          return false
        })
      }
    } else {
      $('.title-bar-btns').hide()
    }
  })

  Mousetrap.bind('ctrl+shift+q', function () {
    ipcRenderer.send('close-all-tabs')
    return false
  })
  Mousetrap.bind('esc', function () {
    electron.remote.getCurrentWindow().close()
    return false
  })
  Mousetrap.bind('ctrl+shift+s', function () {
    ipcRenderer.send('save-last-tabs')
    return false
  })
  Mousetrap.bind('ctrl+`', function () {
    ipcRenderer.send('hide-all-tabs')
    return false
  })
  Mousetrap.bind('`', function () {
    ipcRenderer.send('hide-tab', electron.remote.getCurrentWindow().id)
    return false
  })
  Mousetrap.bind('ctrl+t', function () {
    ipcRenderer.send('open', './src/index.html')
    return false
  })
})().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
