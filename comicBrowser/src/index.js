// ==Headers==
// @Name:               index
// @Description:        index
// @Version:            1.0.831
// @Author:             dodying
// @Created:            2020-02-04 13:54:15
// @Modified:           2020-3-2 15:33:23
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron
// ==/Headers==
/* global Mousetrap */

// query
// 显示所有列 SHOW COLUMNS FROM files

// 全局变量
let scrollElement = $('html').get(0)
let lastTooltip = null

// 可自定义
let keypressTimeout = 80
let scrollHeight = 30
let keyMap = {
  up: ['w', 'up', '8'],
  down: ['s', 'down', '5'],
  left: ['a', 'left', '4'],
  right: ['d', 'right', '6'],
  upLeft: ['q', '7'],
  upRight: ['e', '9'],
  plus: ['+', '='],
  minus: ['-']
}
keyMap.shiftAndUp = keyMap.up.map(i => `shift+${i}`)
keyMap.shiftAndDown = keyMap.down.map(i => `shift+${i}`)

// 导入原生模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const electron = require('electron')

const findData = require('./../../comicSort/js/findData')
const ipcRenderer = electron.ipcRenderer
const EHT = JSON.parse(fs.readFileSync(path.join(__dirname, './../../comicSort/EHT.json'), 'utf-8')).data
findData.init(EHT)

