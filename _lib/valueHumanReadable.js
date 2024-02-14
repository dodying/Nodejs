// ==Headers==
// @Name:               valueHumanReadable
// @Description:        valueHumanReadable
// @Version:            1.0.10
// @Author:             dodying
// @Created:            2023-06-25 09:13:23
// @Modified:           2023-07-01 20:47:26
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

const replace = require('./replaceWithDict');

/**
 * @param {number} value
 * @param {array} formats
 * @param {(array | number)} steps
 * @param {string} output
 * @example valueHumanReadable(322350904, ['bytes', 'KB', 'MB', 'GB'], 1024, '{-1}{-1f}') => 307MB
 * @example valueHumanReadable(135400, ['s', 'min', 'h', 'day'], [60, 60, 24], '{2}:{1}:{0}') => 13:36:40
 */
module.exports = function valueHumanReadable(value, formats, steps, output) {
  let outputRaw = value;
  if (typeof steps === 'number') steps = new Array(formats.length).join(',').split(',').map((i) => steps);
  let index = 0;
  const arr = [];
  const obj = {};
  obj[`${(index).toString()}.2`] = (outputRaw).toFixed(2) * 1;

  while (outputRaw >= steps[index] && index + 1 < formats.length) {
    arr.push(parseInt(outputRaw) % steps[index]);

    outputRaw = outputRaw / steps[index];
    obj[`${(index + 1).toString()}.2`] = (outputRaw).toFixed(2) * 1;

    index = index + 1;
  }
  arr.push(steps[index] ? parseInt(outputRaw) % steps[index] : parseInt(outputRaw));
  for (let i = 0; i < formats.length; i++) {
    obj[i] = arr[i] || 0;
    obj[`0${i}`] = String(arr[i] || 0).padStart(2, '0');
    obj[`${i.toString()}f`] = formats[i];
    if (i < arr.length) {
      obj[i - arr.length] = arr[i] || 0;
      obj[`${(i - arr.length).toString()}.2`] = obj[`${i.toString()}.2`];
      obj[`${(i - arr.length).toString()}f`] = formats[i];
    }
  }
  return replace(output, obj);
};
