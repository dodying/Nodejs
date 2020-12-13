// ==Headers==
// @Name:               replaceWithDict
// @Description:        replaceWithDict
// @Version:            1.0.66
// @Author:             dodying
// @Created:            2020-04-02 20:57:43
// @Modified:           2020/9/15 15:10:35
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

'use strict';
let dictG = {};
let optionG = {
  depth: 1,
  ifNotString: (key, value, dict) => JSON.stringify(value),
  ifString: (key, value, dict) => value,
  ignoreDefaultDict: false
};

/**
 * @name replaceWithDict
 * @param {string} text string with {var}
 * @param {object} dict eg: {var: value}
 * @param {object} option
 * @example replaceWithDict('{a}|b|{c}|d|{e}', {a:'12',c:[1,2,3]}) = "12|b|c:1,2,3|d|e:undefined"
 * depth
 */
const replaceWithDict = (text, dict, option = {}) => {
  option = Object.assign({}, optionG, option);
  if (!option.ignoreDefaultDict) dict = Object.assign({}, dictG, dict);
  const pattern = /(\{[^{}]+\})/;
  const pattern1 = /\{([^{}]+)\}/;
  for (let time = 0; time < (option.depth || 1); time++) {
    const arr = text.split(pattern);
    if (arr.length === 1) break;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].match(pattern1)) {
        const key = arr[i].match(pattern1)[1];
        let value = dict[key];
        if (typeof value === 'string') {
          value = option.ifString(key, value, dict);
        } else {
          value = option.ifNotString(key, value, dict);
        }
        arr[i] = value;
      }
    }
    text = arr.join('');
  }
  return text;
};
replaceWithDict.init = (dict = {}, option = optionG) => {
  dictG = dict;
  optionG = Object.assign({}, optionG, option);
};
replaceWithDict.assign = dict => (dictG = Object.assign(dictG, dict || {}));
module.exports = replaceWithDict;
