// ==Headers==
// @Name:               viewer
// @Description:        viewer
// @Version:            1.0.1072
// @Author:             dodying
// @Created:            2020-02-08 18:17:38
// @Modified:           2020-3-10 10:31:16
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron,jszip
// ==/Headers==
/* global Mousetrap */

// 全局变量
let loading = null;
let pageAnchor = null;
let zipContent = null;
let fileList = null;
let lastTooltip = null;
let viewInfo = {
  file: '', // 仅在showFile时修改
  page: '',
  condition: ''
};
let fileInfo = null;
let viewTime = null;
const mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc'];
const scrollElement = $('.content').get(0);

// 设置
const sevenZip = '7z';
const viewTimeMin = 10 * 1000;
const viewPageMin = 3;
const mousemoveDelay = 50;
const fixHeight = 1; // TO ENHANCEMENT 1px 待测试
const keypressTimeout = 80; // 小于此时间的keypress事件不触发
const scorllMode = 'jquery'; // jquery||auto
const scrollHeight = 50; // 滚动高度
const scrollTime = 200; // 仅jquery，每滚动单位高度（可视页面高度）所需时间
const scrollTimeMax = 2000; // 仅jquery，滚动最大时间
let zoomPercent = 120; // 缩放百分比
const zoomPercentStep = 5; // 缩放百分比间隔
const loadPageHeight = 100; // 距离底部或顶部多高时，读取页面
const keyMap = {
  // 全局通用
  separator: [],
  closeAllTabs: ['ctrl+t'],
  closeTab: ['esc'],
  saveAllTabs: ['ctrl+shift+s'],
  hideAllTabs: ['ctrl+`'],
  hideTab: ['`'],
  openNewTab: ['ctrl+t'],

  help: ['f1'],
  openFile: ['f2', 'ctrl+o'],
  closeAndSave: ['f3'],
  closeAndClear: ['f4'],
  showFileList: ['f5'],
  readingList: ['f6'],
  starList: ['f7'],
  historyList: ['f8'],
  deletePage: ['del'],
  deleteFile: ['shift+del'],
  reload: ['r'],
  jumpToPageTop: ['t'],
  findByTags: ['f'],
  starFile: ['z'],
  plus: ['+', '='],
  minus: ['-'],

  up: ['w', 'up', '8'],
  down: ['s', 'down', '5'],
  left: ['a', 'left', '4'],
  right: ['d', 'right', '6'],
  upLeft: ['q', '7'],
  upRight: ['e', '9']
};
const keyHelp = {
  help: '显示帮助',
  openFile: '打开文件',
  closeAndSave: '关闭并保存记录',
  closeAndClear: '关闭并清除记录',
  showFileList: '显示文件列表',
  readingList: '显示阅读列表',
  starList: '显示星标列表',
  historyList: '显示历史列表',
  deletePage: '删除当前页',
  deleteFile: '删除当前文件',
  reload: '重载页面',
  jumpToPageTop: '对位到当前页顶部',
  findByTags: '根据标签查找相似书籍',
  starFile: '星标书籍',
  plus: '放大',
  minus: '缩小',

  // 全局通用
  separator: '全局通用',
  closeAllTabs: '关闭所有窗口',
  closeTab: '关闭当前窗口',
  saveAllTabs: '保存所有窗口',
  hideAllTabs: '隐藏所有窗口',
  hideTab: '隐藏当前窗口',
  openNewTab: '新建窗口',

  up: '向上翻页/打开上一本',
  down: '向下翻页/打开下一本',
  left: '向上翻页/打开上一本',
  right: '向下翻页/打开下一本',
  shiftAndUp: '滚动到顶部',
  shiftAndDown: '滚动到底部',
  upLeft: '打开上一本',
  upRight: '打开下一本'
};
keyMap.shiftAndUp = keyMap.up.map(i => `shift+${i}`);
keyMap.shiftAndDown = keyMap.down.map(i => `shift+${i}`);
const pageLoadCount = 5; // 一次载入多少页
const nextPageTop = 200; // 图片距离顶部多远视为下一页

// 导入原生模块
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

// 导入第三方模块
const electron = require('electron');
const JSZip = require('jszip');

const waitInMs = require('./../../_lib/waitInMs');
const parseInfo = require('./../js/parseInfo');
const findData = require('./../js/findData');
const removeOtherInfo = require('./../js/removeOtherInfo');
const ipcRenderer = electron.ipcRenderer;
const Menu = electron.remote.Menu;

