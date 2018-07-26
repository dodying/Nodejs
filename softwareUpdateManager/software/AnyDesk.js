'use strict'

let data = {
  commercial: true,
  url: 'https://anydesk.com/platforms/windows',
  version: {
    selector: '#updates .u-type-bold'
  },
  download: {
    plain: 'http://download.anydesk.com/AnyDesk.exe'
  },
  install: function (output, iPath) {
    require('fs-extra').copyFileSync(output, iPath)
    return true
  }
}
module.exports = data
