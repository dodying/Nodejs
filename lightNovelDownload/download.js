// ==Headers==
// @Name:               download
// @Description:        download
// @Version:            1.0.168
// @Author:             dodying
// @Date:               2019-2-12 18:41:49
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra
// ==/Headers==

// 导入原生模块

// 导入第三方模块
const fse = require('fs-extra');

// Main
const main = async () => {
  const data = fse.existsSync('data.json') ? fse.readJSONSync('data.json') : { items: [], files: [], manual: [] };
  data.manual = [];
  let gdriveDir = [];
  let gdrive = [];
  let mega = [];
  if (!fse.existsSync('file')) fse.mkdirSync('file');

  for (let i = 0; i < data.files.length; i++) {
    data.files[i].href = [].concat(data.files[i].href).filter((item, index, array) => item && !item.match(/blogspot.com|blogger/) && array.indexOf(item) === index);
    if (data.files[i].href.length === 1) data.files[i].href = data.files[i].href[0];
  }
  data.files.sort((a, b) => (a.title > b.title ? 1 : a.title === b.title ? 0 : -1));

  for (const i of data.files) {
    let href = [].concat(i.href);
    if (href.filter((i) => i.match('://mega')).length) {
      href = href.filter((i) => i.match('://mega'))[0];
      mega.push(href);
    } else if (href.filter((i) => i.match(/(docs|drive).google.com/)).length) {
      href = href.filter((i) => i.match(/(docs|drive).google.com/))[0];
      let id;
      if (href.match(/folders\/(.*)(\?|$)/) || href.match(/folderview\?.*id=(.*)/)) {
        id = (href.match(/folders\/(.*)(\?|$)/) || href.match(/folderview\?.*id=(.*)/))[1];
        gdriveDir.push(id);
        continue;
      } else if (href.match(/file\/d\/(.*)\//)) {
        id = href.match(/file\/d\/(.*)\//)[1];
      } else if (href.match(/id=(.*)($|&)/)) {
        id = href.match(/id=(.*)($|&)/)[1];
      } else {
        console.log(href);
        data.manual.push(i);
        continue;
      }

      gdrive.push(`https://docs.google.com/uc?id=${id}&export=download`);
    } else {
      data.manual.push(i);
    }
  }
  fse.writeJSONSync('data.json', data, { spaces: 2 });

  const gdriveDirAll = fse.existsSync('all-gdriveDir.txt') ? fse.readFileSync('all-gdriveDir.txt', 'utf-8').split(/\r\n/) : [];
  gdriveDir = gdriveDir.filter((i) => !gdriveDirAll.includes(i));
  fse.appendFileSync('now-gdriveDir.txt', gdriveDir.join('\r\n'));
  fse.appendFileSync('now-gdriveDir.bat', gdriveDir.map((i) => ['gdrive.exe', 'download', '--path', 'file', '--force', '--recursive', i].join(' ')).join('\r\n'));
  fse.appendFileSync('all-gdriveDir.txt', gdriveDir.join('\r\n'));

  const gdriveAll = fse.existsSync('all-gdrive.txt') ? fse.readFileSync('all-gdrive.txt', 'utf-8').split(/\r\n/) : [];
  gdrive = gdrive.filter((i) => !gdriveAll.includes(i));
  fse.appendFileSync('now-gdrive.txt', gdrive.join('\r\n'));
  fse.appendFileSync('all-gdrive.txt', gdrive.join('\r\n'));

  const megaAll = fse.existsSync('all-mega.txt') ? fse.readFileSync('all-mega.txt', 'utf-8').split(/\r\n/) : [];
  mega = mega.filter((i) => !megaAll.includes(i));
  fse.appendFileSync('now-mega.txt', mega.join('\r\n'));
  fse.appendFileSync('all-mega.txt', mega.join('\r\n'));
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit(1);
});
