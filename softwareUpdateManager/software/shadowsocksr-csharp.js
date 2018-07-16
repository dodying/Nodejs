'use strict'

let data = {
  useProxy: true,
  url: 'https://github.com/shadowsocksrr/shadowsocksr-csharp/releases',
  version: {
    selector: '.release-title'
  },
  download: {
    selector: 'a[href$=".zip"]:has(small.text-gray)',
    attr: 'href'
  },
  install: function (output, iPath) {
    return require('./../js/install')(output, iPath)
  }
}
module.exports = data
