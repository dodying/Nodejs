'use strict'

let Dataset
let _ = require('./../config')

const findData = (main, sub = undefined, textOnly = true) => {
  let data = Dataset.filter(i => i.namespace === main)
  if (data.length === 0) return {}
  if (sub === undefined) {
    return {
      name: main,
      cname: data[0].frontMatters.name,
      info: data[0].frontMatters.description
    }
  }
  let data1 = data[0].data[sub.replace(/_/g, ' ')]
  if (!data1) {
    if (sub.match(' \\| ')) {
      let arr = sub.split(' | ').map(i => i.replace(/_/g, ' '))
      data1 = data[0].data[arr[0]]
    }
  }
  if (data1) {
    let info = data1.intro
    let cname = data1.name
    if (textOnly) {
      info = info.replace(/!\[(.*?)\]\((.*?)\)/g, '').replace(_.emojiRegExp, '')
      cname = cname.replace(/!\[(.*?)\]\((.*?)\)/g, '').replace(_.emojiRegExp, '')
    }
    return {
      name: main === 'misc' ? sub : main + ':' + sub,
      cname: cname,
      info: info
    }
  } else {
    return {}
  }
}

findData.init = (obj) => {
  Dataset = obj
}

module.exports = findData
