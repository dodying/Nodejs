'use strict'

let data = {
  useProxy: true,
  url: 'https://github.com/2dust/v2rayN/releases/latest',
  version: {
    selector: '.release-title'
  },
  download: {
    selector: 'a[href$=".exe"]:has(small.text-gray)',
    attr: 'href'
  },
  install: function (output, iPath) {
    require('fs-extra').copyFileSync(output, iPath)
    return true
  }
}
module.exports = data
