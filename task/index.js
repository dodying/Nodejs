// ==Headers==
// @Name:               task
// @Description:        自动更新头部信息(Headers)
// @Version:            1.0.97
// @Author:             dodying
// @Modified:           2021/2/26 20:21:45
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            clipboardy,inquirer
// ==/Headers==

// usage: mode file
//   mode: one of "userjs"/"nodejs"/"deno"/"bookmarklet"

// 设置

// 导入原生模块
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const clipboardy = require('clipboardy');
const replaceWithDict = require('../_lib/replaceWithDict');

// 导入第三方模块
// const inquirer = require('inquirer');
const _ = require('./config');

// Function
// const getVar = async name => {
//   if (!name) return _;
//   if (!(name in _)) {
//     const prompt = await inquirer.prompt({
//       type: 'input',
//       name: 'var',
//       message: `${name}:\t`,
//       validate: value => value ? true : 'Please enter a valid string'
//     });
//     _[name] = prompt.var;
//   }
//   return _[name];
// };
const spawnSync = (...argsForSpwan) => new Promise((resolve) => {
  const child = cp.spawn(...argsForSpwan);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on('exit', (code) => {
    let end;
    if (code.toString() !== '0') {
      end = 'error';
      console.error(`Command:\t${argsForSpwan[0]}\nCommand Args:${argsForSpwan[1].map((i) => `{${i}}`).join(', ')}\nExit Code:\t${code.toString()}`);
    } else {
      end = true;
    }
    resolve(end);
  });
});

// Main
async function init() {
  const argv = process.argv.splice(2);
  console.log(argv);
  const mode = argv[0];
  const item = argv[1];
  if (mode === 'userjs') {
    const content = fs.readFileSync(item, 'utf-8');
    const eof = content.match('\r\n') ? '\r\n' : '\n';
    const arr = content.split(eof);

    const headerStart = '// ==UserScript==';
    const headerEnd = '// ==/UserScript==';

    const start = arr.indexOf(headerStart);
    const end = arr.indexOf(headerEnd);
    if (start < 0 || end < 0) return;

    for (let i = start + 1; i < end; i++) {
      if (!arr[i].match(/^(.*?)@(.*?)(\s+)(.*)$/)) continue;
      const [, pre, key, space, value] = arr[i].match(/^(.*?)@(.*?)(\s+)(.*)$/);
      _[`__script_${key}`] = value;

      if (key === 'version') {
        const version = value.split('.');
        const temp = parseInt(version[version.length - 1]);
        if (!isNaN(temp)) version[version.length - 1] = version[version.length - 1].replace(temp, temp + 1);
        arr[i] = `${pre}@${key}${space}${version.join('.')}`;
      } else if (key === 'author') {
        arr[i] = `${pre}@${key}${space}${_.author}`;
      } else if (key === 'modified') {
        arr[i] = `${pre}@${key}${space}${_.nowStr}`;
      } else if (key === 'task-next-line') {
        arr[i + 1] = replaceWithDict(value, _);
        i = i + 1;
      }
    }
    fs.writeFileSync(item, arr.join(eof));
  } else if (mode === 'nodejs' || mode === 'deno') {
    const content = fs.readFileSync(item, 'utf-8');
    const eof = content.match('\r\n') ? '\r\n' : '\n';
    const arr = content.split(eof);

    const headerStart = '// ==Headers==';
    const headerEnd = '// ==/Headers==';

    const start = arr.indexOf(headerStart);
    const end = arr.indexOf(headerEnd);
    if (start >= 0 && end > start) {
      for (let i = start + 1; i < end; i++) {
        if (!arr[i].match(/^(.*?)@(.*?):(\s*)(.*?)$/)) continue;
        const [, pre, key, space, value] = arr[i].match(/^(.*?)@(.*?):(\s*)(.*?)$/);
        _[`__script_${key}`] = value;

        if (key === 'Version') {
          const version = value.split('.');
          const temp = parseInt(version[version.length - 1]);
          if (!isNaN(temp)) version[version.length - 1] = version[version.length - 1].replace(temp, temp + 1);
          arr[i] = `${pre}@${key}:${space}${version.join('.')}`;
        } else if (key === 'Author') {
          arr[i] = `${pre}@${key}:${space}${_.author}`;
        } else if (key === 'Modified') {
          arr[i] = `${pre}@${key}:${space}${_.nowStr}`;
        } else if (key === 'Require') {
          let libs = arr.map((i) => {
            if (i.match(/require\(.*?\)/)) {
              i = i.match(/require\((.*?)\)/)[1];
            } else {
              return null;
            }
            if (i.match(/^("|')(.*)("|')$/)) {
              i = i.match(/^("|')(.*)("|')$/)[2];
            } else {
              return null;
            }
            if (i.match(/\.\//)) {
              return null;
            } if (i.match('/')) {
              i = i.split('/')[0];
            }
            if (_.nativeModule.includes(i)) {
              return null;
            }
            return i;
          }).filter((i) => i);
          if (libs.length === 0) libs = ['null'];
          arr[i] = `${pre}@${key}:${space}${libs.sort().join(',')}`;
        } else if (key === 'task-next-line') {
          arr[i + 1] = replaceWithDict(value, _);
          i = i + 1;
        }
      }
      fs.writeFileSync(item, arr.join(eof));
    }

    if (mode === 'deno') {
      // await spawnSync('deno', ['fmt', item]);
    }
  } else if (mode === 'bookmarklet') {
    const { dir, name } = path.parse(item);
    const minified = path.join(dir, `${name}.min.js`);

    // 使用encodeURIComponent压缩
    const content = fs.readFileSync(item);
    const minifiedContent = `javascript:${encodeURIComponent(`(function (){${content}})()`)}`;
    fs.writeFileSync(minified, minifiedContent);

    clipboardy.writeSync(minifiedContent);
  } else {
    console.log(item);
  }
}

init().then(() => {
}, (err) => {
  console.error(err);
  process.exit(err);
});
