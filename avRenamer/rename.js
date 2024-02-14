#!/usr/bin/env node

// ==Headers==
// @Name:               rename
// @Description:        重命名
// @Version:            1.0.147
// @Author:             dodying
// @Modified:           2023-01-22 11:43:47
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            readline-sync
// ==/Headers==

// 设置
// const CONFIG = require('./config')

// 导入原生模块
const fs = require('fs');
const path = require('path');

// 导入第三方模块
const readlineSync = require('readline-sync');

const { exts, rename, valid } = require('../@private/__video');
require('../_lib/log').hack();

const main = async () => {
  const workdir = [].concat(process.cwd(), process.argv.slice(2))
    .map((i) => path.resolve(process.cwd(), i))
    .filter((item, index, array) => array.indexOf(item) === index && fs.existsSync(item));

  for (const thisdir of workdir) {
    const files = fs.readdirSync(thisdir).filter((i) => exts.includes(path.extname(i).toLowerCase().replace(/^\./, ''))).map((i) => path.join(thisdir, i));
    console.log(`Amount:\t${files.length}`);

    for (const file of files) {
      const { name, ext } = path.parse(file);
      if (valid(name, true)) {
        console.log(`无需:\t${name}`);
        continue;
      }
      const renamed = rename(name, true);
      if (valid(renamed, true)) {
        let nameNew = renamed.toUpperCase();
        let fileNew = path.join(thisdir, `${nameNew}${ext.toLowerCase()}`);

        if (file.toUpperCase() === fileNew.toUpperCase()) {
          console.log(`重复:\t${name}`);
          continue;
        }

        console.log(`Rename 【${nameNew}】 <== 【${name}】 ? or put in (without Extension)`);
        const input = readlineSync.question();

        nameNew = input ? input.toUpperCase() : nameNew;
        fileNew = path.join(thisdir, `${nameNew}${ext.toLowerCase()}`);

        if (file.toUpperCase() === fileNew.toUpperCase()) {
          console.log(`重复:\t${name}`);
        } else {
          let count = 1;
          while (fs.existsSync(fileNew)) {
            count = count + 1;
            fileNew = path.join(thisdir, `${nameNew}[重复文件-${count}]${ext.toLowerCase()}`);
          }
          console.log(`命名:\t【${nameNew}】 <== 【${name}】`);
          fs.renameSync(file, fileNew);
        }
      } else {
        console.error(`错误:\t${name}*${renamed}`);
      }
    }
  }
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit(1);
});
