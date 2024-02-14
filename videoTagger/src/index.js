/* eslint-disable no-new */
/* eslint-disable no-unused-vars */
// ==Headers==
// @Name:               index
// @Description:        index
// @Version:            1.0.668
// @Author:             dodying
// @Created:            2023-07-22 20:25:56
// @Modified:           2023-07-30 16:03:16
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            electron
// ==/Headers==
/* global window document */
/* global $ DPlayer Tagify DragSort pinyinPro stanz */

// 导入原生模块
const fs = require('fs');
const path = require('path');
const url = require('url');

// 导入第三方模块
const electron = require('electron');

// 设置
const explorerMode = false;
const roots = ['G:\\__NEWER', 'Z:', 'H:', 'E:\\Downloads\\Torrents', 'F:\\H'];
const exts = {
  video: ['.3g2', '.3ga', '.3gp', '.3gp2', '.3gpp', '.ac3', '.aif', '.aifc', '.alac', '.amr', '.amv', '.aob', '.asf', '.avi', '.bdmv', '.bik', '.d2v', '.diva', '.divx', '.drc', '.dsa', '.dsm', '.dss', '.dsv', '.dts', '.dvr-ms', '.evo', '.f4v', '.flc', '.fli', '.flic', '.flv', '.h264', '.h265', '.hdm', '.hdmov', '.hevc', '.hm10', '.ifo', '.ismv', '.ivf', '.m1a', '.m1v', '.m2a', '.m2p', '.m2t', '.m2ts', '.m2v', '.m3u', '.m3u8', '.m4b', '.m4p', '.m4v', '.mid', '.midi', '.mk3d', '.mkv', '.mlp', '.mov', '.mp2v', '.mp4', '.mp4v', '.mpa', '.mpe', '.mpeg', '.mpg', '.mpls', '.mpv2', '.mpv4', '.mts', '.mxf', '.ofs', '.ogm', '.ogv', '.pss', '.pva', '.qt', '.ram', '.ratd', '.ratdvd', '.rec', '.rm', '.rme', '.rmf', '.rmi', '.rmm', '.rmvb', '.roq', '.rp', '.rpm', '.rt', '.sfd', '.smil', '.smk', '.snd', '.ssif', '.swf', '.tp', '.tpe', '.tpf', '.tpr', '.trp', '.ts', '.tse', '.tsf', '.vc1', '.vob', '.vp6', '.webm', '.wm', '.wme', '.wmf', '.wmp', '.wmv', '.wtv', '.y4m'],
  // image: ['.jpg', '.png', '.webp', '.bmp'],
  // plaintext: ['.txt', '.nfo', '.js', '.html', '.css'],
};
let current = {};
let tagifyCos, tagifySuffix, dplayer;
const tagger = stanz(JSON.parse(fs.readFileSync(`${__dirname}\\tagger.json`, 'utf-8')));
tagger.watch((e) => {
  fs.writeFileSync(`${__dirname}\\tagger.json`, JSON.stringify(tagger, null, 2));
  if (e.path.slice(-1)[0] === e.currentTarget.cos) tagifyCos.dropdown.refilter.call(tagifyCos);
  if (e.path.slice(-1)[0] === e.currentTarget.suffix) tagifySuffix.dropdown.refilter.call(tagifySuffix);
});

