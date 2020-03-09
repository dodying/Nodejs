'use strict'

module.exports = function reEscape (text) {
  // refer https://github.com/lodash/lodash/blob/master/escapeRegExp.js
  return text.replace(/[\\^$.*+?()[\]{}|-]/g, '\\$&')
}
