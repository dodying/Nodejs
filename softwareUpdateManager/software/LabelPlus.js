'use strict'

let data = {
  useProxy: true,
  url: 'https://github.com/LabelPlus/LabelPlus/releases/latest',
  version: {
    selector: '.release-title'
  },
  download: {
    selector: 'a[href$=".7z"]:has(small.text-gray)',
    attr: 'href'
  },
  install: function (output, iPath) {
    return require('./../js/install')(output, iPath)
  }
}
module.exports = data
