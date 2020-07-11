// ==Headers==
// @Name:               calcImagesAvgSize
// @Description:        calcImagesAvgSize
// @Version:            1.0.19
// @Author:             dodying
// @Created:            2020-07-04 21:57:50
// @Modified:           2020/7/4 22:11:43
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            jszip
// ==/Headers==

// 设置
const _ = require('./../config');

// 导入原生模块
const fs = require('fs');
const path = require('path');

// 导入第三方模块
const JSZip = require('jszip');
const walk = require('./../../_lib/walk');

// Function

// Main
const main = async () => {
  const files = walk(_.libraryFolder, {
    matchFile: /.(cbz|zip)$/,
    ignoreDir: path.basename(_.subFolderTag),
    fullpath: true,
    nodir: true,
    recursive: true
  });
  // console.log(files);
  let count = 0;
  let size = 0;
  for (const file of files) {
    let targetData = fs.readFileSync(file);
    let jszip = new JSZip();
    let zip;
    try {
      zip = await jszip.loadAsync(targetData);
    } catch (error) {
      continue;
    }
    count += Object.keys(zip.files).filter(i => i.match(/\.(jpg|png)$/i)).length;
    size += parseInt(fs.statSync(file).size / 1024);

    targetData = null;
    jszip = null;
    zip = null;
  }
  console.log(size / count);
};

main().then(async () => {
  //
}, async err => {
  console.error(err);
  process.exit();
});
