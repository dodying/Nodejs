// ==Headers==
// @Name:               index
// @Description:        index
// @Version:            1.0.47
// @Author:             dodying
// @Created:            2021-04-19 20:16:30
// @Modified:           2021-04-19 20:51:11
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

// 设置
const fs = require('fs');
const config = require('./config');

// 导入原生模块

// 导入第三方模块
const req = require('../_lib/req');

req.config.init(config.req);
require('../_lib/log').hack();

// Function
let database;
const doExit = (exit = true) => {
  if (typeof database === 'object' && database instanceof Object) {
    fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
  }
  if (exit) process.exit();
};
const errorHandle = (res) => {
  console.log(res.json);
};

// Main
const main = async () => {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  if (fs.existsSync('./database.json')) {
    database = fs.readFileSync('database.json', 'utf-8');
    database = JSON.parse(database);
  } else {
    database = {};
  }

  setInterval(() => {
    doExit(false);
  }, 1000 * 60 * 10);

  const res = await req(new URL('/api/medical/getList?pageNo=1&pageSize=10', config.origin).href);
  if (!res || !res.json || res.json.msg !== 'success') return errorHandle(res);
  let page = 1;
  while (Object.keys(database).length < res.json.totalCount) {
    const res1 = await req(`/api/medical/getList?pageNo=${page}&pageSize=100`);
    if (!res1 || !res1.json || res1.json.msg !== 'success') return errorHandle(res1);
    for (const i of res1.json.list) {
      if (i.id in database) continue;
      const res2 = await req(`/api/medical/${i.id}`);
      if (!res2 || !res2.json || res2.json.msg !== 'success') {
        errorHandle(res2);
        continue;
      }
      fs.writeFileSync(`./data/${i.id}.json`, res2.body);
      database[i.id] = res2.json.medical.comName;
    }
    page++;
    doExit(false);
  }
};

try {
  process.once('SIGINT', () => {
    doExit(false);
    console.log('SIGINT');
    process.exit();
  });

  main().then(async () => {
    doExit();
  }, async (err) => {
    console.error(err);

    doExit();
  });
} catch (error) {
  doExit();
}
