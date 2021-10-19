// ==Headers==
// @Name:               webVideo
// @Description:        根据list.txt下载网页视频（主要是NSFW）
// @Version:            1.1.704
// @Author:             dodying
// @Created:            2020-10-27 15:58:28
// @Modified:           2021/2/17 14:33:13
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            cheerio,commander,crypto-js,dotenv,m3u8-parser,puppeteer
// ==/Headers==

// 设置
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const config = {
  workDir: 'E:\\Downloads\\Torrents\\###1\\###m3u8',
  format: ['.mp4', '.avi', '.ts', '.mkv', '.wmv'].concat(['.asf', '.asx', '.bik', '.divx', '.flv', '.ifo', '.mov', '.mpe', '.mpeg', '.mpg', '.mpg4', '.ogm', '.qt', '.rm', '.rmv', '.rmvb', '.smk', '.vob', '.wm', '.xvid']),
  executable: {
    'N_m3u8DL-CLI': 'm3u8.exe', // https://github.com/nilaoda/N_m3u8DL-CLI
    aria2c: 'aria2c.exe', // 支持更多选项
    IDMan: 'D:\\GreenSoftware\\_Basis\\Internet Download Manager\\Bin\\IDMan.exe', // 可视化
    ffmpeg: 'ffmpeg'
  },
  downloadMode: 'auto', // one of ['auto', 'hls', 'direct']
  directDownloadMode: 'aria2c', // one of ['aria2c', 'IDMan']
  proxyHTTP: 'http://127.0.0.1:8118', // aria2c 代理
  reqConfig: {
    proxy: 'socks5://127.0.0.1:1088',
    request: {
      timeout: 60 * 1000,
      followAllRedirects: false,
      strictSSL: false
    },
    autoProxy: true,
    withProxy: [
      '91porn.com',
      // 'papapa.info',
      '3atv.cc',
      'zmxx22.com',
      'avtb01.com',
      '4hu.tv',
      '8x8x.com',

      'xvideos.com',
      'pornhub.com',
      'tokyomotion.net', 'osakamotion.net',
      'daftsex.com', 'daxab.com',
      'xhamster.com',
      'spankbang.com',
      'tnaflix.com',
      'netflav.com', 'avple.video', 'fvs.io', /ff-\d{2}.com/
    ],
    withoutProxy: ['ph666.me'],
    logLevel: ['debug', 'warn', 'error'],
    setCookie: []
  },
  checkDurationFailed: 'skip', // one of ['retry', 'skip'] // 下载完成后，如果长度不匹配，则重试或跳过
  listFiles: {
    list: './list.txt',
    exceedLimit: './exceedLimit.txt',
    failed: './failed.txt',
    succeed: './succeed.txt',
    cookies: './cookies.txt',
    checkFailed: './checkFailed.txt'
  }
};

// 全局变量
let list;
const succeedList = [];
let workingHostname;
let exiting = false;
let browser;

// 导入原生模块
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

// 导入第三方模块
const cheerio = require('cheerio');
const m3u8Parser = require('m3u8-parser');
const puppeteer = require('puppeteer');
const CryptoJS = require('crypto-js');
const { program } = require('commander');
require('dotenv').config();

require('./../_lib/log').hack();
const wait = require('./../_lib/wait');
const req = require('./../_lib/req');
const walk = require('./../_lib/walk');

