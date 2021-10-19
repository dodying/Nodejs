// ==Headers==
// @Name:               githubSoftwareSpider
// @Description:        githubSoftwareSpider
// @Version:            1.0.472
// @Author:             dodying
// @Created:            2019-12-12 18:17:57
// @Modified:           2020/6/10 14:52:17
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

const fs = require('fs');
const config = require('./config');

// 导入原生模块
// const url = require('fs')
// const path = require('path');

// 导入第三方模块
const req = require('../_lib/req');

req.config.init(config.req);
require('../_lib/log').hack();

// Main
let database;
const doExit = (exit = true) => {
  if (typeof database === 'object' && database instanceof Object) {
    fs.writeFileSync('./database.json', JSON.stringify(database, (key, value) => {
      if (typeof value === 'object' && value instanceof Array) {
        return Array.from(new Set(value));
      }
      return value;
    }, 2));
  }
  if (exit) process.exit();
};
const errorHandle = (res) => {
  console.log(res.json);
  if (res.json && res.json.message.match(/^API rate limit exceeded for/)) {
    console.log(`Ratelimit Reset:\t${new Date(res.headers['x-ratelimit-reset'] * 1000).toLocaleString('zh-CN', { hour12: false })}`);
    return true;
  }
};
const main = async () => {
  if (fs.existsSync('./database.json')) {
    database = fs.readFileSync('database.json', 'utf-8');
    database = JSON.parse(database);
  } else {
    database = {
      wait: {
        repo: [],
        user: [],
        star: ['dodying'],
      },
      done: {
        repo: [],
        user: [],
        star: [],
      },
    };
  }

  setInterval(() => {
    doExit(false);
  }, 1000 * 60 * 10);

  while (Object.values(database.wait).flat().length) {
    if (database.wait.repo.length) {
      const repos = database.wait.repo.slice(0, config.thread);
      console.time('request');
      const reses = await Promise.allSettled(repos.map((repo) => {
        if (database.done.repo.includes(repo)) return true;
        return req(`https://api.github.com/repos/${repo}/releases`);
      }));
      console.timeEnd('request');

      let exit = false;
      for (let i = 0; i < repos.length; i++) {
        if (reses[i].status === 'rejected' || reses[i].value === null) {
          exit = true;
          continue;
        }
        const repo = repos[i];
        const res = reses[i].value;

        if (typeof res === 'boolean') {
        } else if (!(res.json instanceof Array)) {
          console.log(repo);
          if (errorHandle(res)) {
            exit = true;
            continue;
          }
        } else if (config.releaseFilter) {
          if (res.json.some(config.releaseFilter)) fs.appendFileSync('repo.txt', `\n${repo}`);
        } else {
          fs.appendFileSync('repo.txt', `\n${repo}`);
        }
        database.done.repo.push(repo);
        if (database.wait.repo.includes(repo)) database.wait.repo.splice(database.wait.repo.indexOf(repo), 1);
      }
      if (exit) doExit();
    } else if (database.wait.user.length) {
      const user = database.wait.user[0];
      if (!(database.done.user.includes(user))) {
        let page = 1;
        while (true) {
          const res = await req(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=100&page=${page}`);
          if (!(res.json instanceof Array)) {
            if (errorHandle(res)) return;
            break;
          } else {
            let repos = res.json;
            if (config.repoFilter) repos = repos.filter(config.repoFilter);
            database.wait.repo.push(...repos.map((i) => i.full_name));
            if (res.json.length >= 100) {
              page++;
            } else {
              break;
            }
          }
        }

        database.done.user.push(user);
      }
      database.wait.user.splice(0, 1);
    } else if (database.wait.star.length) {
      const user = database.wait.star[0];
      if (!(database.done.star.includes(user))) {
        let page = 1;
        while (true) {
          const res = await req(`https://api.github.com/users/${user}/starred?per_page=100&page=${page}`);
          if (!(res.json instanceof Array)) {
            if (errorHandle(res)) return;
            break;
          } else {
            let repos = res.json;
            if (config.repoFilter) repos = repos.filter(config.repoFilter);
            database.wait.repo.push(...repos.map((i) => i.full_name));

            const users = res.json.map((i) => i.owner.login);
            database.wait.user.push(...users);
            database.wait.star.push(...users);
            if (res.json.length >= 100) {
              page++;
            } else {
              break;
            }
          }
        }

        database.done.star.push(user);
      }
      database.wait.star.splice(0, 1);
    }
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