// Function
async function configChange (func) {
  let CONFIG = ipcRenderer.sendSync('config')
  let noSave = await func(CONFIG)
  if (!noSave) ipcRenderer.sendSync('config', 'set', CONFIG)
}
function tooltip (option, content) {
  if (lastTooltip) lastTooltip.close()
  if (typeof option === 'string') {
    option = { title: option }
    if (typeof content !== 'undefined') option.content = content
  }
  return new Promise((resolve, reject) => {
    lastTooltip = $.confirm(Object.assign({
      theme: 'banner',
      boxWidth: '50%',
      useBootstrap: false,
      title: null,
      autoClose: 'ok|0',
      backgroundDismiss: 'ok',
      buttons: {
        ok: {
          text: 'OK',
          btnClass: 'btn-blue',
          keys: ['enter']
        }
      },
      onClose: function () {
        resolve()
        lastTooltip = null
      },
      onAction: function (btn) {
        resolve(btn)
        lastTooltip = null
      }
    }, option))
  })
}
let showResult = (rows = []) => {
  let CONFIG = ipcRenderer.sendSync('config')

  // category: "MANGA"
  // language: "zh"
  // time_upload: "2011-10-21T07:37:00.000Z"
  // time_download: "2019-12-23T05:46:00.000Z"
  // favorited: 635
  // pages: 195
  // path: "#Star\#阅览注意\EBA\[EBA] Datsu ☆ Imouto Sengen [Chinese].cbz"
  // rating: 4.85
  // size: 38598782
  // summary: "Uploader Comment: [EBA] 脱☆妹宣言 [Badluck1205掃圖#029] [2011-10]"
  // tags: {artist: Array(1), female: Array(5), language: Array(2), misc: Array(2)}
  // title: "[EBA] Datsu ☆ Imouto Sengen [Chinese]"
  // title_jpn: "[EBA] 脱☆妹宣言 [中国翻訳]"
  // uploader: "badluck1205"
  // web: "https://exhentai.org/g/424583/0542c0c2a9/"

  let html = [
    '<table>',
    '  <thead>',
    '    <th></th>',
    '    <th>类别</th>',
    // '    <th>语言</th>',
    '    <th>上传时间</th>',
    '    <th>下载时间</th>',
    '    <th>最近阅读</th>',
    // '    <th>星标</th>',
    '    <th>页数</th>',
    '    <th>评分</th>',
    // '    <th>大小</th>',
    '    <th>事件</th>',
    '    <th>标题</th>',
    '    <th>标题(日文)</th>',
    '    <th>路径</th>',
    // '    <th>上传者</th>',
    '  </thead>',
    '  <tbody>'
  ]
  let condition = encodeURIComponent(JSON.stringify(getCondition()))

  let order = 1
  for (let row of rows) {
    // tr
    let tagString = encodeURIComponent(row.tagString)
    let star = CONFIG.star && CONFIG.star[row.path] ? CONFIG.star[row.path] : 0
    let tr = `<tr path="${row.path}" star="${star}" tags="${tagString}">` // path 用于定位

    // td order
    tr += `<td>${order++}</td>`

    // td category
    tr += `<td>${row.category}</td>`

    // td language
    // tr += `<td>${row.language}</td>`

    // td time_upload,time_download,time_view
    let lastViewTime = CONFIG.lastViewTime && CONFIG.lastViewTime[row.path] ? CONFIG.lastViewTime[row.path] : null
    tr += `<td datetime="${row.time_upload}" sort-value="${new Date(row.time_upload).getTime()}"></td>`
    tr += `<td datetime="${row.time_download}" sort-value="${new Date(row.time_download).getTime()}"></td>`
    tr += `<td name="time_view" datetime="${lastViewTime}" sort-value="${new Date(lastViewTime).getTime()}"></td>`

    // td favorited
    // tr += `<td>${row.favorited}</td>`

    // td pages
    tr += `<td>${row.pages}</td>`

    // td rating
    let precent = row.rating / 5 * 100
    let color = row.rating >= 4 ? '#0f0' : row.rating >= 2.5 ? '#ff0' : '#f00'
    tr += `<td style="background:-webkit-linear-gradient(left, ${color} ${precent}%, white ${100 - precent}%);">${row.rating}</td>`

    // td size
    // tr += `<td>${(row.size / 1024 / 1024).toFixed(2)} MB</td>`

    // td Event
    tr += [
      '<td>',
      // `<a href="${row.path}" name="path" target="_blank">Open</a>`,
      `<a href="${row.path}" name="delete" target="_blank">Delete</a>`,
      ' ',
      `<a href="${row.web}" target="_blank">Web</a>`,
      '<br>',
      `<a name="native" href="./src/viewer.html?file=${encodeURIComponent(row.path)}">View</a>`,
      ' ',
      `<a name="native" href="./src/viewer.html?file=${encodeURIComponent(row.path)}&condition=${condition}">List</a>`,
      '<br>',
      '<button name="star"></button>',
      ' ',
      '<button name="clear">Clear</button>',
      '</td>'
    ].join('')

    // td title,title_jpn
    tr += `<td>${row.title}</td>`
    tr += `<td>${row.title_jpn}</td>`

    // td path
    tr += `<td>${path.dirname(row.path)}</td>`

    // td uploader
    // tr += `<td>${row.uploader}</td>`

    tr += '</tr>'
    html.push(tr)
  }
  html.push('</tbody>', '</table>')
  $('.result').html(html.join(''))
  updateRelativeTime()
  $('.result>table').tablesorter({
    theme: 'blackice',

    widthFixed: true,

    textAttribute: 'sort-value',
    widgets: ['zebra', 'filter'],
    widgetOption: {
      filter_defaultAttrib: 'sort-value',
      filter_saveFilters: false
    }
  }).on('sortEnd', function (e, t) {
    let condition = getCondition()
    let arr = $('.result tbody>tr').toArray().map(i => $(i).attr('path'))
    window.localStorage.setItem(JSON.stringify(condition), JSON.stringify(arr))
  })

  setTimeout(() => {
    let times = $('.result tbody>tr>td[name="time_view"]').toArray().map(i => $(i).attr('sort-value')).sort().reverse()
    if (times[0] !== '0') $(`.result tbody>tr:has(td[name="time_view"][sort-value="${times[0]}"])`).get(0).scrollIntoView()
  })
}
let showBookmarks = () => {
  let CONFIG = ipcRenderer.sendSync('config')
  if (!CONFIG.bookmarkCondition) return
  let conditions = CONFIG.bookmarkCondition
  let html = [
    '<ul>'
  ]
  for (let name in conditions) {
    let condition = JSON.stringify(conditions[name])
    condition = encodeURIComponent(condition)
    html.push(`<li><a name="native" href="./src/index.html?condition=${condition}">${name}</a></li>`)
  }
  html.push('</ul>')
  $('.bookmarks').html(html.join(''))
}
let showHistory = () => {
  let CONFIG = ipcRenderer.sendSync('config')
  if (!CONFIG.history) return
  let history = CONFIG.history
  let html = [
    '<ul>'
  ]
  for (let href of history) {
    let name = href.match(/^.\/src\//) ? 'native' : 'path'
    let text = decodeURIComponent(href.replace('./src/', ''))
    html.push(`<li><a name="${name}" href="${href}">${text}</a></li>`)
  }
  html.push('</ul>')
  $('.history').html(html.join(''))
}
let getCondition = () => {
  let condition = []
  let elems = $('.filter>.condition')

  for (let i = 0; i < elems.length; i++) {
    let parent = elems.eq(i)

    let not = parent.find('[name="not-condition"]').prop('checked')
    let column = parent.find('[name="column"]').val()
    let comparison = parent.find('.comparison:visible').val()
    let value = parent.find('.value:visible').val()
    let value1 = parent.find('.value:visible').eq(1).val()
    condition.push([not, column, comparison, value, value1])
  }
  return condition
}
let rememberLastCondition = () => {
  configChange((CONFIG) => {
    let condition = getCondition()
    if (CONFIG.rememberLastCondition) {
      CONFIG.lastCondition = condition
    } else {
      return true
    }
  })
}
let showCondition = (conditions) => {
  let CONFIG = ipcRenderer.sendSync('config')
  for (let i = 0; i < conditions.length; i++) {
    let [not, column, comparison, value, value1] = conditions[i]
    if (i !== 0) $('.filter').find('.condition>[name="new-condition"]').eq(-1).click()
    let parent = $('.filter').find('.condition').eq(-1)

    parent.find('[name="not-condition"]').prop('checked', not)
    parent.find('[name="column"]').val(column).trigger('change')
    parent.find('.comparison:visible').val(comparison)
    parent.find('.value:visible').val(value)
    parent.find('.value:visible').eq(1).val(value1)
  }
  if (CONFIG.fastQuery) $('.filter').find('[name="query"]').trigger('click')
}
let calcRelativeTime = (time) => {
  let lasttime = new Date(time).getTime()
  if (isNaN(lasttime)) return ''
  let delta = new Date().getTime() - lasttime
  let info = {
    ms: 1,
    s: 1000,
    m: 60,
    h: 60,
    d: 24,
    mh: 30,
    y: 12
  }
  let suf
  let t = delta
  for (let i in info) {
    let m = t / info[i] // 倍数
    let r = t % info[i] // 余数
    if (m >= 1 || info[i] - r <= 2) { // 进阶
      t = m
      suf = i
    } else {
      break
    }
  }
  t = Math.round(t)
  let double = '' // t > 1 ? 's' : ''
  let text = `${t}${suf}${double}`
  if (delta <= 1000 * 60 * 60 * 24 * 7 * 2) text = '<span class="highlight">' + text + '</span>'
  return text
}
let updateRelativeTime = () => {
  $('[datetime]').toArray().forEach(ele => {
    $(ele).html(calcRelativeTime($(ele).attr('datetime')))
  })
}
function waitInMs (time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
let updateTitleUrl = () => {
  let condition = getCondition()
  document.title = condition.map(i => i[3]).join('||')

  let params = new URLSearchParams()
  params.set('condition', JSON.stringify(condition))
  window.history.pushState(null, 'INDEX', '?' + params.toString())
}

// Main
const main = async () => {
  if (electron.remote.getCurrentWindow().id === 1 && ipcRenderer.sendSync('config', 'get', 'rememberLastTabs') && ipcRenderer.sendSync('config', 'get', 'lastTabs') && ipcRenderer.sendSync('config', 'get', 'lastTabs').length) {
    let confirm = await tooltip({
      title: '是否打开上次保存的网页',
      autoClose: 'cancel|10000',
      backgroundDismiss: 'cancel',
      buttons: {
        ok: {
          text: 'OK',
          btnClass: 'btn-red'
        },
        cancel: {
          text: 'Cancel',
          keys: ['enter'],
          btnClass: 'btn-blue'
        }
      }
    })
    if (confirm === 'ok') {
      if (ipcRenderer.sendSync('config', 'get', 'deleteLastTabs')) configChange(config => delete config.lastTabs)

      ipcRenderer.sendSync('open', ipcRenderer.sendSync('config', 'get', 'lastTabs'))
      electron.remote.getCurrentWindow().close()
      return
    }
  }

  let lastActiveElement = null

  // 条件
  $('.filter').on('click', '[name="toggle-not-condition"]', (e) => {
    let parent = $(e.target).parent()
    let checked = parent.find('[name="not-condition"]').prop('checked')
    parent.find('[name="not-condition"]').prop('checked', !checked)
  })
  $('.filter').on('change', '[name="column"]', (e) => {
    let parent = $(e.target).parent()
    let column = parent.find('[name="column"]').val()
    let type = parent.find('[name="column"]').find(`[value="${column}"]`).attr('type')
    parent.find('.comparison').addClass('hide')
    parent.find(`.comparison[name="comp-${type}"]`).removeClass('hide')
    parent.find('.value').addClass('hide')
    parent.find(type === 'datetime' ? '.value[name^="value-time"]' : '.value[name="value-common"]').removeClass('hide')
  })
  $('.filter').on('change', '.comparison', (e) => {
    let parent = $(e.target).parent()
    parent.find('.value:visible').trigger('input')
  })

  // 自动填充
  let typing = false
  $('.filter').on('compositionstart', '.value[name="value-common"]', async (e) => {
    typing = true
  })
  $('.filter').on('compositionend', '.value[name="value-common"]', async (e) => {
    typing = false
    $(document.activeElement).trigger('input')
  })
  $('.filter').on('keydown', '.value[name="value-common"]', async (e) => {
    lastActiveElement = e.target
    let hasItem = $('.datalist li').length
    let onItem = $('.datalistHover').index()
    if ((e.ctrlKey && e.key === 's')) {
      rememberLastCondition()
    } else if (hasItem && e.key.match(/^[0-9]$/)) {
      e.preventDefault()
      $('.datalist li').eq(e.key === '0' ? 9 : e.key - 1).click()
    } else if (hasItem && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
      if (['ArrowUp'].includes(e.key)) {
        onItem += -1
      } else if (['ArrowDown'].includes(e.key)) {
        onItem += 1
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        onItem += -10
      } else if (['ArrowRight', 'PageDown'].includes(e.key)) {
        onItem += 10
      } else if (['Home'].includes(e.key)) {
        onItem = 0
      } else if (['End'].includes(e.key)) {
        onItem = -1
      }
      while (onItem < 0 || onItem >= hasItem) {
        onItem += onItem < 0 ? hasItem : -hasItem
      }
      $('.datalistHover').removeClass('datalistHover')
      $('.datalist li').eq(onItem).addClass('datalistHover').get(0).scrollIntoView()
      $(window).scrollTop(0)
    } else if (onItem >= 0 && ['Enter', 'Insert'].includes(e.key)) {
      $('.datalistHover').click()
    }
    // console.log(e.key)
  })
  $('.filter').on('input', '.value[name="value-common"]', async (e) => { // TODO
    let value = $(e.target).val()
    let parent = $(e.target).parent()
    let column = parent.find('[name="column"]').val()
    let comparison = parent.find('.comparison:visible').val()
    $('.datalist>ol').empty()
    if (!['path', 'tags'].includes(column) || (value.length < 3 && !value.match(/[\u4e00-\u9fa5]/)) || typing) return
    if (column === 'path') {
      return
      // let query = `SELECT path FROM files WHERE path LIKE ${mysql.escape(`%${value.replace(/\\/g, '\\\\')}%`)} LIMIT 50`
      // let [rows] = await ipcRenderer.sendSync('database-query', query)
      // let html = []
      // rows.forEach(i => html.push(`<li>${i.path}</li>`))
      // $('.datalist>ol').html(html)
    } else if (column === 'tags') {
      let main = comparison.replace('tags:', '')
      let html = []
      let tags
      if (main === '*') {
        tags = EHT
      } else {
        tags = EHT.filter(i => i.name === main)[0]
      }

      tags.forEach(i => {
        for (let key in i.data) {
          if (key.match(value) || i.data[key].name.match(value)) {
            html.push(`<li cname="${i.data[key].name}">${key}</li>`)
          }
        }
      })

      html = [...(new Set(html))]
      $('.datalist>ol').html(html.join(''))
    }
    $('.datalist').show()
  })
  $('.filter').on('focusin', '.value[name="value-common"]', async (e) => {
    $('.datalist').show()
  })
  $('.filter').on('focusout', '.value[name="value-common"]', async (e) => {
    await waitInMs(200)
    $('.datalist').hide()
  })

  // 按钮-增删条件
  let cloned = $('.filter>.condition').clone()
  $('.filter').on('click', '[name="new-condition"]', (e) => {
    let parent = $(e.target).parent()
    cloned.clone().insertAfter(parent)
  })
  $('.filter').on('click', '[name="delete-condition"]', (e) => {
    let parent = $(e.target).parent()
    if ($('.filter>.condition').length <= 1) cloned.clone().insertBefore(parent)
    parent.remove()
  })

  // 按钮-查询
  $('.filter').find('[name="query"]').on('click', async (e) => {
    updateTitleUrl()
    rememberLastCondition()

    let condition = getCondition()

    let [rows] = ipcRenderer.sendSync('query-by-condition', condition)
    console.log(rows)
    window.localStorage.setItem(JSON.stringify(condition), JSON.stringify(rows.map(i => i.path)))
    showResult(rows)
  })

  // 按钮-保存/收藏
  $('.filter').find('[name="save-condition"]').on('click', async (e) => {
    rememberLastCondition()
  })
  $('.filter').find('[name="bookmark-condition"]').on('click', async (e) => {
    let condition = getCondition()
    let name = await new Promise((resolve, reject) => {
      $.confirm({
        theme: 'supervan',
        boxWidth: '30%',
        useBootstrap: false,
        title: 'Please put in NAME:',
        content: `<input name="name" style="width:95%;border:none;" value="${condition.map(i => i[3]).join('||')}">`,
        autoClose: 'cancel|20000',
        buttons: {
          submit: {
            text: 'Submit',
            btnClass: 'btn-blue',
            keys: ['enter'],
            action: function () {
              var name = this.$content.find('[name="name"]').val()
              resolve(name)
            }
          },
          cancel: function () {
            resolve(null)
          }
        },
        onContentReady: function () {
          this.$content.find('[name="name"]').focus()
        }
      })
    })
    if (!name) return
    configChange((CONFIG) => {
      if (!('bookmarkCondition' in CONFIG)) CONFIG.bookmarkCondition = {}
      CONFIG.bookmarkCondition[name.trim()] = condition
    })
  })

  // 按钮-打开新窗口
  $('.filter').find('[name="new-query"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/index.html?condition=%5B%5D')
  })
  $('.filter').find('[name="config"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/config.html')
  })
  $('.filter').find('[name="viewer"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/viewer.html')
  })

  // 按钮-更新数据库
  $('.filter').find('[name="database-update"]').on('click', async (e) => {
    ipcRenderer.sendSync('database-connect', undefined, 'update')
  })

  // 按钮-移动结果
  $('.filter').find('[name="move-files"]').on('click', async (e) => {
    if (!$('.query>.result tr[path]').length) return
    let result = electron.remote.dialog.showOpenDialogSync({
      properties: ['openDirectory']
    })
    if (result && result.length) {
      let dir = result[0]
      let libraryFolder = ipcRenderer.sendSync('config', 'get', 'libraryFolder')
      let files = $('.query>.result tr[path]').toArray().map(i => path.resolve(libraryFolder, $(i).attr('path')))
      let moveMode = path.parse(libraryFolder).root === path.parse(dir).root
      for (let file of files) {
        if (!fs.existsSync(file)) continue
        let fileNew = path.resolve(dir, path.basename(file))
        try {
          if (moveMode) {
            fs.renameSync(file, fileNew)
          } else {
            let info = fs.statSync(file)
            fs.writeFileSync(fileNew, fs.readFileSync(file))
            fs.utimesSync(fileNew, info.atime, info.mtime)
            ipcRenderer.send('open-external', file, 'delete')
          }
        } catch (error) {
          if (error.code === 'EBUSY') {
            console.error('File Locked: ' + file)
          } else {
            console.error(error)
          }
        }
      }
    }
  })

  // 自动填充-选择项点击
  $('.filter').on('click', '.datalist li', async (e) => {
    $(lastActiveElement).val($(e.target).text())
    $('.datalist').hide()
  })

  // 结果-预览图片
  let loading = false
  $('.result').on('mouseover', 'tr', (e) => {
    if (loading) return
    loading = true
    let CONFIG = ipcRenderer.sendSync('config')
    let target = e.currentTarget
    let file = $(target).attr('path')
    if (!file) {
      $('.preview').hide()
      loading = false
      return
    }
    let html = []
    let { dir, name } = path.parse(file)
    let src = path.resolve(CONFIG.libraryFolder, dir, name + '.jpg')

    let cover = $(target).attr('cover')
    if (!cover && fs.existsSync(src)) {
      let buffer = fs.readFileSync(src)
      let blob = new window.Blob([new Uint8Array(buffer)])
      cover = URL.createObjectURL(blob)
      $(target).attr('cover', cover)
    }
    html.push(`<img src="${cover}" />`)

    let tagsChs = $(target).prop('tagsChs')
    if (!tagsChs) {
      let tags = $(target).attr('tags')
      tags = decodeURIComponent(tags)
      tags = tags.split('\n')
      tagsChs = []
      for (let tag of tags) {
        let [main, subs] = tag.split(': ')
        let chs = findData(main).cname + ': '
        let subChs = []
        for (let sub of subs.split(', ')) {
          subChs.push(findData(main, sub).cname || sub)
        }
        tagsChs.push(chs + subChs.join(', '))
      }
      tagsChs = tagsChs.map(i => `<span>${i}</span>`).join('<br>')
      $(target).prop('tagsChs', tagsChs).attr('tags', null)
    }
    html.push(tagsChs)

    $('.preview').html(html.join('<br>')).show()
    loading = false
  })
  $('.result').on('mousemove', 'tr', (e) => {
    let _width = $('.preview').outerWidth()
    let _height = $('.preview').outerHeight()
    let left = _width + e.clientX + 10 < window.innerWidth ? e.clientX + 5 : e.clientX - _width - 5
    let top = _height + e.clientY + 10 < window.innerHeight ? e.clientY + 5 : e.clientY - _height - 5
    if (left < 0) left = 0
    if (top < 0) top = 0
    $('.preview').css({ left, top })
  })
  $('.result').on('mouseout', 'table', (e) => {
    $('.preview').hide()
  })

  // 结果-点击事件
  $('.result').on('click', 'tr', (e) => {
    $('.trHover').removeClass('trHover')
    let parent = $(e.target).parentsUntil('.result>table>tbody').eq(-1)
    parent.addClass('trHover')
  })
  $('.result').on('click', 'tr>td>button[name="star"]', async (e) => {
    e.preventDefault()
    let parent = $(e.target).parentsUntil('.result>table>tbody').eq(-1)
    let file = parent.attr('path')
    let star = parent.attr('star')
    star = star === '1' ? 0 : 1
    configChange((CONFIG) => {
      if (!('star' in CONFIG)) CONFIG.star = {}
      if (star === 1) {
        CONFIG.star[file] = star
      } else {
        delete CONFIG.star[file]
      }
    })
    parent.attr('star', star)
  })
  $('.result').on('click', 'tr>td>button[name="clear"]', async (e) => {
    e.preventDefault()
    let parent = $(e.target).parentsUntil('.result>table>tbody').eq(-1)
    let file = parent.attr('path')
    parent.find('[name="time_view"]').attr('datetime', 'null').attr('sort-value', 0)
    configChange((CONFIG) => {
      if (CONFIG.lastViewPosition && file in CONFIG.lastViewPosition) delete CONFIG.lastViewPosition[file]
      if (CONFIG.lastViewTime && file in CONFIG.lastViewTime) delete CONFIG.lastViewTime[file]
      if (CONFIG.history && CONFIG.history.includes(file)) CONFIG.history.splice(CONFIG.history.indexOf(file), 1)
    })
    updateRelativeTime()
  })

  // 侧边栏
  $('.btnBox>button').on('click', (e) => {
    let name = $(e.target).attr('name')
    let visible = $('.sidebar').filter(`.${name}`).is(':visible')
    $('.sidebar').hide()
    if (visible) {
      $('.btnBox').addClass('btnBox-hide')
    } else {
      $('.btnBox').removeClass('btnBox-hide')
      $('.sidebar').filter(`.${name}`).show()
      if (name === 'bookmarks') {
        showBookmarks()
      } else if (name === 'history') {
        showHistory()
      }
    }
  })

  // 全局事件
  $('body').on('click', 'a', async (e) => {
    e.preventDefault()
    let parent = $(e.target).parentsUntil('.result>table>tbody').eq(-1)
    let href = $(e.target).attr('href')
    let name = $(e.target).attr('name')
    let file = parent.attr('path')
    // name: native, path, delete, null
    if (name === 'native') {
      ipcRenderer.send('open', href)
    } else {
      ipcRenderer.send('open-external', href, name)
      if (name === 'path') {
        let date = new Date()
        configChange((CONFIG) => {
          if (!('lastViewTime' in CONFIG)) CONFIG.lastViewTime = {}
          CONFIG.lastViewTime[file] = date.toLocaleString('zh-CN', { hour12: false })
        })
        parent.find('[name="time_view"]').attr('datetime', date).attr('sort-value', date.getTime())
        waitInMs(1000).then(() => {
          updateRelativeTime()
        })
      }
    }
    configChange((CONFIG) => {
      if (!name || !CONFIG.rememberHistory) return true
      if (!('history' in CONFIG)) CONFIG.history = []
      CONFIG.history.unshift(href)
      CONFIG.history = [...(new Set(CONFIG.history))]
    })
  })

  // 全局快捷键
  let keypressLastTime = 0
  Mousetrap.bind([].concat(keyMap.up, keyMap.down), async (e, combo) => { // 上下键
    if (e.type === 'keypress' && new Date().getTime() - new Date(keypressLastTime).getTime() <= keypressTimeout) return

    if (keyMap.up.includes(combo)) { // 向上滚动
      scrollElement.scrollTop += -scrollHeight
    } else if (keyMap.down.includes(combo)) { // 向下滚动
      scrollElement.scrollTop += scrollHeight
    }

    keypressLastTime = new Date().getTime()
    return false
  })
  Mousetrap.bind([].concat(keyMap.left, keyMap.right), async (e, combo) => { // 左右键
    if (keyMap.left.includes(combo)) { // 向上滚动
      scrollElement.scrollTop += -scrollElement.clientHeight
    } else if (keyMap.right.includes(combo)) { // 向下滚动
      scrollElement.scrollTop += scrollElement.clientHeight
    }
    return false
  })
  Mousetrap.bind([].concat(keyMap.shiftAndUp, keyMap.shiftAndDown), (e, combo) => { // shift+上下键 滚动到顶部或底部
    scrollElement.scrollTop = keyMap.shiftAndUp.includes(combo) ? 0 : scrollElement.scrollHeight
    return false
  })

  // 连接数据库
  let result = ipcRenderer.sendSync('database-connect')
  if (result[1] !== 1) {
    ipcRenderer.send('open', './src/config.html')
    electron.remote.getCurrentWindow().close()
  }

  // 还原上次或链接里的条件
  let params = (new URL(document.location)).searchParams
  if (params.get('condition')) {
    showCondition(JSON.parse(params.get('condition')))
  } else if (ipcRenderer.sendSync('config', 'get', 'rememberLastCondition')) {
    showCondition(ipcRenderer.sendSync('config', 'get', 'lastCondition') || [])
  }
}

main().then(async () => {
  //
}, async err => {
  console.error(err)
  process.exit()
})