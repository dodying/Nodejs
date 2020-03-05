'use strict'

let removeOtherInfo = (text, reverse = false) => {
  let infoGroup = ['[]', '()', '{}', '【】']
  if (reverse) text = text.split('').reverse().join('')
  let group = reverse ? infoGroup.map(i => i.split('').reverse().join('')) : infoGroup
  group = group.map(i => i.split('').map(j => reEscape(j)))
  let re = group.map(i => `${i[0]}.*?${i[1]}`).join('|')
  re = new RegExp(`^(${re})`)
  let matched = text.match(re)
  while (matched) {
    text = text.replace(re, '').trim()
    matched = text.match(re)
  }
  if (reverse) text = text.split('').reverse().join('')
  return text
}
function reEscape (text) {
  // refer https://github.com/lodash/lodash/blob/master/escapeRegExp.js
  return text.replace(/[\\^$.*+?()[\]{}|-]/g, '\\$&')
}
function fullWidth2Half (str) { // 全角字符转半角
  // info: https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms
  // refer: https://www.cnblogs.com/html55/p/10298569.html
  let result = ''
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 12288) {
      result += String.fromCharCode(str.charCodeAt(i) - 12256)
      continue
    }
    if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375) result += String.fromCharCode(str.charCodeAt(i) - 65248)
    else result += String.fromCharCode(str.charCodeAt(i))
  }
  return result
}

let punctuation = `.?!,,;:""''--~_-_-#`
let punctuationJpn = '。？！，、；：“”‘’─－～＿—﹏–#'
let numberStr = '-.,\\s\\d零一二三四五六七八九十百千万零壹贰参肆伍陆柒捌玖拾佰仟萬'
let numberPrefixStr = '第|番外|総集|前|後|中|ch|vol|\\s'
let numberSuffixStr = '話|篇|幕|編|章'

let separatorRe = /\s[-_+・.]|[?!;:|~]/
let reLib = {
  numberJpn: new RegExp(`(${numberPrefixStr})([${numberStr}]+)?(${numberSuffixStr})?$`, 'i'),
  number: new RegExp(`[${numberStr}]+$`),
  punctuation: new RegExp(`[${reEscape(punctuation)}]+$`)
}
let reLibArr = Object.values(reLib)

let main = (text) => {
  let output = removeOtherInfo(text)
  output = removeOtherInfo(output, true)

  output = fullWidth2Half(output) // 转换为半角
  output = output.replace(new RegExp(`[${reEscape(punctuationJpn)}]`, 'g'), (str) => punctuation.substr(punctuationJpn.indexOf(str), 1)) // 转换标点符号为英文标点

  if (output.match(separatorRe)) { // 分隔符
    output = output.split(separatorRe).filter(i => i)[0].trim()
  }

  while (reLibArr.some(i => output.match(i))) {
    output = output.replace(reLibArr.filter(i => output.match(i))[0], '').trim()
  }

  // 首字母大写，其他小写(同时统一空白字符)
  output = output.replace(/\w+/g, all => all.slice(0, 1).toUpperCase() + all.slice(1).toLowerCase())

  return output
}
module.exports = main