// Function
function changeDirectory(dir = '', highlight = '') {
  tagger.path = dir;
  if (dir === '?') {
    const result = electron.remote.dialog.showOpenDialogSync({
      defaultPath: roots[0],
      properties: ['openFile', 'openDirectory', 'dontAddToRecent'],
    });
    if (result && result.length) {
      // eslint-disable-next-line no-param-reassign
      [dir] = result;
      changeDirectory(dir);
      return;
    }
    return;
  }
  if (dir) {
    try {
      if (fs.statSync(dir).isFile()) {
        const arr = dir.split('\\');
        changeDirectory(arr.slice(0, -1).join('\\'), arr.slice(-1)[0]);
        return;
      }
    } catch (error) {
      changeDirectory('');
      return;
    }
  }
  const files = dir === '' ? roots : fs.readdirSync(dir);
  if (dir !== '') files.unshift('..');

  $('#explorerPath').empty();
  const dirArr = ['ROOT', ...dir.split('\\'), '?'].filter((i) => i);
  for (let i = 0; i < dirArr.length; i++) {
    const text = dirArr[i];
    let fullpath = text === 'ROOT' ? '' : dirArr.slice(1, i + 1).join('\\');
    if (text === '?') fullpath = '?';
    $('<button>')
      .attr('data-path', fullpath)
      .text(text)
      .appendTo('#explorerPath');
  }

  $('#explorerFile').html('<ol>');
  for (const file of files) {
    try {
      let fullpath, type;
      fullpath = dir === '' ? file : path.resolve(dir, file);
      if (file === '..' && roots.includes(dir)) {
        fullpath = '';
        type = 'directory';
      } else {
        type = fs.statSync(fullpath).isFile() ? 'file' : 'directory';
        if (type === 'file') {
          if (!Object.values(exts).flat().includes(path.extname(fullpath).toLowerCase())) continue;
          [type] = Object.entries(exts).find((i) => i[1].includes(path.extname(fullpath).toLowerCase()));
        }
      }
      const elem = $('<li>')
        .attr('data-path', fullpath)
        .attr('data-type', type)
        .text(file)
        .appendTo('#explorerFile>ol');
      if (highlight === file) {
        $(elem).addClass('highlight').get(0).scrollIntoView();
      }
    } catch (error) { /* noop */ }
  }
}
function parse(fullpath) {
  document.title = `videoTagger - ${fullpath}`;
  current = path.parse(fullpath);
  let { name } = current;

  let [prefix, suffix, people] = [[], [], ''];
  if (name.match(/^\[([^[\]]+)\]/)) { // 处理前缀
    const m = name.match(/^\[([^[\]]+)\]/)[1];
    name = name.substring(m.length + 2);
    prefix = m.split('-');
  }
  if (name.match(/\[([^[\]]+)\]$/)) { // 处理后缀
    let m = name.match(/\[([^[\]]+)\]$/)[1];
    if (m.match(/^([0-9x][.+-])(.*)$/i)) {
      name = name.substring(0, name.length - (m.length + 2));
      m = m.match(/^([0-9x][.+-])(.*)$/i);
      [, people] = m;
      suffix = m[2].split('-');
    }
  }
  $('#info [name="name"]').val(name).trigger('change');
  $('#info [name="people"]').val(people);

  { // 处理前缀，仅选择
    const tags = { prefix, suffix };
    $('#prefix').empty();
    const preset = tagger.prefix;
    const presetUppercase = preset.map((i) => i.toUpperCase());
    for (let i = 0; i < preset.length; i++) {
      const tag = preset[i];
      $(`<div id="div-prefix-${tag.toUpperCase()}">`).html(`<input type="checkbox" id="prefix-${tag}" raw="${tag}"><label for="prefix-${tag}">${tag}</label>`).appendTo('#prefix');
    }
    for (const tag of tags.prefix) {
      if (presetUppercase.includes(tag.toUpperCase())) {
        $(`#prefix>div[id="div-prefix-${tag.toUpperCase()}"]>input`).prop('checked', true);
      } else {
        $(`<div id="div-prefix-${tag.toUpperCase()}">`).html(`<input type="checkbox" id="prefix-${tag}" raw="${tag}" checked><label for="prefix-${tag}">${tag}</label>`).appendTo('#prefix');
      }
    }
  }

  { // 处理后缀#cos
    if (tagifyCos) {
      tagifyCos.removeAllTags();
    } else {
      tagifyCos = new Tagify(document.querySelector('input[name="suffix-cos"]'), { // https://github.com/yairEO/tagify#settings
        delimiters: /[\s,，;；+-]+/,
        addTagOnBlur: true,
        keepInvalidTags: true,
        trim: false,
        duplicates: true,
        blacklist: [],
        whitelist: tagger.cos.map((i) => ({
          raw: i,
          value: i,
          pinyin: pinyinPro.pinyin(i, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toUpperCase(),
        })),
        dropdown: {
          maxItems: Infinity,
          classname: 'extra-properties',
          enabled: 0,
          includeSelectedTags: true,
          searchKeys: ['value', 'pinyin'],
          highlightFirst: true,
          placeAbove: false,
        },
        templates: {
          dropdownItem(tagData) {
            try {
              return [
                `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ''}' raw="${tagData.raw}" >`,
                '  <x title="remove tag" class="tagify__tag__removeBtn"></x>',
                `  <span>${tagData.value}</span>`,
                '</div>',
              ].join('\n');
            } catch (err) {
              console.error(err);
              return '';
            }
          },
        },
        hooks: {
          suggestionClick(e) {
            const isAction = e.target.classList.contains('tagify__tag__removeBtn');
            const suggestionElm = e.target.closest('.tagify__dropdown__item');
            const raw = suggestionElm.getAttribute('raw');

            return new Promise((resolve, reject) => {
              if (isAction) {
                tagifyCos.settings.whitelist.splice(tagifyCos.settings.whitelist.findIndex((i) => i.raw === raw), 1);
                tagifyCos.dropdown.refilter.call(tagifyCos);
                tagger.cos.splice(tagger.cos.indexOf(raw), 1);
                reject();
              }
              resolve();
            });
          },
        },
        callbacks: {
          add(e) {
            if (tagger.cos.includes(e.detail.data.raw) || (!e.detail.data.raw && tagger.cos.includes(e.detail.data.value))) return;
            tagifyCos.settings.whitelist.push({
              raw: e.detail.data.value,
              value: e.detail.data.value,
              pinyin: pinyinPro.pinyin(e.detail.data.value, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toUpperCase(),
            });
            tagger.cos.push(e.detail.data.value);
          },
        },
      });
      new DragSort(tagifyCos.DOM.scope, {
        selector: `.${tagifyCos.settings.classNames.tag}`,
        callbacks: {
          dragEnd(elm) {
            tagifyCos.updateValueByDOMTags();
          },
        },
      });
    }

    if (suffix.some((i) => i.match(/^#cos(.*)$/i))) { // 处理后缀#cos
      const index = suffix.findIndex((i) => i.match(/^#cos(.*)$/i));

      const m = suffix[index].match(/^#cos(.*)$/i);
      const value = m[1].replace(/^\{|\}$/g, '').split(/[\s,，+-]+/).filter((i) => i);
      tagifyCos.addTags(value);

      suffix.splice(index, 1);
    }
  }

  { // 处理后缀
    if (tagifySuffix) {
      tagifySuffix.removeAllTags();

      tagifySuffix.state.inputText = '';
      tagifySuffix.DOM.input.textContent = '';
      $('#suffix-tags>div').show();
    } else {
      tagifySuffix = new Tagify(document.querySelector('input[name="suffix"]'), { // https://github.com/yairEO/tagify#settings
        delimiters: /[\s,，;；+-]+/,
        addTagOnBlur: false,
        keepInvalidTags: true,
        trim: false,
        duplicates: true,
        blacklist: [],
        whitelist: tagger.suffix.map((i) => {
          const [group, value] = i.split('-').length === 1 ? ['', i] : i.split('-');
          return {
            raw: i,
            value,
            pinyin: pinyinPro.pinyin(value, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toUpperCase(),
            group,
          };
        }),
        dropdown: {
          maxItems: Infinity,
          classname: 'extra-properties',
          enabled: 0,
          includeSelectedTags: true,
          searchKeys: ['value', 'pinyin'],
          highlightFirst: true,
          placeAbove: false,
        },
        templates: {
          tag(tagData) {
            try {
              const img = path.resolve(__dirname, './../img/tagger/', `${tagData.raw}.jpg`);
              return [
                `<tag title='${tagData.value}' contenteditable='false' spellcheck="false" class='tagify__tag ${tagData.class ? tagData.class : ''}' ${this.getAttributes(tagData)}>`,
                '  <x title="remove tag" class="tagify__tag__removeBtn"></x>',
                '  <div>',
                `    ${fs.existsSync(img) ? `<img onerror="this.style.display='none'" width=16 src="${url.pathToFileURL(img).href}">` : ''}`,
                `    <em>${tagData.group || '未分类'}:</em>`,
                `    <span class='tagify__tag-text'>${tagData.value}</span>`,
                '  </div>',
                '</tag>',
              ].join('\n');
            } catch (err) {
              return '';
            }
          },
          dropdownItem(tagData) {
            try {
              const img = path.resolve(__dirname, './../img/tagger/', `${tagData.raw}.jpg`);
              return [
                `<div ${this.getAttributes(tagData)} class='tagify__dropdown__item ${tagData.class ? tagData.class : ''}' raw="${tagData.raw}" >`,
                `  ${fs.existsSync(img) ? `<img onerror="this.style.display='none'" width=16 src='${url.pathToFileURL(img).href}'>` : ''}`,
                '  <x title="remove tag" class="tagify__tag__removeBtn"></x>',
                `  <em>${tagData.group || '未分类'}:</em>`,
                `  <span>${tagData.value}</span>`,
                '</div>',
              ].join('\n');
            } catch (err) {
              console.error(err);
              return '';
            }
          },
        },
        hooks: {
          suggestionClick(e) {
            const isAction = e.target.classList.contains('tagify__tag__removeBtn');
            const suggestionElm = e.target.closest('.tagify__dropdown__item');
            const raw = suggestionElm.getAttribute('raw');

            return new Promise((resolve, reject) => {
              if (isAction) {
                tagifySuffix.settings.whitelist.splice(tagifySuffix.settings.whitelist.findIndex((i) => i.raw === raw), 1);
                tagifySuffix.dropdown.refilter.call(tagifySuffix);
                tagger.suffix.splice(tagger.suffix.indexOf(raw), 1);
                reject();
              }
              resolve();
            });
          },
        },
        callbacks: {
          add(e) {
            tagifySuffix.state.inputText = '';
            tagifySuffix.DOM.input.textContent = '';
            $('#suffix-tags>div').show();

            if (tagger.suffix.includes(e.detail.data.raw) || (!e.detail.data.raw && tagger.suffix.includes(e.detail.data.value))) return;
            tagifySuffix.settings.whitelist.push({
              raw: e.detail.data.value,
              value: e.detail.data.value,
              pinyin: pinyinPro.pinyin(e.detail.data.value, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toUpperCase(),
            });
            tagger.suffix.push(e.detail.data.value);
          },
          input(e) {
            const { value } = e.detail;
            const re = new RegExp(value, 'gi');
            $('#suffix-tags>div').toArray().forEach((i) => {
              const raw = $(i).attr('raw');
              const pinyin = $(i).attr('pinyin');
              $(i).toggle(!!(raw.match(re) || pinyin.match(re)));
            });
          },
          blur(e) {
            if (tagifySuffix.settings.whitelist.find((i) => i.value === tagifySuffix.state.inputText)) {
              tagifySuffix.addTags(tagifySuffix.state.inputText);
              tagifySuffix.state.inputText = '';
              tagifySuffix.DOM.input.textContent = '';
              $('#suffix-tags>div').show();
            }
          },
          // change(e) {
          //   console.log(e);
          // },
          // invalid(e) {
          //   console.log(e);
          // },
        },
      });
      tagifySuffix.dropdown.createListHTML = (sugegstionsList) => {
        const groupsOfOptions = sugegstionsList.reduce((acc, suggestion) => {
          const group = suggestion.group || 'Not Assigned';
          if (!acc[group]) {
            acc[group] = [suggestion];
          } else {
            acc[group].push(suggestion);
          }
          return acc;
        }, {});
        const getUsersSuggestionsHTML = (groupOptions) => groupOptions.map((suggestion, idx) => {
          // eslint-disable-next-line no-param-reassign
          if (typeof suggestion === 'string' || typeof suggestion === 'number') suggestion = { value: suggestion };
          const value = tagifySuffix.dropdown.getMappedValue.call(tagifySuffix, suggestion);
          // eslint-disable-next-line no-param-reassign
          suggestion.value = value && typeof value === 'string' ? tagifySuffix.helpers.escapeHTML(value) : value;
          return tagifySuffix.settings.templates.dropdownItem.apply(tagifySuffix, [suggestion]);
        }).join('');
        return Object.entries(groupsOfOptions).map(([group, groupOptions]) => `<div class="tagify__dropdown__itemsGroup" data-title="Group ${group}:">${getUsersSuggestionsHTML(groupOptions)}</div>`).join('');
      };

      new DragSort(tagifySuffix.DOM.scope, {
        selector: `.${tagifySuffix.settings.classNames.tag}`,
        callbacks: {
          dragEnd(elm) {
            tagifySuffix.updateValueByDOMTags();
          },
        },
      });

      for (let i = 0; i < tagger.suffix.length; i++) {
        const raw = tagger.suffix[i];
        const img = path.resolve(__dirname, './../img/tagger/', `${raw}.jpg`);
        const [group, tag] = raw.split('-').length === 1 ? ['', raw] : raw.split('-');
        const div = $(`<div raw="${tag}" pinyin="${pinyinPro.pinyin(tag, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toUpperCase()}">`).html(`<input type="button" value="${tag}" raw="${tag}" class="pure-button pure-button-primary button-secondary">`).appendTo('#suffix-tags');
        if (fs.existsSync(img)) {
          $(`<img onerror="this.style.display='none'" src="${url.pathToFileURL(img).href}">`).prependTo(div);
        }
      }
      $('#suffix-tags').on('click', 'input', (e) => {
        tagifySuffix.addTags($(e.target).attr('raw'));
        tagifySuffix.state.inputText = '';
        tagifySuffix.DOM.input.textContent = '';
        $('#suffix-tags>div').show();
      });
    }

    tagifySuffix.addTags(suffix);
  }
}
function preview() {
  const prefix = $('#prefix input:checked').toArray().map((i) => $(i).attr('raw')).join('-');
  const people = $('#info [name="people"]').val();
  const suffix = (people.match(/^[0-9x]{1,2}$/) ? `${people}+` : people) + [
    (tagifyCos.value.length ? `#cos{${tagifyCos.value.map((i) => i.value).join('+') || '未知'}}` : ''),
    ...tagifySuffix.value.map((i) => i.value),
  ].filter((i) => i).join('-');
  return `${prefix ? `[${prefix}]` : ''}${$('#info [name="name"]').val()}${suffix ? `[${suffix}]` : ''}`;
}
function moveTo(dir) {
  const people = $('#info [name="people"]').val();
  if (!people) {
    // window.alert('请输入people，预设值1');
    $('#info [name="people"]').focus().val(1).css({ border: 'red 1px solid' });
    return;
  }
  $('#info [name="people"]').css({ border: '' });

  if (explorerMode) dplayer.switchVideo({ url: url.pathToFileURL(path.join(__dirname, 'demo.mp4')).href });
  fs.mkdirSync(dir, { recursive: true });

  setTimeout(() => {
    try {
      if (current.name.toUpperCase() !== preview().toUpperCase()) {
        fs.renameSync(path.join(current.dir, `${current.name}${current.ext}`), path.join(dir, `${preview()}${current.ext}`));
      }
      if (explorerMode) {
        changeDirectory(path.join(current.dir, `${preview()}${current.ext}`));
        window.location.reload();
        $('.viewer').hide();
      } else {
        const mainWindow = electron.remote.BrowserWindow.getAllWindows()[0];
        mainWindow.hide();
      }
    } catch (error) {
      if (error.errno === -4082) {
        moveTo(dir);
      } else {
        console.dir(error);
      }
    }
  }, explorerMode ? 400 : 0);
}

// Main
const main = async () => {
  const search = new URLSearchParams(window.location.search);
  if (search.get('file') && fs.existsSync(search.get('file'))) parse(search.get('file'));

  electron.ipcRenderer.on('file', (event, file) => {
    if (file) parse(file);
  });

  if (explorerMode) {
    const mainWindow = electron.remote.BrowserWindow.getAllWindows()[0];
    mainWindow.show();
    mainWindow.maximize();

    $('#divLeft').show();
    dplayer = new DPlayer({
      container: $('.viewer[name="video"]').get(0),
      volume: '0',
      video: { url: url.pathToFileURL(path.join(__dirname, 'demo.mp4')).href },
      contextmenu: [
        {
          text: 'custom2',
          click: (player) => {
            console.log(player);
          },
        },
      ],
      highlight: [
        { text: '00:10:00', time: 10 * 60 },
        { text: '00:30:00', time: 30 * 60 },
        { text: '00:60:00', time: 60 * 60 },
        { text: '00:90:00', time: 90 * 60 },
        { text: '00:120:00', time: 120 * 60 },
      ],
    });

    { // 文件选择器
      $('#explorerPath,#explorerFile').on({
        click: (e) => {
          $('.viewer').hide();
          dplayer.switchVideo({ url: url.pathToFileURL(path.join(__dirname, 'demo.mp4')).href });
        },
      });
      changeDirectory(tagger.path);
      $('#explorerPath').on('click', 'button', (e) => {
        changeDirectory(e.target.dataset.path);
      });
      $('#explorerFile').on('dblclick', 'li[data-type="directory"]', (e) => {
        $('.viewer').hide();
        dplayer.switchVideo({ url: url.pathToFileURL(path.join(__dirname, 'demo.mp4')).href });
        changeDirectory(e.target.dataset.path);
      });
      $('#explorerFile').on('dblclick', 'li:not([data-type="directory"])', (e) => {
        const { type, path: fullpath } = e.target.dataset;

        $('.viewer').hide();
        dplayer.switchVideo({ url: url.pathToFileURL(path.join(__dirname, 'demo.mp4')).href });
        $(`.viewer[name="${type}"]`).show();

        if (type === 'video') {
          dplayer.switchVideo({ url: url.pathToFileURL(fullpath).href });
          parse(fullpath);
        } else if (type === 'image') {
          $('.viewer[name="image"]>img').attr('src', url.pathToFileURL(fullpath).href).attr('alt', fullpath);
        } else if (type === 'plaintext') {
          let text;
          try {
            text = fs.readFileSync(fullpath, 'utf-8');
          } catch (error) {
            text = `${error.message}\n${error.stack}`;
          }
          $('.viewer[name="plaintext"]>pre').text(text);
        }
        changeDirectory(fullpath);
      });
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (search.get('file') && fs.existsSync(search.get('file'))) {
      const mainWindow = electron.remote.BrowserWindow.getAllWindows()[0];
      mainWindow.show();
    }
  }

  {
    $('#info #nameSearch').on({
      click: (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        electron.remote.shell.openExternal(e.target.href);
      },
    });
    $('#info [name="name"]').on({
      change: (e) => {
        let { value } = e.target;
        while (value.match(/^\[([^[\]]+)\]/)) value = value.replace(/^\[([^[\]]+)\]/, '');
        while (value.match(/\[([^[\]]+)\]$/)) value = value.replace(/\[([^[\]]+)\]$/, '');
        let href = `https://www.google.com/search?q=${encodeURIComponent(value)}`;
        if (value.match(/^GETCHU-(\d+)$/i)) {
          href = `https://dl.getchu.com/i/item${value.match(/^GETCHU-(\d+)$/i)[1]}`;
        } else if (value.match(/^KISSCOS-(\d+)$/i)) {
          href = `https://kisscos.net/?p=${value.match(/^KISSCOS-(\d+)$/i)[1]}`;
        }
        $('#info #nameSearch').attr('href', href);
      },
    });
    $('#info [name="people"]').on({
      dblclick: (e) => {
        let value = parseInt(e.target.value || 0, 10);
        if (Number.isNaN(value)) value = 0;
        e.target.value = value + 1;
      },
      contextmenu: (e) => {
        e.target.value = 'x';
        return false;
      },
    });
    $('#preview').on({
      click: (e) => {
        $('#info [name="preview"]').val(preview());
      },
    });
    $('#execuate').on({
      click: (e) => {
        moveTo(current.dir);
      },
    });
    $('#moveto').on('click', 'li>a', (e) => {
      let { dir } = current;

      while (!dir.endsWith('\\__OK')) {
        const files = fs.readdirSync(dir);
        // eslint-disable-next-line no-loop-func
        const find = files.find((i) => i === '__OK' && fs.statSync(path.join(dir, i)).isDirectory());
        if (find) {
          dir = path.join(dir, find);
        } else {
          if (dir === path.parse(dir).root) break;
          dir = path.dirname(dir);
        }
      }
      if (!dir.endsWith('\\__OK')) dir = path.join(current.dir, '__OK');
      moveTo(path.resolve(dir, e.target.textContent.replace(/^OK/, '.')));
    });
  }

  $(document).on({
    keydown: (e) => {
      if (dplayer) {
        if (e.key === 'ArrowRight') {
          dplayer.seek(dplayer.video.currentTime + 10);
        } else if (e.key === 'ArrowLeft') {
          dplayer.seek(dplayer.video.currentTime - 10);
        } else if (e.key === '3') {
          dplayer.seek(dplayer.video.currentTime + 120);
        } else if (e.key === '1') {
          dplayer.seek(dplayer.video.currentTime - 120);
        } else if (e.key === '9') {
          dplayer.seek(dplayer.video.currentTime + 1);
        } else if (e.key === '7') {
          dplayer.seek(dplayer.video.currentTime - 1);
        } else if (e.key === ' ') {
          dplayer.toggle();
        }
      } else if (e.key === 'Escape') {
        window.close();
      } else if (e.key === 's' && e.ctrlKey) {
        moveTo(current.dir);
      } else if (e.key === 'q' && e.ctrlKey) {
        $('#info [name="preview"]').val(preview());
      }
    },
  });

  // https://www.electronjs.org/docs/latest/api/dialog#dialogshowmessageboxsyncbrowserwindow-options
  // await require('electron').remote.dialog.showMessageBox({message:'123',type:'question',buttons:['a','b','c'],checkboxLabel:'11',cancelId :-1})
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit(1);
});