// Function
async function configChange (func) {
  const CONFIG = ipcRenderer.sendSync('config');
  const noSave = await func(CONFIG);
  if (!noSave) ipcRenderer.sendSync('config', 'set', CONFIG);
}
function tooltip (option, content) {
  if (lastTooltip) lastTooltip.close();
  if (typeof option === 'string') {
    option = { title: option };
    if (typeof content !== 'undefined') option.content = content;
  }
  return new Promise((resolve, reject) => {
    lastTooltip = $.confirm(Object.assign({
      theme: 'banner',
      boxWidth: '50%',
      useBootstrap: false,
      title: null,
      content: viewInfo.file,
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
        resolve();
        lastTooltip = null;
      },
      onAction: function (btn) {
        resolve(btn);
        lastTooltip = null;
      }
    }, option));
  });
}
const getCurrentPage = () => {
  let onView = $('.content>div').eq(-1);
  for (const ele of $('.content>div').toArray()) {
    if ($(ele).offset().top > nextPageTop) {
      onView = $('.content>div').eq($(ele).index() - 1);
      break;
    }
  }

  viewInfo.page = onView.attr('name');

  const img = $(`.content>div[name="${viewInfo.page}"]>img`).attr('src');
  $('.preview>div:nth-child(2)').attr('name', viewInfo.page).html(`<img src="${img}">`);
};
const getNaturalWidth = (src) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = function () {
      resolve(this.width);
    };
    img.src = src;
  });
};
const loadImage = async (reverse) => {
  $('.content').attr('disable-scroll', 'true');

  let count = 0;
  let i = reverse ? fileList.indexOf($('.content>div').eq(0).attr('name')) - 1 : pageAnchor;
  for (; ;) {
    if (i < 0 || i >= fileList.length) break;
    const name = fileList[i];
    if (count >= pageLoadCount) break;
    count++;
    const blob = await zipContent.files[name].async('blob');
    const imageUrl = URL.createObjectURL(blob);
    const width = await getNaturalWidth(imageUrl);
    const ele = $(`<div name="${name}"><img src="${imageUrl}" /></div>`).css('width', width * zoomPercent / 100);

    if (reverse) {
      ele.prependTo('.content');
      i--;
    } else {
      ele.appendTo('.content');
      i++;
    }
  }
  if (!reverse) pageAnchor = i;

  $('.content').removeAttr('disable-scroll');
  getCurrentPage();
  const goon = reverse ? i >= 0 : i < fileList.length;
  return count >= pageLoadCount && goon; // 是否可以继续加载
};
const jumpToImage = async (page) => {
  if (!fileList.includes(page)) return;
  const index = fileList.indexOf(page);
  const indexFirst = fileList.indexOf($('.content>div').attr('name'));
  const reverse = index < indexFirst;
  let pageLeft = true;
  while (true) {
    const pageFind = $(`.content>div[name="${page}"]`);
    if (pageFind.length) {
      $('.content').attr('disable-scroll', 'true');
      scrollTop(pageFind.offset().top);
      $('.content').removeAttr('disable-scroll');
      break;
    } else if (pageLeft) {
      pageLeft = await loadImage(reverse);
    } else {
      break;
    }
  }
};
const rememberPosition = async (noTooltip) => {
  if (!viewInfo.file || isNaN(viewTime) || new Date().getTime() - viewTime < viewTimeMin || fileList.indexOf(viewInfo.page) < viewPageMin) return;
  await configChange((CONFIG) => {
    if (!('lastViewPosition' in CONFIG)) CONFIG.lastViewPosition = {};
    CONFIG.lastViewPosition[viewInfo.file] = viewInfo.page;

    if (!('lastViewTime' in CONFIG)) CONFIG.lastViewTime = {};
    const date = new Date();
    CONFIG.lastViewTime[viewInfo.file] = date.toLocaleString('zh-CN', { hour12: false });

    if (CONFIG.rememberHistory) {
      if (!('history' in CONFIG)) CONFIG.history = [];
      const params = new URLSearchParams();
      for (const key in viewInfo) {
        if (viewInfo[key] && !(['page'].includes(key))) params.set(key, viewInfo[key]);
      }
      CONFIG.history.unshift(`./src/viewer.html?${params.toString()}`);
      CONFIG.history = [...(new Set(CONFIG.history))];
    }
  });
  if (!noTooltip) await tooltip('记录已保存');
};
const showFile = async (option = {}) => {
  // option:
  //  page: string
  //  relativeBook: string 'prev','next'
  if (loading) return;
  const params = (new URL(document.location)).searchParams;
  let file = params.get('file');
  if (!file) {
    await tooltip('缺少参数', null);
    onLoadError();
    return;
  }
  const CONFIG = ipcRenderer.sendSync('config');
  let page = option.page;
  const condition = params.get('condition');

  let fullpath = path.resolve(CONFIG.libraryFolder, file);

  if (option.relativeBook) {
    let files;
    if (condition) {
      if ('list_' + condition in window.localStorage) {
        files = JSON.parse(window.localStorage.getItem('list_' + condition));
      } else {
        const conditionArr = JSON.parse(condition);
        const [rows] = ipcRenderer.sendSync('query-by-condition', conditionArr);
        files = rows.map(i => i.path);
        window.localStorage.setItem('list_' + condition, JSON.stringify(files));
      }
    } else {
      const dirname = path.dirname(file);
      files = fs.readdirSync(path.dirname(fullpath));
      files = files.filter(i => ['.cbz', '.zip'].includes(path.extname(i))).map(i => path.join(dirname, i));
    }
    let index = files.indexOf(file);
    if (option.relativeBook === 'prev') {
      if (index - 1 >= 0) {
        fullpath = path.resolve(CONFIG.libraryFolder, files[index - 1]);
        while (!fs.existsSync(fullpath)) {
          await tooltip('文件不存在，继续查找上一本', fullpath);
          index = index - 1;
          if (index <= 0) break;
          fullpath = path.resolve(CONFIG.libraryFolder, files[index - 1]);
        }
      }
      if (index === 0) {
        await tooltip('本书籍为第一本', fullpath);
        onLoadEnd();
        return;
      }
    } else if (option.relativeBook === 'next') {
      if (index + 1 <= files.length - 1) {
        fullpath = path.resolve(CONFIG.libraryFolder, files[index + 1]);
        while (!fs.existsSync(fullpath)) {
          await tooltip('文件不存在，继续查找下一本', fullpath);
          index = index + 1;
          if (index >= files.length - 1) break;
          fullpath = path.resolve(CONFIG.libraryFolder, files[index + 1]);
        }
      }
      if (index === files.length - 1) {
        await tooltip('本书籍为最后一本', fullpath);
        onLoadEnd();
        return;
      } else {
        fullpath = path.resolve(CONFIG.libraryFolder, files[index + 1]);
      }
    }
    rememberPosition();
  }

  if (!fs.existsSync(fullpath)) {
    await tooltip('文件不存在', fullpath);
    onLoadError();
    return;
  }

  file = path.relative(CONFIG.libraryFolder, fullpath);

  $('.content').empty().focus();
  $('.titlebar').html('正在载入，请稍后').show();
  loading = true;
  zipContent = null;
  fileList = null;

  const targetData = fs.readFileSync(fullpath);
  const jszip = new JSZip();
  try {
    zipContent = await jszip.loadAsync(targetData);
  } catch (error) {
    await tooltip('文件无法读取', fullpath);
    onLoadError();
    return;
  }
  fileList = Object.keys(zipContent.files);

  // 检测有无info.txt
  if (fileList.filter(item => item.match(/(^|\/)info\.txt$/)).length === 0) {
    fileInfo = null;
  } else {
    const infoFile = fileList.find(item => item.match(/(^|\/)info\.txt$/));
    const data = await zipContent.files[infoFile].async('text');
    fileInfo = parseInfo(data);
  }

  fileList = fileList.filter(i => ['.jpg', '.png', '.gif'].includes(path.extname(i)));

  if (!page && CONFIG.lastViewPosition && CONFIG.lastViewPosition[file]) page = CONFIG.lastViewPosition[file];
  if (!page || !fileList.includes(page)) page = fileList[0];

  viewInfo = { file, page, condition };

  if (condition) {
    window.localStorage.setItem(condition, file);
  }
  // updateTitleUrl()

  pageAnchor = fileList.includes(page) ? fileList.indexOf(page) : 0;
  await jumpToImage(page);

  $('.content').removeAttr('disable-scroll');
  document.title = path.basename(file) + '\\' + (page || '');
  onLoadEnd();
};
const openFile = async () => {
  const CONFIG = ipcRenderer.sendSync('config');
  const result = electron.remote.dialog.showOpenDialogSync({
    defaultPath: path.resolve(CONFIG.libraryFolder, viewInfo.file ? path.dirname(viewInfo.file) : ''),
    filters: [{
      name: '漫画压缩包',
      extensions: ['cbz', 'zip']
    }, {
      name: '所有类型',
      extensions: ['*']
    }],
    properties: ['openFile']
  });
  if (result && result.length) {
    const fullpath = result[0];
    const file = path.relative(CONFIG.libraryFolder, fullpath);
    viewInfo = { file };
    updateTitleUrl();
    await showFile();
  }
};
const onLoadEnd = () => {
  $('.titlebar').hide();
  if (viewInfo.file) {
    const value = fileList.indexOf(viewInfo.page) + 1;
    $('.statusbar>[name="range"]').attr('max', fileList.length).val(value);
    $('.statusbar>[name="current"]').text(value);
    $('.statusbar>[name="max"]').text(fileList.length);
    $('.openfile').hide();
    viewTime = new Date().getTime();
  } else {
    viewTime = null;
  }
  loading = false;
  updateTitleUrl();
};
const onLoadError = () => {
  // viewInfo.file = ''
  onLoadEnd();
};
const updateTitleUrl = () => {
  let title = 'VIEWER';
  let url = null;
  if (!viewInfo.file) {
    url = window.location.origin + window.location.pathname;
  } else {
    const params = new URLSearchParams();
    for (const key in viewInfo) {
      if (viewInfo[key] && !(['page'].includes(key))) params.set(key, viewInfo[key]);
    }
    url = '?' + params.toString();
    title = path.basename(viewInfo.file) + '\\' + (viewInfo.page || '');
  }
  document.title = title;
  window.history.pushState(null, title, url);
};
const showFileList = (files, title) => {
  const html = [
    '<div style="text-align:justify;">',
    '<ul>'
  ];
  for (const file of files) {
    html.push(`<li><span name="${file}" style="cursor:pointer;">${file}</span></li>`);
  }
  html.push('</ul>', '</div>');
  tooltip({
    theme: 'supervan',
    boxWidth: '80%',
    title: title || 'File List:',
    content: html.join(''),
    autoClose: null,
    onContentReady: function () {
      const fileThis = $(this.$content).find(`li:has(span[name="${window.CSS.escape(viewInfo.file)}"])`);
      if (fileThis.length) fileThis.css('color', 'red').get(0).scrollIntoView();
      $(this.$content).find('li>span[name]').on('click', async (e) => {
        await rememberPosition(true);
        this.close();
        const name = $(e.target).attr('name');
        viewInfo.file = name;
        updateTitleUrl();
        await showFile();
      });
    }
  });
};
const scrollTop = (top, left = 0, speed, absolute = false) => {
  if (scorllMode === 'jquery') {
    $(scrollElement).css('scroll-behavior', 'unset');
    if (!speed) {
      speed = Math.abs(absolute ? scrollElement.scrollTop - top : top) / scrollElement.clientHeight * scrollTime;
      speed = Math.min(speed, scrollTimeMax);
    }
    $(scrollElement).finish().animate({
      scrollTop: absolute ? top : scrollElement.scrollTop + top,
      scrollLeft: absolute ? left : scrollElement.scrollLeft + left
    }, speed);
  } else {
    $(scrollElement).css('scroll-behavior', 'smooth');
    scrollElement.scrollTop = absolute ? top : scrollElement.scrollTop + top;
    scrollElement.scrollLeft = absolute ? left : scrollElement.scrollLeft + left;
  }
};

