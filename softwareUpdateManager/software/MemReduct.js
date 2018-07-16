'use strict'

let data = {
  url: 'https://github.com/henrypp/memreduct/releases/latest',
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
