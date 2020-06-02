// ==Headers==
// @Name:               githubSoftwareSpider
// @Description:        githubSoftwareSpider
// @Version:            1.0.194
// @Author:             dodying
// @Created:            2019-12-12 18:17:57
// @Modified:           2019-12-12 20:35:08
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            cheerio,death,iconv-lite,request-promise,socks5-http-client,socks5-https-client
// ==/Headers==

// 导入原生模块
const fs = require('fs');
// const url = require('fs')
// const path = require('path')

// 导入第三方模块
const requestPromise = require('request-promise');
const Agent = require('socks5-http-client/lib/Agent');
const Agent2 = require('socks5-https-client/lib/Agent');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
var ON_DEATH = require('death');

// 设置
const config = {
  _: require('./config'),
  uriLast: null,
  cookies: requestPromise.jar(),
  retryList: {}
};

// Function
function reqOption (uriOrOption, optionUser = {}) {
  let option = typeof uriOrOption === 'string' ? { uri: uriOrOption } : uriOrOption;
  let uri = option.uri;
  const useProxy = optionUser.useProxy;

  if (config.uriLast) uri = new URL(uri, config.uriLast).href;
  option = Object.assign({
    method: 'GET',
    headers: {
      'User-Agent': config._.request.userAgent,
      Accept: 'application/json, text/plain, */*',
      // 'Accept-Language': '*;q=0.5',
      Referer: config.uriLast && new URL(config.uriLast).hostname === new URL(uri).hostname ? config.uriLast : uri,
      Authorization: 'token 28c1e498757d7c21e37306bb89df4a093f391083'
    },
    timeout: config._.request.timeout * 1000,
    jar: config.cookies,
    strictSSL: false,
    resolveWithFullResponse: true,
    simple: false
  }, option, { uri });

  uri = option.uri || option.url;
  delete option.url;

  if (useProxy && config._.request.proxy && config._.request.proxy.match(/(http|socks5):\/\/((.*?):(.*?)@)?(.*?):(\d+)/i)) {
    const [, protocol,, username, password, hostname, port] = config._.request.proxy.match(/(http|socks5):\/\/((.*?):(.*?)@)?(.*?):(\d+)/i);
    if (protocol.toLowerCase() === 'http') {
      option.proxy = config._.request.proxy;
    } else if (protocol.toLowerCase() === 'socks5') {
      option.agentClass = uri.match(/^http:/) ? Agent : Agent2;
      option.agentOptions = {
        socksHost: hostname,
        socksPort: port
      };
      if (username && password) {
        option.agentOptions.socksUsername = username;
        option.agentOptions.socksPassword = password;
      }
    }
  }
  console.warn(`${option.method}${option.proxy ? '+proxy' : ''}:\t${uri}`);

  config.uriLast = uri;
  return option;
}

async function req (uriOrOption, optionUser = {}) {
  const option = reqOption(uriOrOption, optionUser);
  const uri = option.uri || option.url;

  const errorHandle = (message) => {
    config.retryList[uri] = uri in config.retryList ? config.retryList[uri] + 1 : 1;

    console.error(`Try-${config.retryList[uri]}:\t${message}`);
    return config._.request.retry > config.retryList[uri] ? req(uriOrOption, optionUser) : null;
  };

  let res;
  try {
    if (!('encoding' in option)) option.encoding = null;
    res = await requestPromise(option);
    if (option.encoding === null) {
      // 判断网页编码
      let charset = res.headers['content-type'] && res.headers['content-type'].match(/charset=(.*?)(;|$)/) ? res.headers['content-type'].match(/charset=(.*?)(;|$)/i)[1] : 'utf-8';

      let body;
      try {
        body = iconv.decode(res.body, charset);
      } catch (error) {
        body = iconv.decode(res.body, 'utf-8');
      }

      const $ = cheerio.load(body);
      if ($('meta[http-equiv="Content-Type"][content*="charset"]').length || $('meta[charset]').length) {
        if ($('meta[http-equiv="Content-Type"][content*="charset"]').length) {
          charset = $('meta[http-equiv="Content-Type"][content*="charset"]').attr('content').match(/charset=(.*?)(;|$)/)[1];
        } else if ($('meta[charset]').length) {
          charset = $('meta[charset]').attr('charset');
        }
        try {
          body = iconv.decode(res.body, charset);
        } catch (error) {
          body = iconv.decode(res.body, 'utf-8');
        }
      }
      res.body = body;
    }
    const succeed = typeof optionUser.check === 'function' ? optionUser.check(res) : res.statusCode >= 200 || res.statusCode < 300;
    if (succeed) {
      if (res.body) {
        try {
          res.json = JSON.parse(res.body);
        } catch (error) {}
      }
      delete config.retryList[uri];
      return res;
    } else {
      return errorHandle(res.statusCode + ' ' + res.statusMessage);
    }
  } catch (error) {
    if (error.cause && error.cause.errno === 'ETIMEDOUT' && error.cause.port === 443 && uri.match('http://')) {
      option.uri = uri.replace('http://', 'https://');
      return req(option, optionUser);
    } else {
      return errorHandle(error.message);
    }
  }
}

// Main
let database;
const main = async () => {
  if (fs.existsSync('./database.json')) {
    database = fs.readFileSync('database.json', 'utf-8');
    database = JSON.parse(database);
    let lastUrl = [].concat(...Object.values(database.wait));
    if (lastUrl.length === 0) {
      console.error('None');
      process.exit(-1);
    } else {
      lastUrl = lastUrl[0];
    }
  } else {
    database = {
      wait: {
        repo: [],
        user: [],
        star: ['dodying']
      },
      done: {
        repo: [],
        user: [],
        star: []
      },
      repo: []
    };
  }
  ON_DEATH(function (signal, err) {
    fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
    process.exit();
  });

  while ([].concat(...Object.values(database.wait)).length) {
    if (database.wait.repo.length) {
      const repo = database.wait.repo[0];
      if (!database.done.repo.includes(repo)) {
        const res = await req(`https://api.github.com/repos/${repo}/releases`);
        if (!(res.json instanceof Array)) {
          console.log(res.json);
          if (res.json.message.match(/^API rate limit exceeded for/)) {
            break;
          }
        } else if (res.json.filter(i => i.assets.length).length) {
          database.repo.push(`https://github.com/${repo}/releases`);
        }

        database.done.repo.push(repo);
      }
      database.wait.repo.splice(0, 1);
    } else if (database.wait.user.length) {
      const user = database.wait.user[0];
      if (!database.done.user.includes(user)) {
        const res = await req(`https://api.github.com/users/${user}/repos`);
        const repos = res.json.map(i => i.full_name);
        database.wait.repo.push(...repos);

        database.done.user.push(user);
      }
      database.wait.user.splice(0, 1);
    } else if (database.wait.star.length) {
      const user = database.wait.star[0];
      if (!database.done.star.includes(user)) {
        const res = await req(`https://api.github.com/users/${user}/starred`);
        const repos = res.json.map(i => i.full_name);
        database.wait.repo.push(...repos);
        const users = res.json.map(i => i.owner.login);
        database.wait.user.push(...users);
        database.wait.star.push(...users);

        database.done.star.push(user);
      }
      database.wait.star.splice(0, 1);
    }
  }
};

main().then(async () => {
  fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));
  //
}, async err => {
  fs.writeFileSync('./database.json', JSON.stringify(database, null, 2));

  console.error(err);
  process.exit();
});
