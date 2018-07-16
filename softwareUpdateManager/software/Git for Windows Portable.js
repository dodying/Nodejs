'use strict'

let data = {
  useProxy: true,
  url: 'https://github.com/git-for-windows/git/releases/latest',
  version: {
    selector: '.release-title'
  },
  download: {
    selector: 'a[href*="PortableGit"][href$="64-bit.7z.exe"]:has(small.text-gray)',
    attr: 'href'
  },
  install: function (output, iPath) {
    return require('./../js/install')(output, iPath)
  }
}
module.exports = data
