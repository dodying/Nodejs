// ==Headers==
// @Name:               replaceWithDict
// @Description:        replaceWithDict
// @Version:            1.0.13
// @Author:             dodying
// @Created:            2020-04-02 20:57:43
// @Modified:           2020-4-24 20:37:48
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

'use strict';

/**
 * @name replaceWithDict
 * @param {string} text string with {var}
 * @param {object} dict eg: {var: value}
 * @param {function} ifNotString
 * @example replaceWithDict('{a}|b|{c}|d|{e}', {a:'12',c:[1,2,3]}, (key,value)=>`${key}:${String(value)}`) = "12|b|c:1,2,3|d|e:undefined"
 */
const replaceWithDict = (text, dict, ifNotString) => {
  const pattern = /(\{[^{}]+\})/;
  const pattern1 = /\{([^{}]+)\}/;
  while (text.split(pattern).length > 1) {
    const arr = text.split(pattern);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].match(pattern1)) {
        const key = arr[i].match(pattern1)[1];
        let value = dict[key];
        if (typeof value !== 'string') value = ifNotString(key, value);

        arr[i] = value;
      }
    }
    text = arr.join('');
  }
  return text;
};
module.exports = replaceWithDict;
