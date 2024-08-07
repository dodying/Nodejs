/* eslint-disable no-param-reassign,no-use-before-define,import/no-extraneous-dependencies,no-shadow,no-loop-func,camelcase */
// ==Headers==
// @Name:               index
// @Description:        index
// @Version:            1.0.1984
// @Author:             dodying
// @Created:            2020-02-04 13:54:15
// @Modified:           2024-02-16 19:36:59
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron,mysql2
// ==/Headers==
/* eslint-env browser */
/* global $ Mousetrap */

// query
// 显示所有列 SHOW COLUMNS FROM files

// 全局变量
let scrollElement = $('html').get(0);
let tagsAlert = null;
let resultTable = null;
let lastResult = null;
let columns = null;

// 可自定义
const keypressTimeout = 80; // keypress事件延迟
const scrollHeight = 50; // 滚动高度(keyMap.up/down)
const showInfo = { // 查询结果-显示列
  // 按key顺序显示
  // [是否显示， 中文标题]
  category: [true, '类别'],
  language: [true, '语言'],
  time_upload: [true, '上传时间'],
  time_download: [true, '下载时间'],
  time_view: [true, '最近阅读'], // (#)上次阅读事件
  pages: [true, '页数'],
  size: [false, '文件大小'],
  rating: [true, '评分'],
  favorited: [false, '星标数'],
  event: [true, '事件'], // (#)
  uploader: [false, '上传者'],
  'tag:artist': [false, '标签:作者'], // (#)标签:作者
  artist: [true, '作者'],
  title_main: [true, '标题(主)'], // 英文标题的主要部分
  title_number: [true, '数字'], // 英文标题的数字部分
  title: [true, '标题'], // 英文标题
  title_jpn: [true, '标题(日文)'],
  title_jpn_main: [true, '标题(日文)(主)'],
  title_jpn_number: [false, '数字(日文)'],
  path: [true, '路径'],
  tags: [false, '标签'],
  'tag:parody': [true, '标签:原作'], // (#)标签:原作
  'tag:female': [true, '标签:女性'], // (#)标签:女性
  'tag:male': [true, '标签:男性'], // (#)标签:男性
  'tag:mixed': [false, '标签:混合'], // (#)标签:混合
  'tag:other': [false, '标签:其他'], // (#)标签:其他
  'tag:group': [false, '标签:团队'], // (#)标签:团队
};
const keyMap = { // 按键事件
  up: ['w', 'up', '8'], // 向上滚动scrollHeight高度
  down: ['s', 'down', '5'], // 向下滚动scrollHeight高度
  left: ['a', 'left', '4'], // 向上翻页
  right: ['d', 'right', '6'], // 向下翻页
  upLeft: ['q', '7'], // 上一页
  upRight: ['e', '9'], // 下一页
};
const showColumns = { // 筛选条件要显示的类别
  // 按key顺序显示
  // [是否显示， 类型]
  tags: [true, 'json-tags'],
  path: [true, 'text'],
  artist: [true, 'text'],
  title: [true, 'text'],
  title_main: [true, 'text'],
  title_number: [true, 'text'],
  title_jpn: [true, 'text'],
  title_jpn_main: [true, 'text'],
  title_jpn_number: [true, 'text'],
  size: [false, 'number'],
  category: [true, 'text'],
  rating: [true, 'number'],
  web: [true, 'text'],
  language: [true, 'text'],
  pages: [true, 'number'],
  time_upload: [true, 'datetime'],
  uploader: [true, 'text'],
  favorited: [true, 'number'],
  time_download: [true, 'datetime'],
  order: [true, 'order'],
  command: [true, 'text'], // (#)
};
keyMap.shiftAndUp = keyMap.up.map((i) => `shift+${i}`); // 滚动到顶部
keyMap.shiftAndDown = keyMap.down.map((i) => `shift+${i}`); // 滚动到底部
const pagerOption = { // 分页设置
  enable: true, // 是否启用
  minCount: 300, // 结果数量超过则pager
  size: 100, // 每页数量
};
const autoCompleteOption = { // 自动填充条件
  enbaleColumns: ['tags', 'order'].concat(Object.keys(showColumns).map((i) => [i, showColumns[i]]).filter((i) => i[1][0] && i[1][1] === 'text' && !(['command'].includes(i[0]))).map((i) => i[0])), // 支持tags或类型为text
  minLength: 3, // 最小字符数时，显示
  limit: 50, // 填充结果数限制
};
const tagsAlertStyle = { // 高亮标签
  // action: css
  Alert: 'color:#FF0;background-color:#080;',
  // 'Unlike': 'color:#F00!important;background-color:#000;',
  Unlike: 'color:#F00;background-color:#00F;',
  Like: 'color:#000;background-color:#0FF;',
};

// 导入原生模块
const fs = require('fs');
const path = require('path');

// 导入第三方模块
const electron = require('electron');
const mysql = require('mysql2/promise');

const waitInMs = require('../../_lib/waitInMs');
const findData = require('../js/findData');
const configChange = require('./common/configChange');
const tooltip = require('./common/tooltip');

const { ipcRenderer } = electron;
const { Menu } = electron.remote;
const EHT = JSON.parse(fs.readFileSync(path.join(__dirname, './../../comicSort/EHT.json'), 'utf-8')).data;
findData.init(EHT);
const mainTag = 'language,artist,group,parody,character,cosplayer,female,male,mixed,other,reclass,temp'.split(',');
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const randomColor = {};

