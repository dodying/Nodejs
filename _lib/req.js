// ==Headers==
// @Name:               req
// @Description:        req
// @Version:            1.0.175
// @Author:             dodying
// @Created:            2020-05-23 20:46:13
// @Modified:           2023-11-10 22:51:59
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            request,request-promise,socks5-http-client,socks5-https-client,cheerio,iconv-lite,deepmerge
// ==/Headers==

const request = require('request');
const requestPromise = require('request-promise');
const Agent = require('socks5-http-client/lib/Agent');
const Agent2 = require('socks5-https-client/lib/Agent');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const merge = require('deepmerge');

let uriLast = null;
const retryList = {};
const proxyList = {};
const cacheList = {};

let config = {
  request: { // 替换option
    headers: {
      Accept: 'text/html, application/json, */*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
    },
    timeout: 60 * 1000,
    jar: request.jar(),
  },
  retry: 5,
  proxy: '', // 仅http/socks5 格式：http://user:pwd@host:port
  withProxy: ['google.com'], // 总是通过代理
  withoutProxy: ['://127.0.0.1', '://localhost'], // 总是直连
  autoProxy: true, // 自动切换代理（开启后，先直连，直连失败则通过代理，之后再直连
  setCookie: [], // eg: [['key=value','example.com']]
  logLevel: ['debug', 'warn', 'error'],
};

const initConfig = (obj) => {
  config = merge(config, obj, {
    arrayMerge: (destinationArray, sourceArray, options) => sourceArray, // 不合并数组
    clone: false,
  });
  if (config.setCookie.length) {
    for (const i of config.setCookie) {
      config.request.jar.setCookie(...i);
    }
    config.setCookie = [];
  }
};
const setConfig = (key, value) => { config[key] = value; };
const getConfig = (key, defaultValue) => config[key] || defaultValue;

