const reEscape = require('../../_lib/reEscape');

const infoGroup = ['[]', '()', '{}', '【】', '（）', '〈〉', '『』', '《》'];

module.exports = (text, reverse = false) => {
  text = text.replace(/\u200B/g, '');
  if (reverse) text = text.split('').reverse().join('');
  let group = reverse ? infoGroup.map((i) => i.split('').reverse().join('')) : infoGroup;
  group = group.map((i) => i.split('').map((j) => reEscape(j)));
  let re = group.map((i) => `${i[0]}.*?${i[1]}`).join('|');
  re = new RegExp(`^(${re})`);
  let matched = text.match(re);
  while (matched) {
    text = text.replace(re, '').trim();
    matched = text.match(re);
  }
  if (reverse) text = text.split('').reverse().join('');
  return text;
};
