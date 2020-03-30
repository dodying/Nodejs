// ==Headers==
// @Name:               index
// @Description:        index
// @Version:            1.0.1560
// @Author:             dodying
// @Created:            2020-02-04 13:54:15
// @Modified:           2020-3-30 19:11:28
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron,mysql2
// ==/Headers==
/* global Mousetrap */

// query
// 显示所有列 SHOW COLUMNS FROM files

// 全局变量
let scrollElement = $('html').get(0);
let observer = null;
let tagsAlert = null;

// 可自定义
const keypressTimeout = 80; // keypress事件延迟
const scrollHeight = 50; // 滚动高度(keyMap.up/down)
const showInfo = { // 查询结果-显示列
  // 按key顺序显示
  // [是否显示， 中文标题]
  category: [true, '类别'],
  language: [false, '语言'],
  time_upload: [true, '上传时间'],
  time_download: [true, '下载时间'],
  time_view: [true, '最近阅读'], // (#)上次阅读事件
  pages: [true, '页数'],
  size: [false, '文件大小'],
  rating: [true, '评分'],
  favorited: [false, '星标数'],
  event: [true, '事件'], // (#)
  uploader: [false, '上传者'],
  'tag:artist': [true, '标签:作者'], // (#)标签:作者
  artist: [false, '作者'],
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
  'tag:misc': [true, '标签:杂项'], // (#)标签:杂项
  'tag:group': [false, '标签:组织'] // (#)标签:组织
  // tag:language
  // tag:reclass
};
const keyMap = { // 按键事件
  up: ['w', 'up', '8'], // 向上滚动scrollHeight高度
  down: ['s', 'down', '5'], // 向下滚动scrollHeight高度
  left: ['a', 'left', '4'], // 向上翻页
  right: ['d', 'right', '6'], // 向下翻页
  upLeft: ['q', '7'], // 上一页
  upRight: ['e', '9'] // 下一页
};
const showColumns = { // 筛选条件要显示的类别
  // 按key顺序显示
  // [是否显示， 类型]
  tags: [true, 'json'],
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
  command: [true, 'text'] // (#)
};
keyMap.shiftAndUp = keyMap.up.map(i => `shift+${i}`); // 滚动到顶部
keyMap.shiftAndDown = keyMap.down.map(i => `shift+${i}`); // 滚动到底部
const pagerOption = { // 分页设置
  enable: true, // 是否启用
  minCount: 300, // 结果数量超过则pager
  size: 100 // 每页数量
};
const autoCompleteOption = { // 自动填充条件
  enbaleColumns: ['tags'].concat(Object.keys(showColumns).map(i => [i, showColumns[i]]).filter(i => i[1][0] && i[1][1] === 'text' && !(['command'].includes(i[0]))).map(i => i[0])), // 支持tags或类型为text
  minLength: 3, // 最小字符数时，显示
  limit: 50 // 填充结果数限制
};
const tagsAlertStyle = { // 高亮标签
  // action: css
  Alert: 'color:#FF0;background-color:#080;',
  // 'Unlike': 'color:#F00!important;background-color:#000;',
  Unlike: 'color:#F00;background-color:#00F;',
  Like: 'color:#000;background-color:#0FF;'
};

// 导入原生模块
const fs = require('fs');
const path = require('path');

// 导入第三方模块
const electron = require('electron');
const mysql = require('mysql2/promise');

const waitInMs = require('./../../_lib/waitInMs');
const findData = require('./../js/findData');
const configChange = require('./common/configChange');
const tooltip = require('./common/tooltip');
const ipcRenderer = electron.ipcRenderer;
const EHT = JSON.parse(fs.readFileSync(path.join(__dirname, './../../comicSort/EHT.json'), 'utf-8')).data;
findData.init(EHT);
const mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc'];

