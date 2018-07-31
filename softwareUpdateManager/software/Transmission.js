'use strict'

let data = {
  useProxy: true,
  url: 'https://github.com/transmission/transmission/releases/latest',
  version: {
    selector: '.release-title'
  },
  download: {
    plain: 'https://github.com/transmission/transmission-releases/raw/master/transmission-{version}-x64.msi'
  },
  install: function (output, iPath) {
    return require('./../js/install_msi')(output, iPath)
  }
}
module.exports = data
