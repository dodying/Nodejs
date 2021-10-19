// ==Headers==
// @Name:               timeFormat
// @Description:        timeFormat
// @Version:            1.0.1
// @Author:             dodying
// @Created:            2020-07-13 11:14:36
// @Modified:           2020/7/13 11:14:46
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

module.exports = (time, format = 'yyyy-MM-dd HH:mm:ss') => {
  const date = new Date(time);
  const obj = {
    yyyy: date.getFullYear().toString(),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    dd: date.getDate().toString().padStart(2, '0'),

    HH: date.getHours().toString().padStart(2, '0'),
    mm: date.getMinutes().toString().padStart(2, '0'),
    ss: date.getSeconds().toString().padStart(2, '0'),
  };
  const re = new RegExp(`(${Object.keys(obj).join('|')})`, 'g');
  return format.replace(re, (matched, p1) => obj[p1]);
};