// Function
const showResult = (page) => {
  // page为undefined时，自动跳转到上次阅读，否则跳转到第几页
  const store = ipcRenderer.sendSync('store');
  const condition = getCondition();
  const conditionStr = encodeURIComponent(JSON.stringify(condition));

  if (lastResult.length && !('time_view' in lastResult[0])) { // 仅在第一次，增加属性time_view，方便后续排序等操作
    for (const i of lastResult) {
      i.time_view = store.lastViewTime ? store.lastViewTime[i.path] || '' : '';
      i.viewed = i.time_view || (store.lastViewPosition && store.lastViewPosition[i.path]) ? 1 : 0;
    }
  }

  const html = ['<div class="tableHead">', '<table class="tablesorter-blackice">', '<thead>', '<th class="tablesorter-header" sort="id"></th>'];
  for (const i in showInfo) {
    if (showInfo[i][0]) {
      html.push(`<th ${lastResult.length && i in lastResult[0] ? `class="tablesorter-header" sort="${i}"` : ''}>${showInfo[i][1] || i}</th>`);
    }
  }
  html.push('</thead>', '</table>', '</div>');

  html.push('<div class="tableBody">', '<table class="tablesorter-blackice">', '<tbody>');
  let order = 1;
  let result = lastResult;
  if (pagerOption.enable && lastResult.length > pagerOption.minCount) { // 分页
    if (page === undefined) {
      const resultPosition = ipcRenderer.sendSync('store', 'get', 'resultPosition', {});
      let index = 0;
      if (JSON.stringify(condition) in resultPosition) {
        const file = resultPosition[JSON.stringify(condition)];
        index = lastResult.findIndex((i) => i.path === file);
      } else {
        const lastViewTimes = lastResult.map((i) => i.time_view);
        const sorted = lastViewTimes.filter((i) => i).sort(collator.compare).reverse();
        index = sorted.length ? lastViewTimes.indexOf(sorted[0]) : 0;
      }
      page = Math.floor(index / pagerOption.size) + 1;
    }
    if (page <= 0) page = 1;
    const max = Math.ceil(lastResult.length / pagerOption.size);
    if (page > max) page = max;
    result = result.slice((page - 1) * pagerOption.size, page * pagerOption.size);

    $('.pager').show();
    $('.pager>.first').off('click').on('click', () => { showResult(1); }).removeClass('disabled');
    $('.pager>.prev').off('click').on('click', () => { showResult(page - 1); }).removeClass('disabled');
    if (page === 1) $('.pager>.first,.pager>.prev').off('click').addClass('disabled');
    $('.pager>.next').off('click').on('click', () => { showResult(page + 1); }).removeClass('disabled');
    $('.pager>.last').off('click').on('click', () => { showResult(max); }).removeClass('disabled');
    if (page === max) $('.pager>.next,.pager>.last').off('click').addClass('disabled');
    $('.pager>.pagedisplay').attr('max', max);
    $('.pager>.pagedisplay>input').val(page).prop('max', max).off('change')
      .on('change', (e) => { showResult(e.target.value * 1); });
  } else {
    $('.pager').hide();
  }
  for (const row of result) {
    // fix mariadb
    if (typeof row.tags === 'string') row.tags = JSON.parse(row.tags);

    // tr
    const tagString = encodeURIComponent(JSON.stringify(row.tags));
    const star = store.star && store.star.includes(row.path) ? 1 : 0;
    const invisible = store.invisible && store.invisible.includes(row.path) ? 1 : 0;
    let tr = `<tr class="${order % 2 ? 'even' : 'odd'}" path="${row.path}" star="${star}" viewed="${row.viewed}" tags="${tagString}" invisible="${invisible}">`; // path 用于定位

    // td order
    tr = `${tr}<td>${order}</td>`;
    order = order + 1;

    for (const i in showInfo) {
      if (showInfo[i][0]) {
        const attr = [`name="${i}"`];
        let text = '';
        let sql = false;
        if (['time_upload', 'time_download', 'time_view'].includes(i)) {
          const time = row[i];
          const date = new Date(time);
          text = `<span datetime="${time}" title="${date.toLocaleString('zh-CN', { hour12: false })}"></span>`;
        } else if (['rating'].includes(i)) {
          const precent = (row.rating / 5) * 100;
          // eslint-disable-next-line no-nested-ternary
          const color = row.rating >= 4 ? '#0f0' : row.rating >= 2.5 ? '#ff0' : '#f00';

          attr.push(`style="background-image:-webkit-linear-gradient(left, ${color} ${precent}%, white ${100 - precent}%);"`);
          text = row.rating;
        } else if (['size'].includes(i)) {
          text = `${(row.size / 1024 / 1024).toFixed(2)} MB`;
        } else if (['event'].includes(i)) {
          text = [
            `<a href="${row.web}">Web</a>`,
            '<button name="star"></button>',
            '<button name="clear"></button>',
            '<br>',
            `<a href="${row.path}" name="delete" title="删除"></a>`,
            `<a href="${row.path}" name="empty" title="清空"></a>`,
            '<button name="invisible"></button>',
            '<br>',
            `<a name="native" href="./src/viewer.html?file=${encodeURIComponent(row.path)}">View</a>`,
            `<a name="native" href="./src/viewer.html?file=${encodeURIComponent(row.path)}&condition=${conditionStr}">List</a>`,
          ].join('');
        } else if (['path'].includes(i)) {
          sql = true;
          text = `<a href="${row.path}" name="item">${path.dirname(row[i]).replace(/\\(#[^\\]+)/g, (all, m1) => {
            const random = m1 in randomColor ? randomColor[m1] : Math.floor(Math.random() * 0x1000000);
            randomColor[m1] = random;
            return `\\<span style="background-color:#${random.toString(16)};color:#${(0x1000000 - random).toString(16)}">${m1}</span>`;
          })}</a>`;
        } else if (['title', 'title_main', 'title_jpn', 'title_jpn_main'].includes(i)) {
          sql = true;
          text = row[i] + (['title', 'title_main'].includes(i) ? `<a href="${row[i]}" name="everything"></a>` : '');
        } else if (i.match(/^tag:(.*)$/)) {
          const main = i.match(/^tag:(.*)$/)[1];
          if (row.tags && main in row.tags) {
            text = row.tags[main].map((sub) => {
              const condition = [[false, 'tags', `tags:${main}`, `${sub.split(' | ')[0]}`, undefined]];
              let color = '';
              const full = `${main}:${sub}`;
              if (full in tagsAlert) color = tagsAlert[full];
              return `<a name="native" href="./src/index.html?condition=${encodeURIComponent(JSON.stringify(condition))}" color="${color}">${findData(main, sub).cname || sub}</a>`;
            }).sort().join(', ');
          }
        } else {
          sql = true;
          text = row[i] instanceof Object ? JSON.stringify(row[i]) : row[i];
        }
        if (sql) {
          text = `<a name="native" href="./src/index.html?condition=${encodeURIComponent(JSON.stringify([[false, i, '=', row[i], undefined]]))}"></a>${text}`;
        }
        tr = `${tr}<td ${attr.join(' ')}>${text}</td>`;
      }
    }

    tr = `${tr}</tr>`;
    html.push(tr);
  }
  html.push('</tbody>', '</table>', '</div>');

  $('.result').html(html.join('')).get(0).scrollIntoView();
  if (condition.filter((i) => i[1] === 'order').length) {
    const filter = condition.filter((i) => i[1] === 'order');
    for (const find of filter) {
      $('.result').find(`th[sort="${find[3]}"]`).prop('className', `tablesorter-header tablesorter-header${find[2].substring(0, 1).toUpperCase()}${find[2].substring(1).toLowerCase()}`);
    }
  }
  $('.tableBody').css('height', document.documentElement.clientHeight - 120);

  updateRelativeTime();
  scrollElement = $('.tableBody').get(0);
  $(scrollElement).on('scroll', () => {
    const total = $(scrollElement).prop('scrollHeight');
    let current = $(scrollElement).prop('scrollTop');
    current = current + Math.min(parseInt($(scrollElement).css('height'), 10), document.documentElement.clientHeight);
    electron.remote.getCurrentWindow().setProgressBar(Math.min(current / total, 1));
  });
  resultTable = $('.tableBody');

  const colgroup = ['<colgroup>'];

  const overallWidth = $('.tableBody>table').width();
  for (const td of $('.tableBody>table>tbody>tr:nth-child(1)>td').toArray()) {
    const width = $(td).width();
    const percent = `${parseInt((width / overallWidth) * 1000, 10) / 10}%`;
    colgroup.push(`<col style="width: ${percent};">`);
  }
  colgroup.push('</colgroup>');
  $('.tablesorter-blackice').prepend(colgroup.join(''));
  $('.tableHead').css('width', overallWidth);

  scrollToLast();
};
const showBookmarks = () => {
  const conditions = ipcRenderer.sendSync('config', 'get', 'bookmarkCondition', {});
  const html = ['<ul>'];
  for (const name of Object.keys(conditions)) {
    const condition = encodeURIComponent(conditions[name]);
    html.push(`<li><a name="native" href="./src/index.html?condition=${condition}">${name}</a></li>`);
  }
  html.push('</ul>');
  $('.bookmarks').html(html.join(''));
};
const showHistory = () => {
  const history = ipcRenderer.sendSync('store', 'get', 'history', []);
  const html = [
    '<ul>',
  ];
  for (const href of history) {
    const name = href.match(/^.\/src\//) ? 'native' : 'path';
    const text = decodeURIComponent(href.replace('./src/', ''));
    html.push(`<li><a name="${name}" href="${href}">${text}</a></li>`);
  }
  html.push('</ul>');
  $('.history').html(html.join(''));
};
const getCondition = () => {
  const condition = [];
  const elems = $('.filter>.condition');

  for (let i = 0; i < elems.length; i++) {
    const parent = elems.eq(i);

    const not = parent.find('[name="not-condition"]').prop('checked');
    const column = parent.find('[name="column"]').val();
    const comparison = parent.find('.comparison:visible').val();
    const value = parent.find('.value:visible').val();
    const value1 = parent.find('.value:visible').eq(1).val();
    condition.push([not, column, comparison, value, value1]);
  }
  return condition;
};
const getConditionReadable = () => {
  const condition = getCondition();
  const text = condition.map((i) => {
    let text = i[0] ? '!' : '';
    if (i[1] === 'tags') {
      let main = i[2].split(':')[1];
      if (main === '*') {
        main = null;
        text = `${text}*:`;
      } else {
        text = `${text}${findData(main).cname}:`;
      }

      text = text + (findData(main, i[3]).cname || i[3]);
    } else if (i[1] === 'order') {
      text = `${showInfo[i[3]][1]}:${i[2] === 'ASC' ? '升序' : '降序'}`;
    } else if ($('.comparison:not(.hide)').attr('name') === 'comp-datetime') {
      text = `${text}${i[1]}:${i[2]}`;
    } else if (i[2] === 'Duplicate') {
      text = `${text}重复值:${i[1]}`;
    } else {
      text = text + i[3];
    }
    return text;
  }).join('&&');
  return text;
};
const rememberCondition = (key) => {
  configChange((config) => {
    const condition = getCondition();
    config[key] = JSON.stringify(condition);
  });
};
const showCondition = (conditions) => {
  for (let i = 0; i < conditions.length; i++) {
    const [not, column, comparison, value, value1] = conditions[i];
    if (i !== 0) $('.filter').find('.condition>[name="new-condition"]').eq(-1).click();
    const parent = $('.filter').find('.condition').eq(-1);

    parent.find('[name="not-condition"]').prop('checked', not);
    parent.find('[name="column"]').val(column).trigger('change');
    parent.find('.comparison:visible').val(comparison);
    parent.find('.value:visible').val(value);
    parent.find('.value:visible').eq(1).val(value1);
  }
};
const calcRelativeTime = (time) => {
  const lasttime = new Date(time).getTime();
  if (Number.isNaN(lasttime)) return '';
  const delta = new Date().getTime() - lasttime;
  const info = {
    ms: 1,
    s: 1000,
    m: 60,
    h: 60,
    d: 24,
    mh: 30,
    y: 12,
  };
  let suf;
  let t = delta;
  for (const i of Object.keys(info)) {
    const m = t / info[i]; // 倍数
    const r = t % info[i]; // 余数
    if (m >= 1 || info[i] - r <= 2) { // 进阶
      t = m;
      suf = i;
    } else {
      break;
    }
  }
  t = Math.round(t);
  const double = ''; // t > 1 ? 's' : ''
  let text = `${t}${suf}${double}`;
  if (delta <= 1000 * 60 * 60 * 24 * 30) text = `<span class="highlight">${text}</span>`;
  return text;
};
const updateRelativeTime = () => {
  $('[datetime]').toArray().forEach((ele) => {
    $(ele).html(calcRelativeTime($(ele).attr('datetime')));
  });
};
const updateTitleUrl = () => {
  const condition = getCondition();
  document.title = getConditionReadable();

  const params = new URLSearchParams();
  params.set('condition', JSON.stringify(condition));
  window.history.pushState(null, 'INDEX', `?${params.toString()}`);
};
const scrollToLast = () => {
  let scrollTop = 0;

  const condition = getCondition();
  const resultPosition = ipcRenderer.sendSync('store', 'get', 'resultPosition', {});

  let file;
  if (JSON.stringify(condition) in resultPosition) {
    file = resultPosition[JSON.stringify(condition)];
  } else {
    const lastViewTimes = lastResult.map((i) => i.time_view);
    const sorted = lastViewTimes.filter((i) => i).sort(collator.compare).reverse();
    const index = sorted.length ? lastViewTimes.indexOf(sorted[0]) : 0;
    if (index in lastResult) file = lastResult[index].path;
  }
  if (file) {
    const item = resultTable.find('tbody>tr').filter(`[path="${window.CSS.escape(file)}"]`);
    if (item.length) {
      item.eq(0).addClass('trHover');
      scrollTop = item.get(0).offsetTop;
    }
  }

  scrollElement.scrollTop = scrollTop;
  $('.result').get(0).scrollIntoView();
};

// Main
const main = async () => {
  if (window.location.search === '' && electron.remote.getCurrentWindow().id === 1 && ipcRenderer.sendSync('config', 'get', 'rememberLastTabs') && ipcRenderer.sendSync('config', 'get', 'lastTabs', []).length) {
    const confirm = await tooltip({
      title: '是否打开上次保存的网页',
      autoClose: 'cancel|10000',
      backgroundDismiss: 'cancel',
      buttons: {
        ok: {
          text: 'OK',
          keys: ['enter'],
          btnClass: 'btn-red',
        },
        cancel: {
          text: 'Cancel',
          btnClass: 'btn-blue',
        },
      },
    });
    if (confirm === 'ok') {
      if (ipcRenderer.sendSync('config', 'get', 'deleteLastTabs')) {
        configChange((config) => delete config.lastTabs);
      }

      ipcRenderer.sendSync('open', ipcRenderer.sendSync('config', 'get', 'lastTabs'));
      electron.remote.getCurrentWindow().close();
      return;
    }
  }

  // 生成option-column
  for (const i in showColumns) {
    if (showColumns[i][0]) {
      $(`<option type="${showColumns[i][1]}" value="${i}">${i}</option>`).appendTo('.filter [name="column"]');
    }
  }

  let lastActiveElement = null;

  // 条件
  $('.filter').on('click', '[name="toggle-not-condition"]', (e) => {
    const parent = $(e.target).parent();
    const checked = parent.find('[name="not-condition"]').prop('checked');
    parent.find('[name="not-condition"]').prop('checked', !checked);
  });
  $('.filter').on('change', '[name="column"]', (e) => {
    const parent = $(e.target).parent();
    const column = parent.find('[name="column"]').val();
    const type = parent.find('[name="column"]').find(`[value="${column}"]`).attr('type');
    parent.find('.comparison').addClass('hide');
    parent.find(`.comparison[name="comp-${type}"]`).removeClass('hide');
    parent.find('.value').addClass('hide');
    parent.find(type === 'datetime' ? '.value[name^="value-time"]' : '.value[name="value-common"]').removeClass('hide');
  });
  $('.filter').on('change', '.comparison', (e) => {
    const parent = $(e.target).parent();
    parent.find('.value:visible').trigger('input');
  });

  // 自动填充
  let typing = false;
  $('.filter').on('compositionstart', '.value[name="value-common"]', async (e) => {
    typing = true;
  });
  $('.filter').on('compositionend', '.value[name="value-common"]', async (e) => {
    typing = false;
    $(document.activeElement).trigger('input');
  });
  $('.filter').on('keydown', '.value[name="value-common"]', async (e) => {
    lastActiveElement = e.target;
    const hasItem = $('.datalist li').length;
    let onItem = $('.datalistHover').index();
    if ((e.ctrlKey && e.key === 's')) {
      rememberCondition('starCondition');
    } else if (['Enter'].includes(e.key) && (hasItem === 0 || $('.datalist').is(':hidden'))) {
      $('.filter').find('[name="query"]').trigger('click');
    } else if (hasItem && e.key.match(/^[0-9]$/)) {
      e.preventDefault();
      $('.datalist li').eq(e.key === '0' ? 9 : e.key - 1).click();
    } else if (hasItem && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
      if (['ArrowUp'].includes(e.key)) {
        onItem = onItem + -1;
      } else if (['ArrowDown'].includes(e.key)) {
        onItem = onItem + 1;
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        onItem = onItem + -10;
      } else if (['ArrowRight', 'PageDown'].includes(e.key)) {
        onItem = onItem + 10;
      } else if (['Home'].includes(e.key)) {
        onItem = 0;
      } else if (['End'].includes(e.key)) {
        onItem = -1;
      }
      while (onItem < 0 || onItem >= hasItem) {
        onItem = onItem + (onItem < 0 ? hasItem : -hasItem);
      }
      $('.datalistHover').removeClass('datalistHover');
      $('.datalist li').eq(onItem).addClass('datalistHover').get(0)
        .scrollIntoView();
      $(window).scrollTop(0);
    } else if (onItem >= 0 && ['Enter', 'Insert'].includes(e.key)) {
      $('.datalistHover').click();
    }
    // console.log(e.key, hasItem, onItem);
  });
  $('.filter').on('input', '.value[name="value-common"]', async (e) => {
    const value = $(e.target).val();
    const parent = $(e.target).parent();
    const column = parent.find('[name="column"]').val();
    const comparison = parent.find('.comparison:visible').val();
    $('.datalist>ol').empty();
    if (!autoCompleteOption.enbaleColumns.includes(column) || (value.length < autoCompleteOption.minLength && !value.match(/[\u4e00-\u9fa5]/)) || typing) return;
    if (column === 'tags') {
      const main = comparison.replace('tags:', '');
      let html = [];
      let tags;
      if (main === '*') {
        tags = EHT;
      } else {
        tags = EHT.filter((i) => i.namespace === main);
      }

      tags.forEach((i) => {
        for (const key of Object.keys(i.data)) {
          const name = i.data[key].name.replace(/!\[(.*?)\]\((.*?)\)/g, '');
          if (key.match(value) || name.match(value)) {
            html.push(`<li cname="${name}">${key}</li>`);
          }
        }
      });

      html = Array.from(new Set(html));
      $('.datalist>ol').html(html.join(''));
    } else if (column === 'order') {
      if (!columns) {
        const query = 'SHOW COLUMNS FROM files';
        const [rows] = await ipcRenderer.sendSync('database-query', query);
        columns = rows.map((i) => i.Field);
      }
      const html = [];
      columns.filter((i) => i.includes(value)).forEach((i) => html.push(`<li>${i}</li>`));
      $('.datalist>ol').html(html);
    } else if (showColumns[column][1] === 'text') {
      const query = `SELECT ${column} FROM files WHERE ${column} LIKE ${mysql.escape(`%${value.replace(/[%_\\]/g, '\\$&')}%`)} LIMIT ${autoCompleteOption.limit}`;
      const [rows] = await ipcRenderer.sendSync('database-query', query);
      const html = [];
      Array.from(new Set(rows.map((i) => i[column]))).forEach((i) => html.push(`<li>${i}</li>`));
      $('.datalist>ol').html(html);
    }
    $('.datalist').show();
  });
  $('.filter').on('focusin', '.value[name="value-common"]', async (e) => {
    const value = $(e.target).val();
    const parent = $(e.target).parent();
    const column = parent.find('[name="column"]').val();
    if (!autoCompleteOption.enbaleColumns.includes(column) || (value.length < autoCompleteOption.minLength && !value.match(/[\u4e00-\u9fa5]/)) || typing) {
      $('.datalist').hide();
    } else {
      $('.datalist').show();
    }
  });
  $('.filter').on('focusout', '.value[name="value-common"]', async (e) => {
    await waitInMs(200);
    $('.datalist').hide();
  });

  // 按钮-增删条件
  const cloned = $('.filter>.condition').clone();
  $('.filter').on('click', '[name="new-condition"]', (e) => {
    const parent = $(e.target).parent();
    cloned.clone().insertAfter(parent);
  });
  $('.filter').on('click', '[name="delete-condition"]', (e) => {
    const parent = $(e.target).parent();
    if ($('.filter>.condition').length <= 1) cloned.clone().insertBefore(parent);
    parent.remove();
  });

  // 按钮-查询
  $('.filter').find('[name="query"]').on('click', async (e) => {
    rememberCondition('lastCondition');

    const condition = getCondition();

    const [rows] = ipcRenderer.sendSync('query-by-condition', condition);
    lastResult = rows;
    showResult();
    updateTitleUrl();
  });

  // 按钮-星标/收藏
  $('.filter').find('[name="star-condition"]').on('click', async (e) => {
    rememberCondition('starCondition');
  });
  $('.filter').find('[name="bookmark-condition"]').on('click', async (e) => {
    const condition = getCondition();
    let nameBefore = null;
    const bookmarkCondition = ipcRenderer.sendSync('config', 'get', 'bookmarkCondition', {});
    const conditionStr = JSON.stringify(condition);
    if (Object.values(bookmarkCondition).includes(conditionStr)) {
      const index = Object.values(bookmarkCondition).indexOf(conditionStr);
      nameBefore = Object.keys(bookmarkCondition)[index];
    }

    const name = await new Promise((resolve, reject) => {
      $.confirm({
        theme: 'supervan',
        boxWidth: '30%',
        useBootstrap: false,
        title: 'Please put in NAME:',
        content: '<input name="name" style="width:95%;border:none;">',
        autoClose: null,
        backgroundDismiss: 'cancel',
        buttons: {
          submit: {
            text: 'Submit',
            btnClass: 'btn-blue',
            keys: ['enter'],
            action() {
              const name = this.$content.find('[name="name"]').val();
              resolve(name);
            },
          },
          cancel() {
            resolve(null);
          },
        },
        onContentReady() {
          this.$content.find('[name="name"]').focus().val(nameBefore || getConditionReadable());
        },
      });
    });
    if (!name) return;
    configChange((config) => {
      if (!('bookmarkCondition' in config)) config.bookmarkCondition = {};
      if (nameBefore) delete config.bookmarkCondition[nameBefore];
      config.bookmarkCondition[name.trim()] = conditionStr;
    });
    tooltip('保存完成', name);
  });

  // 按钮-打开新窗口
  $('.filter').find('[name="new-query"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/index.html');
  });
  $('.filter').find('[name="config"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/config.html');
  });
  $('.filter').find('[name="viewer"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/viewer.html');
  });

  // 按钮-移动结果
  $('.filter').find('[name="move-files"]').on('click', async (e) => {
    if (!lastResult.length) return;
    const result = electron.remote.dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    });
    if (result && result.length) {
      const dir = result[0];
      const libraryFolder = ipcRenderer.sendSync('config', 'get', 'libraryFolder');
      const files = lastResult.map((i) => i.path).map((i) => path.resolve(libraryFolder, i));
      const moveMode = path.parse(libraryFolder).root === path.parse(dir).root;
      for (const file of files) {
        electron.remote.getCurrentWindow().setProgressBar((files.indexOf(file) + 1) / files.length);
        if (!fs.existsSync(file)) continue;
        const fileNew = path.resolve(dir, path.basename(file));
        try {
          if (moveMode) {
            fs.renameSync(file, fileNew);
          } else {
            const info = fs.statSync(file);
            fs.writeFileSync(fileNew, fs.readFileSync(file));
            fs.utimesSync(fileNew, info.atime, info.mtime);
            ipcRenderer.send('open-external', file, 'delete');
          }
        } catch (error) {
          if (error.code === 'EBUSY') {
            console.error(`File Locked: ${file}`);
          } else {
            console.error(error);
          }
        }
      }
      electron.remote.getCurrentWindow().setProgressBar(-1);
      tooltip('移动完成');
    }
  });

  // 按钮-清理
  $('.filter').find('[name="clear"]').on('click', async (e) => {
    ipcRenderer.sendSync('clear');
  });

  // 按钮-【显示/隐藏】被隐藏的文件
  $('.filter').find('[name="toggle-invisible"]').on('click', async (e) => {
    const statusAll = ['hide', 'show'];
    const statusNow = $(e.target).attr('status') || statusAll[0];
    const status = statusAll[(statusAll.indexOf(statusNow) + 1) % statusAll.length];
    $(e.target).attr('status', status);
    if (status === 'hide') {
      $('.query>.result>.tableBody tr[raw-invisible="1"]').attr('invisible', '1').attr('raw-invisible', null);
    } else if (status === 'show') {
      $('.query>.result>.tableBody tr[invisible="1"]').attr('raw-invisible', '1').attr('invisible', null);
    }
    scrollToLast();
  });
  // 按钮-【所有/只显示/隐藏】收藏/阅读过
  $('.filter').find('[name="toggle-star"],[name="toggle-viewed"]').on('click', async (e) => {
    const name = $(e.target).attr('name').match(/^toggle-(.*)$/)[1];
    const statusAll = ['all', 'hide', 'only'];
    const statusNow = $(e.target).attr('status') || statusAll[0];
    const status = statusAll[(statusAll.indexOf(statusNow) + 1) % statusAll.length];
    $(e.target).attr('status', status);
    if (status === 'all') {
      $(`.query>.result>.tableBody tr[${name}-invisible]`).attr(`${name}-invisible`, null);
    } else if (status === 'only') {
      $(`.query>.result>.tableBody tr[${name}="1"][${name}-invisible]`).attr(`${name}-invisible`, null);
      $(`.query>.result>.tableBody tr:not([${name}="1"]):not([${name}-invisible])`).attr(`${name}-invisible`, '1');
    } else if (status === 'hide') {
      $(`.query>.result>.tableBody tr[${name}="1"]:not([${name}-invisible])`).attr(`${name}-invisible`, '1');
      $(`.query>.result>.tableBody tr:not([${name}="1"])[${name}-invisible]`).attr(`${name}-invisible`, null);
    }
    scrollToLast();
  });

  // 自动填充-选择项点击
  $('.filter').on('click', '.datalist li', async (e) => {
    $(lastActiveElement).val($(e.target).text());
    $('.datalist').hide();
  });

  // 结果-预览图片
  let loading = false;
  $('.result').on('mouseover', 'tr>[name^="title"]', (e) => {
    if (loading) return;
    loading = true;
    const libraryFolder = ipcRenderer.sendSync('config', 'get', 'libraryFolder');
    const target = e.currentTarget.parentElement;
    const file = $(target).attr('path');
    if (!file) {
      $('.preview').hide();
      loading = false;
      return;
    }

    const fullpath = path.resolve(libraryFolder, file);
    $(target).attr('exists', fs.existsSync(fullpath));

    const { dir, name } = path.parse(file);
    const src = path.resolve(libraryFolder, dir, `${name}.jpg`);
    let cover = $(target).attr('cover');
    if (!cover && !$(target).prop('image_loading') && fs.existsSync(src)) {
      $(target).prop('image_loading', true);
      $('.preview[name="cover"]>img').attr('src', null);
      fs.readFile(src, (err, buffer) => {
        $(target).prop('image_loading', null);
        if (err) {
          // noop
        } else {
          const blob = new window.Blob([new Uint8Array(buffer)]);
          cover = URL.createObjectURL(blob);
          $(target).attr('cover', cover);
          $('.preview[name="cover"]>img').attr('src', cover);
        }
      });
    } else {
      $('.preview[name="cover"]>img').attr('src', cover || null);
    }

    const html = [];
    let tagsChs = $(target).prop('tagsChs');
    if (!tagsChs) {
      let tags = $(target).attr('tags');
      if (!tags || tags === 'null') {
        tagsChs = '';
      } else {
        tags = JSON.parse(decodeURIComponent(tags));
        tagsChs = [];
        for (const main of mainTag) {
          if (!(main in tags)) continue;
          const chs = `${findData(main).cname}: `;
          const subChs = [];
          for (const sub of tags[main]) {
            let color = '';
            const full = `${main}:${sub}`;
            if (full in tagsAlert) color = tagsAlert[full];
            const html = `<span color="${color}">${findData(main, sub).cname || sub}</span>`;
            subChs.push(html);
          }
          tagsChs.push(chs + subChs.join(', '));
        }
        tagsChs = `<ul>${tagsChs.map((i) => `<li>${i}</li>`).join('')}</ul>`;
      }
      $(target).prop('tagsChs', tagsChs).attr('tags', null);
    }
    html.push(tagsChs);

    $('.preview[name="tags"]').html(html.join('<br>'));
    $('.preview').show();
    loading = false;
  });
  $('.result').on('mousemove', 'tr>[name^="title"]', (e) => {
    const outerWidth = $('.preview[name="tags"]').outerWidth();
    const outerHeight = $('.preview[name="tags"]').outerHeight();
    let left = outerWidth + e.clientX + 10 < window.innerWidth ? e.clientX + 5 : e.clientX - outerWidth - 5;
    let top = outerHeight + e.clientY + 10 < window.innerHeight ? e.clientY + 5 : e.clientY - outerHeight - 5;
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    $('.preview[name="tags"]').css({ left, top });
  });
  $('.result').on('mouseout', 'table', (e) => {
    // if ($(e.toElement).is('table,table *,.preview *')) return
    // console.log(e.toElement)
    $('.preview').hide();
  });

  // 结果-点击事件
  $('.result').on('click', 'tr', (e) => {
    $('.trHover').removeClass('trHover');
    const parent = $(e.target).parentsUntil('tbody').eq(-1);
    parent.addClass('trHover');
  });
  $('.result').on('click', 'tr[path]>td>button[name="star"]', async (e) => {
    e.preventDefault();
    const parent = $(e.target).parentsUntil('tbody').eq(-1);
    const file = parent.attr('path');
    let star = parent.attr('star');
    star = star === '1' ? 0 : 1;
    configChange((obj) => {
      if (!('star' in obj)) obj.star = [];
      if (star === 1 && !obj.star.includes(file)) {
        obj.star.push(file);
      } else if (star === 0 && obj.star.includes(file)) {
        obj.star.splice(obj.star.indexOf(file, 1));
      }
    }, 'store');
    parent.attr('star', star);
  });
  $('.result').on('click', 'tr[path]>td>button[name="clear"]', async (e) => {
    e.preventDefault();
    const parent = $(e.target).parentsUntil('tbody').eq(-1);
    const file = parent.attr('path');
    parent.find('[name="time_view"]').attr('datetime', 'null');
    configChange((obj) => {
      if (obj.lastViewPosition && file in obj.lastViewPosition) delete obj.lastViewPosition[file];
      if (obj.lastViewTime && file in obj.lastViewTime) delete obj.lastViewTime[file];
      if (obj.history && obj.history.includes(file)) obj.history.splice(obj.history.indexOf(file), 1);
    }, 'store');
    updateRelativeTime();
  });
  $('.result').on('click', 'tr[path]>td>button[name="invisible"]', async (e) => {
    e.preventDefault();
    const parent = $(e.target).parentsUntil('tbody').eq(-1);
    const file = parent.attr('path');
    const invisible = (parent.attr('invisible') || parent.attr('raw-invisible')) === '1' ? 0 : 1;
    configChange((obj) => {
      if (!('invisible' in obj)) obj.invisible = [];
      if (invisible) {
        obj.invisible.push(file);
      } else if (obj.invisible.includes(file)) obj.invisible.splice(obj.invisible.indexOf(file), 1);
    }, 'store');
    parent.attr('invisible', invisible);
    parent.attr('raw-invisible', invisible);
  });
  $('.result').on('click', 'th[sort]', (e) => { // 排序
    const key = $(e.target).attr('sort');
    const isAsc = $(e.target).is('.tablesorter-headerAsc');

    const condition = getCondition();
    let elem;
    if (condition.find((i) => i[1] === 'order' && i[3] === key)) {
      elem = $('.filter>.condition').toArray().find((i) => $(i).find('[name="column"]').val() === 'order' && $(i).find('.value:visible').val() === key);
    } else if (condition.find((i) => i[1] === 'order')) {
      elem = $('.filter>.condition').toArray().find((i) => $(i).find('[name="column"]').val() === 'order');
      elem = $(elem).clone().insertBefore(elem);
    } else {
      elem = $('.filter>.condition').eq(-1).clone().insertAfter($('.filter>.condition').eq(-1));
    }
    $(elem).find('[name="column"]').val('order').trigger('change');
    $(elem).find('.value:visible').val(key);
    $(elem).find('[name="comp-order"]').val(isAsc ? 'DESC' : 'ASC');
    $('.filter').find('[name="query"]').click();

    showResult();
  });

  // 侧边栏
  $('.btnBox>button').on('click', (e) => {
    const name = $(e.target).attr('name');
    const visible = $('.sidebar').filter(`.${name}`).is(':visible');
    $('.sidebar').hide();
    if (visible) {
      $('.btnBox').addClass('btnBox-hide');
    } else {
      $('.btnBox').removeClass('btnBox-hide');
      $('.sidebar').filter(`.${name}`).show();
      if (name === 'bookmarks') {
        showBookmarks();
      } else if (name === 'history') {
        showHistory();
      }
    }
  });

  // 全局事件
  $('body').on('click', 'a', async (e) => {
    e.preventDefault();
    const parent = $(e.target).parentsUntil('tbody').eq(-1);
    const href = $(e.target).attr('href');
    const name = $(e.target).attr('name');
    const file = parent.attr('path');
    // name: native, path, delete, empty, everything, null
    if (name === 'native') {
      ipcRenderer.send('open', href);
    } else {
      ipcRenderer.send('open-external', href, name);
      if (name === 'path') {
        const date = new Date();
        configChange((obj) => {
          if (!('lastViewTime' in obj)) obj.lastViewTime = {};
          obj.lastViewTime[file] = date.toLocaleString('zh-CN', { hour12: false });
        }, 'store');
        parent.find('[name="time_view"]').attr('datetime', date);
        waitInMs(1000).then(() => {
          updateRelativeTime();
        });
      } else if (['delete', 'empty'].includes(name)) {
        parent.remove();
      }
    }
    if ([undefined, 'native', 'path'].includes(name)) {
      const rememberHistory = ipcRenderer.sendSync('config', 'get', 'rememberHistory');
      configChange((obj) => {
        if (!name || !rememberHistory) return true;
        if (!('history' in obj)) obj.history = [];
        obj.history.unshift(href);
        return false;
      }, 'store');
    }

    const condition = getCondition();
    if (file) {
      configChange((obj) => {
        if (!('resultPosition' in obj)) obj.resultPosition = {};
        obj.resultPosition[JSON.stringify(condition)] = file;
      }, 'store');
    }
  });

  // 全局快捷键
  let keypressLastTime = 0;
  Mousetrap.bind([].concat(keyMap.up, keyMap.down), async (e, combo) => { // 上下键
    if (e.type === 'keypress' && new Date().getTime() - new Date(keypressLastTime).getTime() <= keypressTimeout) return false;

    if (keyMap.up.includes(combo)) { // 向上滚动
      scrollElement.scrollTop = scrollElement.scrollTop + -scrollHeight;
    } else if (keyMap.down.includes(combo)) { // 向下滚动
      scrollElement.scrollTop = scrollElement.scrollTop + scrollHeight;
    }

    keypressLastTime = new Date().getTime();
    return false;
  });
  Mousetrap.bind([].concat(keyMap.left, keyMap.right), async (e, combo) => { // 左右键
    if (keyMap.left.includes(combo)) { // 向上滚动
      scrollElement.scrollTop = scrollElement.scrollTop + -scrollElement.clientHeight;
    } else if (keyMap.right.includes(combo)) { // 向下滚动
      scrollElement.scrollTop = scrollElement.scrollTop + scrollElement.clientHeight;
    }
    return false;
  });
  Mousetrap.bind([].concat(keyMap.shiftAndUp, keyMap.shiftAndDown), (e, combo) => { // shift+上下键 滚动到顶部或底部
    scrollElement.scrollTop = keyMap.shiftAndUp.includes(combo) ? 0 : scrollElement.scrollHeight;
    return false;
  });
  Mousetrap.bind([].concat(keyMap.upLeft, keyMap.upRight), async (e, combo) => { // 打开上/下一本书籍
    $('.pager').find(keyMap.upLeft.includes(combo) ? '.prev' : '.next').click();
    return false;
  }, 'keyup');

  // 连接数据库
  const result = ipcRenderer.sendSync('database-connect');
  if (result[1] !== 1) {
    ipcRenderer.send('open', './src/config.html');
    electron.remote.getCurrentWindow().close();
  }

  tagsAlert = ipcRenderer.sendSync('config', 'get', 'tagsAlert', '{}');
  tagsAlert = JSON.parse(tagsAlert);
  $('<style>').text(Object.keys(tagsAlertStyle).map((i) => `[color="${i}"]{${tagsAlertStyle[i]}}`).join('\n')).appendTo('head');

  // 还原上次或链接里的条件
  const params = (new URL(document.location)).searchParams;
  if (params.get('condition')) {
    showCondition(JSON.parse(params.get('condition')));
    if (ipcRenderer.sendSync('config', 'get', 'fastQuery')) $('.filter').find('[name="query"]').trigger('click');
  } else if (ipcRenderer.sendSync('config', 'get', 'rememberLastCondition')) {
    showCondition(JSON.parse(ipcRenderer.sendSync('config', 'get', 'lastCondition', '[]')));
  } else if (ipcRenderer.sendSync('config', 'get', 'useStarCondition')) {
    showCondition(JSON.parse(ipcRenderer.sendSync('config', 'get', 'starCondition', '[]')));
  }

  // 右键菜单
  let rightEvent;
  const menuItem = [
    {
      label: '删除web相同的本子',
      click: () => {
        for (const item of lastResult) {
          let arr = lastResult.filter((i) => i.web === item.web);
          arr = arr.sort((a, b) => {
            const ta = new Date(a.time_download).getTime();
            const tb = new Date(b.time_download).getTime();
            // eslint-disable-next-line no-nested-ternary
            return ta > tb ? -1 : ta < tb ? 1 : 0;
          });
          for (let i = 1; i < arr.length; i++) {
            console.log(arr[i].path);
            ipcRenderer.send('open-external', arr[i].path, 'delete');
          }
        }
      },
    },
    {
      label: '清空该本子内容',
      click: () => {
        if (!$(rightEvent.target).is('.tableBody>table>tbody>tr>td')) return;
        const index = $(rightEvent.target).parent().index();
        const item = lastResult[index];
        console.log(item.path);
        ipcRenderer.send('open-external', item.path, 'empty');
      },
    },
    {
      label: '清空这之后的本子内容',
      click: () => {
        if (!$(rightEvent.target).is('.tableBody>table>tbody>tr>td')) return;
        const index = $(rightEvent.target).parent().index();
        if (window.confirm(`是否清空第${index + 1}本以及之后的本子`)) {
          for (const item of lastResult.slice(index)) {
            console.log(item.path);
            ipcRenderer.send('open-external', item.path, 'empty');
          }
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Inspect Element',
      click: () => {
        electron.remote.getCurrentWindow().openDevTools();
        console.log(rightEvent);
      },
    },
  ];
  const contextMenu = Menu.buildFromTemplate(menuItem);
  $('.result').on('contextmenu', (e) => {
    e.preventDefault();
    rightEvent = e;
    contextMenu.popup(electron.remote.getCurrentWindow());
  });
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit(1);
});
