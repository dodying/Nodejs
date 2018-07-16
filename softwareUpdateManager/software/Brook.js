'use strict'

let data = {
  useProxy: true,
  url: 'https://github.com/txthinking/brook/releases/latest',
  version: {
    selector: '.release .css-truncate-target'
  },
  download: {
    selector: 'a[href$="amd64.exe"]:has(small.text-gray)',
    attr: 'href'
  },
  install: function (output, iPath) {
    require('fs-extra').copyFileSync(output, iPath)
    return true
  }
}
module.exports = data
