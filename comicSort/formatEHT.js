// ==Headers==
// @Name:               formatEHT
// @Description:        整理EHT.json
// @Version:            1.0.2
// @Author:             dodying
// @Date:               2019-2-16 16:34:28
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra
// ==/Headers==

// 设置

// 导入原生模块
const fs = require('fs-extra')
const path = require('path')

// 导入第三方模块

// Function
const combineText = (arr, textOnly = true) => {
  return arr instanceof Array ? arr.map(i => {
    if (i.type === 0) {
      return i.text
    } else if (!textOnly && i.type === 2) {
      return `"url("${i.src.replace(/http.?:/g, '')}")"`
    } else {
      return null
    }
  }).filter(i => i).join('\\A') : ''
}

// Main
const main = async () => {
  let content = fs.readFileSync('./EHT.json', 'utf-8')

  let out = {}

  JSON.parse(content).dataset.forEach(i => {
    let tags = {}
    i.tags.forEach(j => {
      if (j.name) {
        tags[j.name] = {
          cname: combineText(j.cname, true),
          info: combineText(j.info, true)
        }
      }
    })
    out[i.name] = {
      cname: combineText(i.cname, true),
      info: combineText(i.info, true),
      tags: tags
    }
  })

  fs.writeFileSync('EHT-format.json', JSON.stringify(out, null, 2))
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
