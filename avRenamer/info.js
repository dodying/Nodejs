// ==Headers==
// @Name:               info
// @Description:        根据list.txt生成指定信息
// @Version:            1.0.218
// @Author:             dodying
// @Created:            2019-09-29 16:30:27
// @Modified:           2020/9/17 14:27:19
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:cheerio,fs-extra,iconv-lite,readline-sync,request-promise,socks5-http-client,socks5-https-client
// ==/Headers==

/* eslint-disable no-unused-vars */

// 设置
const _ = require('./config');

// 导入原生模块
const path = require('path');
const cp = require('child_process');
require('../_lib/log').hack();

replaceWithDict.init({}, {
  ifNotString: (key, value) => {
    if (!value) return _.emptyStr;
    if (value instanceof Array) {
      return value.length ? value.sort().join(',') : _.emptyStr;
    }
  },
});

// 导入第三方模块
const readlineSync = require('readline-sync');
const fse = require('fs-extra');
const request = require('request-promise');
const Agent = require('socks5-http-client/lib/Agent');
const Agent2 = require('socks5-https-client/lib/Agent');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const replaceWithDict = require('../_lib/replaceWithDict');

// Function
const libs = [
  { // 一本道
    // https://www.1pondo.tv/dyn/phpauto/movie_details/movie_id/011516_227.json
    id: '1Pondo',
    keyword: ['一本道', /1Pondo/i], // 匹配搜索结果
    name: [/1pon/i], // 匹配文件名
    valid: async (name) => {
      let id = name.match(/\d{6}[-_]\d{3}/);
      if (!id) return;
      id = id[0].replace('-', '_');
      return `https://www.1pondo.tv/dyn/phpauto/movie_details/movie_id/${id}.json`;
    },
    getInfo: {
      /**
       * 以下属性保持原样
       * censored
       *
       * string/array
       * 顺序为 selector, attribute = 'text', match = /(.*)/[1]
       *
       * function
       * 参数为 res, $
       */
      id: (res) => JSON.parse(res.body).MovieID, // id
      title: (res) => JSON.parse(res.body).Title, // 标题
      cover: (res) => JSON.parse(res.body).ThumbHigh, // 封面
      censored: 'Uncensored', // 码
      actor: (res) => JSON.parse(res.body).ActressesJa.sort().join(), // 演员
      rating: (res) => JSON.parse(res.body).AvgRating, // 评分
      release: (res) => JSON.parse(res.body).Release, // 发行日期
      duration: (res) => formatTime(JSON.parse(res.body).Duration), // 时长
      genre: (res) => JSON.parse(res.body).UCNAME, // 类别或标签
      // preview 预览图
      // director 导演
      // studio 製作商
      // label 發行商
      // related 相关影片
    },
  },
  { // 加勒比-会员
    // https://www.caribbeancompr.com/moviepages/100618_002/index.html
    id: 'CaribPr',
    keyword: ['加勒比PPV', 'カリブPPV', 'cappv', /Caribpr/i, /caribbeancompr/i, /Caribbeancom Premium/i, 'カリビアンコム プレミアム'],
    name: [/Caribpr/i],
    valid: async (name) => {
      let id = name.match(/\d{6}[-_]\d{3}/);
      if (!id) return;
      id = id[0].replace('-', '_');
      return `https://www.caribbeancompr.com/moviepages/${id}/index.html`;
    },
    getInfo: {
      id: (res) => res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1],
      title: '.video-detail>h1',
      cover: (res) => `/moviepages/${res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1]}/images/l_l.jpg`,
      censored: 'Uncensored',
      preview: ['.fancy-gallery:not([data-is_sample="0"])', 'href'],
      actor: '.movie-info>dl:contains("出演")>dd a',
      release: '.movie-info>dl:contains("販売日")>dd',
      duration: '.movie-info>dl:contains("再生時間")>dd',
      genre: '.movie-info>dl:contains("カテゴリー")>dd a',
      studio: '.movie-info>dl:contains("スタジオ")>dd',
      related: ['.movie-source-content li>a', 'href', /moviepages\/(.*?)\/index/],
    },
  },
  { // 加勒比
    // https://www.caribbeancom.com/moviepages/100716-275/index.html
    id: 'Carib',
    keyword: ['加勒比', /Carib/i, 'カリビアンコム'],
    name: [/Carib/i],
    valid: async (name) => {
      let id = name.match(/\d{6}[-_]\d{3}/);
      if (!id) return;
      id = id[0].replace('_', '-');
      const uri = `https://www.caribbeancom.com/moviepages/${id}/index.html`;
      const res = await req({
        method: 'HEAD',
        uri,
      });
      if (res.statusCode === 404) {
        id = id.replace('-', '_');
        return [libs.find((i) => i.id === 'CaribPr'), `https://www.caribbeancompr.com/moviepages/${id}/index.html`];
      }
      return uri;
    },
    getInfo: {
      id: (res) => res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1],
      title: '#moviepages h1',
      cover: (res) => `/moviepages/${res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1]}/images/l_l.jpg`,
      preview: ['.fancy-gallery:not([data-is_sample="0"])', 'href'],
      censored: 'Uncensored',
      actor: '.movie-info ul>li:contains("出演")>.spec-content a',
      release: '.movie-info ul>li:contains("配信日")>.spec-content',
      duration: '.movie-info ul>li:contains("再生時間")>.spec-content',
      genre: '.movie-info ul>li:contains("タグ")>.spec-content a',
      related: ['.movie-source-content li>a', 'href', /moviepages\/(.*?)\/index/],
    },
  },
  { // Heyzo
    // http://www.heyzo.com/moviepages/1426/index.html
    id: 'Heyzo',
    keyword: [/Heyzo/i], // 匹配搜索结果
    name: [/Heyzo/i], // 匹配文件名
    valid: async (name) => {
      let id = name.match(/\d{4}/);
      if (!id) return;
      id = id[0];
      return `http://www.heyzo.com/moviepages/${id}/index.html`;
    },
    getInfo: {
      id: (res) => `HEYZO-${res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1]}`, // id
      title: '#movie>h1', // 标题
      cover: ['[property="og:image"]', 'content'], // 封面
      preview: async (res, $) => {
        let uris = res.body.match(/document.write\('<img src="(\/contents.*?)"/g);
        if (!uris) return [];
        uris = uris.map((i) => i.match(/document.write\('<img src="(\/contents.*?)"/)[1]).map((i) => new URL(i.replace('/member/', '/').replace('/thumbnail_', '/'), res.request.uri.href).href);
        for (let i = 0; i < uris.length; i++) {
          const uri = uris[i];
          const res = await req({
            method: 'HEAD',
            uri,
            followRedirect: false,
          });
          if (res.statusCode === 302) return uris.splice(0, i);
        }
      },
      censored: 'Uncensored', // 码
      actor: '.table-actor a', // 演员
      rating: '[itemprop="ratingValue"]', // 评分
      release: '.table-release-day>td:nth-child(2)', // 发行日期
      duration: (res) => res.body.match(/"duration":"(.*?)",/)[1], // 时长
      genre: '.table-actor-type a,.tag-keyword-list a',
    },
  },
  { // TokyoHot
    // https://my.tokyo-hot.com/product/6213/
    id: 'TokyoHot',
    keyword: [/Tokyo[-\s_]*Hot/i],
    name: [/Tokyo[-\s_]*Hot/i, /^n\d{4}$/i],
    valid: async (name) => {
      let id = name.match(/\d{4}/);
      if (!id) return;
      id = id[0];
      const uri = `https://my.tokyo-hot.com/product/?q=n${id}`;
      const res = await req(uri);
      const $ = cheerio.load(res.body);
      return (new URL($(`.detail:contains(${id})>a`).attr('href'), uri)).href;
    },
    getInfo: {
      id: '.info>dt:contains("作品番号")+dd',
      title: '.contents>h2',
      cover: ['video', 'poster'],
      preview: ['.scap a', 'href'],
      censored: 'Uncensored',
      actor: '.info>dt:contains("出演者")+dd>a',
      release: '.info>dt:contains("配信開始日")+dd',
      duration: '.info>dt:contains("収録時間")+dd',
      genre: '.info>dt:contains("プレイ内容")+dd>a,.info>dt:contains("タグ")+dd>a',
      label: '.info>dt:contains("レーベル")+dd',
    },
  },
  { // 10musume
    // https://www.10musume.com/moviepages/011618_01/index.html
    id: '10musume',
    keyword: [/10musume/i],
    name: [/10mu/i],
    valid: async (name) => {
      let id = name.match(/\d{6}[-_]\d{2}/);
      if (!id) return;
      id = id[0].replace('-', '_');
      return `https://www.10musume.com/moviepages/${id}/index.html`;
    },
    getInfo: {
      id: (res) => res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1],
      title: '.detail-header__title',
      cover: (res) => `/moviepages/${res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1]}/images/str.jpg`,
      preview: ['.gallery-table a', 'href'],
      censored: 'Uncensored',
      actor: (res, $) => $('.detail-info__meta dt:contains("出演")+dd>a').text().split(/\s+/),
      release: '.detail-info__meta dt:contains("配信日")+dd',
      duration: '.detail-info__meta dt:contains("再生時間")+dd',
      genre: '.detail-info__meta dt:contains("カテゴリー")+dd>a',
    },
  },
  { // Pacopacomama
    // https://www.pacopacomama.com/moviepages/051518_272/index.html
    id: 'Pacopacomama',
    keyword: [/Pacopacomama/i, /paco[-\s_]+/i, '파코', 'パコ'],
    name: [/paco/i],
    valid: async (name) => {
      let id = name.match(/\d{6}[-_]\d{3}/);
      if (!id) return;
      id = id[0].replace('-', '_');
      return `https://www.pacopacomama.com/moviepages/${id}/index.html`;
    },
    getInfo: {
      id: (res) => res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1],
      title: 'h1',
      cover: (res) => `/moviepages/${res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1]}/images/l_hd.jpg`,
      preview: ['.gallery_con a:not(.fancy-alert)', 'href'],
      censored: 'Uncensored',
      actor: (res, $) => $('.detail-info table tr:contains("名前")>td:nth-child(2)>a').text().split(/\s+/),
      release: ['.detail-info-l .date', null, /配信日:\s+(\d+.*?)\s+/],
      duration: ['.detail-info-l .date', null, /再生時間:\s+(\d+.*?)\s+/],
      genre: '.detail-info table tr:contains("カテゴリー")>td:nth-child(2)>a',
    },
  },
  { // FC2PPV
    // https://adult.contents.fc2.com/article_search.php?id=370402
    id: 'FC2PPV',
    keyword: [/fc2[-_\s]*ppv/i],
    name: [/fc2[-_\s]*ppv/i],
    valid: async (name) => {
      let id = name.match(/fc2[-_\s]*ppv[-_\s]*(\d+)/i);
      if (!id) return;
      id = id[1];
      return `https://adult.contents.fc2.com/article_search.php?id=${id}`;
    },
    getInfo: {
      id: (res) => `FC2PPV-${res.request.uri.href.match(/id=(\d+)/)[1]}`,
      title: '.detail>.title_bar',
      cover: ['.analyticsLinkClick_mainThum', 'href'],
      preview: ['.images a', 'href'],
      censored: 'FC2',
      actor: '.analyticsLinkClick_toUserPage1',
      release: '.main_info_block dt:contains("上架时间")+dd',
      duration: (res, $) => {
        const ele = $('.main_info_block dt:contains("播放时间")+dd');
        if (ele.length === 0) return;
        let duration = ele.text();
        duration = duration.match(/(\d{2}):(\d{2})/);
        duration = duration[1] * 60 + duration[2];
        return formatTime(duration);
      },
    },
  },

  { // Other
    // https://www.javbus.life/MIFD-070
    id: 'Censored',
    keyword: [/\Wcensored\W/i, /JAVLibrary/i],
    name: [/[a-z]+-\d+/i],
    valid: async (name) => `https://www.javbus.com/${name}`,
    getInfo: {
      id: (res) => res.request.uri.href.split('/')[3].toUpperCase(),
      title: (res, $) => $('h3').eq(0).text().replace(new RegExp(res.request.uri.href.split('/')[3], 'gi'), '')
        .trim(),
      cover: ['.bigImage img', 'src'],
      // preview: ['#sample-waterfall>img', 'src'],
      censored: 'Censored',
      actor: '.star-name',
      release: ['.info>p:contains("發行日期")', 'text', /([\d-]+)/],
      duration: ['.info>p:contains("長度")', 'text', /(\d+)/],
      genre: '.info>p:contains("類別")+p>.genre',
      director: '.info>p:contains("導演")>a:nth-child(2)',
      studio: '.info>p:contains("製作商")>a:nth-child(2)',
      label: '.info>p:contains("發行商")>a:nth-child(2)',
      related: ['#related-waterfall>.movie-box', 'href', /com\/(.*)$/],
    },
  },
];

const searchLibs = {
  duckduckgo: {
    search: `https://duckduckgo.com/html/?q={searchTerms}${encodeURIComponent(' inurl:jav')}&kl=en-us&kp=-2`,
    items: '.result__a',
  },
  googleCSE: {
    search: async (keyword) => {
      const page = 0;
      let apiKey = 'AIzaSyCWOFOM-rXF4tL7Uhg-RbzNP65S2a6GwF4AIzaSyDukgtdUTmmk5OppUGvEIp2mqsRyzdWgTIAIzaSyDpcKQorOu0oUX5asC_6-M1ZUsqj44QJPgAIzaSyAdGWEblloAiYegOVRWkWbVpJNzjAa1VCMAIzaSyDkSpb0-_F9l6Srg9Z82c1sz15Rbm7-v4YAIzaSyCae4Sf4sKeJfAf_OXoNJVca-SFlwi7P8UAIzaSyAeKr5R7dZe_5zQO3SS7rNWQxUHyP2uR9oAIzaSyAf3rXFbeP8G1bTaFNMwWUhL7gRESRPCMQAIzaSyAxaqEHJO-zCN4zxv_zRdyBV0yJQ-jSCMAAIzaSyCgYz1MAAp9I9xtyq6t4MPG26DhvR6f_3A';
      apiKey = apiKey.substr(parseInt(Math.random() * 10) * 39, 39);
      const cx = '010023307804081171493:ooy1eodf_y0';
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&num=10&alt=json&q=${keyword}&start=${page * 10 + 1}`;

      const res = await req({
        uri: url,
        json: true,
      });
      return res.body.items ? res.body.items.map((i) => `${i.title}\n${i.snippet}\n${i.link}`) : [];
    },
  },
};

const req = async (option) => {
  if (typeof option === 'string') option = { uri: option };
  option = {
    method: 'GET',
    headers: {
      'Cache-Control': 'max-age=0',
      Connection: 'keep-alive',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'User-Agent': _.userAgent,
      Referer: new URL(option.uri).origin,
    },
    timeout: _.timeout * 1000,
    resolveWithFullResponse: true,
    simple: false,
    ...option,
  };

  const uri = option.uri || option.url;
  if (_.proxySocks) {
    option.agentClass = uri.match(/^http:/) ? Agent : Agent2;
    option.agentOptions = {
      socksHost: _.proxySocksHost || 'localhost',
      socksPort: _.proxySocksPort,
    };
    if (_.proxySocksUsername && _.proxySocksPassword) {
      option.agentOptions.socksUsername = _.proxySocksUsername;
      option.agentOptions.socksPassword = _.proxySocksPassword;
    }
  } else if (_.proxyHTTP) {
    option.proxy = _.proxyHTTP;
  }

  let res;
  try {
    res = await request(option);
  } catch (error) {
    if (error.cause.errno === 'ETIMEDOUT' && error.cause.port === 443 && uri.match('http://')) {
      option.uri = uri.replace('http://', 'https://');
      delete option.url;
      return req(option);
    }
    return error;
  }
  return res;
};

const formatTime = (second) => {
  const d = new Date(second * 1000);

  const h = d.getUTCHours();
  const hh = h < 10 ? `0${h}` : h;
  const m = d.getUTCMinutes();
  const mm = m < 10 ? `0${m}` : m;
  const s = d.getUTCSeconds();
  const ss = s < 10 ? `0${s}` : s;
  return `${hh}:${mm}:${ss}`;
};

const nfoFile = (info, target) => { // 生成NFO文件
  let content = '';
  content = `${content}<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n`;
  content = `${content}<movie>\r\n`;
  content = `${content}  <title>${info.id} ${info.title}</title>\r\n`;
  content = `${content}  <originaltitle>${info.title}</originaltitle>\r\n`;
  content = `${content}  <sorttitle>${info.id}</sorttitle>\r\n`;
  content = `${content}  <homepage href="${info.homepage}">${info.homepage}</homepage>\r\n`;
  if (info.rating) content = `${content}  <rating>${info.rating}</rating>\r\n`;
  if (info.release && info.release.match(/\d{4}/)) content = `${content}  <year>${info.release.match(/\d{4}/)[0]}</year>\r\n`;

  if (info.duration) {
    let minute = new Date(`1970-01-01 ${info.duration}`).getTime() / 60 / 1000;
    minute = minute - new Date().getTimezoneOffset();
    minute = parseInt(minute);
    content = `${content}  <runtime>${minute}</runtime>\r\n`;
  }
  if (info.cover) content = `${content}  <thumb aspect="poster" preview="${info.cover}">${info.cover}</thumb>\r\n`;
  if (info.preview) {
    content = `${content}  <fanart>\r\n`;
    [].concat(info.preview).forEach((i) => {
      content = `${content}    <thumb preview="${i}">${i}</thumb>\r\n`;
    });
    content = `${content}  </fanart>\r\n`;
  }
  if (info.release) content = `${content}  <premiered>${info.release}</premiered>\r\n`;
  if (info.studio) content = `${content}  <studio>${info.studio}</studio>\r\n`;
  if (info.director) content = `${content}  <director>${info.director}</director>\r\n`;
  [].concat(info.genre || '').forEach((i) => {
    content = `${content}  <genre>${i}</genre>\r\n`;
    content = `${content}  <tag>${i}</tag>\r\n`;
  });
  [].concat(info.actor || '').forEach((i) => {
    content = `${content}  <actor>\r\n`;
    content = `${content}    <name>${i}</name>\r\n`;
    content = `${content}    <role>${i}</role>\r\n`;
    content = `${content}  </actor>\r\n`;
  });
  [].concat(info.related || '').forEach((i) => {
    content = `${content}  <related>${i}</related>\r\n`;
  });
  content = `${content}  <uniqueid default="true" type="unknown">${info.id}</uniqueid>\r\n`;
  content = `${content}</movie>`;

  fse.writeFileSync(target, content);
};

const download = async (url, target, trytime = 0) => {
  if (fse.existsSync(target)) return;
  trytime = trytime + 1;
  const res = await req({
    url,
    encoding: null,
  });

  if (res instanceof Error) {
    if (trytime >= _.imageRetry) {
      console.error(`Error:\t${res.message}`);
      return false;
    }
    return download(url, target, trytime);
  }

  const buffer = Buffer.from(res.body, 'utf8');
  fse.writeFileSync(target, buffer);
};

const findLibInName = async (name) => {
  for (const lib of libs) {
    for (const re of lib.name) {
      if (name.match(re)) {
        const uri = await lib.valid(name);
        if (typeof uri === 'string') {
          return [lib, uri];
        } if (uri instanceof Array) {
          return uri;
        }
      }
    }
  }
  return [];
};

const findLibInResult = async (name, results) => {
  for (const result of results) {
    for (const lib of libs) {
      for (const re of lib.keyword) {
        if (result.match(re)) {
          const uri = await lib.valid(name);
          if (typeof uri === 'string') {
            return [lib, uri];
          } if (uri instanceof Array) {
            return uri;
          }
        }
      }
    }
  }
  return [];
};

// Main
const main = async () => {
  let list = fse.readFileSync('list.txt', 'utf-8');
  list = list.split(/[\r\n]+/);

  let find;
  for (let i = 0; i < list.length; i++) {
    if (find === false) fse.appendFileSync('list1.txt', `${list[i - 1]}\r\n`);

    const nameTrue = list[i];
    if (!list[i]) continue;
    console.log(i);
    find = false;

    // 通过文件名判断lib，来获取网址
    let [site, uri] = await findLibInName(nameTrue);

    // 当无法直接获得网址时，尝试搜索
    if (!site || !uri) {
      console.log(`Start Search:\t${nameTrue}`);

      for (const searchLib in searchLibs) {
        console.log(`Search Engine:\t${searchLib}`);

        let results;
        if (typeof searchLibs[searchLib].search === 'string') {
          const searchUri = searchLibs[searchLib].search.replace(/\{searchTerms\}/g, encodeURIComponent(nameTrue));
          const res = await req(searchUri);

          if (res instanceof Error) {
            console.error(`Error:\t${res.message}`);
            continue;
          }
          if (res.statusCode && res.statusCode !== 200) {
            console.error(`statusCode:\t${res.statusCode}`);
            continue;
          }

          const $ = cheerio.load(res.body);
          results = $(searchLibs[searchLib].items).map((index, item) => $(item).text()).toArray();
        } else {
          results = await searchLibs[searchLib].search(nameTrue);
        }
        if (!results.length) continue;
        [site, uri] = await findLibInResult(nameTrue, results);
        if (site && uri) break;
      }
    }

    // 还是不行，放弃
    if (!site || !uri) {
      console.error('Skipped:\tCan\'t Find the Lib');
      continue;
    }

    console.log(`Find:\t${site.id}`);
    console.log(`Homepage:\t${uri}`);

    // 获取网页
    const res = await req({
      uri,
      encoding: null,
    });
    if (res instanceof Error) {
      console.error(`Error:\t${res.message}`);
      continue;
    }
    // 判断网页编码
    let charset = res.headers['content-type'].match(/charset=(.*?)(;|$)/) ? res.headers['content-type'].match(/charset=(.*?)(;|$)/i)[1] : 'utf-8';
    let body = iconv.decode(res.body, charset);
    let $ = cheerio.load(body);
    if ($('meta[http-equiv="Content-Type"][content*="charset"]').length || $('meta[charset]').length) {
      if ($('meta[http-equiv="Content-Type"][content*="charset"]').length) {
        charset = $('meta[http-equiv="Content-Type"][content*="charset"]').attr('content').match(/charset=(.*?)(;|$)/)[1];
      } else if ($('meta[charset]').length) {
        charset = $('meta[charset]').attr('charset');
      }
      body = iconv.decode(res.body, charset);
      $ = cheerio.load(body);
    }
    res.body = body;

    // 获取视频信息
    const info = {
      homepage: uri,
    };
    for (const key in site.getInfo) {
      let value = site.getInfo[key];
      if (['censored'].includes(key)) {
        info[key] = value;
        continue;
      }
      if (typeof value === 'string' || value instanceof Array) { // ['selector', 'attributes', 'match(1)']
        const arr = [].concat(value);
        value = $(arr[0]);
        if (!arr[1] || arr[1] === 'text') {
          value = value.toArray().map((i) => $(i).text());
        } else if (arr[1] === 'html') {
          value = value.toArray().map((i) => $(i).html());
        } else {
          value = value.toArray().map((i) => $(i).attr(arr[1]));
        }
        if (arr[2]) value = value.map((i) => (i.match(arr[2]) ? i.match(arr[2])[1] : null));
      } else if (typeof value === 'function') {
        try {
          value = await value(res, $);
        } catch (error) {
          value = '';
        }
      } else {
        console.error(`Error:\tUnknown Type in ${site.id}:${key}\n`, value);
        continue;
      }
      if (!value) continue;
      if (typeof value === 'number') value = [].concat(value.toFixed(2));
      if (typeof value === 'string') value = [].concat(value);
      value = value.filter((i) => i).map((i) => i.replace(/\s+/g, ' ').trim()).filter((item, index, array) => array.indexOf(item) === index);
      if (['cover', 'preview'].includes(key)) value = value.map((i) => (new URL(i, uri)).href);
      for (const arr of _.strReplace) {
        value = value.map((k) => k.replace(new RegExp(arr[0], 'gi'), arr[1]).trim());
      }
      value = value.filter((i) => i);

      if (key === 'title') value = value.map((i) => i.split(info.id).join('').trim());

      if (value.length === 1) {
        info[key] = value[0];
      } else if (value.length) {
        info[key] = value;
      }
    }

    // 检测是否获取到主要信息，否则放弃
    if (!info.id || !info.title) {
      console.error('Skipped:\tGet Info Failed');
      continue;
    }

    const infoFormatted = replaceWithDict(_.infoFormat, info);
    fse.appendFileSync('list1.txt', `${infoFormatted}\r\n`);
    find = true;
  }

  if (find === false) fse.appendFileSync('list1.txt', `${list[list.length - 1]}\r\n`);

  readlineSync.keyInPause('Task Completed, Open file');
  cp.exec('notepad.exe list1.txt', () => {
    fse.removeSync('list1.txt');
  });
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit();
});
