// ==Headers==
// @Name:               makeReadme
// @Description:        根据 Headers 生产 `README.md`
// @Version:            1.0.24
// @Author:             dodying
// @Modified:           2020-3-15 22:14:30
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            glob
// ==/Headers==

// 设置
const _ = {
  'E:\\Desktop\\_\\GitHub\\UserJs': {
    repo: 'https://github.com/dodying/UserJs/tree/master/',
    ext: ['user.js']
  },
  'E:\\Desktop\\_\\GitHub\\Nodejs': {
    repo: 'https://github.com/dodying/Nodejs/tree/master/',
    ext: ['js'],
    ignore: ['**\\node_modules\\**', '**\\@private\\**', '**\\**.temp\\**', '**\\**.doing\\**', '**\\**.redoing\\**', '**\\**.starting\\**', '**\\**.private\\**', '**\\comicSort\\Extensions\\**', '**\\comicSort\\User Data\\**', '**\\*.main.js', '**\\*.meta.js']
  }
};
const START = ['// ==UserScript==', '// ==Headers==', '# ==Headers=='];
const END = ['// ==/UserScript==', '// ==/Headers==', '# ==/Headers=='];

// 导入原生模块
const fs = require('fs');
const path = require('path');
const Url = require('url');

// 导入第三方模块
const glob = require('glob');

// Function

// Main
Object.keys(_).forEach(i => {
  const lst = glob.sync('**\\*.@(' + _[i].ext.join('|') + ')', {
    cwd: i,
    ignore: _[i].ignore || ''
  });
  // console.log(lst)
  let md = '';
  if (fs.existsSync(path.resolve(i, 'README_RAW.md'))) md = fs.readFileSync(path.resolve(i, 'README_RAW.md'), 'utf-8');
  const info = {};
  lst.forEach(j => {
    const jsPath = path.resolve(i, j);
    // console.log(jsPath)
    const content = fs.readFileSync(jsPath, 'utf-8').split(/[\r\n]+/);
    let start;
    for (let k = 0; k < content.length; k++) {
      if (START.includes(content[k])) {
        start = k;
        break;
      }
    }
    if (start === undefined) return;
    const folder = path.parse(j);
    if (!(folder.dir in info)) info[folder.dir] = {};
    info[folder.dir][folder.base] = {};
    for (let k = start; k < content.length; k++) {
      if (END.includes(content[k])) break;
      if (!content[k].match('@')) continue;
      let arr = content[k].replace(/.*?@/, '').replace(/:\s+/, ': ').split(': ');
      if (arr.length === 1) arr = content[k].replace(/.*?@/, '').replace(/:\s/, ' ').split(/\s+/);
      info[folder.dir][folder.base][arr[0].toLowerCase()] = arr.splice(1).join(' ');
    }
  });
  // console.log(info);
  for (const j in info) {
    const folder = j;
    const readme = path.resolve(i, j, 'README.md');
    md += '\r\n';
    md += `##### ${folder}\r\n\r\n`;
    if (fs.existsSync(readme)) md += '[README](' + folder + '/' + 'README.md)\r\n\r\n';
    md += 'Name | Raw | Version | Last-Modified | Create-Time | Description\r\n';
    md += '--- | --- | --- | --- | --- | ---\r\n';
    for (const k in info[j]) {
      const item = k;
      const _info = info[j][k];

      const name = _info['name:zh-CN'] || _info.name;
      const url = folder + '/' + item;
      const rawUrl = Url.resolve(_[i].repo, folder + '/' + item).replace('/tree/', '/raw/');
      const version = _info.version.replace(/\.\d{13,}$/, '');
      const modified = _info.modified || _info.date || '';
      const created = _info.created || _info.date || '';
      const description = _info['description:zh-CN'] || _info.description || '';

      md += `[${name}](${url}) | [Raw](${rawUrl}) | ${version} | ${modified} | ${created} | ${description}\r\n`;
    }
  }
  fs.writeFileSync(path.resolve(i, 'README.md'), md);
});
