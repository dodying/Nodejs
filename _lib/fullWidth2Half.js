'use strict';

module.exports = function fullWidth2Half (str) { // 全角字符转半角
  // info: https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms
  // refer: https://www.cnblogs.com/html55/p/10298569.html
  let result = '';
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 12288) {
      result += String.fromCharCode(str.charCodeAt(i) - 12256);
      continue;
    }
    if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375) result += String.fromCharCode(str.charCodeAt(i) - 65248);
    else result += String.fromCharCode(str.charCodeAt(i));
  }
  return result;
};
