/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
// ==Headers==
// @Name:               viewer
// @Description:        viewer
// @Version:            1.0.1594
// @Author:             dodying
// @Created:            2020-02-08 18:17:38
// @Modified:           2024-02-14 21:08:35
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron,jszip
// ==/Headers==
/* eslint-env browser */
/* global $ Mousetrap */

// 全局变量
let loading = null;
let pageAnchor = null;
let zipContent = null;
let fileList = [];
const viewInfo = new Proxy({
  file: '', // 仅在showFile时修改
  page: '',
  condition: '',
}, {
  set(target, prop, value, receiver) {
    target[prop] = value;
    if (prop === 'file') {
      target.page = '';
      target.condition = '';
    } else if (prop === 'page') {
      // 仅播放在窗口中的视频
      $('.content>div>video[playing]').toArray().forEach((i) => {
        $(i).attr('playing', null);
        i.pause();
      });
      if ($(`.content>div[name="${target.page}"]>video:not([playing])`).length) {
        $(`.content>div[name="${target.page}"]>video:not([playing])`).attr({
          playing: 1,
          loop: true,
        }).get(0).play();
      }
    }
    return true;
  },
});
let fileInfo = null;
let viewTime = null;
const mainTag = 'language,artist,group,parody,character,cosplayer,female,male,mixed,other,reclass,temp'.split(',');
const viewModes = ['fall', 'single'];
const scrollElement = $('.content').get(0);
const keyHelp = {
  help: '显示帮助',
  openFile: '打开文件',
  closeAndSave: '关闭并保存记录',
  closeAndClear: '关闭并清除记录',
  showFileList: '显示文件列表',
  readingList: '显示阅读列表',
  starList: '显示星标列表',
  historyList: '显示历史列表',
  openDevTools: '打开开发者工具',
  deletePage: '删除当前页',
  deleteFile: '删除当前文件',
  reload: '重载页面',
  jumpToPageTop: '对位到当前页顶部',
  findByTags: '根据标签查找相似书籍',
  starFile: '星标书籍',
  plus: '放大',
  minus: '缩小',
  toggleViewMode: `切换浏览模式(${viewModes.join(',')})`,
  Save: '保存记录(Mark)',

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
  upRight: '打开下一本',
};
const imageExt = ['.png', '.jpg', '.gif', '.webp'];
const videoExt = ['.mp4', '.m4v'];
const supportedExt = [].concat(imageExt, videoExt);
let isTopLast, isBottomLast;
let keypressLastTime = 0;
let resultList = null;
let lastScrollTop = 0;
let lastScrollEnd = true;

// 设置
const viewTimeMin = 10 * 1000; // 最小阅读时间，当停留当前本子时间超过该时间时，才会记录
const viewPageMin = 5; // 最小阅读页数，当当前页数超过该页数时，才会记录
const viewPageMax = -3; // 当阅读到最后几页时，不保存记录
let viewMode = viewModes[0];
const mousemoveDelay = 50; // mousemove时间的延迟
const fixHeight = 1; // TO ENHANCEMENT 1px 待测试
const keypressTimeout = 80; // 小于此时间的keypress事件不触发
const scorllMode = 'jquery'; // jquery||auto，jquery时使用jquery.animate来显示滚动动画，否则使用css的scroll-behavior:smooth
const scrollHeight = 50; // 滚动高度
const scrollTime = 200; // 仅jquery，每滚动单位高度（可视页面高度）所需时间
const scrollTimeMax = 2000; // 仅jquery，滚动最大时间
const maxWidth = 940;
const maxHeight = 970;
let zoomPercent = 120; // 缩放百分比
const zoomPercentStep = 5; // 缩放百分比间隔
const loadPageHeight = 100; // 距离底部或顶部多高时，读取页面
const keyMap = { // 按键事件
  // 说明请看 keyHelp
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
  openDevTools: ['f12'],
  deletePage: ['del'],
  deleteFile: ['shift+del'],
  reload: ['r'],
  jumpToPageTop: ['t'],
  findByTags: ['f'],
  starFile: ['z'],
  plus: ['+', '='],
  minus: ['-'],
  toggleViewMode: ['v'],
  Save: ['m'],

  up: ['w', 'up', '8'],
  down: ['s', 'down', '5'],
  left: ['a', 'left', '4'],
  right: ['d', 'right', '6'],
  upLeft: ['q', '7'],
  upRight: ['e', '9'],
};
keyMap.shiftAndUp = keyMap.up.map((i) => `shift+${i}`);
keyMap.shiftAndDown = keyMap.down.map((i) => `shift+${i}`);
const pageLoadCount = 5; // 一次载入多少页
const nextPageTop = (1 / 2) * document.documentElement.clientHeight; // 图片距离顶部多远视为下一页

