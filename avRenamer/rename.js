#!/usr/bin/env node

// ==Headers==
// @Name:               rename
// @Description:        重命名
// @Version:            1.0.83
// @Author:             dodying
// @Modified:           2019-8-6 13:28:59
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            readline-sync
// ==/Headers==

// 设置
// const CONFIG = require('./config')

// 导入原生模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const readlineSync = require('readline-sync')

//
const exts = ['.264', '.265', '.3g2', '.3ga', '.3gp', '.3gp2', '.3gpp', '.ac3', '.aif', '.aifc', '.alac', '.amv', '.aob', '.asf', '.avi', '.bdmv', '.bik', '.diva', '.divx', '.dsa', '.dsm', '.dsv', '.dts', '.dvr-ms', '.evo', '.f4v', '.flc', '.fli', '.flic', '.flv', '.h264', '.h265', '.hdm', '.hdmov', '.hevc', '.hm10', '.ifo', '.ismv', '.ivf', '.m1a', '.m1v', '.m2a', '.m2p', '.m2t', '.m2ts', '.m2v', '.m3u', '.m3u8', '.m4v', '.mid', '.midi', '.mk3d', '.mkv', '.mlp', '.mov', '.mp2v', '.mp4', '.mp4v', '.mpa', '.mpe', '.mpeg', '.mpg', '.mpls', '.mpv2', '.mpv4', '.mts', '.mxf', '.ofs', '.ogm', '.ogv', '.pva', '.ram', '.ratd', '.rec', '.rm', '.rme', '.rmf', '.rmi', '.rmm', '.roq', '.rp', '.rt', '.sfd', '.smil', '.smk', '.snd', '.ssif', '.swf', '.tp', '.tpe', '.tpf', '.trp', '.ts', '.tse', '.tsf', '.vc1', '.vob', '.webm', '.wm', '.wme', '.wmf', '.wmp', '.wmv', '.wtv', '.y4m', '.rmvb']

const getNum = text => { // 尝试修改名称
  text = text.replace(/mp4$/i, '')
  text = text.match(/[^h_0-9].*/)[0]
  text = text.replace(/^tk|tk$/g, '').replace(/00([0-9]{3})/g, '$1').replace(/([a-z]+)([0-9]+)/gi, '$1-$2').replace(/([a-z]+-[0-9]+)(R|C|)/i, '$1')
  text = text.toUpperCase().trim()
  return text
}

const main = async () => {
  let workdir = [].concat(process.cwd(), process.argv.splice(2)).map(i => path.resolve(process.cwd(), i)).filter((item, index, array) => array.indexOf(item) === index && fs.existsSync(item))

  for (let thisdir of workdir) {
    let items = fs.readdirSync(thisdir).filter(i => exts.includes(path.extname(i).toLowerCase()))
    console.log(`Amount:\t${items.length}`)

    items = items.map(i => {
      let ext = i.match(/\.\w{2,4}$/)[0]
      let t = i.replace(/\.\w{2,4}$/, '').replace(/^\[.*?\]|\[.*?\]$/g, '').toUpperCase() + ext
      let tryNum = getNum(t.replace(/\.\w{2,4}$/, '').replace(/-C$/i, '')) + ext

      if (t !== tryNum) {
        console.log(`Rename ${i} ==> ${tryNum} ? or put in (without Extension)`)
        let input = readlineSync.question()
        tryNum = input ? input + ext : tryNum
      }

      if (i !== tryNum) {
        let target = path.resolve(thisdir, tryNum)
        let targetOld = path.resolve(thisdir, i)
        if (!fs.existsSync(target) || i.toUpperCase() === tryNum.toUpperCase()) {
          fs.renameSync(targetOld, target)
        }
      }
    })
  }
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})
