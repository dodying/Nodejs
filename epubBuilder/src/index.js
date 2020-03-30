// ==Headers==
// @Name:               index
// @Description:        index
// @Version:            1.0.1097
// @Author:             dodying
// @Created:            2020-01-11 13:06:39
// @Modified:           2020-3-28 16:05:18
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            archiver,chardet,iconv-lite
// ==/Headers==
/* global tranStr */

var CONFIG = {
  workDir: process.cwd()
  // defaultAuthor
  // nativeCover
};
var THIS = {
  // files 工作路径下的txt文件集
  // title 标题
  // content 工作路径下的首个txt文件的内容，或选择的文件的内容
};

const numberLib = {
  1: '\\.0-9',
  '１': '\\.０-９',
  一: '点零一二两三四五六七八九十卅百千万廿卅上中下',
  壹: '点點零壹贰叁参肆伍陆柒捌玖拾佰仟萬上中下',
  '①': '〇①-⒛'
};
numberLib['1１'] = numberLib['1'] + numberLib['１'];
numberLib['一壹'] = numberLib['一'] + numberLib['壹'];
numberLib['-1'] = numberLib['1１'] + numberLib['一壹'] + numberLib['①'];

const suffixLib = {
  '-1': '章回节集卷部话篇季'
};

const prefixLib = {};

// 导入原生模块
const fs = require('fs');
const path = require('path');

// 导入第三方模块
const archiver = require('archiver');
const chardet = require('chardet');
const iconv = require('iconv-lite');
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

// Function
function wordSection (mode, word) { // 文本强制分段-测试功能
  const symbol = {
    lineEnd: '。？！”」』', // 句子结尾
    lineStart: '“「『', // 句子开头
    unbreak: '…，、—（）()·《 》〈 〉．_；：' // 不包括作为句子开头的标点 //作用是找到【需要断句的标点】后，不断判断之后的字符是否为标点，是则继续找，不是则断句
  };
  const reLineEnd = new RegExp('[' + symbol.lineEnd + ']');
  const reLineStart = new RegExp('[' + symbol.lineStart + ']');
  const reUnbreak = new RegExp('[' + symbol.unbreak + ']');
  if (mode.includes('all')) word = word.replace(/([\r\n]+\s+)/g, '').replace(/[\r\n]+/g, '');
  const arr = word.split(/[\r\n]+/);

  if (mode.includes('end')) {
    for (let i = 0; i < arr.length; i++) {
      let j = i;
      let lastWord = arr[j].substr(-1, 1);
      while (!reLineEnd.test(lastWord) && arr[j].trim() && j < arr.length - 1) {
        j++;
        lastWord = arr[j].substr(-1, 1);
      }
      arr.splice(i, j - i + 1, arr.slice(i, j + 1).map(i => i.trim()).join(''));
    }
  }

  if (mode.includes('long')) {
    for (let i = 0; i < arr.length;) {
      // if (arr[i].length <= 30) continue;
      const arrNew = arr[i].split('');
      for (let j = 1; j < arrNew.length; j++) {
        const lastWord = arrNew[j - 1].substr(-1, 1); // 查找上一个元素的最后一个字符
        if (reUnbreak.test(arrNew[j]) || reLineEnd.test(arrNew[j]) || (!reLineEnd.test(lastWord) && !reLineStart.test(arrNew[j]))) {
          arrNew[j - 1] += arrNew[j];
          arrNew.splice(j, 1);
          j--;
        }
      }
      arr.splice(i, 1);
      for (let j = 0; j < arrNew.length; j++) {
        arr.splice(i, 0, arrNew[j]);
        i++;
      }
    }
  }

  return arr.join('\r\n').replace(/\r\n\s+/g, '\r\n').replace(/[\r\n]+/g, '\r\n　　');
}

function regexpEscape (text) {
  return text.replace(/[\^$*+?.|(){}[\]]/g, '\\$&');
}