// Function
const showResult = (rows = []) => {
  const store = ipcRenderer.sendSync('store');
  const condition = encodeURIComponent(JSON.stringify(getCondition()));

  const html = ['<table>', '<thead>', '<th></th>'];
  for (const i in showInfo) {
    if (showInfo[i][0]) html.push(`<th>${showInfo[i][1] || i}</th>`);
  }
  html.push('</thead>');

  html.push('<tbody>');
  let order = 1;
  for (const row of rows) {
    // tr
    const tagString = encodeURIComponent(JSON.stringify(row.tags));
    const star = store.star && store.star.includes(row.path) ? 1 : 0;
    const invisible = store.invisible && store.invisible.includes(row.path) ? 1 : 0;
    let tr = `<tr path="${row.path}" star="${star}" tags="${tagString}" invisible="${invisible}">`; // path 用于定位

    // td order
    tr += `<td>${order++}</td>`;

    for (const i in showInfo) {
      if (showInfo[i][0]) {
        const attr = [`name="${i}"`];
        let text = '';
        if (['time_upload', 'time_download', 'time_view'].includes(i)) {
          const time = ['time_view'].includes(i) ? (store.lastViewTime && store.lastViewTime[row.path] ? store.lastViewTime[row.path] : null) : row[i];

          const data = new Date(time);
          attr.push(`datetime="${time}"`, `sort-value="${data.getTime()}"`, `title="${data.toLocaleString('zh-CN', { hour12: false })}"`);
        } else if (['rating'].includes(i)) {
          const precent = row.rating / 5 * 100;
          const color = row.rating >= 4 ? '#0f0' : row.rating >= 2.5 ? '#ff0' : '#f00';

          attr.push(`style="background-image:-webkit-linear-gradient(left, ${color} ${precent}%, white ${100 - precent}%);"`);
          text = row.rating;
        } else if (['size'].includes(i)) {
          text = `${(row.size / 1024 / 1024).toFixed(2)} MB`;
        } else if (['event'].includes(i)) {
          text = [
            `<a href="${row.web}">Web</a>`,
            '<br>',
            '<button name="star"></button>',
            '<button name="clear"></button>',
            `<a href="${row.path}" name="delete"></a>`,
            '<button name="invisible"></button>',
            '<br>',
            `<a name="native" href="./src/viewer.html?file=${encodeURIComponent(row.path)}">View</a>`,
            `<a name="native" href="./src/viewer.html?file=${encodeURIComponent(row.path)}&condition=${condition}">List</a>`
          ].join('');
        } else if (['path'].includes(i)) {
          text = `<a href="${row.path}" name="item">${path.dirname(row[i])}</a>`;
        } else if (['title', 'title_main', 'title_jpn', 'title_jpn_main'].includes(i)) {
          const condition = [[false, i, '=', row[i], undefined]];
          text = `<a name="native" href="./src/index.html?condition=${encodeURIComponent(JSON.stringify(condition))}"></a>`;
          text += row[i] + (['title', 'title_main'].includes(i) ? `<a href="${row[i]}" name="everything"></a>` : '');
        } else if (i.match(/^tag:(.*)$/)) {
          const main = i.match(/^tag:(.*)$/)[1];
          if (row.tags && main in row.tags) {
            text = row.tags[main].map((sub) => {
              const condition = [[false, 'tags', `tags:${main}`, `"${sub.split(' | ')[0]}"`, undefined]];
              let color = '';
              const full = main === 'misc' ? sub : `${main}:${sub}`;
              if (full in tagsAlert) color = tagsAlert[full];
              return `<a name="native" href="./src/index.html?condition=${encodeURIComponent(JSON.stringify(condition))}" color="${color}">${findData(main, sub).cname || sub}</a>`;
            }).sort().join(', ');
          }
        } else {
          text = row[i] instanceof Object ? JSON.stringify(row[i]) : row[i];
        }
        tr += `<td ${attr.join(' ')}>${text}</td>`;
      }
    }

    tr += '</tr>';
    html.push(tr);
  }
  html.push('</tbody>', '</table>');

  $('.result').html(html.join(''));

  const table = $('.result>table').tablesorter({
    theme: 'blackice',

    widthFixed: true,

    textAttribute: 'sort-value',
    widgets: ['zebra', 'filter', 'scroller'],
    widgetOptions: {
      filter_defaultAttrib: 'sort-value',
      filter_saveFilters: false,

      scroller_height: document.documentElement.clientHeight - 150, // - (25 + 25 * getCondition().length)
      scroller_upAfterSort: true,
      scroller_jumpToHeader: true
    }
  }).on('sortEnd', function (e, t) {
    const condition = getCondition();
    const arr = $('.result tbody>tr').toArray().map(i => $(i).attr('path'));
    configChange(obj => {
      if (!('resultList' in obj)) obj.resultList = {};
      obj.resultList[JSON.stringify(condition)] = arr;
    }, 'store');
  });
  if (pagerOption.enable && rows.length > pagerOption.minCount) {
    let page = 0;
    const condition = getCondition();
    const resultPosition = ipcRenderer.sendSync('store', 'get', 'resultPosition', {});
    if (JSON.stringify(condition) in resultPosition) {
      const file = resultPosition[JSON.stringify(condition)];
      const item = $('.result tbody>tr').filter(`[path="${window.CSS.escape(file)}"]`);
      if (item.length) {
        const index = item.index();
        page = Math.floor(index / pagerOption.size);
      }
    }
    table.tablesorterPager({
      container: $('.pager'),
      savePages: false,
      page: page,
      size: pagerOption.size,
      pageReset: 0,

      cssNext: '.next',
      cssPrev: '.prev',
      cssFirst: '.first',
      cssLast: '.last',
      output: '{page:input} / {totalPages}',
      cssDisabled: 'disabled'
    });
    $('.pager').show().get(0).scrollIntoView();
  }

  setTimeout(() => {
    if (observer) observer.disconnect();

    scrollElement = $('.result .tablesorter-scroller-table').get(0);
    scrollToLast();
    updateRelativeTime();

    observer = new window.MutationObserver(scrollToLast);
    observer.observe(scrollElement, {
      childList: true,
      subtree: true
    });
  });
};
const showBookmarks = () => {
  const conditions = ipcRenderer.sendSync('config', 'get', 'bookmarkCondition', {});
  const html = ['<ul>'];
  for (const name in conditions) {
    const condition = encodeURIComponent(conditions[name]);
    html.push(`<li><a name="native" href="./src/index.html?condition=${condition}">${name}</a></li>`);
  }
  html.push('</ul>');
  $('.bookmarks').html(html.join(''));
};
const showHistory = () => {
  const history = ipcRenderer.sendSync('store', 'get', 'history', []);
  const html = [
    '<ul>'
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
  const text = condition.map(i => {
    let text = i[0] ? '!' : '';
    if (i[1] === 'tags') {
      let main = i[2].split(':')[1];
      if (main === '*') {
        main = null;
        text += '*:';
      } else {
        text += findData(main).cname + ':';
      }

      text += findData(main, i[3]).cname || i[3];
    } else if ($('.comparison:not(.hide)').attr('name') === 'comp-datetime') {
      text += `${i[1]}:${i[2]}`;
    } else if (i[2] === 'Duplicate') {
      text += `重复值:${i[1]}`;
    } else {
      text += i[3];
    }
    return text;
  }).join('&&');
  return text;
};
const rememberCondition = (key) => {
  configChange(config => {
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
  if (isNaN(lasttime)) return '';
  const delta = new Date().getTime() - lasttime;
  const info = {
    ms: 1,
    s: 1000,
    m: 60,
    h: 60,
    d: 24,
    mh: 30,
    y: 12
  };
  let suf;
  let t = delta;
  for (const i in info) {
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
  if (delta <= 1000 * 60 * 60 * 24 * 7 * 2) text = '<span class="highlight">' + text + '</span>';
  return text;
};
const updateRelativeTime = () => {
  $('[datetime]').toArray().forEach(ele => {
    $(ele).html(calcRelativeTime($(ele).attr('datetime')));
  });
};
const updateTitleUrl = () => {
  const condition = getCondition();
  document.title = getConditionReadable();

  const params = new URLSearchParams();
  params.set('condition', JSON.stringify(condition));
  window.history.pushState(null, 'INDEX', '?' + params.toString());
};
const scrollToLast = () => {
  let scrollTop = 0;

  const condition = getCondition();
  const resultPosition = ipcRenderer.sendSync('store', 'get', 'resultPosition', {});
  if (JSON.stringify(condition) in resultPosition) {
    const file = resultPosition[JSON.stringify(condition)];
    const item = $('.result tbody>tr').filter(`[path="${window.CSS.escape(file)}"]`);
    if (item.length) {
      item.addClass('trHover');
      scrollTop = item.get(0).offsetTop;
    }
  }

  scrollElement.scrollTop = scrollTop;
  $('.result').get(0).scrollIntoView();
};

// Main
const main = async () => {
  if (electron.remote.getCurrentWindow().id === 1 && ipcRenderer.sendSync('config', 'get', 'rememberLastTabs') && ipcRenderer.sendSync('config', 'get', 'lastTabs', []).length) {
    const confirm = await tooltip({
      title: '是否打开上次保存的网页',
      autoClose: 'cancel|10000',
      backgroundDismiss: 'cancel',
      buttons: {
        ok: {
          text: 'OK',
          keys: ['enter'],
          btnClass: 'btn-red'
        },
        cancel: {
          text: 'Cancel',
          btnClass: 'btn-blue'
        }
      }
    });
    if (confirm === 'ok') {
      if (ipcRenderer.sendSync('config', 'get', 'deleteLastTabs')) {
        configChange(config => delete config.lastTabs);
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
        onItem += -1;
      } else if (['ArrowDown'].includes(e.key)) {
        onItem += 1;
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        onItem += -10;
      } else if (['ArrowRight', 'PageDown'].includes(e.key)) {
        onItem += 10;
      } else if (['Home'].includes(e.key)) {
        onItem = 0;
      } else if (['End'].includes(e.key)) {
        onItem = -1;
      }
      while (onItem < 0 || onItem >= hasItem) {
        onItem += onItem < 0 ? hasItem : -hasItem;
      }
      $('.datalistHover').removeClass('datalistHover');
      $('.datalist li').eq(onItem).addClass('datalistHover').get(0).scrollIntoView();
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
        tags = EHT.filter(i => i.namespace === main);
      }

      tags.forEach(i => {
        for (const key in i.data) {
          const name = i.data[key].name.replace(/!\[(.*?)\]\((.*?)\)/g, '');
          if (key.match(value) || name.match(value)) {
            html.push(`<li cname="${name}">${key}</li>`);
          }
        }
      });

      html = Array.from(new Set(html));
      $('.datalist>ol').html(html.join(''));
    } else if (showColumns[column][1] === 'text') {
      const query = `SELECT ${column} FROM files WHERE ${column} LIKE ${mysql.escape(`%${value.replace(/\\/g, '\\\\')}%`)} LIMIT ${autoCompleteOption.limit}`;
      const [rows] = await ipcRenderer.sendSync('database-query', query);
      const html = [];
      Array.from(new Set(rows.map(i => i[column]))).forEach(i => html.push(`<li>${i}</li>`));
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
    configChange(obj => {
      if (!('resultList' in obj)) obj.resultList = {};
      obj.resultList[JSON.stringify(condition)] = rows.map(i => i.path);
    }, 'store');
    showResult(rows);
    updateTitleUrl();
  });

  // 按钮-保存/收藏
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
            action: function () {
              const name = this.$content.find('[name="name"]').val();
              resolve(name);
            }
          },
          cancel: function () {
            resolve(null);
          }
        },
        onContentReady: function () {
          this.$content.find('[name="name"]').focus().val(nameBefore || getConditionReadable());
        }
      });
    });
    if (!name) return;
    configChange(config => {
      if (!('bookmarkCondition' in config)) config.bookmarkCondition = {};
      if (nameBefore) delete config.bookmarkCondition[nameBefore];
      config.bookmarkCondition[name.trim()] = conditionStr;
    });
    tooltip('保存完成', name);
  });

  // 按钮-打开新窗口
  $('.filter').find('[name="new-query"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/index.html?condition=%5B%5D');
  });
  $('.filter').find('[name="config"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/config.html');
  });
  $('.filter').find('[name="viewer"]').on('click', async (e) => {
    ipcRenderer.send('open', './src/viewer.html');
  });

  // 按钮-更新数据库
  $('.filter').find('[name="database-update"]').on('click', async (e) => {
    ipcRenderer.send('database-connect', undefined, 'update');
  });

  // 按钮-移动结果
  $('.filter').find('[name="move-files"]').on('click', async (e) => {
    if (!$('.query>.result tr[path]').length) return;
    const result = electron.remote.dialog.showOpenDialogSync({
      properties: ['openDirectory']
    });
    if (result && result.length) {
      const dir = result[0];
      const libraryFolder = ipcRenderer.sendSync('config', 'get', 'libraryFolder');
      const files = $('.query>.result tr[path]').toArray().map(i => path.resolve(libraryFolder, $(i).attr('path')));
      const moveMode = path.parse(libraryFolder).root === path.parse(dir).root;
      for (const file of files) {
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
            console.error('File Locked: ' + file);
          } else {
            console.error(error);
          }
        }
      }
      tooltip('移动完成');
    }
  });

  // 按钮-清理
  $('.filter').find('[name="clear"]').on('click', async (e) => {
    ipcRenderer.sendSync('clear');
  });

  // 按钮-切换hide
  let invisible = true;
  $('.filter').find('[name="toggle-invisible"]').on('click', async (e) => {
    if (invisible) {
      $('.query>.result tr[invisible="1"]').attr('raw-invisible', '1').attr('invisible', null);
    } else {
      $('.query>.result tr[raw-invisible="1"]').attr('invisible', '1').attr('raw-invisible', null);
    }
    invisible = !invisible;
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
    const src = path.resolve(libraryFolder, dir, name + '.jpg');
    let cover = $(target).attr('cover');
    if (!cover && !$(target).prop('image_loading') && fs.existsSync(src)) {
      $(target).prop('image_loading', true);
      $('.preview[name="cover"]>img').attr('src', null);
      fs.readFile(src, (err, buffer) => {
        $(target).prop('image_loading', null);
        if (err) {

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
          const chs = findData(main).cname + ': ';
          const subChs = [];
          for (const sub of tags[main]) {
            let color = '';
            const full = main === 'misc' ? sub : `${main}:${sub}`;
            if (full in tagsAlert) color = tagsAlert[full];
            const html = `<span color="${color}">${findData(main, sub).cname || sub}</span>`;
            subChs.push(html);
          }
          tagsChs.push(chs + subChs.join(', '));
        }
        tagsChs = '<ul>' + tagsChs.map(i => `<li>${i}</li>`).join('') + '</ul>';
      }
      $(target).prop('tagsChs', tagsChs).attr('tags', null);
    }
    html.push(tagsChs);

    $('.preview[name="tags"]').html(html.join('<br>'));
    $('.preview').show();
    loading = false;
  });
  $('.result').on('mousemove', 'tr>[name^="title"]', (e) => {
    const _width = $('.preview[name="tags"]').outerWidth();
    const _height = $('.preview[name="tags"]').outerHeight();
    let left = _width + e.clientX + 10 < window.innerWidth ? e.clientX + 5 : e.clientX - _width - 5;
    let top = _height + e.clientY + 10 < window.innerHeight ? e.clientY + 5 : e.clientY - _height - 5;
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
    configChange(obj => {
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
    parent.find('[name="time_view"]').attr('datetime', 'null').attr('sort-value', 0);
    configChange(obj => {
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
    console.log(invisible);
    configChange(obj => {
      if (!('invisible' in obj)) obj.invisible = [];
      if (invisible) {
        obj.invisible.push(file);
      } else {
        if (obj.invisible.includes(file)) obj.invisible.splice(obj.invisible.indexOf(file), 1);
      }
    }, 'store');
    parent.attr('invisible', invisible);
    parent.attr('raw-invisible', invisible);
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
    // name: native, path, delete, null
    if (name === 'native') {
      ipcRenderer.send('open', href);
    } else {
      ipcRenderer.send('open-external', href, name);
      if (name === 'path') {
        const date = new Date();
        configChange(obj => {
          if (!('lastViewTime' in obj)) obj.lastViewTime = {};
          obj.lastViewTime[file] = date.toLocaleString('zh-CN', { hour12: false });
        }, 'store');
        parent.find('[name="time_view"]').attr('datetime', date).attr('sort-value', date.getTime());
        waitInMs(1000).then(() => {
          updateRelativeTime();
        });
      }
    }
    console.log(!['delete', 'everything'].includes(name));
    if (!['delete', 'everything'].includes(name)) {
      const rememberHistory = ipcRenderer.sendSync('config', 'get', 'rememberHistory');
      configChange(obj => {
        if (!name || !rememberHistory) return true;
        if (!('history' in obj)) obj.history = [];
        obj.history.unshift(href);
      }, 'store');
    }

    const condition = getCondition();
    if (file) {
      configChange(obj => {
        if (!('resultPosition' in obj)) obj.resultPosition = {};
        obj.resultPosition[JSON.stringify(condition)] = file;
      }, 'store');
    }
  });

  // 全局快捷键
  let keypressLastTime = 0;
  Mousetrap.bind([].concat(keyMap.up, keyMap.down), async (e, combo) => { // 上下键
    if (e.type === 'keypress' && new Date().getTime() - new Date(keypressLastTime).getTime() <= keypressTimeout) return;

    if (keyMap.up.includes(combo)) { // 向上滚动
      scrollElement.scrollTop += -scrollHeight;
    } else if (keyMap.down.includes(combo)) { // 向下滚动
      scrollElement.scrollTop += scrollHeight;
    }

    keypressLastTime = new Date().getTime();
    return false;
  });
  Mousetrap.bind([].concat(keyMap.left, keyMap.right), async (e, combo) => { // 左右键
    if (keyMap.left.includes(combo)) { // 向上滚动
      scrollElement.scrollTop += -scrollElement.clientHeight;
    } else if (keyMap.right.includes(combo)) { // 向下滚动
      scrollElement.scrollTop += scrollElement.clientHeight;
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
  $('<style>').text(Object.keys(tagsAlertStyle).map(i => `[color="${i}"]{${tagsAlertStyle[i]}}`).join('\n')).appendTo('head');

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
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  process.exit();
});
