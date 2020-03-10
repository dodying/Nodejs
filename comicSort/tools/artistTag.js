// ==Headers==
// @Name:               artistTag
// @Description:        将artist文件夹下子文件夹按照最多的标签重命名
// @Version:            1.0.126
// @Author:             dodying
// @Modified:           2020-3-4 12:14:54
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:fs-extra,jszip
// ==/Headers==

// 设置
const _ = require('./../config');

// 导入原生模块
const path = require('path');

// 导入第三方模块
const fse = require('fs-extra');
const JSZip = require('jszip');
const parseInfo = require('./../js/parseInfo');
const findData = require('./../js/findData');

// Function
const escape = text => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '').replace(_.emojiRegExp, '');

// Main
const main = async () => {
  const dir = path.resolve(_.libraryFolder, _.subFolder[9]);
  const lists = fse.readdirSync(dir);
  for (const folderName of lists) {
    const thisPath = path.join(dir, folderName);
    const items = fse.readdirSync(thisPath).filter(i => ['.cbz', '.zip'].includes(path.extname(i)));
    if (items.length < _.artistMinimumItems) continue;
    console.log(thisPath);

    let total = [];

    for (const item of items) {
      // 处理路径
      const target = path.resolve(thisPath, item);

      // 读取数据
      const targetData = fse.readFileSync(target);
      const jszip = new JSZip();
      let zip;
      try {
        zip = await jszip.loadAsync(targetData);
      } catch (error) {
        continue;
      }

      // 查看列表
      const fileList = Object.keys(zip.files);

      // 检测有无info.txt
      if (fileList.filter(item => item.match(/(^|\/)info\.txt$/)).length === 0) continue;

      // 读取info.txt
      const infoFile = fileList.find(item => item.match(/(^|\/)info\.txt$/));
      const data = await zip.files[infoFile].async('text');
      const info = parseInfo(data);

      let tags = JSON.stringify(info, ['female', 'male', 'misc']);
      tags = JSON.parse(tags);
      tags = Object.keys(tags).map(i => tags[i].map(j => {
        let [main, sub] = [i, j];
        let subChs = findData(main, sub).cname;
        if (!subChs) subChs = findData('female', sub).cname || sub;
        main = findData(main).cname || main;
        return ['female', 'misc'].includes(i) ? subChs : `${main.substr(0, 1)}-${subChs}`;
      }));
      if (tags.length) {
        tags = tags.reduce((pre, cur) => [].concat(cur, pre));
        total.push(tags);
      }
    }

    total = [].concat(...total);
    const count = {};
    total.forEach(i => (count[i] = total.filter(j => j === i).length));
    const count1 = {};
    for (const i in count) count1[count[i]] = [].concat(count1[count[i]], i).filter(i => i);
    const amount = Object.keys(count1).reverse();
    let order = 0;
    let name = [];
    for (const i of amount) {
      name = name.concat(count1[i]);
      order += count1[i].length;
      if (order >= _.artistTags) break;
    }

    let nameNew = `[${items.length}]` + name.map(i => `[${i}]`).join('') + folderName.replace(/^\[.*\]/, '');
    nameNew = escape(nameNew);
    const thisPathNew = path.join(dir, nameNew);
    console.log(`${folderName} => ${nameNew}`);
    fse.renameSync(thisPath, thisPathNew);
  }
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  process.exit();
});
