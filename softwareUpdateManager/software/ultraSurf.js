'use strict'

let data = {
  useProxy: true,
  url: 'http://wujieliulan.com/',
  version: {
    selector: '#Right+div'
  },
  download: {
    plain: 'http://wujieliulan.com/download/u.exe'
  },
  install: function (output, iPath) {
    require('fs-extra').copyFileSync(output, iPath)
    return true
  }
}
module.exports = data