function reqOption(uriOrOption, optionUser = {}) {
  let option = typeof uriOrOption === 'string' ? { uri: uriOrOption } : uriOrOption;
  let { uri } = option;

  if (uriLast) uri = new URL(uri, uriLast).href;
  const { formData } = option;
  delete option.formData;
  option = merge.all([{
    method: 'GET',
    headers: {
      Referer: uriLast && new URL(uriLast).host === new URL(uri).host ? uriLast : uri,
    },
    timeout: 60 * 1000,
    strictSSL: false,
    resolveWithFullResponse: true,
    simple: false,
    gzip: true,
  }, config.request, option, { uri }]); // 不合并数组
  if (formData) option.formData = formData;

  uri = option.uri || option.url;
  if (uri.match(/[^a-zA-Z0-9-_.~!*'();:@&=+$,/?#[\]%]/)) uri = encodeURI(uri);
  delete option.url;
  if (uriLast && !uri.match(/^https?:/i)) uri = new URL(uri, uriLast).href;
  option.uri = uri;

  if (config.proxy) {
    const [, protocol, , username, password, hostname, port] = config.proxy.match(/(http|socks5):\/\/((.*?):(.*?)@)?(.*?):(\d+)/i);
    const uriHost = new URL(uri).hostname;
    let useProxy;
    if (!protocol || !hostname || !port) {
      useProxy = false;
    } else if (config.withoutProxy.some((i) => uri.match(i))) {
      useProxy = false;
    } else if (config.withProxy.some((i) => uri.match(i))) {
      useProxy = true;
    } else if (config.autoProxy) {
      useProxy = uri in retryList ? !proxyList[uriHost] : proxyList[uriHost] || false;
      proxyList[uriHost] = useProxy;
    }

    if (useProxy) {
      if (protocol.toLowerCase() === 'http') {
        option.proxy = config.proxy;
      } else if (protocol.toLowerCase() === 'socks5') {
        option.agentClass = uri.match(/^http:/) ? Agent : Agent2;
        option.agentOptions = {
          socksHost: hostname,
          socksPort: port,
        };
        if (username && password) {
          option.agentOptions.socksUsername = username;
          option.agentOptions.socksPassword = password;
        }
      }
    }
  }

  if (config.logLevel.includes('debug')) console.debug(`${option.method}${(option.proxy || option.agentClass) ? '+proxy' : ''}:\t${uri}`);

  uriLast = uri;
  return option;
}

async function req(uriOrOption, optionUser = {}) {
  const option = reqOption(uriOrOption, optionUser);
  const uri = option.uri || option.url;
  if (option.cache && uri in cacheList) return cacheList[uri];

  const errorHandle = (message) => {
    retryList[uri] = uri in retryList ? retryList[uri] + 1 : 1;

    if (config.logLevel.includes('error')) console.error(`Failed-${retryList[uri]}:\t${message}`);
    return config.retry > retryList[uri] ? req(uriOrOption, optionUser) : null;
  };

  let res;
  try {
    if (!('encoding' in option)) {
      option.encoding = null;
      res = await requestPromise(option);
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
    } else {
      res = await requestPromise(option);
    }
    const succeed = typeof optionUser.check === 'function' ? optionUser.check(res) : res.statusCode >= 200 || res.statusCode < 300;
    if (succeed) {
      if (res.body) {
        try {
          res.$ = cheerio.load(res.body);

          res.json = JSON.parse(res.body);
          // console.debug(res.json);
        } catch (error) { }
      }
      delete retryList[uri];
      if (option.cache) cacheList[uri] = res;
      return res;
    }
    return errorHandle(`${res.statusCode} ${res.statusMessage}`);
  } catch (error) {
    if (error.cause && error.cause.errno === 'ETIMEDOUT' && error.cause.port === 443 && uri.match('http://')) {
      option.uri = uri.replace('http://', 'https://');
      return req(option, optionUser);
    }
    return errorHandle(error.message);
  }
}

function reqRaw(uriOrOption, optionUser = {}) {
  const option = reqOption(uriOrOption, optionUser);
  return request(option);
}

async function reqHEAD(uriOrOption, optionUser = {}) {
  let option = typeof uriOrOption === 'string' ? { uri: uriOrOption } : uriOrOption;
  let { useProxy } = optionUser;
  const { withoutHeader } = optionUser;

  let retry = 1;
  const head = async () => new Promise((resolve, reject) => {
    let req;
    const _withoutHeader = withoutHeader;
    if (!_withoutHeader) {
      req = reqRaw(option, optionUser);
    } else {
      option = Object.assign(option, {
        headers: {},
        jar: request.jar(),
        removeRefererHeader: true,
      });
      req = reqRaw(option, optionUser);
    }
    let html = '';
    const reses = [];

    req.on('redirect', function () {
      if (config.logLevel.includes('warn')) console.warn(`Redirect:\t${this.uri.href}`);
    }).on('response', async (res) => {
      reses.push(res);
      if (
        ['application', 'binary', 'image', 'audio', 'video', 'font', 'model'].some((i) => res.headers['content-type'] && res.headers['content-type'].match(i))
        || (res.headers['content-disposition'] && res.headers['content-disposition'].match(/^attachment/))
        || res.headers.etag
      ) {
        req.abort();
        resolve(reses);
        return;
      }

      res.on('end', async () => {
        const $ = cheerio.load(html);
        const match = html.match(/<meta http-equiv="?refresh"? content="?(.*)"?/i);
        const refresh = $('meta[http-equiv="refresh"],meta[http-equiv="REFRESH"]');
        if (refresh.length || match) {
          let uri1 = refresh.length ? refresh.attr('content') : match[1];
          uri1 = uri1.match(/url=(.*)/i)[1];
          option.uri = uri1;
          const reses1 = await reqHEAD(option, { useProxy });
          resolve(reses.concat(reses1));
        } else {
          resolve(reses);
        }
      });
      res.on('data', (chunk) => {
        html = html + chunk;
      });
    }).on('error', async (error) => {
      if (error.message === 'aborted') return;
      if (config.logLevel.includes('error')) console.error(`Failed-${retry}:\t${error.message}`);
      retry = retry + 1;
      useProxy = !useProxy;
      if (config.retry > retry) {
        const reses1 = await head();
        resolve(reses.concat(reses1));
      } else {
        resolve(reses);
      }
    });
  });
  const reses = await head();
  return reses[reses.length - 1];
}

req.config = {
  init: initConfig,
  set: setConfig,
  get: getConfig,
};
req.option = reqOption;
req.raw = reqRaw;
req.head = reqHEAD;

module.exports = req;
