'use strict'

let data = {
  url: 'http://www.chuyu.me/zh-Hans/index.html',
  version: {
    selector: '.subh2'
  },
  download: {
    plain: '.butt-holder a[href$=".zip"]'
  },
  install: function (output, iPath) {
    return require('./../js/install')(output, iPath)
  }
}
module.exports = data
