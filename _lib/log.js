// ==Headers==
// @Name:               log
// @Description:        log
// @Version:            1.0.0
// @Author:             dodying
// @Created:            2020-05-23 20:45:56
// @Modified:           2020-05-23 20:45:56
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

'use strict';

const color = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m'
};
const _color = {
  log: color.FgGreen,
  warn: color.FgYellow,
  error: color.BgRed,
  debug: color.FgBlue
};
var consoleRaw = {};

function logWithColor (type, ...args) {
  if (args.length === 1 && typeof args[0] === 'string') {
    const result = args[0].match(/^(.*):\t(.*)$/);
    if (result && result[1].length < 16) {
      let space = 16 - result[1].length - 1;
      if (result[2].match(/^"/)) space = space - 1;
      consoleRaw[type](`${color.FgCyan}${result[1]}${color.Reset}:${' '.repeat(space)}${_color[type]}${result[2]}${color.Reset}`);
    } else {
      consoleRaw[type](...args);
    }
  } else {
    consoleRaw[type](...args);
  }
}

const log = (...args) => logWithColor('log', ...args);
log.hack = () => {
  for (const i in _color) {
    console[i] = log[i];
  }
};

for (const i in _color) {
  consoleRaw[i] = console[i];
  log[i] = (...args) => logWithColor(i, ...args);
}

module.exports = log;
