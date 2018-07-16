'use strict'

let data = {
  useProxy: true,
  url: 'https://github.com/yinghuocho/firefly-proxy/releases/latest',
  version: {
    selector: '.release-title'
  },
  download: {
    plain: 'https://raw.githubusercontent.com/xiayhc/yhc/master/greenyhc.exe'
  },
  install: function (output, iPath) {
    require('fs-extra').copyFileSync(output, iPath)
    return true
  }
}
module.exports = data
