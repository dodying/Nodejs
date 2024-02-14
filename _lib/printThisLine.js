// ==Headers==
// @Name:               printThisLine
// @Description:        printThisLine
// @Version:            1.0.11
// @Author:             dodying
// @Created:            2023-01-01 16:24:03
// @Modified:           2023-01-26 21:14:55
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            eastasianwidth
// ==/Headers==

const eaw = require('eastasianwidth');

module.exports = function (text, remain = 'end') {
  if (!process.stdout?.clearLine) return;
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  const total = eaw.length(text);
  if (total > process.stdout.columns) {
    const lengthMax = process.stdout.columns - 3;
    let text1 = text;
    let length = lengthMax;
    if (remain !== 'left') text1 = text1.split('').reverse().join('');
    text1 = text1.substring(0, length);
    let lengthView = eaw.length(text1);
    while (lengthView > lengthMax) {
      length = length - Math.ceil((lengthView - lengthMax) / 2);
      text1 = text1.substring(0, length);
      lengthView = eaw.length(text1);
    }
    text1 = `${text1}...`;
    if (remain !== 'left') text1 = text1.split('').reverse().join('');
    process.stdout.write(text1);
  } else {
    process.stdout.write(text);
  }
};
