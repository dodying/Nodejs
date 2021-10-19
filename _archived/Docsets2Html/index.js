// ==Headers==
// @Name:               Docsets2Html
// @Description:        将Dash的Docsets文件夹转换为Html
// @Version:            1.0.4
// @Author:             dodying
// @Date:               2019-2-12 10:40:49
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            fs-extra,sql.js
// ==/Headers==

// 导入原生模块
const path = require('path');
const zlib = require('zlib');

// 导入第三方模块
const SQL = require('sql.js');
const fse = require('fs-extra');

// Function

// Main
if (!fse.existsSync('docsets')) fse.mkdirSync('docsets');
const database = fse.existsSync('data.json') ? JSON.parse(fse.readFileSync('data.json')) : {};

const init = async () => {
  const ls = fse.readdirSync(process.cwd()).filter((i) => i.match(/\.docset$/) && fse.statSync(i).isDirectory());
  console.log(ls);
  for (const i of ls) {
    const infoPath = `${i}/Contents/Info.plist`;
    if (!fse.existsSync(infoPath)) continue;

    let infoContent = fse.readFileSync(infoPath, 'utf8');
    let apiName = infoContent.match(/<key>CFBundleName<\/key>/);
    infoContent = infoContent.substr(apiName.index);
    apiName = infoContent.match(/<string>(.*?)<\/string>/)[1];

    const searchPath = `${i}/Contents/Resources/docSet.dsidx`;
    const searchDb = new SQL.Database(fse.readFileSync(searchPath));
    const searchIndex = searchDb.exec('SELECT * FROM searchIndex;')[0].values;
    database[apiName] = searchIndex.map((item) => item.splice(1));

    if (!fse.existsSync(`docsets/${apiName}`)) fse.mkdirSync(`docsets/${apiName}`);
    if (fse.existsSync(`${i}/icon.png`)) fse.writeFileSync(`docsets/${apiName}/icon.png`, fse.readFileSync(`${i}/icon.png`));
    if (fse.existsSync(`${i}/icon@2x.png`)) fse.writeFileSync(`docsets/${apiName}/icon@2x.png`, fse.readFileSync(`${i}/icon@2x.png`));

    const resourcesPath = `${i}/Contents/Resources/Resources.db`;
    const resourcesDb = new SQL.Database(fse.readFileSync(resourcesPath));
    const filepaths = resourcesDb.exec('SELECT * FROM FilePaths;')[0].values;
    const files = resourcesDb.exec('SELECT * FROM Files;')[0].values;
    for (const item of filepaths) {
      const itemPath = path.resolve(process.cwd(), 'docsets', apiName, item[1]);
      const itemPathDir = path.parse(itemPath).dir;
      if (!fse.existsSync(itemPathDir)) fse.mkdirsSync(itemPathDir);
      const itemData = files.filter((j) => j[0] === item[0])[0][1];
      if (itemData && itemData instanceof Uint8Array) {
        try {
          fse.writeFileSync(itemPath, zlib.unzipSync(itemData));
        } catch (error) {
          fse.writeFileSync(itemPath, itemData);
        }
      }
    }

    fse.removeSync(i);
  }
};

init().then(() => {
  fse.writeFileSync('data.json', JSON.stringify(database));
  fse.writeFileSync('data.js', `window.data=${JSON.stringify(database)}`);
}, (err) => {
  fse.writeFileSync('data.json', JSON.stringify(database));
  fse.writeFileSync('data.js', `window.data=${JSON.stringify(database)}`);
  console.error(err);
  process.exit(err);
});