const deleteFolderRecursive = function (filepath) {
  if (fs.existsSync(filepath)) {
    fs.readdirSync(filepath).forEach((file, index) => {
      const curPath = path.join(filepath, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(filepath);
  }
};

const makeFolderRecursive = function (filepath) {
  if (!fs.existsSync(filepath)) {
    makeFolderRecursive(path.dirname(filepath));
    fs.mkdirSync(filepath);
  }
};

const writeFile = (filepath, content) => {
  makeFolderRecursive(path.dirname(filepath));

  if (content.match(/^data:.*?;base64,/)) {
    fs.writeFileSync(filepath, content.replace(/^data:.*?;base64,/, ''), 'base64');
  } else {
    fs.writeFileSync(filepath, content);
  }
};

const funcStart = () => {
  // console.log('start')

  // 重置全局参数
  THIS = {};

  // 设置全局元素
  $('.bottomBar [name="prev"]').attr('disabled', 'disabled');

  // 设置本地参数
  let files;
  files = fs.existsSync(CONFIG.workDir) ? fs.readdirSync(CONFIG.workDir).filter(file => ['.txt'].includes(path.extname(file).toLowerCase())).sort(collator.compare) : [];

  // 设置本地元素属性
  if (files.length) {
    $('.tabContent[name="start"]').find('[name="currentWorkStatus"]').addClass('actived').attr('files', files.length);
    $('.bottomBar [name="next"]').removeAttr('disabled');
  } else {
    $('.tabContent[name="start"]').find('[name="currentWorkStatus"]').removeClass('actived');
  }
  files = files.slice(0, 10);
  const currentWorkFileList = files.map(file => `<li>${file}</li>`).join('');
  $('.tabContent[name="start"]').find('[name="currentWorkDir"]').val(CONFIG.workDir);
  $('.tabContent[name="start"]').find('[name="currentWorkFiles"]').html(currentWorkFileList);

  // 设置本地元素事件
  $('.tabContent[name="start"]').find('[name="selectFile"]').off('change').on('change', e => {
    if (!e.target.files || !e.target.files.length) {
      e.target.value = null;
      return;
    }
    THIS.title = path.parse(e.target.value).name.trim();
    const fr = new window.FileReader();
    fr.onload = e => {
      const content = Buffer.from(e.target.result);
      const charset = chardet.detect(content);
      console.log(charset);
      THIS.content = iconv.decode(content, charset);
      $('.tabContent[name="start"]').find('[name="selectFile"]').val(null);
      $('.bottomBar [name="next"]').removeAttr('disabled');
      $('.bottomBar [name="next"]').click();
    };
    fr.readAsArrayBuffer(e.target.files[0]);
  });

  $('.tabContent[name="start"]').find('input[name="list"]').off('click').on('click', (e) => {
    let folder = fs.readdirSync(CONFIG.workDir).map(i => path.resolve(CONFIG.workDir, i)).filter(i => fs.statSync(i).isDirectory()).sort(collator.compare);
    folder = folder.find(i => fs.readdirSync(i).filter(file => ['.txt'].includes(path.extname(file).toLowerCase())).length);
    const files = fs.readdirSync(folder).filter(file => ['.txt'].includes(path.extname(file).toLowerCase())).map(file => path.join(folder, file)).sort(collator.compare);
    if (files.length) {
      $('.bottomBar [name="next"]').removeAttr('disabled');
    } else {
      return;
    }
    THIS.title = path.basename(folder);

    THIS.list = [];
    for (const file of files) {
      let charset = chardet.detectFileSync(file, { sampleSize: 1024 * 10 });
      if (!['GB18030', 'UTF-8'].includes(charset)) charset = chardet.detectFileSync(file);
      console.log(charset);
      const content = fs.readFileSync(file);
      THIS.list.push({
        title: path.parse(file).name.replace(/^\d+-(.*)$/, '$1'),
        content: iconv.decode(content, charset)
      });
    }
    THIS.content = THIS.list.map(i => `${i.title}\r\n${i.content}`).join('\r\n\r\n');
    $('.bottomBar [name="next"]').click();
    THIS.files = files;
  });

  $('.tabContent[name="start"]').find('input[name="nextEvent"]').off('click').on('click', (e) => {
    if (!THIS.content) {
      THIS.files = files.map(file => path.join(CONFIG.workDir, file));
      THIS.title = path.parse(THIS.files[0]).name.trim();

      let charset = chardet.detectFileSync(THIS.files[0], { sampleSize: 1024 * 10 });
      if (!['GB18030', 'UTF-8'].includes(charset)) charset = chardet.detectFileSync(THIS.files[0]);
      console.log(charset);
      const content = fs.readFileSync(THIS.files[0]);
      THIS.content = iconv.decode(content, charset);
    }

    if (THIS.title.match(/^《(.*?)》/)) THIS.title = THIS.title.match(/^《(.*?)》/)[1];
    if (THIS.title.match(/^【(.*?)】/)) THIS.title = THIS.title.match(/^【(.*?)】/)[1];
    THIS.title = THIS.title.replace(/\(.*?\)|（.*?）|【.*?】|作者：.*|全本|全集|完本|(无|未)删?减.*$/g, '').trim();

    THIS.content = THIS.content.replace(/^\s*(\*+|\*\s+.*?(更多好书请访问|shuchong8).*?\s*\*)\s*$/mg, '\r\n').replace(/([^\S\r\n]|[*]){10,}/g, '\r\n').replace(//g, '').replace(/<\/?br>/gi, '\r\n').replace(/<\/?font>/gi, '').replace(/^.*(书虫包小说网).*$/mig, '').trim();
    if (THIS.list) {
      for (let i = 0; i < THIS.list.length; i++) {
        THIS.list[0].content = THIS.list[0].content.replace(/^\s*(\*+|\*\s+.*?(更多好书请访问|shuchong8).*?\s*\*)\s*$/mg, '').replace(/[\s＊]{10,}/g, '\r\n').replace(//g, '').replace(/<\/?br>/gi, '\r\n').replace(/<\/?font>/gi, '').replace(/^.*(书虫包小说网).*$/mig, '').trim();
      }
    }
  });
};

const funcPretreat = () => {
  // console.log('pretreat')

  // 重置全局参数
  // THIS = {}

  // 设置全局元素
  $('.bottomBar [name="prev"]').removeAttr('disabled');

  // 设置本地参数
  // 设置本地元素属性
  $('.tabContent[name="pretreat"]').find('[name="content"]').text(THIS.content.replace(/\r/g, '').split('\n').slice(0, 30).join('\n'));

  // 设置本地元素事件
  $('.tabContent[name="pretreat"]').find('input[type="button"][name]').off('click').on('click', (e) => {
    e.stopPropagation();
    const name = $(e.target).attr('name');
    if (name === 'none') {
    } else {
      THIS.content = wordSection(name.split(','), THIS.content);
    }
    $('.bottomBar [name="next"]').click();
  });
};

const funcInfo = () => {
  // console.log('info')

  // 重置全局参数
  THIS.author = THIS.author || CONFIG.defaultAuthor;
  THIS.cover = THIS.cover || null;

  // 设置全局元素
  // $('.bottomBar [name="next"]').attr('disabled', 'disabled')

  // 设置本地参数

  // 设置本地元素属性
  $('.tabContent[name="info"]').find('[name="title"]').val(THIS.title);
  $('.tabContent[name="info"]').find('[name="author"]').val(THIS.author);

  // 设置本地元素事件
  $('.tabContent[name="info"]').find('[name="selectCover"]').off('change').on('change', e => {
    if (!e.target.files || !e.target.files.length) {
      e.target.value = null;
      return;
    }
    const fr = new window.FileReader();
    fr.onload = e => {
      THIS.cover = e.target.result;
    };
    fr.readAsDataURL(e.target.files[0]);
  });

  $('.tabContent[name="info"]').find('input[name="nextEvent"]').off('click').on('click', (e) => {
    THIS.title = $('.tabContent[name="info"]').find('[name="title"]').val().trim();
    THIS.author = $('.tabContent[name="info"]').find('[name="author"]').val().trim();

    const fontSize = 20;
    const width = 180;
    const height = 240;
    const color = '#000';
    const lineHeight = 10;
    const maxlen = width / fontSize - 2;
    const txtArray = THIS.title.split(new RegExp('(.{' + maxlen + '})'));
    let i = 1;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.strokeRect(0, 0, width, height);
    context.font = fontSize + 'px sans-serif';
    context.textBaseline = 'top';
    let fLeft, fTop;
    for (let j = 0; j < txtArray.length; j++) {
      if (txtArray[j] === '') continue;
      fLeft = fontSize * ((maxlen - txtArray[j].length) / 2 + 1);
      fTop = fontSize / 4 + fontSize * i + lineHeight * i;
      context.fillText(txtArray[j], fLeft, fTop);
      context.fillText('\n', fLeft, fTop);
      i++;
    }
    THIS.cover = canvas.toDataURL();
  });
};

const funcChapter = () => {
  // console.log('chapter')

  // 重置全局参数
  THIS.chapters = THIS.chapters || THIS.list || [{
    title: THIS.title,
    content: THIS.content
  }];

  // 设置全局元素

  // 设置本地参数
  let index;
  const isWarnChapter = (chapter) => {
    const wordCount = $('.tabContent[name="chapter"]').find('[name="wordCount"]').val() * 1;
    return !chapter.title || !chapter.content || chapter.content.length < wordCount * 0.1 || chapter.content.length >= wordCount * 4;
  };
  const elemPattern = [
    '<div class="{class}">',
    '<span></span>',
    '<span count="{length}">{length}</span>',
    '<span>{title}</span>',
    '<input type="button" key="a" title="(&a)向上移动" name="moveup" value="▲">',
    '<input type="button" key="s" title="(&s)按标记分割章节" name="split" value="拆">',
    '<input type="button" key="d" title="(&d)按字数分割章节" name="cut" value="分">',
    '<input type="button" key="f" title="(&f)按章节字数分割章节" name="chapter" value="章">',
    '<input type="button" key="g" title="(&g)合并到上一章节" name="combine" value="合">',
    '<input type="button" key="h" title="(&h)新增章节" name="add" value="增">',
    '<input type="button" key="j" title="(&j)插入章节" name="insert" value="插">',
    '<input type="button" key="k" title="(&k)移除章节" name="delete" value="减">',
    '</div>'
  ].join('');
  const elemGen = chapter => {
    let html = elemPattern;
    html = html.replace(/\{title\}/g, $('<div>').text(chapter.title.substr(0, 30)).html());
    html = html.replace(/\{length\}/g, chapter.content.length);
    html = html.replace(/\{class\}/g, isWarnChapter(chapter) ? 'warn' : '');
    return html;
  };
  const updateRegExp = () => {
    let number = $('.tabContent[name="chapter"]').find('[name="patternNumber"]').val();
    if (number in numberLib) {
      number = numberLib[number];
      number = '[' + number + ']+';
    }

    let prefix = $('.tabContent[name="chapter"]').find('[name="patternPre"]').val();
    if (prefix in prefixLib) {
      prefix = prefixLib[prefix];
      prefix = '[' + prefix + ']+';
    }

    let suffix = $('.tabContent[name="chapter"]').find('[name="patternSuf"]').val();
    if (suffix in suffixLib) {
      suffix = suffixLib[suffix];
      suffix = '[' + suffix + ']+';
    }

    const regexp = '([\\r\\n]|^)(.*?' + prefix + number + suffix + '.*?)([\\r\\n]|$)';
    $('.tabContent[name="chapter"]').find('[name="pattern"]').val(regexp);
  };
  let filtered = false;
  let chs = false;
  const regenChapterElements = () => {
    $('.tabContent[name="chapter"]').find('[name="chapterList"]').empty();
    THIS.chapters.forEach(chapter => {
      $(elemGen(chapter)).appendTo('.tabContent[name="chapter"] [name="chapterList"]');
    });
  };
  window.regenChapterElements = regenChapterElements;
  let store = window.localStorage.getItem('value-store');
  if (store) {
    store = JSON.parse(store);
    for (const name in store) {
      const list = $('.tabContent[name="chapter"]').find('input[list]').filter(`[name="${name}"]`).prop('list');
      $(list).append(store[name].map(value => `<option value="${value}">${value}</option>`).join(''));
    }
  }

  // 设置本地元素属性
  regenChapterElements();

  // 设置本地元素事件
  $('.tabContent[name="chapter"]').find('[name="patternPre"],[name="patternNumber"],[name="patternSuf"],[name="patternGroup"],[name="titlePattern"]').off('dblclick').on('dblclick', (e) => {
    e.target.value = '';
    updateRegExp();
  });
  $('.tabContent[name="chapter"]').find('[name="patternPre"],[name="patternNumber"],[name="patternSuf"]').off('change').on('change', (e) => {
    updateRegExp();
  }).change();
  $('.tabContent[name="chapter"]').find('[name="patternGroup"]').off('change').on('change', (e) => {
    const value = e.target.value;
    if (value.split('|').length === 3) {
      const [pre, number, suf] = value.split('|');
      if (pre !== 'null') $('.tabContent[name="chapter"]').find('[name="patternPre"]').val(pre);
      if (number !== 'null') $('.tabContent[name="chapter"]').find('[name="patternNumber"]').val(number);
      if (suf !== 'null') $('.tabContent[name="chapter"]').find('[name="patternSuf"]').val(suf);
      updateRegExp();
    }
  });
  $('.tabContent[name="chapter"]').find('input[list]').on('change', (e) => {
    const value = $(e.target).val();
    const name = $(e.target).attr('name');
    const list = $(e.target).prop('list');
    const options = $(list.options).map((i, e) => $(e).val()).toArray();
    if (!options.includes(value)) {
      const store = JSON.parse(window.localStorage.getItem('value-store') || '{}');
      if (!(name in store)) store[name] = [];
      store[name].push(value);
      window.localStorage.setItem('value-store', JSON.stringify(store));
      $(`<option value="${value}">${value}</option>`).appendTo(list);
    }
  });

  $('.tabContent[name="chapter"]').find('[name="filterChapter"]').off('click').on('click', (e) => {
    if (filtered) {
      $('.tabContent[name="chapter"]').find('[name="chapterList"]>div.hide').removeClass('hide');
      $('.tabContent[name="chapter"]').find('[name="chapterList"]>div.filter').removeClass('filter');
    } else {
      const showIndex = [];
      const titlePattern = $('.tabContent[name="chapter"]').find('[name="titlePattern"]').val();
      const titlePatternRe = new RegExp(titlePattern, 'gim');
      const isMatch = $('.tabContent[name="chapter"]').find('[name="titleMatch"]')[0].checked;
      for (let i = 1; i < THIS.chapters.length; i++) {
        const chapter = THIS.chapters[i];
        if (titlePattern) {
          const matched = THIS.chapters[i].title.match(titlePatternRe);
          if ((isMatch && matched) || (!isMatch && !matched)) {
            $('.tabContent[name="chapter"]').find('[name="chapterList"]>div').eq(i).addClass('filter');
            showIndex.push(i, i - 1, i + 1);
          }
        } else if (isWarnChapter(chapter)) {
          showIndex.push(i, i - 1, i + 1);
        }
      }
      $('.tabContent[name="chapter"]').find('[name="chapterList"]>div').filter(i => !showIndex.includes(i)).addClass('hide');
    }
    filtered = !filtered;
    $('.tabContent[name="chapter"]').find('[name="chapterList"]>div.actived').get(0).scrollIntoView();
  });

  $('.tabContent[name="chapter"]').find('[name="resetChapter"]').off('click').on('click', (e) => {
    THIS.chapters = THIS.list || [{
      title: THIS.title,
      content: THIS.content
    }];
    regenChapterElements();
  });

  $('.tabContent[name="chapter"]').find('[name="removeEmptyChapter"]').off('click').on('click', (e) => {
    for (let i = 0; i < THIS.chapters.length; i++) {
      if (THIS.chapters[i].content.length === 0) {
        THIS.chapters.splice(i, 1);
        i--;
      }
    }
    regenChapterElements();
  });

  $('.tabContent[name="chapter"]').find('[name="combineEmptyChapter"]').off('click').on('click', (e) => {
    for (let i = 1; i < THIS.chapters.length; i++) {
      if (THIS.chapters[i].content.length === 0) {
        THIS.chapters[i - 1].content += '\r\n' + THIS.chapters[i].title;
        THIS.chapters.splice(i, 1);
        i--;
      }
    }
    regenChapterElements();
  });

  $('.tabContent[name="chapter"]').find('[name="removeEmptyLine"]').off('click').on('click', (e) => {
    for (let i = 0; i < THIS.chapters.length; i++) {
      THIS.chapters[i].content = THIS.chapters[i].content.replace(/(\r?\n){2,}/g, '\r\n');
    }
    regenChapterElements();
  });

  $('.tabContent[name="chapter"]').find('[name="sectionLine"]').off('click').on('click', (e) => {
    const action = $(e.target).attr('action');
    for (let i = 0; i < THIS.chapters.length; i++) {
      THIS.chapters[i].content = wordSection([action], THIS.chapters[i].content);
    }
    regenChapterElements();
  });

  $('.tabContent[name="chapter"]').find('[name="changeChineseST"]').off('click').on('click', (e) => {
    for (let i = 0; i < THIS.chapters.length; i++) {
      THIS.chapters[i].title = tranStr(THIS.chapters[i].title, chs);
      THIS.chapters[i].content = tranStr(THIS.chapters[i].content, chs);
    }
    chs = !chs;
    regenChapterElements();
  });

  $('.tabContent[name="chapter"]').find('[name="dealLongChapter"]').off('click').on('click', (e) => {
    const action = $(e.target).attr('action');
    const wordCount = $('.tabContent[name="chapter"]').find('[name="wordCount"]').val() * 1;
    $('.tabContent[name="chapter"]').find('[name="chapterList"]>div').filter((i, e) => $(e).find('[count]').attr('count') * 1 >= wordCount * 2).find(`[type="button"][name="${action}"]`).click();
    regenChapterElements();
  });

  $('.tabContent[name="chapter"]').find('[name="chapterList"]').off('click').on('click', 'span', (e) => {
    $('.tabContent[name="chapter"]').find('[name="editable"]').prop('checked', false);
    $('.tabContent[name="chapter"]').find('[name="content"]').attr('disabled', 'disabled');

    const wordCount = $('.tabContent[name="chapter"]').find('[name="wordCount"]').val() * 1;
    const target = $(e.target).parent();
    target.siblings().removeClass('actived');
    target.addClass('actived');
    index = target.index();

    $('.tabContent[name="chapter"]').find('[name="title"]').val(THIS.chapters[index].title);
    $('.tabContent[name="chapter"]').find('[name="length"]').val(THIS.chapters[index].content.length);
    $('.tabContent[name="chapter"]').find('[name="content"]').val(THIS.chapters[index].content.substr(0, wordCount * 10));
    $('.tabContent[name="chapter"]').find('[name="content"]')[0].scrollTop = 0;
  });

  $('.tabContent[name="chapter"]').find('[name="chapterList"]').on('click', 'input:button', (e) => {
    const target = $(e.target).parent();
    target.addClass('hide');
    index = target.index();
    const name = $(e.target).attr('name');

    if (name === 'split') {
      let regexp = $('.tabContent[name="chapter"]').find('[name="pattern"]').val();
      regexp = new RegExp(regexp, 'gim');

      const chapter = THIS.chapters[index];
      var result = chapter.content.split(regexp);
      const chapters = [];
      // if (result[0].trim()) {
      chapters.push({
        title: chapter.title,
        content: result[0].trim()
      });
      // }
      for (let i = 1; i < result.length; i = i + 4) {
        let title = result[i + 1].trim();
        let content = result[i + 3].trim();
        if (!title) {
          content = content.split(/[\n]/).map(i => i.replace(/[\r]/g, ''));
          for (let i = 0; i < content.length;) {
            if (content[i].trim()) break;
            content.splice(i, 1);
          }
          if (content.length) {
            title = content.splice(0, 1)[0].trim();
            content = content.join('\r\n');
          } else {
            continue;
          }
        }
        chapters.push({ title, content });
      }

      const elems = chapters.map(chapter => elemGen(chapter)).join('');
      $(target).replaceWith(elems);
      THIS.chapters.splice(index, 1, ...chapters);
    } else if (name === 'cut') {
      const wordCount = $('.tabContent[name="chapter"]').find('[name="wordCount"]').val() * 1;
      const lineEnd = '。？！”」』\n';
      const searchMaxCount = 100;

      const chapter = THIS.chapters[index];
      let chapters = [];

      let content = chapter.content;
      const title = chapter.title;
      while (content.length) {
        if (content.length <= wordCount && chapters.length) {
          if (content.length * 2 < wordCount) {
            chapters[chapters.length - 1] += '\r\n　　' + content.trim();
          } else {
            chapters.push(content);
          }
          break;
        }
        let i;
        for (i = wordCount - 1; i > wordCount - searchMaxCount + 1; i = i - 1) {
          if (lineEnd.includes(content[i])) break;
        }
        if (i === wordCount - searchMaxCount + 1) {
          for (i = wordCount - 1; i < wordCount + searchMaxCount - 1; i = i + 1) {
            if (i >= content.length || lineEnd.includes(content[i])) break;
          }
        }
        if (i === wordCount + searchMaxCount - 1) i = wordCount - 1;
        chapters.push(content.substr(0, i + 1));
        content = content.substr(i + 1).trim();
      }

      chapters = chapters.map((i, o) => ({ title: `${title} - 第${o + 1}部分`, content: i }));

      const elems = chapters.map(chapter => elemGen(chapter)).join('');
      $(target).replaceWith(elems);
      THIS.chapters.splice(index, 1, ...chapters);
    } else if (name === 'combine' && index > 0) {
      const chapter = THIS.chapters[index];
      const chapterBefore = THIS.chapters[index - 1];
      let title;
      if (chapter.title.match(/ - 第(\d+)部分$/)) {
        title = chapter.title.match(/ - 第(\d+)部分$/)[1] * 1 === 1 ? '\r\n\r\n' + chapter.title.replace(/ - 第(\d+)部分$/, '') : '';
      } else {
        title = '\r\n\r\n' + chapter.title.trim();
      }
      const chapterNew = {
        title: chapterBefore.title.replace(/ - 第(\d+)部分$/, ''),
        content: chapterBefore.content + title + '\r\n' + chapter.content.trim()
      };

      index = index - 1;
      $(target).prev().replaceWith(elemGen(chapterNew));
      $(target).remove();
      THIS.chapters.splice(index, 2, chapterNew);
    } else if (name === 'add') {
      const chapterNew = {
        title: '',
        content: ''
      };

      index = index + 1;
      $(target).after(elemGen(chapterNew));
      THIS.chapters.splice(index, 0, chapterNew);
    } else if (name === 'insert') {
      const chapterNew = {
        title: '',
        content: ''
      };

      $(target).before(elemGen(chapterNew));
      THIS.chapters.splice(index, 0, chapterNew);
    } else if (name === 'delete') {
      $(target).remove();
      THIS.chapters.splice(index, 1);
      if (index === THIS.chapters.length) index = index - 1;
    } else if (name === 'chapter') {
      const chapterCount = $('.tabContent[name="chapter"]').find('[name="chapterCount"]').val() * 1;

      const chapter = THIS.chapters[index];
      const chapters = [{
        title: chapter.title,
        content: ''
      }];

      const lines = chapter.content.split(/[\n]/).map(i => i.replace(/[\r]/g, ''));
      for (const line of lines) {
        if (line.trim() && line.trim().length <= chapterCount) {
          chapters.push({
            title: line.trim(),
            content: ''
          });
        } else {
          chapters[chapters.length - 1].content = chapters[chapters.length - 1].content.trim() + '\r\n' + line;
        }
      }

      const elems = chapters.map(chapter => elemGen(chapter)).join('');
      $(target).replaceWith(elems);
      THIS.chapters.splice(index, 1, ...chapters);
    } else if (name === 'moveup' && index > 0) {
      const chapter = THIS.chapters[index];
      const chapterBefore = THIS.chapters[index - 1];

      index = index - 1;
      $(target).prev().replaceWith(elemGen(chapter));
      $(target).replaceWith(elemGen(chapterBefore));
      THIS.chapters.splice(index, 2, chapter, chapterBefore);
    }
    target.removeClass('hide');
    $('.tabContent[name="chapter"]').find('[name="chapterList"]>div>span:nth-child(3)').eq(index).click();
  });

  const keyupFunc = (e) => {
    if (e.ctrlKey || e.shiftKey) return;
    if ($(e.target).is('body') && $('.tabContent.actived[name="chapter"]').length) {
      if (['ArrowDown'].includes(e.key)) {
        index++;
      } else if (['ArrowUp'].includes(e.key)) {
        index--;
      } else if (['ArrowRight'].includes(e.key)) {
        index += 20;
      } else if (['ArrowLeft'].includes(e.key)) {
        index -= 20;
      } else {
        if ($('.tabContent[name="chapter"]').find('[name="chapterList"]>div.actived').find(`input:button[key="${e.key}"]`).length) {
          $('.tabContent[name="chapter"]').find('[name="chapterList"]>div.actived').find(`input:button[key="${e.key}"]`).click();
        } else if ($('.tabContent[name="chapter"]').find(`input:button[key="${e.key}"]`).length) {
          $('.tabContent[name="chapter"]').find(`input:button[key="${e.key}"]`).click();
        } else {
          console.log(e.key);
        }
      }
      if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
        if (index >= THIS.chapters.length) index -= THIS.chapters.length;
        $('.tabContent[name="chapter"]').find('[name="chapterList"]>div>span:nth-child(3)').eq(index).click();
      }
      if ($('.tabContent[name="chapter"]').find('[name="chapterList"]>div.actived').length) $('.tabContent[name="chapter"]').find('[name="chapterList"]>div.actived').get(0).scrollIntoView();
    }
  };

  $(window).off('keyup', keyupFunc).on('keyup', keyupFunc);

  $('.tabContent[name="chapter"]').find('[name="editable"]').off('change').on('change', (e) => {
    const checked = $(e.target).prop('checked');
    if (checked) {
      $('.tabContent[name="chapter"]').find('[name="content"]').val(THIS.chapters[index].content);
      $('.tabContent[name="chapter"]').find('[name="content"]').attr('disabled', null);
    } else {
      $('.tabContent[name="chapter"]').find('[name="content"]').attr('disabled', 'disabled');
      THIS.chapters[index].content = $('.tabContent[name="chapter"]').find('[name="content"]').val();

      const elem = $(elemGen(THIS.chapters[index])).addClass('actived');
      $('.tabContent[name="chapter"]').find('[name="chapterList"]>div').eq(index).replaceWith(elem);
    }
  });
  $('.tabContent[name="chapter"]').find('[name="title"]').off('change').on('change', (e) => {
    THIS.chapters[index].title = e.target.value;

    const elem = $(elemGen(THIS.chapters[index])).addClass('actived');
    $('.tabContent[name="chapter"]').find('[name="chapterList"]>div').eq(index).replaceWith(elem);
  });

  // if ($('.tabContent[name="chapter"]').find('[name="chapterList"]>div').length === 1) $('.tabContent[name="chapter"]').find('[name="chapterList"]>div>input[type="button"][name="split"]').eq(0).click()
  $('.tabContent[name="chapter"]').find('[name="chapterList"]>div>span:nth-child(3)').eq(0).click();
};

const funcExport = () => {
  // console.log('export')

  // 重置全局参数

  // 设置全局元素
  // $('.bottomBar [name="next"]').attr('disabled', 'disabled')

  // 设置本地参数
  const tempDir = path.resolve(__dirname, './../temp');

  // 设置本地元素属性

  // 设置本地元素事件
  $('.tabContent[name="export"]').find('input[name="nextEvent"]').off('click').on('click', (e) => {
    const length = String(THIS.chapters.length).length;
    const uuid = 'nd' + new Date().getTime().toString();

    const files = {
      mimetype: 'application/epub+zip',
      'META-INF/container.xml': '<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" /></rootfiles></container>',
      'OEBPS/stylesheet.css': CONFIG.css,
      'OEBPS/cover.jpg': THIS.cover,
      'OEBPS/content.opf': `<?xml version="1.0" encoding="UTF-8"?><package version="2.0" unique-identifier="${uuid}" xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:title>${THIS.title}</dc:title><dc:creator>${THIS.author}</dc:creator><dc:publisher>epubBuilder</dc:publisher><dc:identifier id="${uuid}">urn:uuid:${uuid}</dc:identifier><dc:language>zh-CN</dc:language><meta name="cover" content="cover-image" /></metadata><manifest>`,
      'OEBPS/toc.ncx': `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="urn:uuid:${uuid}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>${THIS.title}</text></docTitle><navMap><navPoint id="navpoint-1" playOrder="1"><navLabel><text>首页</text></navLabel><content src="cover.html"/></navPoint>`,
      'OEBPS/cover.html': `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${THIS.title}</title><link type="text/css" rel="stylesheet" href="stylesheet.css" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body><h1>${THIS.title}</h1><h2>本电子书由用户脚本${THIS.author}制作</h2></body></html>`
    };

    let item = '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/><item id="cover" href="cover.html" media-type="application/xhtml+xml"/><item id="css" href="stylesheet.css" media-type="text/css"/>';
    let itemref = '<itemref idref="cover" linear="yes"/>';

    for (let i = 0; i < THIS.chapters.length; i++) {
      const chapter = THIS.chapters[i];
      const chapterName = chapter.title;
      const chapterOrder = String(i + 1).padStart(length, '0');
      const chapterContent = chapter.content.replace(/\r/g, '').replace(/\n/g, '</p><p>').replace(/<p>\s+/g, '<p>');

      files['OEBPS/toc.ncx'] += '<navPoint id="chapter' + chapterOrder + '" playOrder="' + (i + 2) + '"><navLabel><text>' + chapterName + '</text></navLabel><content src="' + chapterOrder + '.html"/></navPoint>';

      item += '<item id="chapter' + chapterOrder + '" href="' + chapterOrder + '.html" media-type="application/xhtml+xml"/>';
      itemref += '<itemref idref="chapter' + chapterOrder + '" linear="yes"/>';
      files[`OEBPS/${chapterOrder}.html`] = '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>' + chapterName + '</title><link type="text/css" rel="stylesheet" media="all" href="stylesheet.css" /><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body><h3>' + chapterName + '</h3><div><p>' + chapterContent + '</p></div></body></html>';
    }
    files['OEBPS/content.opf'] += `${item}<item id="cover-image" href="cover.jpg" media-type="image/jpeg"/></manifest><spine toc="ncx">${itemref}</spine><guide><reference href="cover.html" type="cover" title="Cover"/></guide></package>`;
    files['OEBPS/toc.ncx'] += '</navMap></ncx>';

    // console.log(files)
    for (const file in files) {
      const filepath = path.resolve(tempDir, file);
      writeFile(filepath, files[file]);
    }
    let output = path.resolve(CONFIG.workDir, `${THIS.title}.epub`);
    let count = 1;
    while (fs.existsSync(output)) {
      output = path.resolve(CONFIG.workDir, `${THIS.title}-${count++}.epub`);
    }

    output = fs.createWriteStream(output);
    var archive = archiver('zip', {
      zlib: {
        level: 9
      }
    });
    output.on('close', function () {
      if (THIS.list) {
        for (const file of THIS.files) {
          fs.unlinkSync(file);
        }
        const dir = path.dirname(THIS.files[0]);
        if (path.relative(dir, CONFIG.workDir) !== '' && fs.readdirSync(dir).length === 0) {
          fs.rmdirSync(dir);
        }
      } else if (THIS.files && THIS.files.length) {
        fs.unlinkSync(THIS.files[0]);
      }
      $('.bottomBar span[name="reset"]').click();
    });
    archive.on('error', function (err) {
      throw err;
    });
    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
  });
};

const funcConfig = () => {
  const elems = $('.tabContent[name="config"]').find('input:not([type="button"]):not([type="file"]),select,textarea').toArray();

  elems.forEach(i => {
    const key = i.getAttribute('id').replace('config-', '');
    if (!(key in CONFIG)) return;
    const value = CONFIG[key];
    if (i.type === 'text' || i.type === 'hidden' || i.type === 'select-one' || i.type === 'number' || i.type === 'textarea') {
      i.value = value;
    } else if (i.type === 'checkbox') {
      i.checked = value;
    } else if (i.type === 'radio') {
      i.checked = (i.value === value);
    }
  });

  $('#config-btnSave').on('click', () => {
    const config = {};
    elems.forEach(i => {
      const key = i.getAttribute('id').replace('config-', '');
      let value;
      if (i.type === 'number') {
        value = (i.value || i.placeholder) * 1;
        if (isNaN(value)) return;
      } else if (i.type === 'text' || i.type === 'hidden' || i.type === 'textarea') {
        value = i.value || i.placeholder;
      } else if (i.type === 'checkbox') {
        value = i.checked;
      } else if (i.type === 'select-one') {
        value = i.value;
      } else if (i.type === 'radio') {
        if (!i.checked) return;
        value = i.value;
      }
      config[key] = value;
    });
    CONFIG = config;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  });
};

// Main
const main = async () => {
  $('.navBar>span[name="start"]').on('click', funcStart);
  $('.navBar>span[name="pretreat"]').on('click', funcPretreat);
  $('.navBar>span[name="info"]').on('click', funcInfo);
  $('.navBar>span[name="chapter"]').on('click', funcChapter);
  $('.navBar>span[name="export"]').on('click', funcExport);

  $('.navBar>span').on('click', (e) => {
    if ($(e.target).attr('disabled')) return;
    $('.navBar>span').removeClass('actived');
    $(e.target).addClass('actived');

    const name = $(e.target).attr('name');
    $('.tabContent').removeClass('actived');
    $(`.tabContent[name="${name}"]`).addClass('actived');
  });

  $('.bottomBar span[name="reset"]').on('click', () => {
    window.location.reload();
  });

  $('.bottomBar [name="prev"]').on('click', (e) => {
    if ($(e.target).attr('disabled')) return;
    $('.navBar>span.actived').prev().click();
  });
  $('.bottomBar [name="next"]').on('click', (e) => {
    if ($(e.target).attr('disabled')) return;
    $('.tabContent.actived input[name="nextEvent"]').click();
    $('.navBar>span.actived').next().removeAttr('disabled').click();
  });

  if (!fs.existsSync('./config.json')) {
    $('.navBar>span[name="config"]').click();
  } else {
    CONFIG = Object.assign(CONFIG, JSON.parse(fs.readFileSync('./config.json', 'utf-8')));
  }

  deleteFolderRecursive(path.resolve(__dirname, './../temp'));
  $('.navBar>span').not('.navBar>span[name="start"]').not('.navBar>span[name="config"]').attr('disabled', 'disabled');
  $('.bottomBar span[name]').not('.bottomBar span[name="reset"]').attr('disabled', 'disabled');
  $('.navBar>span[name="start"]').click();

  funcConfig();

  $(window).on('keyup', (e) => {
    if ($(e.target).is('body')) {
      if (e.key === ',') {
        $('.bottomBar [name="prev"]').click();
      } else if (e.key === '.') {
        $('.bottomBar [name="next"]').click();
      } else {
        // console.log(e.key)
      }
    }
  });
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  process.exit();
});