// Function
const getVideoInfo = async (file, timeout = 10 * 1000) => {
  // ffprobe -of json -show_streams -show_format "G:\H\###unwatched\032511_057.mp4"
  const result = cp.spawnSync('ffprobe', ['-of', 'json', '-show_streams', '-show_format', file], { timeout, windowsHide: true });
  try {
    if (result.stdout && result.stdout.toString()) {
      let metadata = result.stdout.toString();
      metadata = JSON.parse(metadata);

      if (!metadata.format) return [new Error()];
      for (const i of ['duration', 'size']) {
        metadata.format[i] = parseFloat(metadata.format[i]);
      }
      return [null, metadata];
    } else {
      if (result.stderr) console.log(result.stderr.toString());
      return [result.stderr ? result.stderr.toString() : new Error()];
    }
  } catch (error) {
    if (error.message === 'Unexpected end of JSON input') {
      return getVideoInfo(file, timeout);
    }
    console.log(error);
    return [error];
  }

  // return new Promise((resolve, reject) => {
  //   ffmpeg.ffprobe(file, function (err, metadata) {
  //     if (err) console.error({ err });
  //     resolve([err, metadata]);
  //   });
  //   // setTimeout(() => {

  //   // }, timeout);
  // });
};
function spawnSync (...argsForSpwan) {
  return new Promise(resolve => {
    const child = cp.spawn(...argsForSpwan);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('exit', function (code) {
      let end;
      if (code.toString() !== '0') {
        end = 'error';
        console.error(`Command:\t${argsForSpwan[0]}`);
        console.error(`Command-Args:${argsForSpwan[1].map(i => `{${i}}`).join(', ')}\n`);
        console.error(`Exit-Code:\t${code.toString()}`);
      } else {
        end = true;
      }
      resolve(end);
    });
  });
}
const doExit = () => {
  exiting = true;
  // fs.appendFileSync(config.listFiles.succeed, succeedList.join('\n') + '\n');
  if (list) fs.writeFileSync(config.listFiles.list, list.filter(i => !succeedList.includes(i)).join('\n'));
  if (workingHostname) cp.spawnSync('wmic', ['process', 'where', `name='${path.basename(config.executable['N_m3u8DL-CLI'])}' and commandline like '%${workingHostname}%'`, 'Call', 'Terminate']);
  if (browser) browser.close();
  process.exit();
};
const checkDurationHLS = async (remote, local) => { // 错误返回undefined，否则为长度是否正确
  const [err, localInfo] = await getVideoInfo(local);
  if (err) return;
  const localDuration = localInfo.format.duration;

  let videoRes = await req(remote);
  if (!videoRes || videoRes.statusCode !== 200) return;
  let parser = new m3u8Parser.Parser();
  parser.push(videoRes.body);
  parser.end();
  // fs.writeFileSync('./1.json', JSON.stringify(parser.manifest, null, 2));
  let remoteDuration = parser.manifest.totalDuration || parser.manifest.segments.map(i => i.duration).filter(i => i).reduce((pre, cur) => pre + cur, 0);
  if (remoteDuration === 0 && parser.manifest.playlists && parser.manifest.playlists.find(i => i.uri).uri) {
    videoRes = await req(parser.manifest.playlists.find(i => i.uri).uri);
    if (!videoRes || videoRes.statusCode !== 200) return;
    parser = new m3u8Parser.Parser();
    parser.push(videoRes.body);
    parser.end();
    // fs.writeFileSync('./2.json', JSON.stringify(parser.manifest, null, 2));
    remoteDuration = parser.manifest.totalDuration || parser.manifest.segments.map(i => i.duration).filter(i => i).reduce((pre, cur) => pre + cur, 0);
  }
  const delta = remoteDuration - localDuration;
  // console.log({ localDuration, remoteDuration, delta: delta, percent: Math.abs(delta) / remoteDuration }); process.exit();
  return Math.abs(delta) / remoteDuration < (delta > 0 ? 0.1 : 1);
};
const checkDurationVideo = async (duration, file) => {
  const [err, localInfo] = await getVideoInfo(file);
  if (err) return;
  const localDuration = localInfo.format.duration;

  const remoteDuration = duration * 1;

  const delta = remoteDuration - localDuration;
  return Math.abs(delta) / remoteDuration < (delta > 0 ? 0.1 : 1);
};
const getRemoteInfo = async (url, lib) => {
  if (lib.urlModify && typeof lib.urlModify === 'function') url = lib.urlModify(url);

  console.log(`${lib.puppeteer ? 'Puppeteer' : 'Request'}:\t${lib.name} ${url}`);

  let info = {};
  if (lib.puppeteer) {
    if (!browser) {
      try {
        browser = await puppeteer.launch({ args: [`--proxy-server=${config.reqConfig.proxy}`] }); // https://github.com/puppeteer/puppeteer/blob/main/examples/proxy.js
      } catch (error) {
        console.log(error);
        process.exit();
      }
    }
    const page = await browser.newPage();

    const requests = [];
    page.on('requestfinished', async (req) => {
      const res = req.response();
      let body;
      try {
        body = ['image', 'media', 'font'].includes(req.resourceType()) ? await res.buffer() : await res.text();
      } catch (error) {
        body = null;
      }
      requests.push({
        method: req.method(),
        url: req.url(),
        headers: req.headers(),
        postData: req.postData(),
        redirectChain: req.redirectChain().map(i => i.url()),
        resourceType: req.resourceType(),
        response: {
          headers: res.headers(),
          ok: res.ok(),
          status: res.status(),
          statusText: res.statusText(),
          url: res.url(),
          body
        }
      });
    });

    if (lib.beforeLoad && typeof lib.beforeLoad === 'function') await lib.beforeLoad(page, url, requests);
    let res;
    try {
      res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60 * 1000 });
    } catch (error) {
      console.error(error);
    }

    if (res && res.ok()) {
      try {
        info = await lib.getInfo(page, url, requests);
      } catch (error) {
        info = {};
        console.error('an expection on page.evaluate ', error);
      }
    }

    await page.close();
  } else {
    const res = await req(Object.assign({ uri: url }, lib.request || {}), lib.requestUser || {});
    if (!res || res.statusCode !== 200) {
      if (res) {
        succeedList.push(url);
        fs.appendFileSync(config.listFiles.failed, url + '\n');
        console.error(`Error:\t${res.statusCode}`);
      }
      info.failed = true;
      return info;
    }
    let valueToGetInfo;
    try {
      valueToGetInfo = typeof lib.beforeGetInfo === 'function' ? await lib.beforeGetInfo(res) : null;
    } catch (error) {
      console.log(error);
      console.error(`Error:\tbeforeGetInfo Failed when "${url}"`);
      return info;
    }
    if (typeof lib.getInfo === 'function') {
      try {
        info = await lib.getInfo(res, valueToGetInfo);
      } catch (error) {
        console.log(error);
        console.error(`Error:\tgetInfo Failed when "${url}"`);
      }
    } else {
      for (const key in lib.getInfo) {
        if (typeof lib.getInfo[key] === 'function') {
          try {
            info[key] = await lib.getInfo[key](res, valueToGetInfo);
          } catch (error) {
            console.log(error);
            console.error(`Error:\tgetInfo "${key}" Failed when "${url}"`);
          }
        } else if (typeof lib.getInfo[key] === 'string' || lib.getInfo[key] instanceof Array) {
          let [selector, attribute, match, replace] = [].concat(lib.getInfo[key]);
          if (!attribute) attribute = 'text';

          const element = res.$(selector);
          if (element.length === 0) {
            if (['id', 'title', 'duration', 'videoHLS', 'videoDirect'].includes(key)) fs.writeFileSync(`./${url.replace(/[\\/:*?"<>|]/g, '-')}.html`, res.body);
            console.error(`Error:\tSelector "${selector}" Nothing when "${url}"`);
            continue;
          }

          let value = attribute === 'text' ? element.eq(0).text() : (attribute === 'html' ? element.eq(0).html() : element.eq(0).attr(attribute));
          if (value) value = value.trim();
          if (!value) {
            console.error(`Error:\tAttribute "${attribute}" Empty when "${url}"`);
            continue;
          }

          if (match && replace) {
            value = value.replace(match, replace);
          } else if (match) {
            const temp = value.match(match);
            if (!temp) {
              console.error(`Error:\tRegExp "${match}" Dont Match Text "${value}" when "url"`);
              continue;
            }
            value = temp[1];
          }

          info[key] = value;
        }
      }
    }
  }
  return info;
};
const getSimilarFile = (info, exts = config.format) => {
  return fs.readdirSync(config.workDir)
    .filter(i => i.startsWith(`[${info.name}][${info.id}]`) && exts.includes(path.extname(i)))
    .map(i => path.join(config.workDir, i))
    .filter(i => fs.statSync(i).isFile())[0];
};
const downloadWith = { // 仅当错误时返回错误
  HLS: async (info, filename, url) => {
    workingHostname = new URL(info.videoHLS).hostname;
    await spawnSync('start', ['', '/wait', config.executable['N_m3u8DL-CLI'], `"${info.videoHLS}"`, '--workDir', `"${config.workDir}"`, '--retryCount', '10', '--timeOut', '10', '--enableDelAfterDone', '--saveName', `"${filename}"`], { timeout: 5 * 60 * 1000, shell: true, windowsHide: false });

    while (true) {
      await wait(10000);
      let running = cp.spawnSync('wmic', ['process', 'where', `name='${path.basename(config.executable['N_m3u8DL-CLI'])}' and commandline like '%${new URL(info.videoHLS).hostname}%'`, 'get', 'ExecutablePath,', 'Caption']).output[1].toString();
      running = !running.match(/^\s*$/);
      if (!exiting && !running) break;
    }

    workingHostname = null;
  },
  Direct: async (info, filename, url) => {
    if (config.directDownloadMode === 'aria2c') {
      fs.writeFileSync(config.listFiles.cookies, (JSON.parse(JSON.stringify(req.config.get('request').jar))._jar.cookies || []).map(i => [`.${i.domain}`, i.hostOnly ? 'TRUE' : 'FALSE', i.path, i.secure ? 'TRUE' : 'FALSE', i.expires ? Math.round(new Date(i.expires).getTime() / 1000) : '0', i.key, i.value].join('\t')).join('\r\n'));

      const end = await spawnSync(config.executable.aria2c, [
        '--async-dns=false',

        '--continue',
        '--max-tries=10', '--retry-wait=30', '--timeout=30',
        `--load-cookies=${config.listFiles.cookies}`,
        `--referer=${url}`, '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36 Edg/87.0.664.55"',
        '--check-certificate=false', (config.reqConfig.withProxy.some(i => url.match(i) || info.videoDirect.match(i)) && !config.reqConfig.withoutProxy.some(i => url.match(i) || info.videoDirect.match(i)) ? `--all-proxy=${config.proxyHTTP}` : ''),
        '--auto-file-renaming=false', '--allow-overwrite=true',
        '--file-allocation=none',
        '--min-split-size=1M', '--max-connection-per-server=64', '--split=64',
        '--console-log-level=error',
        `--dir=${config.workDir}`, `--out=${filename}.mp4.!downloading`,
        info.videoDirect
      ]);
      fs.unlinkSync(config.listFiles.cookies);
      if (end === 'error') {
        return new Error('Error:\tDownload Interrupt');
      } else if (end === true) {
        const similarFile = getSimilarFile(info, ['.!downloading']);
        fs.renameSync(similarFile, similarFile.replace(/\.!downloading$/, ''));
      }
    } else if (config.directDownloadMode === 'IDMan') {
      // https://www.internetdownloadmanager.com/support/command_line.html
      await spawnSync(config.executable.IDMan, [
        '/d', info.videoDirect,
        '/p', config.workDir,
        '/f', `${filename}.mp4`,
        '/n', '/h', '/q'
      ]);
    } else {
      return new Error('Error:\t请指定下载方式');
    }
  }
};

