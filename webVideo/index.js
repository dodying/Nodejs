// ==Headers==
// @Name:               webVideo
// @Description:        根据list.txt下载网页视频（主要是NSFW）
// @Version:            1.1.0
// @Author:             dodying
// @Created:            2020-10-27 15:58:28
// @Modified:           2020/12/28 21:03:07
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            cheerio,commander,crypto-js,m3u8-parser,puppeteer
// ==/Headers==

// 设置
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const config = {
  workDir: 'E:\\Downloads\\Torrents\\###1\\###m3u8',
  format: ['.mp4', '.avi', '.ts', '.mkv', '.wmv'].concat(['.asf', '.asx', '.bik', '.divx', '.flv', '.ifo', '.mov', '.mpe', '.mpeg', '.mpg', '.mpg4', '.ogm', '.qt', '.rm', '.rmv', '.rmvb', '.smk', '.vob', '.wm', '.xvid']),
  executable: {
    'N_m3u8DL-CLI': 'm3u8.exe', // https://github.com/nilaoda/N_m3u8DL-CLI
    aria2c: 'aria2c.exe', // 支持更多选项
    IDMan: 'D:\\GreenSoftware\\_Basis\\Internet Download Manager\\Bin\\IDMan.exe' // 可视化
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
    withProxy: ['.pornhub.com'], // '.*'
    withoutProxy: ['ph666.me'], // , '.m3u8', '.hls'
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
    // https://github.com/puppeteer/puppeteer/blob/main/examples/proxy.js
    if (!browser) browser = await puppeteer.launch({ args: [`--proxy-server=${config.reqConfig.proxy}`] });
    const page = await browser.newPage();
    if (lib.beforeLoad && typeof lib.beforeLoad === 'function') await lib.beforeLoad(page, url);
    let res;
    try {
      res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60 * 1000 });
    } catch (error) {
      console.error(error);
    }

    if (res && res.ok()) {
      try {
        info = await lib.getInfo(page, url);
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
      console.error(`Error:\tbeforeGetInfo Failed when "${url}"`);
      return info;
    }
    if (typeof lib.getInfo === 'function') {
      try {
        info = await lib.getInfo(res, valueToGetInfo);
      } catch (error) {
        console.error(`Error:\tgetInfo Failed when "${url}"`);
      }
    } else {
      for (const key in lib.getInfo) {
        if (typeof lib.getInfo[key] === 'function') {
          try {
            info[key] = await lib.getInfo[key](res, valueToGetInfo);
          } catch (error) {
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
        '--check-certificate=false', (url.match(config.reqConfig.withProxy) && !url.match(config.reqConfig.withoutProxy) ? `--all-proxy=${config.proxyHTTP}` : ''),
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
      beforeLoad: async function(page, url); // 当使用无头浏览器时，载入页面前运行
      getInfo: async function(page, url) => Info;

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

      // 特殊的
      failed // 失败，如视频被删等情况
      exceedLimit // 超过限制，下次运行时再次尝试
      tryOtherLib // 如果失败/超过限制，当tryOtherLib为true时，尝试其他规则，否则跳过该视频
    }
    // 文件一般命名为 [name][id][uploader]title
   */

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
      videoDirect: /xvideos-cdn.com\/videos\/mp4\/.*?\/.*?.mp4/
    }
  },
  { // papapa.info
    name: 'papapa.info',
    filter: /(papapa.info|yase1.xyz)\/vod\/play\/id\/(\d+)/,
    beforeGetInfo: res => res.request.uri.href.match(/(papapa.info|yase1.xyz)\/vod\/play\/id\/(\d+)/)[2],
    getInfo: {
      id: (res, id) => id,
      title: '.video-title>h1',
      uploader: '.hr-director+a[href*="/director/"]',
      videoHLS: async (res, id) => {
        const res1 = await req(`https://papapa.info/vod/getPlayUrl?id=${id}&is_win=true`, {
          check: res => {
            try {
              const json = JSON.parse(res.body);
              return json.data;
            } catch (error) {}
          }
        });
        // console.log(res1.json);
        // process.exit()
        return res1.json.data.url;
      }
    },
    link: id => `https://papapa.info/vod/play/id/${id}/sid/1/nid/1.html`,
    test: {
      url: 'https://papapa.info/vod/play/id/100/sid/1/nid/1.html',
      name: 'papapa.info',
      id: '100',
      title: '带验证，匆匆忙忙拍的，下次改进吧',
      uploader: 'Lareine',
      videoHLS: /papapa.info\/video\/complete\/.*?\/index.m3u8/
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
        uploader: $('.video-detailed-info .userInfo .usernameBadgesWrapper>a').text(),
        duration: flashvars.video_duration,
        videoHLS: flashvars.mediaDefinitions.sort((a, b) => -Math.sign(a.quality - b.quality)).find(i => i.format === 'hls').videoUrl,
        videoDirect: flashvars.mediaDefinitions.sort((a, b) => -Math.sign(a.quality - b.quality)).find(i => i.format === 'mp4').videoUrl
      };
    },
    link: id => `https://cn.pornhub.com/view_video.php?viewkey=${id}`,
    test: {
      url: 'https://cn.pornhub.com/view_video.php?viewkey=ph5fba7f726d0b5',
      name: 'pornhub',
      id: 'ph5fba7f726d0b5',
      title: '黑丝袜美女酒店狗狗做爱',
      uploader: 'Harvey2258',
      duration: '595',
      videoHLS: /phncdn.com\/hls\/videos\/.*?\/master.m3u8/,
      videoDirect: /phncdn.com\/videos\/.*?.mp4/
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
      url: 'https://ph666.me/view_video.php?viewkey=ph5f1d654ec4d3a',
      name: 'pornhub',
      id: 'ph5f1d654ec4d3a',
      title: '5个付费视频合集（非更新，请勿重复购买！仅为方便代付使用）',
      uploader: 'xiao e',
      duration: '5662',
      videoHLS: /phprcdn.com\/hls\/videos\/.*?\/master.m3u8/,
      videoDirect: /phprcdn.com\/videos\/.*?.mp4/
    }
  },

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
      videoDirect: /91p52.com\/\/mp43\/116241.mp4/
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
          const script = res.$('#player_one>script').html().match(/strencode\(.*?\)/)[1];
          const res1 = await req({ uri: 'https://91porn.com/js/m.js', cache: true });
          const html = eval(`(function (){const window = {};${res1.body};return ${script}})();`); // eslint-disable-line no-eval
          return html.match(/src='(.*?)'/)[1];
        } catch (error) {
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
      videoDirect: /91p52.com\/\/mp43\/116241.mp4/
    }
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
      videoDirect: /daxab.com\/videos\/-31257429\/456239254\/720.mp4\?extra=.*/
    }
  },
  { // xHamster
    name: 'xHamster',
    filter: /(xhamster.com)\/videos\/[^/]*(\d+)/,
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
      url: 'https://xhamster.com/videos/3263960',
      name: 'xHamster',
      id: '3263960',
      title: 'kinpatu86-0002 hd',
      uploader: 'notaprofessional',
      duration: 2044,
      videoHLS: /xhamster.com\/video-hls\/m3u8\/\d+\/a.m3u8/,
      videoDirect: /cdn\d+.com\/.*?\/720p.h264.mp4/
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
          videoDirect: json[bestSize][0]
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
      videoDirect: /.sb-cd.com\/.*?-1080p.mp4/
    }
  },
  { // 3atv.cc
    name: '3atv.cc',
    filter: /(3atv.cc|3a\d+.com|app\d+.com)\/play\/(\d+)-1-1.html/,
    getInfo: {
      id: res => res.request.uri.href.match(/(3atv.cc|3a\d+.com|app\d+.com)\/play\/(\d+)-1-1.html/)[2],
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
    link: id => `http://3atv.cc/play/${id}-1-1.html`,
    test: {
      url: 'http://3atv.cc/play/9921-1-1.html',
      name: '3atv.cc',
      id: '9921',
      title: 'c2020121_6',
      videoHLS: /index.m3u8/
    }
  },
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
        // uploader: $('.video-detailed-info .userInfo .usernameBadgesWrapper>a').text(),
        duration: flashvars.video_duration,
        videoHLS: flashvars.mediaDefinitions.sort((a, b) => -Math.sign(a.quality - b.quality)).find(i => i.format === 'hls').videoUrl,
        videoDirect: flashvars.mediaDefinitions.sort((a, b) => -Math.sign(a.quality - b.quality)).find(i => i.format === 'mp4').videoUrl
      };
    },
    link: id => `https://cn.pornhub.com/view_video.php?viewkey=${id}`,
    test: {
      url: 'https://cn.pornhub.com/view_video.php?viewkey=ph5fba7f726d0b5',
      name: 'puppeteer-demo',
      id: 'ph5fba7f726d0b5',
      title: '黑丝袜美女酒店狗狗做爱',
      uploader: 'Harvey2258',
      videoHLS: /phncdn.com\/hls\/videos\/.*?\/master.m3u8/,
      videoDirect: /phncdn.com\/videos\/.*?.mp4/
    }
  }
];
const main = async () => {
  req.config.init(config.reqConfig);

  program.version('0.0.1').description('download video according to list');
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

      const filename = `[${info.name}][${info.id}][${info.uploader ? info.uploader.trim() : 'null'}]${info.title.trim()}`.replace(/[\\/:*?"<>|]/g, '-'); // .normalize('NFKD').replace(/[\u0300-\u036F]/g, '')
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
      if (!info.videoDirect || ['hls', 'auto'].includes(config.downloadMode)) {
        downloadError = await downloadWith.HLS(info, filename, url);
      } else if (!info.videoHLS || ['direct'].includes(config.downloadMode)) {
        downloadError = await downloadWith.Direct(info, filename, url);
      }
      if (downloadError) continue;

      // 下载后检查
      file = getSimilarFile(info) || path.join(config.workDir, filename + '.mp4');
      if (fs.existsSync(file)) {
        const check = info.duration ? await checkDurationVideo(info.duration, file) : (info.videoHLS ? await checkDurationHLS(info.videoHLS, file) : null);
        console.log(`Check-${i}:\t${check}`);
        if (check === true) succeedList.push(url);
      }
    }

    doExit();
  });
  program.command('test [names...]').description('test libs that filtered by names').action(async (names) => {
    const $libs = names.length ? libs.filter(i => names.some(j => i.name.match(j))) : libs;
    for (const lib of $libs) {
      if (!lib.test) {
        console.error(`Error:\tNo "test" in "${lib.name}"`);
        continue;
      }

      console.log(`Note:\tChecking ${lib.name}`);
      const url = lib.test.url;
      const info = Object.assign({ name: lib.name }, await getRemoteInfo(url, lib));
      for (const key in info) {
        const value = info[key];
        const prefer = lib.test[key];
        let valid = false;
        if (typeof value === 'undefined' || typeof prefer === 'undefined') {
          valid = false;
        } else if (typeof prefer === 'string' || typeof prefer === 'number') {
          valid = value === prefer;
        } else if (prefer instanceof RegExp) {
          valid = value.match(prefer);
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

        list.push(lib.link(id));
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
