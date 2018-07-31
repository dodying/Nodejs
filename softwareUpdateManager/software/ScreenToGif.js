'use strict'

let data = {
  useProxy: true,
  url: 'https://github.com/NickeManarin/ScreenToGif/releases/latest',
  version: {
    selector: '.release-title'
  },
  download: {
    selector: 'a[href$="Portable.zip"]:has(small.text-gray)',
    attr: 'href'
  },
  install: function (output, iPath) {
    return require('./../js/install')(output, iPath)
  }
}
module.exports = data