// Main
let libs = [
  /*
    interface Lib {
      name: string; // 唯一标识
      tryOtherLib // 如果失败/超过限制，当tryOtherLib为true时，尝试其他规则，否则跳过该视频

      filter: string | RegExp; // 链接匹配时使用当前规则
      urlModify: function(url) => urlNew; // 匹配规则后，修改链接

      puppeteer: boolean; // 是否使用无头浏览器 // https://zhaoqize.github.io/puppeteer-api-zh_CN/#/
      beforeLoad: async function(page, url, requests); // 当使用无头浏览器时，载入页面前运行
      getInfo: async function(page, url, requests) => Info;

      request: object; // 请求时的其他选项（详见https://github.com/request/request/#requestoptions-callback）
      requestUser: object; // 请求时的其他选项（用户）（详见_lib/req optionUser）
      beforeGetInfo: async function(res); // 在getInfo之前进行，返回任意数
      getInfo: async function | Info;

      // 其他功能
      link: function(id) => url;
      test: object;
    }
    interface Info {
      name
      id: string | Array | async function(res, value);
        // 当string/array时，[selector, ?attribute = 'text', ?match, ?replace]
        // 当function时，参数中的value为beforeGetInfo返回值
      title // 标题
      uploader // 演员或上传者
      duration // 视频时长（单位秒）
      videoHLS // m3u8下载（推荐），下载器支持多线程下载
      videoDirect // 直接下载，多线程下载需网站支持
      chapters // 章节 JSON eg: [{ "title": "第一章", "start": time_in_ms }]

      // 特殊的
      failed // 失败，如视频被删等情况
      exceedLimit // 超过限制，下次运行时再次尝试
      tryOtherLib // 如果失败/超过限制，当tryOtherLib为true时，尝试其他规则，否则跳过该视频
    }
    // 文件一般命名为 [name][id][uploader]title
   */

  // 国内
  { // 91porn-heiporn
    name: '91porn-heiporn',
    filter: /91porn.com\/view_video.php\?viewkey=([a-z0-9]+)|heiporn.com\/player-index-([a-z0-9]+).html/,
    urlModify: url => {
      if (url.match(/91porn.com\/view_video.php\?viewkey=([a-z0-9]+)/)) {
        const id = url.match(/91porn.com\/view_video.php\?viewkey=([a-z0-9]+)/)[1];
        return `https://www.heiporn.com/player-index-${id}.html`;
      } else {
        return url;
      }
    },
    puppeteer: true,
    getInfo: async (page, url) => {
      return page.evaluate(function () {
        let duration = document.querySelector('.am-table>tbody>tr:nth-child(1)>td:nth-child(2)').textContent;
        if (!duration.match(/((\d+):)?(\d+):(\d+)/)) return { failed: true };
        const [, , hours, minutes, seconds] = duration.match(/((\d+):)?(\d+):(\d+)/);
        duration = (hours ? hours * 60 * 60 : 0) + minutes * 60 + seconds * 1;
        return {
          name: '91porn',
          id: window.location.href.match(/heiporn.com\/player-index-([a-z0-9]+).html/)[1],
          title: document.querySelector('.am-panel-title').textContent.replace(/^片名：/, ''),
          uploader: document.querySelector('.am-table>tbody>tr:nth-child(4)>td:nth-child(2)').textContent.trim(),
          duration: duration,
          videoDirect: window.play
        };
      });
    },
    link: id => `https://www.heiporn.com/player-index-${id}.html`,
    test: {
      url: 'https://www.heiporn.com/player-index-7e42283b4f5ab36da134.html',
      name: '91porn',
      id: '7e42283b4f5ab36da134',
      title: '18岁大一漂亮学妹，水嫩性感，再爽一次！',
      uploader: '千岁九王爷',
      duration: 431,
      videoDirect: /91p\d+.com\/\/mp43\/\d+.mp4/
    }
  },
  { // 91porn
    name: '91porn',
    filter: /91porn.com\/view_video.php\?viewkey=([a-z0-9]+)/,
    request: {
      headers: {
        Cookie: 'language=cn_CN'
      }
    },
    getInfo: {
      id: res => res.request.uri.href.match(/(91porn.com)\/view_video.php\?viewkey=([a-z0-9]+)/)[2],
      exceedLimit: res => !res.$('#player_one>script').length,
      title: '#videodetails:nth-child(1)>h4:nth-child(1)',
      uploader: '.title-yakov>a[href*="uprofile.php"]>span',
      duration: res => {
        const duration = res.$('.info:contains("时长")>.video-info-span').text();
        const [, , hours, minutes, seconds] = duration.match(/((\d+):)?(\d+):(\d+)/);
        return (hours ? hours * 60 * 60 : 0) + minutes * 60 + seconds * 1;
      },
      videoDirect: async res => {
        try {
          const script = res.$('#player_one>script').html().match(/strencode(\d?)\(.*?\)/);
          const html = decodeURIComponent(script[0]);
          return html.match(/src='(.*?)'/)[1];

          // const res1 = await req({ uri: `https://91porn.com/js/m${script[1]}.js`, cache: true });
          // const html = eval(`(function (){atob = (str) => CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);const window = { atob };${res1.body};return ${script[0].replace(/%/g, '%25')}})();`); // eslint-disable-line no-eval
          // return html.match(/src='(.*?)'/)[1];
        } catch (error) {
          console.log(error);
          return null;
        }
      }
    },
    link: id => `http://91porn.com/view_video.php?viewkey=${id}`,
    test: {
      url: 'http://91porn.com/view_video.php?viewkey=7e42283b4f5ab36da134',
      name: '91porn',
      id: '7e42283b4f5ab36da134',
      title: '18岁大一漂亮学妹，水嫩性感，再爽一次！',
      uploader: '千岁九王爷',
      duration: 431,
      videoDirect: /91p\d+.com\/\/mp43\/\d+.mp4/,
      exceedLimit: false
    }
  },

  // 国内-第三方
  { // papapa.info
    name: 'papapa.info',
    filter: /(papapa.info|yase\d+.xyz)\/vod\/play\/id\/(\d+)/,
    request: {
      headers: {
        Cookie: process.env.Cookie_For_Papapa,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
      }
    },
    beforeGetInfo: res => res.request.uri.href.match(/(papapa.info|yase1.xyz)\/vod\/play\/id\/(\d+)/)[2],
    getInfo: {
      id: (res, id) => id,
      title: '.video-title>h1',
      uploader: '.hr-director+a[href*="/director/"]',
      videoHLS: async (res, id) => {
        const res1 = await req({
          uri: `https://papapa.info/vod/getPlayUrl?id=${id}&is_win=true`,
          headers: {
            Cookie: process.env.Cookie_For_Papapa,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
          }
        }, {
          check: res => {
            try {
              const json = JSON.parse(res.body);
              return json.data;
            } catch (error) {}
          }
        });
        let url = res1.json.data.url.replace(/-/g, '/').replace(/_/g, '+');
        url = CryptoJS.enc.Base64.parse(url).toString(CryptoJS.enc.Utf8);

        let key = res.$('#play-ads').html();

        let url1 = '';
        for (let i = 0; i < url.length; i++) {
          url1 += String.fromCharCode(url.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }

        if (!url1.startsWith('aHR0cHM6')) {
          key = `${id}content`;
          url1 = '';
          for (let i = 0; i < url.length; i++) {
            url1 += String.fromCharCode(url.charCodeAt(i) ^ key.charCodeAt(i % key.length));
          }
        }

        url1 = CryptoJS.enc.Base64.parse(url1).toString(CryptoJS.enc.Utf8);
        return url1;
      }
    },
    link: id => `https://papapa.info/vod/play/id/${id}/sid/1/nid/1.html`,
    test: {
      url: 'https://papapa.info/vod/play/id/100/sid/1/nid/1.html',
      name: 'papapa.info',
      id: '100',
      title: '带验证，匆匆忙忙拍的，下次改进吧',
      uploader: 'Lareine',
      videoHLS: /(papapa.info|yase\d+.xyz)\/video\/complete\/.*?\/index.m3u8/
    }
  },
  { // 3atv.cc
    name: '3atv.cc',
    filter: /(3atv.cc|3a\d+.com|app\d+.com)\/play\/([\d-]+).html/,
    getInfo: {
      id: res => res.request.uri.href.match(/(3atv.cc|3a\d+.com|app\d+.com)\/play\/([\d-]+).html/)[2],
      title: '.bread>a:last-child',
      videoHLS: async res => {
        try {
          const script = res.$('script[src^="/upload/playdata/"]').attr('src');
          const res1 = await req(new URL(script, res.request.uri.href).href);
          const url = eval(`(function (){${res1.body};return mac_url;})();`); // eslint-disable-line no-eval
          return url;
        } catch (error) {
          return null;
        }
      }
    },
    link: id => `http://3atv.cc/play/${id}.html`,
    test: {
      url: 'http://3atv.cc/play/9921-1-1.html',
      name: '3atv.cc',
      id: '9921-1-1',
      title: 'c2020121_6',
      videoHLS: /play\d+.com\/.*?\/index.m3u8/
    }
  },
  { // zmxx22
    name: 'zmxx22',
    filter: /(zm[a-z]{2}\d{2}.com)\/video\/show\/id\/(\d+)/,
    getInfo: {
      id: res => res.request.uri.href.match(/(zm[a-z]{2}\d{2}.com)\/video\/show\/id\/(\d+)/)[2],
      title: '.watch>.title:nth-child(1)',
      videoHLS: async res => res.body.match(/url = '(.*?)'/)[1]
    },
    link: id => `https://www.zmxx22.com/video/show/id/${id}`,
    test: {
      url: 'https://www.zmxx22.com/video/show/id/40754',
      name: 'zmxx22',
      id: '40754',
      title: 'BBAN-242 色情的身体邀请性感模特',
      videoHLS: /videozm.whqhyg.com:8091\/.*?\/index\.m3u8/
    }
  },
  { // avtb01
    name: 'avtb01',
    filter: /(avtb\d+.com)\/(\d+)\//,
    getInfo: {
      id: res => res.request.uri.href.match(/(avtb\d+.com)\/(\d+)\//)[2],
      title: '#video>h1',
      uploader: '.content-container>div>div>a[href^="/users/"]',
      duration: ['[property="og:video:duration"]', 'content'],
      videoDirect: async res => {
        const sources = res.$('#player>source').toArray().map(i => ({
          src: res.$(i).attr('src'),
          label: res.$(i).attr('label')
        })).sort((a, b) => -Math.sign(a.label.match(/^(\d+)/)[1] - b.label.match(/^(\d+)/)[1]));
        return sources[0].src;
      }
    },
    link: id => `https://www.avtb01.com/${id}/`,
    test: {
      url: 'https://www.avtb2047.com/231472/',
      name: 'avtb01',
      id: '231472',
      title: '我要给老公戴绿帽！快操我 淫水喷不停 ！有露脸',
      uploader: 'A淘小管家',
      duration: '249',
      videoDirect: /rachno2.rubinclass.com\/media\/videos\/(mobile|mp4)\/\d+.mp4\?st=.*/
    }
  },
  { // 4hu.tv
    name: '4hu.tv',
    filter: /(4hu.tv|4hu[a-z]\d{2}.com)\/vod\/html(.*?)\.html/,
    getInfo: {
      id: res => res.request.uri.href.match(/(4hu.tv|4hu[a-z]\d{2}.com)\/vod\/html(.*?)\.html/)[2].replace(/\//g, '-'),
      title: '.detail-title>h2',
      videoHLS: async res => {
        for (const url of res.$('.playlist>ul>li>a[href*="_play_"]').toArray().map(i => res.$(i).attr('href'))) {
          const res1 = await req(url);
          const [, serverNumber, pathname] = res1.body.match(/new Clappr\.Player\(\{source: "https:\/\/"\+(CN\d+)\+"(.*?\.m3u8)"/);

          const script = await req({ uri: '/html5/html5.min.hls.js', cache: true });
          const server = eval(`(function (){${script.body}; return ${serverNumber};})()`); // eslint-disable-line no-eval

          // const res2 = await req.head(`https://${server}${pathname}`);
          // if (res2 && res.statusCode === 200)
          return `https://${server}${pathname}`;
        }
      },
      videoDirect: async res => {
        for (const url of res.$('.playlist>ul>li>a[href*="_down_"]').toArray().map(i => res.$(i).attr('href'))) {
          const res1 = await req(url);
          if (res1.body.match(/httpurl = "(.*?\.mp4)"/)) return res1.body.match(/httpurl = "(.*?\.mp4)"/)[1];
        }
      }
    },
    link: id => `https://4hu.tv/vod/html${id.replace(/-/g, '/')}.html`,
    test: {
      url: 'https://4hu.tv/vod/html9/html22/40863.html',
      name: '4hu.tv',
      id: '9-html22-40863',
      title: '110219_199 已婚妇女的淫秽比赛 つるのゆう,菊池くみこ',
      videoHLS: /m3u8.\d+cdn.com\/videos\/.*?\/hls\/.*?.m3u8/,
      videoDirect: /d1.xia12345.com\/dl2\/videos\/.*?\/downloads\/.*?.mp4/
    }
  },
  { // 8x8x
    name: '8x8x',
    filter: /(8x8x.com|8x\w{4}.com)\/html\/(\d+)\//,
    getInfo: {
      id: res => res.request.uri.href.match(/(8x8x.com|8x\w{4}.com)\/html\/(\d+)\//)[2],
      title: '.w_z>h3',
      videoHLS: async res => {
        const res1 = await req({ uri: '/static/main/main.js', cache: true });
        const servers = res1.body.match(/window.globalConfig = \{\r\n\s*item\s*:\s*'\[(.*?)\]'/)[1].split(',').map(i => i.match(/^"(.*)"$/)[1]);
        const server = servers[Math.floor(Math.random() * servers.length)]; // 随机挑选
        return server + res.$('#vpath').text();
      },
      videoDirect: ['#downallurl', 'href']
    },
    link: id => `https://8x8x.com/html/${id}/`,
    test: {
      url: 'https://8x7n9m.com/html/35995/',
      name: '8x8x',
      id: '35995',
      title: '无码：年轻貌美的女孩为了钱,任人玩弄玉体',
      videoHLS: /\/v\/.*?\/index.m3u8/,
      videoDirect: /ppp.downloadxx.com\/assets\/.*?.mp4/
    }
  },
  { // avgle // TODO
    name: 'avgle',
    filter: /(avgle.com)\/video\/([^/]+)\//,
    puppeteer: true,
    getInfo: async (page, url, requests) => {
      const info = await page.evaluate(function () {
        return {
          name: 'avgle',
          id: window.location.href.match(/(avgle.com)\/video\/([^/]+)\//)[2],
          title: document.querySelector('[property="og:title"]').getAttribute('content'),
          duration: document.querySelector('[property="video:duration"]').getAttribute('content') * 1
        };
      });
      info.videoHLS = JSON.parse(requests.find(i => i.resourceType === 'xhr' && i.url.includes('video-url.php')).response.body).url;
      // TODO
      // to debugger videoJs.xhr)(options, function(error, response) {
      return info;
    },
    link: id => `https://avgle.com/video/${id}/`,
    test: {
      url: 'https://avgle.com/video/5_J8p8pfq8I/',
      name: 'avgle',
      id: '5_J8p8pfq8I',
      title: '91汤先生最新高端精品大片为国争光系列_编号sm017_175CM娃娃脸金发美女洋妞',
      duration: 2170,
      videoHLS: /qooqlevideo.com/
    }
  },

  // 国外-第一方
  { // xvideos
    name: 'xvideos',
    filter: /\.xvideos.com\/video(\d+)|xvideos.com\/prof-video-click\/upload/,
    request: {
      headers: {
        'Accept-Language': 'zh-CN'
      }
    },
    getInfo: {
      id: res => res.request.uri.href.match(/\/video(\d+)\//)[1],
      title: ['[property="og:title"]', 'content'],
      uploader: '.video-metadata .uploader-tag>.name',
      duration: ['[property="og:duration"]', 'content'],
      videoHLS: res => res.body.match(/html5player.setVideoHLS\('(.*?)'\);/)[1],
      videoDirect: res => res.body.match(/html5player.setVideoUrlHigh\('(.*?)'\);/)[1]
    },
    link: id => `https://www.xvideos.com/video${id}/`,
    test: {
      url: 'https://www.xvideos.com/video59537313/_-_',
      name: 'xvideos',
      id: '59537313',
      title: '撕裂连裤袜和体内射精 - 欺骗妻子得到硬的丈夫从邻居回来后性交',
      uploader: 'Perfecthelen',
      duration: '418',
      videoHLS: /xvideos-cdn.com\/.*?\/videos\/hls\/.*?\/hls.m3u8/,
      videoDirect: /xvideos-cdn.com\/.*?\/.*?.mp4/
    }
  },
  { // pornhub
    name: 'pornhub',
    filter: /pornhub.com\/view_video.php\?viewkey=([a-z0-9]+)/,
    getInfo: async (res) => {
      if (res.request.uri.href.match(/modelhub.com\/video/)) { // TODO modelhub
        return { failed: true };
      }

      const $ = cheerio.load(res.body);
      const script = $('script').toArray().map(i => $(i).html()).find(i => i.match(/var\s+(flashvars_\d+)\s+=\s+/));
      let flashvars;
      try {
        const name = script.match(/var\s+(flashvars_\d+)\s+=\s+/)[1];
        flashvars = eval(`(function (){var playerObjList = {}; ${script}; return ${name};})()`); // eslint-disable-line no-eval
      } catch (error) {
        console.log(error);
        // return {};
      }
      if (!flashvars || !flashvars.mediaDefinitions) {
        if (!res.request.uri.href.match(/[a-z]+\.pornhub\.com/)) return {};
        const lib = libs.find(i => i.name === 'pornhub-ph666');
        const url = res.request.uri.href.replace(/[a-z]+\.pornhub\.com/, 'ph666.me');
        console.log(`Try ph666.me:\t${url}`);
        const res1 = await req(Object.assign({ uri: url }, lib.request || {}));
        return lib.getInfo(res1);
      }
      return {
        id: res.request._rp_options.uri.match(/(pornhub.com|pornhubpremium.com|ph666.me)\/view_video.php\?viewkey=([a-z0-9]+)/)[2],
        name: 'pornhub',
        title: flashvars.video_title,
        uploader: $('.video-detailed-info>.userRow>.userInfo>.usernameWrap a').text(),
        duration: flashvars.video_duration,
        videoHLS: flashvars.mediaDefinitions.sort((a, b) => -Math.sign(a.quality - b.quality)).find(i => i.format === 'hls').videoUrl,
        // videoDirect: flashvars.mediaDefinitions.sort((a, b) => -Math.sign(a.quality - b.quality)).find(i => i.format === 'mp4').videoUrl,
        chapters: flashvars.actionTags ? JSON.stringify(flashvars.actionTags.split(',').map(i => {
          const chapter = i.match(/^(?<title>.*?):(?<start>\d+)$/).groups;
          chapter.start = chapter.start * 1000;
          return chapter;
        })) : ''
      };
    },
    link: id => `https://cn.pornhub.com/view_video.php?viewkey=${id}`,
    test: {
      url: 'https://cn.pornhub.com/view_video.php?viewkey=ph5e6f7c6e43ed1',
      name: 'pornhub',
      id: 'ph5e6f7c6e43ed1',
      title: '最新汤不热阿黑颜COS女神『Maste』大尺度私拍流出 口爆女神 灵舌搅动给你舔到爆 高清私拍60P 高清720P版',
      uploader: 'z5805246',
      duration: '1100',
      videoHLS: /(phncdn.com|phprcdn.com)\/hls\/videos\/.*?\/master.m3u8/,
      // videoDirect: /phncdn.com\/videos\/.*?.mp4/,
      chapters: '[{"title":"Blowjob","start":48000},{"title":"Facial","start":839000}]'
    }
  },
  { // pornhub-ph666
    name: 'pornhub-ph666',
    filter: /ph666.me\/view_video.php\?viewkey=([a-z0-9]+)/,
    request: {
      headers: {
        Cookie: 'fanClubInfoPop=1; authToken=2bd7671dcc71be9d; __cfduid=d3f9a622ca3dbf5daf8dc927a4866465e1603711336'
      }
    },
    getInfo: async (res) => {
      const $ = cheerio.load(res.body);
      if (!$('.video-wrapper>#player').length || $('.video-wrapper>#player>.lockedFanclub').length) {
        return { failed: true };
      }
      return libs.find(i => i.name === 'pornhub' && i.filter.source.startsWith('pornhub.com')).getInfo(res);
    },
    link: id => `https://ph666.me/view_video.php?viewkey=${id}`,
    test: {
      url: 'https://ph666.me/view_video.php?viewkey=ph5fd25f4b8d256',
      name: 'pornhub',
      id: 'ph5fd25f4b8d256',
      title: 'CUTIE CREAM TEEN LIZ JORDAN FIRST TIME THREESOME CREAMPIE + CUM MOUTH',
      uploader: 'Spank Monster',
      duration: '2693',
      videoHLS: /(phncdn.com|phprcdn.com)\/hls\/videos\/.*?\/master.m3u8/,
      // videoDirect: /(phncdn.com|phprcdn.com)\/videos\/.*?.mp4/,
      chapters: '[{"title":"Blowjob","start":290000},{"title":"Handjob","start":326000},{"title":"Doggystyle","start":896000},{"title":"Blowjob","start":1932000}]'
    }
  },

  // 国外-第三方
  { // tokyomotion osakamotion
    name: 'tokyomotion',
    filter: /(tokyo|osaka)motion.net\/video\/\d+/,
    request: {
      gzip: false
    },
    getInfo: {
      name: res => res.request.uri.host.match(/^(www.)?(?<site>(tokyo|osaka)motion).net$/).groups.site,
      id: res => res.request.uri.href.match(/\/video\/(\d+)\//)[1],
      title: ['[property="og:title"]', 'content'],
      uploader: '.user-container>a>span',
      duration: ['[property="video:duration"]', 'content'],
      videoDirect: ['#vjsplayer>source:nth-child(1)', 'src']
    },
    link: id => `https://www.tokyomotion.net/video/${id}/`,
    test: {
      url: 'https://www.tokyomotion.net/video/1563523/ncy-021',
      name: 'tokyomotion',
      id: '1563523',
      title: 'NCY-021',
      uploader: 'zhaoji987',
      duration: '2311.04',
      videoDirect: /tokyomotion.net\/vsrc\/hd\//
    }
  },
  { // osakamotion
    name: 'osakamotion',
    link: id => `https://www.osakamotion.net/video/${id}/`
  },
  { // DaftSex
    name: 'DaftSex',
    filter: /(daftsex.com)\/watch\/(-?\d+_\d+)/,
    getInfo: {
      id: res => res.request.uri.href.match(/(daftsex.com)\/watch\/(-?\d+_\d+)/)[2],
      title: ['[property="og:title"]', 'content'],
      uploader: '.playlists>.video-item:nth-child(1)>a>.video-title',
      duration: res => {
        const duration = res.$('[itemprop="duration"]').attr('content');
        const [, , hours, minutes, seconds] = duration.match(/T((\d+)H)?(\d+)M(\d+)S/);
        return (hours ? hours * 60 * 60 : 0) + minutes * 60 + seconds * 1;
      },
      videoDirect: async res => {
        const videoId = res.request.uri.href.match(/(daftsex.com)\/watch\/(-?\d+_\d+)/)[2];

        const $ = cheerio.load(res.body);
        const src = $('iframe[src*="/player/"]').attr('src');
        const res1 = await req({ uri: src, headers: { referer: 'https://daftsex.com/' } });
        const $1 = cheerio.load(res1.body);
        const script = $1('#globParams').html();
        try {
          const json = eval(`(function (){const window = {};${script};return window.globParams;})();`); // eslint-disable-line no-eval
          const server = CryptoJS.enc.Base64.parse(json.server.split('').reverse().join('')).toString(CryptoJS.enc.Utf8);

          if (json.video.cdn_files) {
            const bestSize = Object.keys(json.video.cdn_files).sort((a, b) => -Math.sign(a.match(/(\d+)$/)[1] - b.match(/(\d+)$/)[1]))[0];
            return `https://${server}/videos/${videoId.replace('_', '/')}/${bestSize.match(/(\d+)$/)[1]}.mp4?extra=${json.video.cdn_files[bestSize].replace(/^\d+\./, '')}&dl=1`;
          } else if (json.video.partial) {
            const res2 = await req(`https://${server}/method/video.get/${videoId}?token=${json.video.access_token}&videos=${videoId}&ckey=${json.c_key}&credentials=${json.video.credentials}`);
            const json1 = res2.json;

            const size = Object.keys(json.video.partial.quality).sort((a, b) => -Math.sign(a - b));
            let bestSizeAvailable;
            size.find(i => Object.keys(json1.response.items[0].files).some(j => (bestSizeAvailable = j).endsWith(i)));
            return `https://${server}/${json1.response.items[0].files[bestSizeAvailable].replace(/^https?:\/\//, '')}&videos=${videoId}&extra_key=${json.video.partial.quality[bestSizeAvailable.match(/(\d+)$/)[1]]}&dl=1`;
          }
        } catch (error) {
          return null;
        }
      }
    },
    link: id => `https://daftsex.com/watch/${id}`,
    test: {
      url: 'https://daftsex.com/watch/-31257429_456239254',
      name: 'DaftSex',
      id: '-31257429_456239254',
      title: 'Abigaile Johnson - CaribbeancomPR 042315_182 - 1',
      uploader: /Abigaile Johnson/i,
      duration: 2735,
      videoDirect: /daxab.com\/videos\/-?\d+\/\d+\/\d+.mp4\?extra=.*/
    }
  },
  { // xHamster
    name: 'xHamster',
    filter: /(?<hostname>xhamster.com)\/videos\/(?<title>[^/]*-)?(?<id>[a-zA-Z0-9]+)(?<end>\/|#|$)/,
    getInfo: async res => {
      const script = res.$('#initials-script').html();
      const info = {};
      try {
        const json = eval(`(function (){const window = {};${script};return window.initials;})();`); // eslint-disable-line no-eval
        Object.assign(info, {
          id: json.videoModel.idHashSlug,
          title: json.videoModel.title,
          uploader: json.videoModel.author.name,
          duration: json.videoModel.duration,
          videoHLS: new URL(json.xplayerSettings.sources.hls.url, res.request.uri.href).href,
          videoDirect: json.xplayerSettings.sources.standard.mp4.filter(i => i.quality.match(/^(\d+)p$/)).sort((a, b) => -Math.sign(a.quality.match(/^(\d+)/)[1] - b.quality.match(/^(\d+)/)[1]))[0].url
        });
      } catch (error) {
        console.log(error);
      }
      return info;
    },
    link: id => `https://xhamster.com/videos/${id}`,
    test: {
      url: 'https://xhamster.com/videos/met-a-young-girl-on-the-train-and-fucked-her-in-compartment-xhyw0M4',
      name: 'xHamster',
      id: 'xhyw0M4',
      title: 'met a young girl on the train and fucked her in compartment',
      uploader: 'Nik_Rock_XxX',
      duration: 736,
      videoHLS: /xhamster.com\/video-hls\/m3u8\/(?<id>[a-zA-Z0-9]+)\/a.m3u8/,
      videoDirect: /cdn\d+.com\/.*?.mp4/
    }
  },
  { // SpankBang
    name: 'SpankBang',
    filter: /(spankbang).com\/([a-z0-9]+)\/video\//,
    getInfo: async res => {
      const script = res.$('#container>script:nth-child(1)').html();
      const info = {};
      try {
        const json = eval(`(function (){${script};return stream_data;})();`); // eslint-disable-line no-eval
        const bestSize = ['4k', '1080p', '720p', '480p', '320p', '240p'].find(i => json[i] && json[i].length);
        const metadata = JSON.parse(res.$('#container>script[type="application/ld+json"]:nth-child(2)').html());

        let duration = metadata.duration;
        const [, , hours, minutes, seconds] = duration.match(/PT((\d+)H)?(\d+)M(\d+)S/);
        duration = (hours ? hours * 60 * 60 : 0) + minutes * 60 + seconds * 1;

        Object.assign(info, {
          id: res.request.uri.href.match(/(spankbang).com\/([a-z0-9]+)\/video\//)[2],
          title: metadata.name,
          uploader: res.$('#video>div>h1>a[href^="/s/"]').toArray().map(i => res.$(i).text()).join(),
          duration: json.length,
          videoHLS: json.m3u8[0],
          videoDirect: json[bestSize][0],
          chapters: JSON.stringify(res.$('.positions>li[onclick]').toArray().map(i => {
            return {
              title: res.$(i).text(),
              start: res.$(i).attr('data-timestamp') * 1000
            };
          }))
        });
      } catch (error) {
        console.log(error);
      }
      return info;
    },
    link: id => `https://spankbang.com/${id}/video/`,
    test: {
      url: 'https://spankbang.com/4i12w/video/',
      name: 'SpankBang',
      id: '4i12w',
      title: 'AJ Night',
      uploader: 'abigaile johnson',
      duration: 2786,
      videoHLS: /hls.sb-cd.com\/hls\/.*?\/master.m3u8/,
      videoDirect: /.sb-cd.com\/.*?-1080p.mp4/,
      chapters: '[{"title":"blowjob","start":1614000},{"title":"missionary","start":1878000},{"title":"doggy","start":2094000},{"title":"missionary","start":2382000}]'
    }
  },
  { // TNAFlix
    name: 'TNAFlix',
    filter: /(tnaflix.com)\/hd-videos(\/[^/]+)?\/video(?<id>\d+)/,
    getInfo: {
      id: res => res.request.uri.href.match(/(tnaflix.com)\/hd-videos(\/[^/]+)?\/video(?<id>\d+)/).groups.id,
      title: ['[property="og:title"]', 'content'],
      uploader: ['.avatar-link>img', 'alt'],
      duration: res => {
        const duration = res.$('[itemprop="duration"]').attr('content');
        const [, , hours, minutes, seconds] = duration.match(/T((\d+)H)?(\d+)M(\d+)S/);
        return (hours ? hours * 60 * 60 : 0) + minutes * 60 + seconds * 1;
      },
      videoDirect: async res => {
        const site = 'tnaflix';
        const vkey = res.$('#ajax_content #vkey').val();
        const nkey = res.$('#ajax_content #nkey').val();
        const VID = res.$('#ajax_content #VID').val();
        const thumb = res.$('#ajax_content #thumb').val();

        const res1 = await req(`https://cdn-fck.${site}.com/${site}/${vkey}${site === 'empflix' ? '-1' : ''}.fid?key=${nkey}&VID=${VID}&nomp4=1&catID=0&rollover=1&startThumb=${thumb}&embed=0&utm_source=0&multiview=0&premium=1&country=0user=0&vip=1&cd=0&ref=0&alpha`);
        const items = res1.$('quality>item').toArray().map(i => {
          return ({
            res: res1.$(i).find('res').text(),
            dl: res1.$(i).find('videoLinkDownload').html().match(/<!--\[CDATA\[(.*?)\]\]-->/)[1]
          });
        });
        return 'https:' + items.sort((a, b) => -Math.sign(a.res.match(/^(\d+)/)[1] - b.res.match(/^(\d+)/)[1]))[0].dl;
      }
    },
    link: id => `https://www.tnaflix.com/hd-videos/video${id}`,
    test: {
      url: 'https://www.tnaflix.com/hd-videos/video4845881',
      name: 'TNAFlix',
      id: '4845881',
      title: 'PNME-79',
      uploader: 'aileen89',
      duration: 4009,
      videoDirect: /fck-cl\d+.tnaflix.com\/dl\/.*?.mp4/
    }
  },
  { // Netflav
    name: 'Netflav',
    filter: /(netflav.com)\/video\?id=(?<id>[a-zA-Z0-9]+)/,
    beforeGetInfo: res => JSON.parse(res.$('#__NEXT_DATA__').html()),
    getInfo: {
      id: (res, json) => json.query.id, // res.request.uri.href.match(/(netflav.com)\/video\?id=(?<id>[a-zA-Z0-9]+)/).groups.id
      title: (res, json) => json.props.initialState.video.data.title,
      uploader: (res, json) => json.props.initialState.video.data.actors.filter(i => i.startsWith('jp:')).map(i => i.substr(3)).join(','),
      duration: (res, json) => json.props.initialState.video.data.duration.match(/\d+/)[0],
      videoDirect: async (res, json) => {
        const res1 = await req({
          method: 'POST',
          uri: `https://www.avple.video/api/source/${json.props.initialState.video.data.src.match(/\/v\/(.*)/)[1]}`,
          form: {
            r: `https://netflav.com/video?id=${json.query.id}`,
            d: 'www.avple.video'
          }
        });
        let url = res1.json.data.sort((a, b) => -Math.sign(a.label.match(/^(\d+)/)[1] - b.label.match(/^(\d+)/)[1]));
        url = url[0].file;

        const res2 = await req.head(url);
        return res2.request.uri.href;
      }
    },
    link: id => `https://www.tnaflix.com/hd-videos/video${id}`,
    test: {
      url: 'https://netflav.com/video?id=XtwPK2ISMr',
      name: 'Netflav',
      id: 'XtwPK2ISMr',
      title: /SW-448/,
      uploader: '相澤ゆりな,埴生みこ,あず希',
      duration: '198',
      videoDirect: /www\d+.ff-\d+.com\/token=.*?\/(?<timestamp>\d+)\/(?<ip>[\d.]+)\/.*?.mp4/
    }
  },

  // 示例
  { // puppeteer-demo
    name: 'puppeteer-demo',
    // filter: /pornhub.com\/view_video.php\?viewkey=([a-z0-9]+)/,
    puppeteer: true,
    beforeLoad: async page => {
      await page.setCookie(...[
        {
          name: 'fanClubInfoPop',
          value: '1',
          domain: '.ph666.me',
          path: '/',
          httpOnly: false,
          secure: true
        },
        {
          name: 'authToken',
          value: '2bd7671dcc71be9d',
          domain: '.ph666.me',
          path: '/',
          httpOnly: false,
          secure: false
        },
        {
          name: '__cfduid',
          value: 'd3f9a622ca3dbf5daf8dc927a4866465e1603711336',
          domain: '.ph666.me',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'Lax'
        }
      ]);
      // await page.setRequestInterception(true);
      // await page.tracing.start({ path: 'trace.json' });
      // page.on('request', interceptedRequest => {
      //   interceptedRequest.continue();
      // });
    },
    getInfo: async (page, url) => {
      // await page.tracing.stop();
      // const html = await page.content();
      // fs.writeFileSync('./1.html', html);
      const flashvars = await page.evaluate(function () {
        const key = Object.keys(window).filter(i => String(i).startsWith('flashvars_'));
        return window[key];
      });
      return {
        id: url.match(/(pornhub.com|pornhubpremium.com|ph666.me)\/view_video.php\?viewkey=([a-z0-9]+)/)[2],
        title: flashvars.video_title,
        // uploader: $('.video-detailed-info>.userRow>.userInfo>.usernameWrap a').text(),
        duration: flashvars.video_duration,
        videoHLS: flashvars.mediaDefinitions.sort((a, b) => -Math.sign(a.quality - b.quality)).find(i => i.format === 'hls').videoUrl
        // videoDirect: flashvars.mediaDefinitions.sort((a, b) => -Math.sign(a.quality - b.quality)).find(i => i.format === 'mp4').videoUrl
      };
    },
    link: id => `https://cn.pornhub.com/view_video.php?viewkey=${id}`,
    test: {
      url: 'https://cn.pornhub.com/view_video.php?viewkey=ph5fba7f726d0b5',
      name: 'puppeteer-demo',
      id: 'ph5fba7f726d0b5',
      title: '黑丝袜美女酒店狗狗做爱',
      uploader: 'Harvey2258',
      duration: '595',
      videoHLS: /phncdn.com\/hls\/videos\/.*?\/master.m3u8/
      // videoDirect: /phncdn.com\/videos\/.*?.mp4/
    }
  }
];
const main = async () => {
  req.config.init(config.reqConfig);

  program.version('1.1.0').description('download video according to list');
  program.option('-c, --config <path>', 'path of config.json to read', (file) => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      Object.assign(config, JSON.parse(content));
      req.config.init(config.reqConfig);
    } catch (error) {
      console.log(`Error:\t${error}`);
      process.exit(-1);
    }
  });
  program.option('--no-retry-exceedLimit', 'DON\'T retry exceedLimit.txt');
  program.option('--retry-checkFailed', 'retry checkFailed.txt');
  program.option('--retry-failed', 'retry failed.txt');
  program.option('--no-puppeteer', 'DISABLE puppeteer', () => {
    libs = libs.filter(i => !i.puppeteer);
  });
  program.command('run [urls...]', { isDefault: true }).action(async (urls) => {
    list = urls.concat(fs.readFileSync(config.listFiles.list, 'utf-8').split(/\r*\n/));
    if (program.retryExceedLimit && fs.existsSync(config.listFiles.exceedLimit)) {
      list = [].concat(fs.readFileSync(config.listFiles.exceedLimit, 'utf-8').split(/\r*\n/), list);
      fs.unlinkSync(config.listFiles.exceedLimit);
    }
    if (program.retryCheckFailed && fs.existsSync(config.listFiles.checkFailed)) {
      list = [].concat(list, fs.readFileSync(config.listFiles.checkFailed, 'utf-8').split(/\r*\n/));
      fs.unlinkSync(config.listFiles.checkFailed);
    }
    if (program.retryFailed && fs.existsSync(config.listFiles.failed)) {
      list = [].concat(list, fs.readFileSync(config.listFiles.failed, 'utf-8').split(/\r*\n/));
      fs.unlinkSync(config.listFiles.failed);
    }

    console.log(`Total:\t${list.length}`);
    process.once('SIGINT', doExit);

    for (let i = 0; i < list.length; i++) {
      const url = list[i];
      if (!url || !url.trim().match(/^https?:/i)) continue;
      console.log('\n- - - - - - - - - - -\n');
      console.log(`Url-${i}/${list.length}:\t${url}`);

      let info;
      const $libs = libs.filter(i => i.filter && url.match(i.filter));
      for (const lib of $libs) {
        const $info = Object.assign({ name: lib.name, tryOtherLib: lib.tryOtherLib }, await getRemoteInfo(url, lib));
        const error = $info.failed || $info.exceedLimit;
        const success = $info.id && ($info.videoHLS || $info.videoDirect);
        if ((error && !$info.tryOtherLib) || success) {
          info = $info;
          break;
        }
      }
      info = info || {};

      // 检查视频信息完整性
      if (info.failed) {
        console.error('Error:\tGet Info Failed');
        succeedList.push(url);
        fs.appendFileSync(config.listFiles.failed, url + '\n');
        continue;
      } else if (info.exceedLimit) {
        console.error('Error:\texceedLimit');
        succeedList.push(url);
        fs.appendFileSync(config.listFiles.exceedLimit, url + '\n');
        continue;
      } else if (!info.id || (!info.videoHLS && !info.videoDirect)) {
        console.error(`Error:\tNo Enough Info [${['id', 'videoHLS', 'videoDirect'].filter(i => !(i in info) || !info[i]).join()}]`);
        continue;
      }

      const filename = `[${info.name}][${info.id}][${info.uploader ? info.uploader.trim() : 'null'}]${info.title.trim()}`.replace(/[\\/:*?"<>|]/g, '-').substr(0, 200 - config.workDir.length); // .normalize('NFKD').replace(/[\u0300-\u036F]/g, '')
      console.log(`File-${i}/${list.length}:\t${filename}`);

      // 下载前检查
      let file = getSimilarFile(info) || path.join(config.workDir, filename + '.mp4');
      if (fs.existsSync(file)) {
        const check = info.duration ? await checkDurationVideo(info.duration, file) : (info.videoHLS ? await checkDurationHLS(info.videoHLS, file) : null);
        console.log(`Check-${i}:\t${check}`);
        if (check === true) {
          succeedList.push(url);
          continue;
        } else if (check === false) {
          if (config.checkDurationFailed === 'retry') {
            fs.renameSync(file, path.join(config.workDir, '###Duration-' + filename + '.mp4'));
          } else if (config.checkDurationFailed === 'skip') {
            succeedList.push(url);
            fs.appendFileSync(config.listFiles.checkFailed, url + '\n');
            continue;
          }
        } else {
          continue;
        }
      }

      // 下载
      let downloadError;
      if (info.videoHLS && (!info.videoDirect || ['hls', 'auto'].includes(config.downloadMode))) {
        downloadError = await downloadWith.HLS(info, filename, url);
      } else if (info.videoDirect && (!info.videoHLS || ['direct'].includes(config.downloadMode))) {
        downloadError = await downloadWith.Direct(info, filename, url);
      }
      if (downloadError) continue;

      // 下载后检查
      file = getSimilarFile(info) || path.join(config.workDir, filename + '.mp4');
      if (fs.existsSync(file)) {
        const check = info.duration ? await checkDurationVideo(info.duration, file) : (info.videoHLS ? await checkDurationHLS(info.videoHLS, file) : null);
        console.log(`Check-${i}:\t${check}`);
        if (check === true) {
          succeedList.push(url);
          if (info.chapters) {
            fs.writeFileSync('./ffmetadata', [
              ';FFMETADATA1',
              `title=${info.title}`,
              `artist=${info.uploader}`,
              '',
              ...JSON.parse(info.chapters).map(i => {
                return `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${i.start}\nEND=${i.start}\ntitle=${i.title}\n`;
              })
            ].join('\n'));
            const pathInfo = path.parse(file);

            let order = 1;
            let fileNew;
            do {
              fileNew = path.join(pathInfo.dir, `${pathInfo.name}[${order}]${pathInfo.ext}`);
              order++;
            } while (fs.existsSync(fileNew));
            const end = await spawnSync(config.executable.ffmpeg, ['-hide_banner', '-loglevel', 'panic', '-i', file, '-i', 'ffmetadata', '-map_metadata', '1', '-codec', 'copy', fileNew]);
            fs.unlinkSync('./ffmetadata');
            if (end === 'error') {
              if (fs.existsSync(fileNew)) fs.unlinkSync(fileNew);
            } else if (end === true) {
              fs.unlinkSync(file);
              fs.renameSync(fileNew, file);
            }
          }
        }
      }
    }

    doExit();
  });
  program.command('test [names...]').description('test libs that filtered by names').action(async (names) => {
    const $libs = names.length ? libs.filter(i => names.some(j => i.name.match(j))) : libs;
    for (const lib of $libs) {
      console.log('\n- - - - - - - - - - -\n');
      if (!lib.test) {
        console.error(`Error:\tNo "test" in "${lib.name}"`);
        continue;
      }

      console.log(`Note:\tChecking ${lib.name}`);
      const url = lib.test.url;
      if (!url) {
        console.error(`Error:\tNo "url" in "${lib.name}" when "test"`);
        continue;
      }

      const info = Object.assign({ name: lib.name }, await getRemoteInfo(url, lib));
      for (const key in info) {
        const value = info[key];
        const prefer = lib.test[key];
        let valid = false;
        if (typeof value === 'undefined' || typeof prefer === 'undefined') {
          valid = false;
        } else if (typeof value === 'string' && prefer instanceof RegExp) {
          valid = value.match(prefer);
        } else {
          valid = value === prefer;
        }
        if (!valid) {
          console.error(`Error:\t"${lib.name}" "${key}" Failed/Changed`);
          console.error(`Value:\t${value}`);
          console.error(`Prefer:\t${prefer}`);
        }
      }
    }
  });
  program.command('link <output> <directories...>').description('generator links from files under directories').option('-r, --recursive', 'recursively').action(async (output, directories, cmdObj) => {
    const list = [];
    for (const directory of directories) {
      const files = walk(directory, { recursive: cmdObj.recursive, nodir: true, matchFile: /\.(mp4|ts)$/i });
      for (const file of files) {
        const basename = path.basename(file);
        if (!basename.match(/^\[(?<name>[^[\]]+)\]\[(?<id>[^[\]]+)\]/)) continue;
        const { name, id } = basename.match(/^\[(?<name>[^[\]]+)\]\[(?<id>[^[\]]+)\]/).groups;

        const lib = libs.find(i => i.name === name);
        if (!lib.link) continue;

        list.push(await lib.link(id));
      }
    }
    fs.appendFileSync(output, '\n' + list.join('\n') + '\n');
  });
  await program.parseAsync(process.argv);
};

main().then(async () => {
  doExit();
  //
}, async err => {
  console.error(err);
  doExit();
});
