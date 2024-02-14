// ==Headers==
// @Name:               delete
// @Description:        删除漫画
// @Version:            1.0.196
// @Author:             dodying
// @Modified:           2023-01-01 10:38:25
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            readline-sync,jszip
// ==/Headers==

// usage: []file

// 设置
const _ = require('../config');

const extensions = ['.cbz', '.jpg', '.zip', '.png'];

// 导入原生模块
const fs = require('fs');
const path = require('path');

const deletedPath = path.join(_.libraryFolder, _.subFolderDelete);
if (!fs.existsSync(deletedPath)) fs.mkdirSync(deletedPath);

// 导入第三方模块
const readlineSync = require('readline-sync');
const JSZip = require('jszip');

// Function

// Main
const main = async () => {
  const list = process.argv.slice(2).filter((i) => extensions.includes(path.parse(i).ext));
  for (const i of list) {
    const fullpath = path.resolve(process.cwd(), i);
    const { name } = path.parse(fullpath);

    if (!fullpath.match('ComicLibrary') && !readlineSync.keyInYNStrict('Continue to delete?')) continue;

    if (!fs.existsSync(fullpath)) continue;
    console.log((`\nFile:\t${fullpath}`));
    const confirm = readlineSync.keyInYNStrict('Delete it?');
    if (confirm) {
      if (['.zip', '.cbz'].includes(path.extname(fullpath))) {
        const pathnew = path.resolve(deletedPath, `${name}.cbz`);
        try {
          const targetData = fs.readFileSync(fullpath);
          const jszip = new JSZip();
          const zip = await jszip.loadAsync(targetData);
          const fileList = Object.keys(zip.files).filter((i) => !i.match(/(info.txt|\/)$/));
          for (const i of fileList) zip.remove(i);
          const content = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
              level: 9,
            },
          });
          fs.writeFileSync(pathnew, content);
        } catch (error) {
          console.log(error);
          fs.writeFileSync(pathnew, '');
        }
      }
      fs.unlinkSync(fullpath);
    }
  }
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  readlineSync.keyInPause();
  process.exit();
});
