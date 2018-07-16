'use strict'

/**
 * @returns {boolean} if install completed
 * @param {string} js A js call next
 * @param {string} from A path to the install pack file.
 * @param {string} to A path to the install bin file.
 * @param {string} filterInZip The filter to real install pack in zipped file
 * @param {string} filter The filter to real install pack
 * @param {(string | array)} excludes what files you don't want to install
 */

let install = (js, from, to, filterInZip = undefined, filter = undefined, excludes = undefined) => {
  const path = require('path')
  const fse = require('fs-extra')

  require('child_process').execSync(`plugins\\7z.exe e -y -o"archive\\unzip" "${from}" ${filterInZip || ''}`)
  let list = fse.readdirSync('archive\\unzip')
  let fromNew = filter ? list.filter(i => i.match(filter))[0] : list[0]
  fromNew = path.resolve(path.parse(from).dir, 'unzip', fromNew)
  let installed = require('./' + js)(fromNew, to, excludes)
  return installed
}

module.exports = install