// Main
const main = async () => {
  await showFile();

  // 内容-点击翻页
  $('.content').on('click', 'div>img', (e) => {
    scrollTop(scrollElement.clientHeight);
  });
  let lastScrollTop = 0;
  let lastScrollEnd = true;
  $('.content').on('scroll', async (e) => {
    getCurrentPage();
    if ($('.content').attr('disable-scroll')) return;
    const thisScrollTop = scrollElement.scrollTop;
    if (thisScrollTop > lastScrollTop) {
      const scrollHeight = scrollElement.scrollHeight;
      const height = $('.content').height() + thisScrollTop;
      if (height + loadPageHeight >= scrollHeight) {
        await loadImage();
      }
    } else {
      if (lastScrollEnd && fileList.indexOf(viewInfo.page) > 0 && thisScrollTop <= loadPageHeight) {
        lastScrollEnd = false;
        const page = viewInfo.page;
        await loadImage(true);
        await waitInMs(500);
        $('.content').attr('disable-scroll', 'true');
        const preferTop = scrollElement.scrollTop + $(`.content>div[name="${page}"]`).offset().top;
        scrollTop(preferTop, 0, 100, true);
        let scrollEnd;
        scrollEnd = setInterval(() => {
          if (Math.abs(preferTop - scrollElement.scrollTop) <= fixHeight) {
            clearInterval(scrollEnd);
            $('.content').removeAttr('disable-scroll');
            lastScrollEnd = true;
            scrollEnd = null;
          }
        }, 200);
      }
    }
    lastScrollTop = thisScrollTop <= 0 ? 0 : thisScrollTop;
  });

  // 内容-鼠标移动
  let mousemoveLastTime = 0;
  let mousemoveTimeoutId;
  $('body').on('mousemove', (e) => {
    if (new Date().getTime() - new Date(mousemoveLastTime).getTime() <= mousemoveDelay) return;
    if (mousemoveTimeoutId) {
      clearTimeout(mousemoveTimeoutId);
      mousemoveTimeoutId = null;
    }
    const leftPercent = Math.round(e.clientX / $('body').prop('clientWidth') * 100);
    const topPercent = Math.round(e.clientY / $('body').prop('clientHeight') * 100);
    if (leftPercent >= 80 && topPercent >= 80) {
      $('.preview').show();
    } else if (topPercent <= 10 && leftPercent >= 20 && leftPercent <= 80) {
      $('.titlebar').html(viewInfo.file + '\\' + (viewInfo.page || '')).show();
      updateTitleUrl();
    } else if (topPercent >= 90 && leftPercent >= 20 && leftPercent <= 80) {
      $('.statusbar').show();
      const value = fileList.indexOf(viewInfo.page) + 1;
      $('.statusbar>[name="range"]').val(value);
      $('.statusbar>[name="current"]').text(value);
    } else if ((leftPercent <= 10 || leftPercent >= 90) && topPercent >= 20 && topPercent <= 80) {
      $('.sidebar').css('display', 'flex');
    } else {
      $('.bar,.sidebar,.preview,.preview>.coverBox').hide();
    }
    mousemoveTimeoutId = setTimeout(() => {
      $('.bar,.sidebar').hide();
      mousemoveTimeoutId = null;
    }, 1000);
    mousemoveLastTime = new Date().getTime();
  });
  $('.statusbar>[name="range"]').on('change', async e => {
    const value = $(e.target).val();
    await jumpToImage(fileList[value - 1]);
    $(e.target).val(value);
    $('.statusbar>[name="current"]').text(value);
  });
  $('.preview>div:nth-child(1)').on('mousemove', (e) => {
    const target = $('.preview>div:nth-child(2)');
    $('.preview>.coverBox').css({
      top: e.pageY - target.offset().top + 20,
      left: e.pageX - target.offset().left
    }).show();
  });
  $('.preview>div:nth-child(2)').on('mousemove', (e) => {
    const target = $(e.target);
    const x = (e.pageX - target.offset().left) / target.width();
    const y = (e.pageY - target.offset().top) / target.height();
    $('.preview>.coverBox').css({
      top: target.height() * y + 20,
      left: target.width() * x
    }).show();
  });
  $('.preview>div:nth-child(1)').on('click', async (e) => {
    const target = $('.preview>div:nth-child(2)');
    const x = (e.pageX - target.offset().left) / target.width();
    const y = (e.pageY - target.offset().top) / target.height();

    const name = $('.preview>div:nth-child(2)').attr('name');
    const elem = $(`.content>div[name="${name}"]`);
    $('.content').css('scroll-behavior', 'unset');
    scrollTop(elem.offset().top + elem.height() * y, elem.offset().left + elem.width() * x, 20);
    $('.content').css('scroll-behavior', 'smooth');
  });

  // 翻页
  $('.sidebar').on('click', (e) => {
    getCurrentPage();
    let elem = $(`.content>div[name="${viewInfo.page}"]`);
    if ($(e.target).is('.side-left')) {
      elem = elem.prev().length ? elem.prev() : elem;
      scrollTop(elem.offset().top);
    } else {
      if (elem.next().length) {
        scrollTop(elem.next().offset().top);
      } else {
        scrollTop(elem.offset().top + elem.height());
      }
    }
  });

  // 打开文件
  $('.openfile>div').on('click', (e) => {
    openFile();
  });

  // 右键菜单
  let rightClickPosition = null;
  const menuItem = [
    {
      label: '打开文件夹',
      click: () => {
        const CONFIG = ipcRenderer.sendSync('config');
        const fullpath = path.resolve(CONFIG.libraryFolder, viewInfo.file);
        electron.remote.shell.showItemInFolder(fullpath);
      }
    }, {
      label: '外部浏览',
      click: () => {
        ipcRenderer.send('open-external', viewInfo.file, 'path');
      }
    },
    { type: 'separator' },
    {
      label: 'Inspect Element',
      click: () => {
        electron.remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y);
      }
    }
  ];
  const contextMenu = Menu.buildFromTemplate(menuItem);
  $('.content').on('contextmenu', (e) => {
    e.preventDefault();
    rightClickPosition = { x: e.x, y: e.y };
    contextMenu.popup(electron.remote.getCurrentWindow());
  });

  // 全局事件
  $('body').on('click', 'a', async (e) => {
    e.preventDefault();
    $('.trHover').removeClass('trHover');
    const parent = $(e.target).parentsUntil('.result>table>tbody').eq(-1);
    parent.addClass('trHover');
    const href = $(e.target).attr('href');
    const name = $(e.target).attr('name');
    // name: native, path, delete, null
    if (name === 'native') {
      ipcRenderer.send('open', href);
    } else {
      ipcRenderer.send('open-external', href, name);
    }
  });

  // 全局快捷键
  let keypressLastTime = 0;
  let isTopLast, isBottomLast;
  Mousetrap.bind(keyMap.openFile, function (e, combo) { // 打开另一本书
    openFile();
    return false;
  });
  Mousetrap.bind(keyMap.closeAndSave, async function (e, combo) { // 关闭并保存本书记录
    await rememberPosition();
    $('.content').attr('disable-scroll', 'true').empty();
    $('.openfile').show();
    return false;
  });
  Mousetrap.bind(keyMap.closeAndClear, async function (e, combo) { // 关闭并清除本书记录
    $('.content').attr('disable-scroll', 'true').empty();
    $('.openfile').show();

    const file = viewInfo.file;
    configChange((CONFIG) => {
      if (CONFIG.lastViewPosition && file in CONFIG.lastViewPosition) delete CONFIG.lastViewPosition[file];
      if (CONFIG.lastViewTime && file in CONFIG.lastViewTime) delete CONFIG.lastViewTime[file];
      if (CONFIG.history && CONFIG.history.includes(file)) CONFIG.history.splice(CONFIG.history.indexOf(file), 1);
    });

    await tooltip('记录已清除');
    return false;
  }, 'keyup');
  Mousetrap.bind(keyMap.jumpToPageTop, function (e, combo) { // 对位到当前页顶部
    scrollTop($(`.content>div[name="${viewInfo.page}"]`).offset().top);
  });
  Mousetrap.bind(keyMap.deletePage, async function (e, combo) { // 删除当前页
    const confirm = await tooltip({
      title: '是否删除当前页',
      content: viewInfo.page,
      autoClose: null,
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
    });
    if (confirm !== 'ok') return;
    const CONFIG = ipcRenderer.sendSync('config');
    const fullpath = path.resolve(CONFIG.libraryFolder, viewInfo.file);
    const result = cp.execFileSync(sevenZip, ['d', fullpath, viewInfo.page]);
    if (result.toString().match('Everything is Ok')) {
      await tooltip('页面已删除', viewInfo.file + '\\' + viewInfo.page);
      await configChange((CONFIG) => {
        if (!('delete' in CONFIG)) CONFIG.delete = [];
        CONFIG.delete.push(viewInfo.file + '\\' + viewInfo.page);
      });
      viewInfo.page = $(`.content>div[name="${viewInfo.page}"]`).prev().attr('name');
      await rememberPosition(true);
      await showFile();
    }
  });
  Mousetrap.bind(keyMap.deleteFile, async function (e, combo) { // 删除当前文件
    const confirm = await tooltip({
      title: '是否删除文件',
      content: viewInfo.file,
      autoClose: null,
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
    });
    if (confirm !== 'ok') return;
    ipcRenderer.send('open-external', viewInfo.file, 'delete');
    await tooltip('文件已删除', viewInfo.file);
  });
  Mousetrap.bind([].concat(keyMap.up, keyMap.down), async (e, combo) => { // 上下键
    if (e.type === 'keypress' && new Date().getTime() - new Date(keypressLastTime).getTime() <= keypressTimeout) return;
    let isTop = scrollElement.scrollTop === 0;
    isTop = isTop && fileList.indexOf(viewInfo.page) === 0;
    let isBottom = $('.content').height() + scrollElement.scrollTop + fixHeight >= scrollElement.scrollHeight;
    isBottom = isBottom && (!fileList || pageAnchor >= fileList.length);

    if (keyMap.up.includes(combo) && !isTop) { // 向上滚动
      scrollTop(-scrollHeight);
    } else if (keyMap.down.includes(combo) && !isBottom) { // 向下滚动
      scrollTop(scrollHeight);
    } else if (keyMap.up.includes(combo) && isTop && isTopLast) { // 打开上一本书籍
      await showFile({ relativeBook: 'prev' });
    } else if (keyMap.down.includes(combo) && isBottom && isBottomLast) { // 打开下一本书籍
      await showFile({ relativeBook: 'next' });
    }

    keypressLastTime = new Date().getTime();
    isTopLast = isTop;
    isBottomLast = isBottom;
    return false;
  });
  Mousetrap.bind([].concat(keyMap.shiftAndUp, keyMap.shiftAndDown), (e, combo) => { // shift+上下键 滚动到顶部或底部
    scrollTop(keyMap.shiftAndUp.includes(combo) ? 0 : scrollElement.scrollHeight, 0, null, true);
    return false;
  });
  Mousetrap.bind([].concat(keyMap.upLeft, keyMap.upRight), async (e, combo) => { // 打开上/下一本书籍
    await showFile({ relativeBook: keyMap.upLeft.includes(combo) ? 'prev' : 'next' });
    return false;
  }, 'keyup');
  Mousetrap.bind([].concat(keyMap.left, keyMap.right), async (e, combo) => { // 左右键
    let isTop = scrollElement.scrollTop === 0;
    isTop = isTop && fileList.indexOf(viewInfo.page) === 0;
    let isBottom = $('.content').height() + scrollElement.scrollTop + fixHeight >= scrollElement.scrollHeight;
    isBottom = isBottom && (!fileList || pageAnchor >= fileList.length);
    const step = scrollElement.clientHeight;

    if (keyMap.left.includes(combo) && !isTop) { // 向上滚动
      scrollTop(-step);
    } else if (keyMap.right.includes(combo) && !isBottom) { // 向下滚动
      scrollTop(step - 10);
    } else if (keyMap.left.includes(combo) && isTop && isTopLast) { // 打开上一本书籍
      await showFile({ relativeBook: 'prev' });
    } else if (keyMap.right.includes(combo) && isBottom && isBottomLast) { // 打开下一本书籍
      await showFile({ relativeBook: 'next' });
    }

    isTopLast = isTop;
    isBottomLast = isBottom;
    return false;
  });
  Mousetrap.bind([].concat(keyMap.plus, keyMap.minus), async (e, combo) => { // 放大缩小
    zoomPercent += (keyMap.plus.includes(combo) ? zoomPercentStep : -zoomPercentStep);
    tooltip(`当前缩放: ${zoomPercent}%`);
    for (const ele of $('.content>div').toArray()) {
      const width = $(ele).find('img').prop('naturalWidth');
      $(ele).css('width', width * zoomPercent / 100);
    }
    await jumpToImage(viewInfo.page);
    return false;
  });
  Mousetrap.bind(keyMap.findByTags, function (e, combo) { // 快速查找相同本子
    let title = removeOtherInfo(fileInfo.title);
    title = removeOtherInfo(title, true);
    let jTitle = removeOtherInfo(fileInfo.jTitle);
    jTitle = removeOtherInfo(jTitle, true);
    const dirname = path.dirname(viewInfo.file);
    const html = [
      '<div style="text-align:justify;">',
      '<ul>',
      `<li>标题: <a name="native" href="./src/index.html?condition=${encodeURIComponent(`[[false,"title","LIKE","${title}",null]]`)}" style="margin:0 5px;">${title}</a></li>`,
      `<li>日文标题: <a name="native" href="./src/index.html?condition=${encodeURIComponent(`[[false,"title_jpn","LIKE","${jTitle}",null]]`)}" style="margin:0 5px;">${jTitle}</a></li>`,
      `<li>路径: <a name="native" href="./src/index.html?condition=${encodeURIComponent(`[[false,"path","LIKE","${dirname.replace(/\\/g, '\\\\')}",null]]`)}" style="margin:0 5px;">${dirname}</a></li>`,
      `<li>外部打开: <a name="path" href="${viewInfo.file}">${path.basename(viewInfo.file)}</a></li>`,
      `<li>打开路径: <a name="path" href="${dirname}">${dirname}</a></li>`,
      `<li>web: <a href="${fileInfo.web}">${fileInfo.web}</a></li>`
    ];
    for (const main of mainTag) {
      if (!(main in fileInfo)) continue;
      const mainChs = findData(main).cname;
      let htmlLine = `<li>${mainChs}: `;
      for (const sub of fileInfo[main]) {
        const subChs = findData(main, sub).cname || sub;
        const condition = encodeURIComponent(`[[false,"tags","tags:${main}","${sub}",null]]`);
        htmlLine += `<a name="native" href="./src/index.html?condition=${condition}" style="margin:0 5px;">${subChs}</a>`;
      }
      html.push(htmlLine + '</li>');
    }
    html.push('</ul>', '</div>');
    tooltip({
      theme: 'supervan',
      boxWidth: '50%',
      title: 'Search:',
      content: html.join(''),
      autoClose: null
    });
  });
  Mousetrap.bind(keyMap.help, function (e, combo) { // 显示所有快捷键
    const html = [
      '<div style="display:flex;">',
      '<table style="flex:1;"><tbody>'
    ];
    const table2 = [];
    let nextTable = false;
    for (const key in keyHelp) {
      if (key === 'separator') nextTable = true;
      const bindings = keyMap[key].map(i => `<span>${i}</span>`).join('')
        ; (nextTable ? table2 : html).push(`<tr><td class="keyBindings">${bindings}</td><td class="helpDescription">${keyHelp[key]}</td></tr>`);
    }
    html.push('</tbody></table>', '<table style="flex:1;"><tbody>', ...table2, '</tbody></table>', '</div>');
    tooltip({
      theme: 'supervan',
      boxWidth: '60%',
      title: null,
      content: html.join(''),
      autoClose: null
    });
  });
  Mousetrap.bind(keyMap.reload, async function (e, combo) { // 重载页面
    window.onbeforeunload = null;
    await rememberPosition(true);
    window.location.reload();
  });
  Mousetrap.bind(keyMap.starFile, async function (e, combo) { // 星标书籍
    await configChange((CONFIG) => {
      if (!('star' in CONFIG)) CONFIG.star = {};
      CONFIG.star[viewInfo.file] = 1;
    });
    tooltip('书籍已收藏');
  });
  Mousetrap.bind(keyMap.showFileList, function (e, combo) { // 显示文件列表并跳转
    const html = [
      '<div style="text-align:justify;">',
      '<ul>'
    ];
    for (const file of fileList) {
      html.push(`<li><span name="${file}" style="cursor:pointer;">${file}</span></li>`);
    }
    html.push('</ul>', '</div>');
    tooltip({
      theme: 'supervan',
      boxWidth: '50%',
      title: 'File List:',
      content: html.join(''),
      autoClose: null,
      onContentReady: function () {
        $(this.$content).find(`li:has(span[name="${window.CSS.escape(viewInfo.page)}"])`).css('color', 'red').get(0).scrollIntoView();
        $(this.$content).find('li>span[name]').on('click', async (e) => {
          this.close();
          await jumpToImage($(e.target).attr('name'));
        });
      }
    });
  });
  Mousetrap.bind(keyMap.readingList, async function (e, combo) { // 显示阅读列表
    const CONFIG = ipcRenderer.sendSync('config');
    const condition = viewInfo.condition;
    const file = viewInfo.file;
    const fullpath = path.resolve(CONFIG.libraryFolder, file);

    let files;
    if (condition) {
      if ('list_' + condition in window.localStorage) {
        files = JSON.parse(window.localStorage.getItem('list_' + condition));
      } else {
        const conditionArr = JSON.parse(condition);
        const [rows] = ipcRenderer.sendSync('query-by-condition', conditionArr);
        files = rows.map(i => i.path);
        window.localStorage.setItem('list_' + condition, JSON.stringify(files));
      }
    } else {
      const dirname = path.dirname(file);
      files = fs.readdirSync(path.dirname(fullpath));
      files = files.filter(i => ['.cbz', '.zip'].includes(path.extname(i))).map(i => path.join(dirname, i));
    }

    showFileList(files, 'Reading List:');
  });
  Mousetrap.bind(keyMap.starList, async function (e, combo) { // 显示星标列表
    const CONFIG = ipcRenderer.sendSync('config');
    const files = Object.keys(CONFIG.star);

    showFileList(files, 'Star List:');
  });
  Mousetrap.bind(keyMap.historyList, async function (e, combo) { // 显示历史列表
    const CONFIG = ipcRenderer.sendSync('config');
    let files = Object.keys(CONFIG.lastViewTime).map(key => ({ key, value: CONFIG.lastViewTime[key] }));
    files = files.sort((a, b) => new Date(a.value).getTime() > new Date(b.value).getTime() ? -1 : 1).map(i => i.key);

    showFileList(files, 'History List:');
  });

  window.onbeforeunload = (e) => {
    rememberPosition();
  };
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  process.exit();
});
