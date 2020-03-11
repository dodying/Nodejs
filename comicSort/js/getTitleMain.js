'use strict';

const reEscape = require('./../../_lib/reEscape');
const fullWidth2Half = require('./../../_lib/fullWidth2Half');
const removeOtherInfo = require('./removeOtherInfo');

const digitalRomaji = {
  0: [['rei', 'zero'], ['0', '０', '零', '〇']],
  1: [['ichi', 'i'], ['1', '１', 'I', '一', '壹', '壱']],
  2: [['ni', 'ii'], ['2', '２', '二', '贰', '貮', '弐']],
  3: [['san', 'sann', 'iii'], ['3', '３', '三', '参', '參']],
  4: [['yon', 'yonn', 'shi', 'iv'], ['4', '４', '四', '肆']],
  5: [['go', 'v'], ['5', '５', '五', '伍']],
  6: [['roku', 'vi'], ['6', '６', '六', '陆', '陸']],
  7: [['nana', 'shichi', 'vii'], ['7', '７', '七', '柒', '漆']],
  8: [['hachi', 'viii'], ['8', '８', '八', '捌']],
  9: [['kyuu', 'kyu', 'ix'], ['9', '９', '九', '玖']],
  10: [['jyuu', 'jyu', 'juu', 'ju', 'x'], ['10', '１０', '十', '拾']]
};
const punctuation = '.?!,,;:""\'\'--~_-_-#';
const punctuationJpn = '。？！，、；：“”‘’─－～＿—﹏–#';
let numberStr = '\\d０-９百千万佰仟萬' + Object.values(digitalRomaji).map(i => i[1]).map(i => i.slice(2).join('')).join('');
numberStr = `[${numberStr}]+[-.,\\s]*[${numberStr}]*`;
const numberPrefixStr = '第|番外|総集|前|後|中|之|続|(^|\\s)(dai|bangai|soushuu|zenpen|kouhen|chuuhen|sareru|zoku|case|episode|ch|vol|i{0,3}(v|x)?|(v|x)?i{0,3})|\\s';
const numberSuffixStr = 'wa|hanashi|話|hen|編|篇|maku|幕|shou|章|satsume|冊目|hon|本|巻';

const separatorRe = /\s[-_+・.]|[?!;:|~]/;
const reLib = {
  numberJpn: new RegExp(`(${numberPrefixStr})([-.,\\s]*)(${numberStr})?(${numberSuffixStr})?$`, 'i'),
  number: new RegExp(`${numberStr}$`),
  punctuation: new RegExp(`[${reEscape(punctuation)}]+$`),
  punctuationStart: new RegExp(`^[${reEscape(punctuation)}]+`)
};
const reLibArr = Object.keys(reLib).map(i => [i, reLib[i]]);
const cutReLib = (text) => {
  const arr = [];
  while (reLibArr.some(i => text.match(i[1])) && text) {
    const matched = reLibArr.filter(i => text.match(i[1]))[0];
    if (['number', 'numberJpn'].includes(matched[0])) {
      const number = text.match(matched[1]).filter(i => i && i.trim().match(new RegExp(`^${numberStr}$`)));
      arr.push(number.length ? number[0].trim() : text.match(matched[1])[0].trim());
    }
    text = text.replace(matched[1], '').trim();
  }
  return [text, arr];
};

const main = (text) => {
  let mainText = removeOtherInfo(text);
  mainText = removeOtherInfo(mainText, true);
  let numberText = [];
  let arr;

  mainText = fullWidth2Half(mainText); // 转换为半角
  mainText = mainText.replace(new RegExp(`[${reEscape(punctuationJpn)}]`, 'g'), (str) => punctuation.substr(punctuationJpn.indexOf(str), 1)) // 转换标点符号为英文标点

  ;[mainText, arr] = cutReLib(mainText);
  numberText = numberText.concat(arr);

  if (mainText.match(separatorRe)) { // 分隔符
    mainText = mainText.split(separatorRe).filter(i => i)[0].trim();
  }

  [mainText, arr] = cutReLib(mainText);
  numberText = numberText.concat(arr);
  if (numberText.length === 0) numberText = ['1'];

  // 首字母大写，其他小写(同时统一空白字符)
  mainText = mainText.replace(/[a-z]+/gi, all => all.slice(0, 1).toUpperCase() + all.slice(1).toLowerCase());
  numberText = numberText.reverse().join(' ').replace(/[a-z]+/gi, all => all.slice(0, 1).toUpperCase() + all.slice(1).toLowerCase());

  return [mainText, numberText];
};

module.exports = main;
