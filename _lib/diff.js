// ==Headers==
// @Name:               diff
// @Description:        diff
// @Version:            1.0.2
// @Author:             dodying
// @Created:            2020-07-13 10:54:35
// @Modified:           2020/7/13 10:54:53
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

'use strict';

module.exports = function diff (t1, t2) { // ignore case
  t1 = t1.replace(/\s+/g, ' ');
  t2 = t2.replace(/\s+/g, ' ');
  const arr1 = t1.split(/([[\](){}\s])/).filter(i => i); // 不变
  const arr2 = t2.split(/([[\](){}\s])/).filter(i => i); // 变
  const arr1Up = t1.toUpperCase().split(/([[\](){}\s])/).filter(i => i);
  const arr2Up = t2.toUpperCase().split(/([[\](){}\s])/).filter(i => i);
  const result = [];
  for (let i = 0; i < arr1Up.length; i++) {
    if (arr2Up.includes(arr1Up[i])) {
      const index = arr2Up.indexOf(arr1Up[i]);
      if (index > 0 && [' '].includes(arr1Up[i])) {
        result.push([-1, arr1[i]]);
        continue;
      } else if (index > 0) { // added
        arr2Up.splice(0, index);
        const added = arr2.splice(0, index);
        result.push([1, added.join('')]);
      }
      result.push([0, arr1[i]]);
      arr2Up.splice(0, 1);
      arr2.splice(0, 1);
    } else { // removed
      result.push([-1, arr1[i]]);
    }
  }
  if (arr2.length) result.push([1, arr2.join('')]);

  return result;
};