// 导入原生模块
const fs = require('fs');
const path = require('path');

// 导入第三方模块
const electron = require('electron');
const JSZip = require('jszip');

const waitInMs = require('../../_lib/waitInMs');
const parseInfo = require('../js/parseInfo');
const findData = require('../js/findData');
const removeOtherInfo = require('../js/removeOtherInfo');
const configChange = require('./common/configChange');
const tooltip = require('./common/tooltip');

const { ipcRenderer } = electron;
const { Menu } = electron.remote;
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

// Function
function getCurrentPage() {
  let onView;
  if (viewMode === 'single') {
    onView = $('.content>div.current');
  } else {
    onView = $('.content>div').eq(-1);
    for (const ele of $('.content>div').toArray()) {
      if ($(ele).offset().top > nextPageTop) {
        onView = $('.content>div').eq($(ele).index() - 1);
        break;
      }
    }

    $('.content>div.current').removeClass('current');
    onView.addClass('current');
  }

  viewInfo.page = onView.attr('name');

  const html = onView.text();
  $('.preview>div:nth-child(2)').attr('name', viewInfo.page).html(html);
}
async function loadImage(reverse, loadCount = pageLoadCount) {
  $('.content').attr('disable-scroll', 'true');

  let count = 0;
  let i = reverse ? fileList.indexOf($('.content>div').eq(0).attr('name')) - 1 : pageAnchor;
  for (; ;) {
    if (i < 0 || i >= fileList.length) break;
    const name = fileList[i];
    if (count >= loadCount && count >= pageLoadCount) break;
    count = count + 1;
    $('.titlebar').html(`加载图片中，第${count}张`).show();
    const blob = await zipContent.files[name].async('blob');
    const imageUrl = URL.createObjectURL(blob);
    let elem, width, height;
    await new Promise((resolve, reject) => {
      const tag = imageExt.includes(path.extname(name)) ? 'img' : 'video';
      elem = $(`<div name="${name}"><${tag} src="${imageUrl}" /></div>`).hide();
      elem.find(tag).on('load loadedmetadata', (e) => {
        width = elem.find(tag).prop(tag === 'img' ? 'naturalWidth' : 'videoWidth');
        height = elem.find(tag).prop(tag === 'img' ? 'naturalHeight' : 'videoHeight');
        resolve();
      }).on('error', () => {
        width = 0;
        height = 0;
        resolve();
      });
      elem.appendTo('body');
    });

    elem.css({
      width: width * zoomPercent * 0.01,
      'max-width': height / width > 1.1 ? maxWidth : maxHeight * (width / height),
    }).show();
    // elem.css('width', (width / height) * document.documentElement.clientHeight * 0.6); // TODO

    if (reverse) {
      elem.prependTo('.content');
      i = i - 1;
    } else {
      elem.appendTo('.content');
      i = i + 1;
    }
  }
  if (!reverse) pageAnchor = i;

  $('.content').removeAttr('disable-scroll');
  $('.titlebar').hide();
  getCurrentPage();
  const goon = reverse ? i >= 0 : i < fileList.length;
  if (fileList[0] === $('.content>div').eq(0).attr('name')) $('.content').attr('is-top', 'true');
  if (fileList.slice(-1)[0] === $('.content>div').eq(-1).attr('name')) $('.content').attr('is-bottom', 'true');
  return count >= loadCount && goon; // 是否可以继续加载
}
async function jumpToImage(page) {
  if (!fileList.includes(page)) return;
  const index = fileList.indexOf(page);
  const indexFirst = fileList.indexOf($('.content>div').attr('name'));
  const reverse = index < indexFirst;
  let pageLeft = true;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pageFind = $(`.content>div[name="${page}"]`);
    if (pageFind.length) {
      $('.content').attr('disable-scroll', 'true');
      scrollTop({ top: pageFind.offset().top, noEvent: true });
      $('.content').removeAttr('disable-scroll');
      break;
    } else if (pageLeft) {
      pageLeft = await loadImage(reverse, Math.abs(index - indexFirst));
    } else {
      break;
    }
  }

  if (viewMode === 'single') {
    $('.content>div.current').removeClass('current');
    $(`.content>div[name="${page}"]`).addClass('current');
    getCurrentPage();
  }

  electron.remote.getCurrentWindow().setProgressBar((fileList.indexOf(page) + 1) / fileList.length);
}
async function rememberPosition(noTooltip, force) {
  if (!viewInfo.file) return;
  if (!force && (fileList.indexOf(viewInfo.page) < viewPageMin || Number.isNaN(viewTime) || new Date().getTime() - viewTime < viewTimeMin)) return;
  await configChange((obj) => {
    if (!('lastViewPosition' in obj)) obj.lastViewPosition = {};
    obj.lastViewPosition[viewInfo.file] = viewInfo.page;
    if (fileList.indexOf(viewInfo.page) >= fileList.length + viewPageMax) delete obj.lastViewPosition[viewInfo.file];

    if (!('lastViewTime' in obj)) obj.lastViewTime = {};
    const date = new Date();
    obj.lastViewTime[viewInfo.file] = date.toLocaleString('zh-CN', { hour12: false });

    if (ipcRenderer.sendSync('config', 'get', 'rememberHistory')) {
      if (!('history' in obj)) obj.history = [];
      const params = new URLSearchParams();
      for (const key in viewInfo) {
        if (viewInfo[key] && !(['page'].includes(key))) params.set(key, viewInfo[key]);
      }
      obj.history = Array.from(new Set([`./src/viewer.html?${params.toString()}`].concat(obj.history)));
    }
  }, 'store');
  if (!noTooltip) await tooltip('记录已保存', viewInfo.file);
}
async function showFile(option = {}) {
  // option:
  //  page: string
  //  relativeBook: string 'prev','next'
  if (loading) return;
  const params = (new URL(document.location)).searchParams;
  let file = params.get('file');
  if (!file) {
    await tooltip('缺少参数');
    onLoadError();
    return;
  }
  const libraryFolder = ipcRenderer.sendSync('config', 'get', 'libraryFolder');
  let { page, relativeBook } = option;
  const condition = params.get('condition');

  let fullpath = path.resolve(libraryFolder, file);

  if (relativeBook) {
    let files;
    if (condition) {
      const conditionArr = JSON.parse(condition);
      const [rows] = ipcRenderer.sendSync('query-by-condition', conditionArr);
      files = rows.map((i) => i.path);
    } else {
      const dirname = path.dirname(file);
      files = fs.readdirSync(path.dirname(fullpath));
      files = files.filter((i) => ['.cbz', '.zip'].includes(path.extname(i))).map((i) => path.join(dirname, i)).sort(collator.compare);
    }
    resultList = files;
    let index = files.indexOf(file);
    if (relativeBook === 'prev') {
      if (index - 1 >= 0) {
        fullpath = path.resolve(libraryFolder, files[index - 1]);
        while (!fs.existsSync(fullpath)) {
          await tooltip('文件不存在，继续查找上一本', fullpath);
          index = index - 1;
          if (index <= 0) break;
          fullpath = path.resolve(libraryFolder, files[index - 1]);
        }
      }
      if (index === 0) {
        await tooltip('本书籍为第一本', fullpath);
        onLoadEnd();
        return;
      }
    } else if (relativeBook === 'next') {
      if (index + 1 <= files.length - 1) {
        fullpath = path.resolve(libraryFolder, files[index + 1]);
        while (!fs.existsSync(fullpath)) {
          await tooltip('文件不存在，继续查找下一本', fullpath);
          index = index + 1;
          if (index >= files.length - 1) break;
          fullpath = path.resolve(libraryFolder, files[index + 1]);
        }
      }
      if (index === files.length - 1) {
        await tooltip('本书籍为最后一本', fullpath);
        onLoadEnd();
        return;
      }
      fullpath = path.resolve(libraryFolder, files[index + 1]);
    }
    rememberPosition();
  }

  if (!fs.existsSync(fullpath)) {
    await tooltip('文件不存在', fullpath);
    onLoadError();
    return;
  }

  file = path.relative(libraryFolder, fullpath);

  $('.content').empty().focus();
  $('.titlebar').html('正在载入，请稍后').show();
  loading = true;
  zipContent = null;
  fileList = [];

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
  if (fileList.filter((item) => item.match(/(^|\/)info\.txt$/)).length === 0) {
    fileInfo = null;
  } else {
    const infoFile = fileList.find((item) => item.match(/(^|\/)info\.txt$/));
    const data = await zipContent.files[infoFile].async('text');
    fileInfo = parseInfo(data);
  }

  fileList = fileList.filter((i) => supportedExt.includes(path.extname(i))).sort(collator.compare); // 过滤图片
  if (fileList.length === 0) {
    await tooltip('空书籍，继续读取前/后一本书籍', fullpath);
    loading = false;
    viewInfo.file = file;
    viewInfo.condition = condition;
    updateTitleUrl();
    await showFile({ relativeBook: relativeBook || 'next' });
    return;
  }

  const lastViewPosition = ipcRenderer.sendSync('store', 'get', 'lastViewPosition', {});
  if (!page && lastViewPosition[file]) page = lastViewPosition[file];
  if (!page || !fileList.includes(page)) [page] = fileList;

  Object.assign(viewInfo, { file, page, condition });

  if (condition) {
    configChange((obj) => {
      if (!('resultPosition' in obj)) obj.resultPosition = {};
      obj.resultPosition[condition] = file;
    }, 'store');
  }
  // updateTitleUrl()

  // page = fileList.slice(-1)[0]; // TODO
  pageAnchor = fileList.includes(page) ? fileList.indexOf(page) : 0;
  await jumpToImage(page);
  getCurrentPage();

  $('.content').removeAttr('disable-scroll');
  document.title = `${path.basename(file)}\\${page || ''}`;
  onLoadEnd();
}
async function openFile() {
  const libraryFolder = ipcRenderer.sendSync('config', 'get', 'libraryFolder');
  const result = electron.remote.dialog.showOpenDialogSync({
    defaultPath: path.resolve(libraryFolder, viewInfo.file ? path.dirname(viewInfo.file) : ''),
    filters: [{
      name: '漫画压缩包',
      extensions: ['cbz', 'zip'],
    }, {
      name: '所有类型',
      extensions: ['*'],
    }],
    properties: ['openFile'],
  });
  if (result && result.length) {
    const fullpath = result[0];
    const file = path.relative(libraryFolder, fullpath);
    viewInfo.file = file;
    updateTitleUrl();
    await showFile();
  }
}
function onLoadEnd() {
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
}
function onLoadError() {
  // viewInfo.file = ''
  onLoadEnd();
}
function updateTitleUrl() {
  let title = 'VIEWER';
  let url = null;
  if (!viewInfo.file) {
    url = window.location.origin + window.location.pathname;
  } else {
    const params = new URLSearchParams();
    for (const key in viewInfo) {
      if (viewInfo[key] && !(['page'].includes(key))) params.set(key, viewInfo[key]);
    }
    url = `?${params.toString()}`;
    title = `${path.basename(viewInfo.file)}\\${viewInfo.page || ''}`;
  }
  document.title = title;
  window.history.pushState(null, title, url);
}
function showFileList(files, title) {
  const html = [
    '<div style="text-align:justify;">',
    '<ul>',
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
    onContentReady() {
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
    },
  });
}
function scrollTop({
  top, left = 0, speed, absolute = false, noEvent = false,
}) {
  if (scorllMode === 'jquery') {
    $(scrollElement).css('scroll-behavior', 'unset');
    if (!speed) {
      speed = (Math.abs(absolute ? scrollElement.scrollTop - top : top) / scrollElement.clientHeight) * scrollTime;
      speed = Math.min(speed, scrollTimeMax);
    }
    $(scrollElement).finish().animate({
      scrollTop: absolute ? top : scrollElement.scrollTop + top,
      scrollLeft: absolute ? left : scrollElement.scrollLeft + left,
    }, speed);
  } else {
    $(scrollElement).css('scroll-behavior', 'smooth');
    scrollElement.scrollTop = absolute ? top : scrollElement.scrollTop + top;
    scrollElement.scrollLeft = absolute ? left : scrollElement.scrollLeft + left;
  }
  if (!noEvent) scrollEvent(top > 0 ? 'down' : 'up');
}
function isTopNow() {
  let isTop = scrollElement.scrollTop === 0;
  isTop = isTop && fileList.indexOf(viewInfo.page) === 0;
  return isTop;
}
function isBottomNow() {
  let isBottom = $('.content').height() + scrollElement.scrollTop + fixHeight >= scrollElement.scrollHeight;
  isBottom = isBottom && (!fileList || pageAnchor >= fileList.length);
  return isBottom;
}
async function scrollEvent(type = 'down') {
  isTopLast = isTopNow();
  isBottomLast = isBottomNow();

  getCurrentPage();
  if ($('.content').attr('disable-scroll')) return;
  const thisScrollTop = scrollElement.scrollTop;
  if (viewMode === 'single') {
    const raw = $('.content>div.current');
    if (type === 'up') {
      if ($('.content>.current:nth-child(1)').length) await loadImage(true);
      $('.content>div.current').prev().addClass('current');
    } else if (type === 'down') {
      if ($('.content>.current:nth-last-child(1)').length) await loadImage();
      $('.content>div.current').next().addClass('current');
    }
    raw.removeClass('current');
    getCurrentPage();
  } else if (thisScrollTop > lastScrollTop) { // 向下滚动
    // eslint-disable-next-line no-shadow
    const { scrollHeight } = scrollElement;
    const height = $('.content').height() + thisScrollTop;
    if (height + loadPageHeight >= scrollHeight) {
      await loadImage();
    }
  } else if (lastScrollEnd && fileList.indexOf(viewInfo.page) > 0 && thisScrollTop <= loadPageHeight) {
    lastScrollEnd = false;
    await loadImage(true);
    await waitInMs(500);

    const offset = $(`.content>div[name="${viewInfo.page}"]`).offset();
    if (offset) {
      $('.content').attr('disable-scroll', 'true');
      const preferTop = scrollElement.scrollTop + offset.top;
      scrollTop({
        top: preferTop, left: 0, speed: 100, absolute: true, noEvent: true,
      });
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
  electron.remote.getCurrentWindow().setProgressBar((fileList.indexOf(viewInfo.page) + 1) / fileList.length);
  updateTitleUrl();
}

// Main
async function main() {
  await showFile();

  // 内容-点击翻页
  $('.content').on('click', 'div>img,div>video', async (e) => {
    if (isBottomNow() && isBottomLast) {
      await showFile({ relativeBook: 'next' });
    } else {
      scrollTop({ top: scrollElement.clientHeight });
    }
  });
  $('.content').on('wheel', async (e) => {
    if (new Date().getTime() - new Date(keypressLastTime).getTime() <= keypressTimeout) return;
    if (e.type === 'wheel') {
      scrollEvent(e.originalEvent.deltaY < 0 ? 'up' : 'down');
      e.preventDefault();
    }

    if (e.originalEvent.deltaY < 0 && isTopNow() && isTopLast) {
      await showFile({ relativeBook: 'prev' });
    } else if (e.originalEvent.deltaY > 0 && isBottomNow() && isBottomLast) {
      await showFile({ relativeBook: 'next' });
    }

    keypressLastTime = new Date().getTime();
  });
  $('.content').on('scroll', async (e) => {
    if (viewMode === 'single') scrollElement.scrollTop = 0;
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
    const leftPercent = Math.round((e.clientX / $('body').prop('clientWidth')) * 100);
    const topPercent = Math.round((e.clientY / $('body').prop('clientHeight')) * 100);
    if (leftPercent >= 80 && topPercent >= 80) {
      $('.preview').show();
    } else if (topPercent <= 10 && leftPercent >= 20 && leftPercent <= 80) {
      $('.titlebar').html(`${viewInfo.file}\\${viewInfo.page || ''}`).show();
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
  $('.statusbar>[name="range"]').on('change', async (e) => {
    e.target.disabled = true;
    const value = $(e.target).val();
    await jumpToImage(fileList[value - 1]);
    $(e.target).val(value);
    $('.statusbar>[name="current"]').text(value);
    e.target.disabled = false;
  });
  $('.preview>div:nth-child(1)').on('mousemove', (e) => {
    const target = $('.preview>div:nth-child(2)');
    $('.preview>.coverBox').css({
      top: e.pageY - target.offset().top + 20,
      left: e.pageX - target.offset().left,
    }).show();
  });
  $('.preview>div:nth-child(2)').on('mousemove', (e) => {
    const target = $(e.target);
    const x = (e.pageX - target.offset().left) / target.width();
    const y = (e.pageY - target.offset().top) / target.height();
    $('.preview>.coverBox').css({
      top: target.height() * y + 20,
      left: target.width() * x,
    }).show();
  });
  $('.preview>div:nth-child(1)').on('click', async (e) => {
    const target = $('.preview>div:nth-child(2)');
    const x = (e.pageX - target.offset().left) / target.width();
    const y = (e.pageY - target.offset().top) / target.height();

    const name = $('.preview>div:nth-child(2)').attr('name');
    const elem = $(`.content>div[name="${name}"]`);
    $('.content').css('scroll-behavior', 'unset');
    scrollTop({ top: elem.offset().top + elem.height() * y, left: elem.offset().left + elem.width() * x, speed: 20 });
    $('.content').css('scroll-behavior', 'smooth');
  });

  // 翻页
  $('.sidebar').on('click', async (e) => {
    getCurrentPage();
    const elem = $(`.content>div[name="${viewInfo.page}"]`);
    if ($(e.target).is('.side-left')) {
      if (isTopNow() && isTopLast) {
        await showFile({ relativeBook: 'prev' });
      } else if (elem.prev().length) {
        scrollTop({ top: elem.prev().offset().top });
      } else {
        scrollTop({ top: -parseFloat(window.getComputedStyle(elem.parent().get(0), ':before').height) - parseFloat(elem.css('margin-top')) - parseFloat(elem.css('padding-top')) });
      }
    } else if (isBottomNow() && isBottomLast) {
      await showFile({ relativeBook: 'next' });
    } else if (elem.next().length) {
      scrollTop({ top: elem.next().offset().top });
    } else {
      scrollTop({ top: elem.offset().top + elem.height() });
    }
  });

  // 打开文件
  $('.openfile>div').on('click', (e) => {
    openFile();
  });

  // 右键菜单
  let rightEvent;
  const menuItem = [
    {
      label: '打开文件夹',
      click: () => {
        ipcRenderer.send('open-external', viewInfo.file, 'item');
      },
    },
    {
      label: '外部浏览',
      click: () => {
        ipcRenderer.send('open-external', viewInfo.file, 'path');
      },
    },
    { type: 'separator' },
    {
      label: '打开开发者工具',
      click: () => {
        electron.remote.getCurrentWindow().openDevTools();
        console.log(rightEvent);
      },
    },
  ];
  const contextMenu = Menu.buildFromTemplate(menuItem);
  $('.content').on('contextmenu', (e) => {
    e.preventDefault();
    rightEvent = e;
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
  Mousetrap.bind(keyMap.openFile, (e, combo) => { // 打开另一本书
    openFile();
    return false;
  });
  Mousetrap.bind(keyMap.closeAndSave, async (e, combo) => { // 关闭并保存本书记录
    await rememberPosition(false, true);
    $('.content').attr('disable-scroll', 'true').empty();
    $('.openfile').show();
    return false;
  });
  Mousetrap.bind(keyMap.closeAndClear, async (e, combo) => { // 关闭并清除本书记录
    $('.content').attr('disable-scroll', 'true').empty();
    $('.openfile').show();

    const { file } = viewInfo;
    configChange((obj) => {
      if (obj.lastViewPosition && file in obj.lastViewPosition) delete obj.lastViewPosition[file];
      if (obj.lastViewTime && file in obj.lastViewTime) delete obj.lastViewTime[file];
      if (obj.history && obj.history.includes(file)) obj.history.splice(obj.history.indexOf(file), 1);
    }, 'store');

    await tooltip('记录已清除', viewInfo.file);
    return false;
  }, 'keyup');
  Mousetrap.bind(keyMap.jumpToPageTop, (e, combo) => { // 定位到当前页顶部
    scrollTop({ top: $(`.content>div[name="${viewInfo.page}"]`).offset().top });
  });
  Mousetrap.bind(keyMap.deletePage, async (e, combo) => { // 删除当前页
    const confirm = await tooltip({
      title: '是否删除当前页',
      content: viewInfo.page,
      autoClose: null,
      backgroundDismiss: 'cancel',
      buttons: {
        only: {
          text: '仅当前页面(Enter)',
          keys: ['enter'],
          btnClass: 'btn-red',
        },
        more: {
          text: '包括之后页面(Shift)',
          keys: ['shift'],
          btnClass: 'btn-red',
        },
        cancel: {
          text: 'Cancel(Esc)',
          btnClass: 'btn-blue',
        },
      },
    });
    if (!confirm || confirm === 'cancel') return;

    let pages;
    const index = fileList.indexOf(viewInfo.page);
    if (confirm === 'only') {
      pages = fileList.splice(index, 1);
    } else if (confirm === 'more') {
      pages = fileList.splice(index);
    }
    for (const page of pages) zipContent.remove(page);
    const content = await zipContent.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
    const libraryFolder = ipcRenderer.sendSync('config', 'get', 'libraryFolder');
    const fullpath = path.resolve(libraryFolder, viewInfo.file);
    fs.writeFileSync(fullpath, content);
    await tooltip('页面已删除', pages.map((page) => `${viewInfo.file}\\${page}`).join('\n'));
    await configChange((obj) => {
      const arr = pages.map((i) => i.split('/')[1]);
      if ((fileInfo.page || []).filter((i) => arr.includes(i.name)).length) {
        obj.deletePageId = Array.from(new Set(fileInfo.page.filter((i) => arr.includes(i.name)).map((i) => i.id).concat(obj.deletePageId || [])));
      } else {
        obj.deletePage = Array.from(new Set(pages.map((page) => `${viewInfo.file}\\${page}`).concat(obj.deletePage || [])));
      }
    }, 'store');

    $('.statusbar>[name="range"]').attr('max', fileList.length).val(index - 1);
    $('.statusbar>[name="current"]').text(index);
    $('.statusbar>[name="max"]').text(fileList.length);
    for (const page of pages) $(`.content>div[name="${page}"]`).remove();
    if ($('.content>div').length === 0) {
      pageAnchor = fileList.length - 1;
      await jumpToImage(fileList[index - 1]);
    }
  });
  Mousetrap.bind(keyMap.deleteFile, async (e, combo) => { // 删除当前文件
    const confirm = await tooltip({
      title: '是否清空/删除文件',
      content: viewInfo.file,
      autoClose: null,
      backgroundDismiss: 'cancel',
      buttons: {
        empty: {
          text: '清空(Shift)',
          keys: ['shift'],
          btnClass: 'btn-red',
        },
        delete: {
          text: '删除(Enter)',
          keys: ['enter'],
          btnClass: 'btn-red',
        },
        cancel: {
          text: 'Cancel',
          btnClass: 'btn-blue',
        },
      },
    });
    if (!confirm || confirm === 'cancel') return;

    showFile({ relativeBook: 'next' });
    ipcRenderer.send('open-external', viewInfo.file, confirm);
    await tooltip('文件已清空/删除', viewInfo.file);
  });
  Mousetrap.bind([].concat(keyMap.up, keyMap.down, 'home', 'end'), async (e, combo) => { // 上下键
    if (e.type === 'keypress' && new Date().getTime() - new Date(keypressLastTime).getTime() <= keypressTimeout) return false;
    if ([].concat(keyMap.up, 'home').includes(combo) && isTopNow() && isTopLast) { // 打开上一本书籍
      await showFile({ relativeBook: 'prev' });
    } else if ([].concat(keyMap.down, 'end').includes(combo) && isBottomNow() && isBottomLast) { // 打开下一本书籍
      await showFile({ relativeBook: 'next' });
    } else if (keyMap.up.includes(combo)) { // 向上滚动
      scrollTop({ top: -scrollHeight });
    } else if (keyMap.down.includes(combo)) { // 向下滚动
      scrollTop({ top: scrollHeight });
    } else if (['home', 'end'].includes(combo)) {
      scrollEvent(combo === 'end' ? 'down' : 'up');
    }

    keypressLastTime = new Date().getTime();
    return false;
  });
  Mousetrap.bind([].concat(keyMap.shiftAndUp, keyMap.shiftAndDown), (e, combo) => { // shift+上下键 滚动到顶部或底部
    scrollTop({
      top: keyMap.shiftAndUp.includes(combo) ? 0 : scrollElement.scrollHeight, left: 0, speed: null, absolute: true,
    });
    return false;
  });
  Mousetrap.bind([].concat(keyMap.upLeft, keyMap.upRight), async (e, combo) => { // 打开上/下一本书籍
    await showFile({ relativeBook: keyMap.upLeft.includes(combo) ? 'prev' : 'next' });
    return false;
  }, 'keyup');
  Mousetrap.bind([].concat(keyMap.left, keyMap.right), async (e, combo) => { // 左右键
    const step = scrollElement.clientHeight;

    if (keyMap.left.includes(combo) && isTopNow() && isTopLast) { // 打开上一本书籍
      await showFile({ relativeBook: 'prev' });
    } else if (keyMap.right.includes(combo) && isBottomNow() && isBottomLast) { // 打开下一本书籍
      await showFile({ relativeBook: 'next' });
    } else if (keyMap.left.includes(combo)) { // 向上滚动
      scrollTop({ top: -step });
    } else if (keyMap.right.includes(combo)) { // 向下滚动
      scrollTop({ top: step - 10 });
    }

    return false;
  });
  Mousetrap.bind([].concat(keyMap.plus, keyMap.minus), async (e, combo) => { // 放大缩小
    zoomPercent = zoomPercent + (keyMap.plus.includes(combo) ? zoomPercentStep : -zoomPercentStep);
    tooltip(`当前缩放: ${zoomPercent}%`, viewInfo.file);
    for (const ele of $('.content>div').toArray()) {
      const width = $(ele).find('img').prop('naturalWidth');
      $(ele).css('width', width * zoomPercent * 0.01);
    }
    await jumpToImage(viewInfo.page);
    return false;
  });
  Mousetrap.bind(keyMap.findByTags, (e, combo) => { // 快速查找相同本子
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
      `<li>路径: <a name="native" href="./src/index.html?condition=${encodeURIComponent(`[[false,"path","LIKE","${dirname.replace(/[%_\\]/g, '\\$&')}",null]]`)}" style="margin:0 5px;">${dirname}</a></li>`,
      `<li>外部打开: <a name="path" href="${viewInfo.file}">${path.basename(viewInfo.file)}</a></li>`,
      `<li>打开路径: <a name="path" href="${dirname}">${dirname}</a></li>`,
      `<li>web: <a href="${fileInfo.web}">${fileInfo.web}</a></li>`,
      `<li>Uploader: <a name="native" href="./src/index.html?condition=${encodeURIComponent(`[[false,"uploader","=","${fileInfo.Uploader}",null]]`)}" style="margin:0 5px;">${fileInfo.Uploader}</a></li>`,
    ];
    // eslint-disable-next-line no-shadow
    for (const main of mainTag) {
      if (!(main in fileInfo)) continue;
      const mainChs = findData(main).cname;
      let htmlLine = `<li>${mainChs}: `;
      for (const sub of fileInfo[main]) {
        const subChs = findData(main, sub).cname || sub;
        const condition = encodeURIComponent(`[[false,"tags","tags:${main}","${sub}",null]]`);
        htmlLine = `${htmlLine}<a name="native" href="./src/index.html?condition=${condition}" style="margin:0 5px;">${subChs}</a>`;
      }
      html.push(`${htmlLine}</li>`);
    }
    html.push('</ul>', '</div>');
    tooltip({
      theme: 'supervan',
      boxWidth: '50%',
      title: 'Search:',
      content: html.join(''),
      autoClose: null,
    });
  });
  Mousetrap.bind(keyMap.help, (e, combo) => { // 显示所有快捷键
    const html = [
      '<div style="display:flex;">',
      '<table style="flex:1;"><tbody>',
    ];
    const table2 = [];
    let nextTable = false;
    for (const key of Object.keys(keyHelp)) {
      if (key === 'separator') nextTable = true;
      const bindings = keyMap[key].map((i) => `<span>${i}</span>`).join('');
      (nextTable ? table2 : html).push(`<tr><td class="keyBindings">${bindings}</td><td class="helpDescription">${keyHelp[key]}</td></tr>`);
    }
    html.push('</tbody></table>', '<table style="flex:1;"><tbody>', ...table2, '</tbody></table>', '</div>');
    tooltip({
      theme: 'supervan',
      boxWidth: '60%',
      title: null,
      content: html.join(''),
      autoClose: null,
    });
  });
  Mousetrap.bind(keyMap.reload, async (e, combo) => { // 重载页面
    window.onbeforeunload = null;
    await rememberPosition(true, true);
    window.location.reload();
  });
  Mousetrap.bind(keyMap.starFile, async (e, combo) => { // 星标书籍
    await configChange((obj) => {
      if (!('star' in obj)) obj.star = [];
      if (!obj.star.includes(viewInfo.file)) obj.star.push(viewInfo.file);
    }, 'store');
    tooltip('书籍已收藏', viewInfo.file);
  });
  Mousetrap.bind(keyMap.showFileList, (e, combo) => { // 显示文件列表并跳转
    const html = [
      '<div style="text-align:justify;">',
      '<ul>',
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
      onContentReady() {
        $(this.$content).find(`li:has(span[name="${window.CSS.escape(viewInfo.page)}"])`).css('color', 'red').get(0)
          .scrollIntoView();
        $(this.$content).find('li>span[name]').on('click', async (e1) => {
          this.close();
          await jumpToImage($(e1.target).attr('name'));
        });
      },
    });
  });
  Mousetrap.bind(keyMap.readingList, async (e, combo) => { // 显示阅读列表
    const libraryFolder = ipcRenderer.sendSync('config', 'get', 'libraryFolder');
    const { condition } = viewInfo;
    const { file } = viewInfo;
    const fullpath = path.resolve(libraryFolder, file);

    let files;
    if (condition) {
      if (resultList) {
        files = resultList;
      } else {
        const conditionArr = JSON.parse(condition);
        const [rows] = ipcRenderer.sendSync('query-by-condition', conditionArr);
        files = rows.map((i) => i.path);
        resultList = files;
      }
    } else {
      const dirname = path.dirname(file);
      files = fs.readdirSync(path.dirname(fullpath));
      files = files.filter((i) => ['.cbz', '.zip'].includes(path.extname(i))).map((i) => path.join(dirname, i)).sort(collator.compare);
    }

    showFileList(files, 'Reading List:');
  });
  Mousetrap.bind(keyMap.starList, async (e, combo) => { // 显示星标列表
    const files = ipcRenderer.sendSync('store', 'get', 'star', []);

    showFileList(files, 'Star List:');
  });
  Mousetrap.bind(keyMap.historyList, async (e, combo) => { // 显示历史列表
    const lastViewTime = ipcRenderer.sendSync('store', 'get', 'lastViewTime', {});
    let files = Object.keys(lastViewTime).map((key) => ({ key, value: lastViewTime[key] }));
    files = files.sort((a, b) => (new Date(a.value).getTime() > new Date(b.value).getTime() ? -1 : 1)).map((i) => i.key);

    showFileList(files, 'History List:');
  });
  Mousetrap.bind(keyMap.openDevTools, async (e, combo) => { // 打开开发者工具
    electron.remote.getCurrentWindow().openDevTools();
  });
  Mousetrap.bind(keyMap.toggleViewMode, async (e, combo) => { // 切换浏览模式
    viewMode = viewModes[(viewModes.indexOf(viewMode) + 1) % viewModes.length];
    $('.content').attr('mode', viewMode);
    $('.content>div.current').get(0).scrollIntoView();
    await tooltip('当前浏览模式', viewMode);
  });
  Mousetrap.bind(keyMap.Save, async (e, combo) => { // 关闭并保存本书记录
    await rememberPosition(false, true);
    return false;
  });

  window.onbeforeunload = (e) => {
    rememberPosition(true);
  };
}

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit(1);
});
