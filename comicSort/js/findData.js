'use strict'

const fs = require('fs')
const path = require('path')

const EHT = JSON.parse(fs.readFileSync(path.join(__dirname, './../EHT.json'), 'utf-8')).data
let Dataset = EHT
let _ = require('./../config')

const findData = (main, sub = undefined, textOnly = true) => {
  if (!main && !sub) return {}

  let data
  if (main) {
    data = Dataset.filter(i => i.namespace === main)
    if (data.length === 0) return {}
    if (sub === undefined) {
      return {
        name: main,
        cname: data[0].frontMatters.name,
        info: data[0].frontMatters.description
      }
    }
  } else {
    data = Dataset.filter(i => !['rows'].includes(i.namespace) && sub.replace(/_/g, ' ') in i.data)
    if (data.length) {
      main = data[0].namespace
    } else {
      return {}
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
