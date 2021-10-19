// ==Headers==
// @Name:               avRenamer
// @Description:        将文件夹下的不可描述视频按规则分类并命名
// @Version:            1.1.295
// @Author:             dodying
// @Modified:           2020/10/6 23:11:33
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            cheerio,fs-extra,iconv-lite,readline-sync,request-promise,socks5-http-client,socks5-https-client
// ==/Headers==

// usage: [options]
//  options:
//    -q                passive mode
//    -t [keyword]      test selectors of libs

// 设置
const _ = require('./config');

// 导入原生模块
const path = require('path');
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

const jar = request.jar();
let uriLast = null;
jar.setCookie(request.cookie('acc_accept_lang=japanese'), 'https://www.xxx-av.com');
jar.setCookie(request.cookie('adc=1'), 'https://www.mgstage.com');

// Function
const libs = [
  { // 一本道
    id: '1Pondo',
    keyword: ['一本道', /1Pondo/i], // 匹配搜索结果 // null（省略）则视为不匹配
    // keywordIgnore: [], // 匹配搜索结果，匹配则过滤
    name: [/1pon/i], // 匹配文件名 // null（省略）则视为匹配（与keyword不同）
    // nameIgnore: [], // 匹配文件名结果，匹配则过滤
    censored: 'Uncensored', // 用于getCensored
    test: '011516_227', // 用于测试valid/getInfo是否正确
    valid: async (name) => { // 根据id生成目标网站
      let id = name.match(/\d{6}[-_]\d{3}/);
      if (!id) return;
      id = id[0].replace('-', '_');
      return `https://www.1pondo.tv/dyn/phpauto/movie_details/movie_id/${id}.json`;
    },
    getInfo: {
      /**
       * string/array
       * 顺序为 selector, attribute = 'text', match = /(.*)/[1]
       *
       * function
       * 参数为 res, $, data
       */
      // ?getData async function => data
      id: (res) => JSON.parse(res.body).MovieID, // id
      title: (res) => JSON.parse(res.body).Title, // 标题
      cover: (res) => JSON.parse(res.body).ThumbHigh, // 封面
      censored: () => 'Uncensored', // 码
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
    id: 'CaribPr',
    keyword: ['加勒比PPV', 'カリブPPV', 'cappv', /Caribpr/i, /caribbeancompr/i, /Caribbeancom Premium/i, 'カリビアンコム プレミアム'],
    name: [/Caribpr/i],
    censored: 'Uncensored',
    test: '100618_002',
    valid: async (name) => {
      let id = name.match(/\d{6}[-_]\d{3}/);
      if (!id) return;
      id = id[0].replace('-', '_');
      return `https://www.caribbeancompr.com/moviepages/${id}/index.html`;
    },
    getInfo: {
      id: (res) => res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1],
      title: '.heading>h1', // '.video-detail>h1',
      cover: (res) => `/moviepages/${res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1]}/images/l_l.jpg`,
      censored: () => 'Uncensored',
      preview: ['.fancy-gallery:not([data-is_sample="0"])', 'href'],
      actor: '.movie-spec:contains("出演")>.spec-content a',
      release: '.movie-spec:contains("販売日")>.spec-content',
      duration: '.movie-spec:contains("再生時間")>.spec-content',
      genre: '.movie-spec:contains("タグ")>.spec-content a',
      studio: '.movie-spec:contains("スタジオ")>.spec-content',
      related: ['.movie-related .meta-title>a', 'href', /moviepages\/(.*?)\/index/],
    },
  },
  { // 加勒比
    id: 'Carib',
    keyword: ['加勒比', /Carib/i, 'カリビアンコム'],
    name: [/Carib/i],
    censored: 'Uncensored',
    test: '100716-275',
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
      censored: () => 'Uncensored',
      actor: '.movie-info ul>li:contains("出演")>.spec-content a',
      release: '.movie-info ul>li:contains("配信日")>.spec-content',
      duration: '.movie-info ul>li:contains("再生時間")>.spec-content',
      genre: '.movie-info ul>li:contains("タグ")>.spec-content a',
      related: ['.movie-related .media-thum>a', 'href', /moviepages\/(.*?)\/index/],
    },
  },
  { // Heyzo
    id: 'Heyzo',
    keyword: [/Heyzo/i],
    name: [/Heyzo/i],
    censored: 'Uncensored',
    test: 'heyzo-1426',
    valid: async (name) => {
      let id = name.match(/\d{4}/);
      if (!id) return;
      id = id[0];
      return `http://www.heyzo.com/moviepages/${id}/index.html`;
    },
    getInfo: {
      id: (res) => `HEYZO-${res.request.uri.href.match(/moviepages\/(.*?)\/index.html/)[1]}`,
      title: '#movie>h1',
      cover: ['[property="og:image"]', 'content'],
      preview: async (res, $) => {
        if (_.image !== 2) return;
        let uris = res.body.match(/document.write\('<img src="(\/contents.*?)"/g);
        if (!uris) return [];
        uris = uris.map((i) => i.match(/document.write\('<img src="(\/contents.*?)"/)[1]).map((i) => new URL(i.replace('/member/', '/').replace('/thumbnail_', '/'), res.request.uri.href).href);
        for (let i = 0; i < uris.length; i++) {
          const uri = uris[i];
          const res = await req({
            method: 'HEAD',
            uri,
          });
          if (res.request.uri.href === 'https://www.heyzo.com/index2.html') return uris.splice(0, i);
        }
      },
      censored: () => 'Uncensored',
      actor: '.table-actor a',
      rating: '[itemprop="ratingValue"]',
      release: '.table-release-day>td:nth-child(2)',
      duration: (res) => res.body.match(/"duration":"(.*?)",/)[1],
      genre: '.table-actor-type a,.tag-keyword-list a',
    },
  },
  { // TokyoHot
    id: 'TokyoHot',
    keyword: [/Tokyo[-\s_]*Hot/i, '東京熱', '东京热'],
    name: [/Tokyo[-\s_]*Hot/i, /^n\d{4}$/i],
    censored: 'Uncensored',
    test: 'n1120',
    valid: async (name) => {
      let id = name.match(/\d{4}/);
      if (!id) return;
      id = id[0];
      const uri = `https://my.tokyo-hot.com/product/?q=n${id}`;
      const res = await req(uri);
      const $ = cheerio.load(res.body);
      return `${(new URL($(`.detail:contains(${id})>a`).attr('href'), uri)).href}?lang=ja`;
    },
    getInfo: {
      id: '.info>dt:contains("作品番号")+dd',
      title: '.contents>h2',
      cover: ['video', 'poster'],
      preview: ['.scap a', 'href'],
      censored: () => 'Uncensored',
      actor: '.info>dt:contains("出演者")+dd>a',
      release: '.info>dt:contains("配信開始日")+dd',
      duration: '.info>dt:contains("収録時間")+dd',
      genre: '.info>dt:contains("プレイ内容")+dd>a,.info>dt:contains("タグ")+dd>a',
      label: '.info>dt:contains("レーベル")+dd',
    },
  },
  { // 10musume
    id: '10musume',
    keyword: [/10musume/i, '天然むすめ'],
    name: [/10mu/i],
    censored: 'Uncensored',
    test: '011618_01',
    valid: async (name) => { // 同一本道
      let id = name.match(/\d{6}[-_]\d{2}/);
      if (!id) return;
      id = id[0].replace('-', '_');
      return `https://www.10musume.com/dyn/phpauto/movie_details/movie_id/${id}.json`;
    },
    getInfo: { // 同一本道
      id: (res) => JSON.parse(res.body).MovieID,
      title: (res) => JSON.parse(res.body).Title,
      cover: (res) => JSON.parse(res.body).ThumbHigh,
      censored: () => 'Uncensored',
      actor: (res) => JSON.parse(res.body).ActressesJa.sort().join(),
      rating: (res) => JSON.parse(res.body).AvgRating,
      release: (res) => JSON.parse(res.body).Release,
      duration: (res) => formatTime(JSON.parse(res.body).Duration),
      genre: (res) => JSON.parse(res.body).UCNAME,
    },
  },
  { // Pacopacomama
    id: 'Pacopacomama',
    keyword: [/Pacopacomama/i, /paco[-\s_]+/i, '파코', 'パコ', 'パコパコママ'],
    name: [/paco/i],
    censored: 'Uncensored',
    test: '051518_272',
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
      censored: () => 'Uncensored',
      actor: (res, $) => $('.detail-info table tr:contains("名前")>td:nth-child(2)>a').text().split(/\s+/),
      release: ['.detail-info-l .date', 'text', /配信日:\s+(\d+.*?)\s+/],
      duration: ['.detail-info-l .date', 'text', /再生時間:\s+(\d+.*?)\s+/],
      genre: '.detail-info table tr:contains("カテゴリー")>td:nth-child(2)>a',
    },
  },
  { // FC2PPV
    id: 'FC2PPV',
    keyword: [/fc2[-_\s]*ppv/i],
    name: [/fc2[-_\s]*ppv/i],
    censored: 'FC2',
    test: 'FC2PPV-994320',
    valid: async (name) => {
      let id = name.match(/fc2[-_\s]*ppv[-_\s]*(\d+)/i);
      if (!id) return;
      id = id[1];
      return `https://adult.contents.fc2.com/article/${id}/`;
    },
    getInfo: {
      id: (res, $) => `FC2PPV-${JSON.parse($('script[type="application/ld+json"]').html()).productID}`,
      title: (res, $) => JSON.parse($('script[type="application/ld+json"]').html()).name,
      cover: (res, $) => JSON.parse($('script[type="application/ld+json"]').html()).image.url,
      preview: ['.items_article_SampleImagesArea img', 'src'],
      censored: () => 'FC2',
      actor: '.items_comment_sellerBox>div h4>a',
      release: ['.items_article_Releasedate', 'text', /([\d/]+)/],
      duration: '.items_article_info',
    },
  },
  { // AVEntertainments // TODO FIX
    id: 'AVEntertainments',
    name: [/(CWP|DSAM|HEY|LAF|MXX|S2M|SM|SKY|MCB)(BD|HD|PT)?-\d+/i, /([A-Z])\1DV-\d+/i, /MKB?D-S\d+/, /(MC)DV-\d+/],
    censored: 'Uncensored',
    test: 'LLDV-37',
    valid: async (name) => {
      let id = name.match(/([a-z\d-]+)/i);
      if (!id) return;
      id = id[1];
      const [, $] = await getRes(`https://www.aventertainments.com/search_Products.aspx?languageID=2&dept_id=29&keyword=${id}&searchby=keyword`);
      const results = $('#ctl00_ContentPlaceHolder1_Rows5Items1_MyList>tbody>tr>td:has(table)').toArray().map((i) => ({
        text: $(i).find('tbody>tr:nth-child(2)>td>a').text(),
        id: $(i).find('tbody>tr:nth-child(2)>td').text().match(/番号:\s*([\w-]+)/)[1],
        link: $(i).find('tbody>tr:nth-child(2)>td>a').attr('href'),
      }));
      const result = results.find((i) => i.id === id);
      return result ? result.link : null;
    },
    getInfo: {
      id: ['.top-title', 'text', /番号:\s*([\w-]+)/],
      title: '#mini-tabet>h2',
      cover: ['[title="cover"]', 'onclick', /imagefile=(.*?)&Which/],
      preview: ['.TabbedPanelsContentVisible img', 'src'],
      censored: () => 'Uncensored',
      actor: '#titlebox>ul>li:contains("主演女優")>a',
      release: ['#titlebox>ul>li:contains("発売日")', 'text', /([\d/]+)/],
      duration: ['#titlebox>ul>li:contains("収録時間")', 'text', /(\d+)/],
      genre: '#detailbox a[href*="subdept"]',
      studio: '#titlebox>ul>li:contains("スタジオ")>a',
      related: '#ctl00_ContentPlaceHolder1_SeriesDataList a+br+a',
    },
  },
  { // xxx-av
    id: 'xxx-av',
    keyword: [/xxx[-\s]?av/i],
    name: [/xxx[-\s]?av/i],
    censored: 'Uncensored',
    test: 'xxx-av 23080',
    valid: async (name) => {
      let id = name.match(/\d+/);
      if (!id) return;
      id = id[0];
      return `https://www.xxx-av.com/mov/movie/${id}/`;
    },
    getInfo: {
      id: (res) => `xxx-av ${res.request.uri.href.match(/movie\/(\d+)\//)[1]}`,
      title: '.main_contents>.h02',
      cover: ['#streaming_player>img', 'src'],
      preview: ['.movie_sample_img a', 'href'],
      censored: () => 'Uncensored',
      actor: '.info_dl:contains("女優名")>dd a',
      release: '.info_dl:contains("公開日")>dd',
      duration: '.info_dl:contains("再生時間")>dd',
      genre: '.mov_keyword a',
    },
  },
  { // heydouga
    id: 'heydouga',
    keyword: [/heydouga/i, /Hey動画/i],
    name: [/hey(douga)?-\d+-\d+/i],
    censored: 'Uncensored',
    test: 'heydouga-4037-352',
    valid: async (name) => {
      const matched = name.match(/hey(douga)?-(\d+)-(\d+)/);
      if (!matched) return;
      return `https://www.heydouga.com/moviepages/${matched[2]}/${matched[3]}/index.html`;
    },
    getInfo: {
      id: (res) => `heydouga-${res.request.uri.href.match(/moviepages\/(\d+\/\d+)\//)[1].replace('/', '-')}`,
      title: '#title-bg',
      cover: (res) => `https://image01-www.heydouga.com/contents/${res.request.uri.href.match(/moviepages\/(\d+\/\d+)\//)[1]}/player_thumb.jpg`,
      censored: () => 'Uncensored',
      actor: '#movie-info>ul>li:contains("主演")>span:nth-child(2)>a',
      release: '#movie-info>ul>li:contains("配信日")>span:nth-child(2)',
      duration: ['#movie-info>ul>li:contains("再生時間")>span:nth-child(2)', 'text', /(\d+)/],
    },
  },
  { // MGStage
    id: 'MGStage',
    keyword: [/MGStage/i, /MGS動画/i],
    name: [/^\d{3}[a-z]{3,4}-\d{3,4}$/i, /^(SIRO)-\d+$/i],
    censored: 'Censored',
    test: '300MIUM-135', // '200GANA-1720'
    valid: async (name) => `https://www.mgstage.com/product/product_detail/${name.toUpperCase()}/`,
    getInfo: {
      id: '.detail_data>table tr:contains("品番")>td',
      title: 'h1.tag',
      cover: ['#EnlargeImage', 'href'],
      preview: ['.sample_image', 'href'],
      censored: () => 'Censored',
      actor: (res, $) => ($('.detail_data>table tr:contains("出演")>td>a').length ? $('.detail_data>table tr:contains("出演")>td>a') : $('.detail_data>table tr:contains("出演")>td')).toArray().map((i) => $(i).text().split(/\s*\d+歳/)[0]),
      release: '.detail_data>table tr:contains("配信開始日")>td',
      duration: ['.detail_data>table tr:contains("収録時間")>td', 'text', /(\d+)/],
      genre: '.detail_data>table tr:contains("ジャンル")>td>a',
      studio: '.detail_data>table tr:contains("メーカー")>td>a',
      rating: ['.detail_data>table tr:contains("評価")>td', 'text', /([\d.]+)/],
    },
  },
  { // SCute
    id: 'SCute',
    keyword: [/S-?Cute/i],
    name: [/scute-([a-z0-9]+_[a-z]+_\d+)/i],
    censored: 'Censored',
    test: 'scute-438_emiri_01',
    valid: async (name) => `https://www.s-cute.com/contents/${name.match(/scute-([a-z0-9]+_[a-z]+_\d+)/i)[1]}/`,
    getInfo: {
      id: (res) => `scute-${res.request.uri.href.match(/contents\/(.*?)\//)[1]}`,
      title: '.h1',
      cover: ['.video >div>div>a>img', 'src'],
      preview: ['.photos .my-item>a', 'href'],
      censored: () => 'Censored',
      actor: '.about-author>a>h5',
      release: ['.single-meta>div>.date', 'text', /([\d/]+)/],
      duration: ['.single-meta>div>.comment', 'text', /(\d+)/],
      genre: '.tags>a',
      studio: () => 'S-Cute',
    },
  },
  { // H4610
    id: 'H4610',
    keyword: [/エッチな(4610|0930)/, '人妻斬り', /(h|c)(4610|0930)-[a-z]+\d+/i],
    name: [/(h|c)(4610|0930)-[a-z]+\d+/i],
    censored: 'Uncensored',
    test: 'H4610-ori1693',
    valid: async (name) => {
      const arr = name.toLowerCase().split('-');
      return `https://www.${arr[0]}.com/moviepages/${arr[1]}/index.html`;
    },
    getInfo: {
      id: (res) => `${res.request.uri.host.match(/www\.(.*?)\.com/)[1].toUpperCase()}-${res.request.uri.href.match(/moviepages\/(.*?)\//)[1]}`,
      title: 'h1>span',
      cover: ['#movieContent', 'poster'],
      preview: (res, $) => res.body.match(/document.write\('<a href="(.*?)" target="_blank">/g).slice(-1).map((i) => i.match(/document.write\('<a href="(.*?)" target="_blank">/)[1]),
      censored: () => 'Uncensored',
      actor: ['h1>span', 'text', /(.*?)\s*\d+歳/],
      duration: '#movieInfo section>dl>dt:contains("動画")+dd',
      genre: (res, $) => $('#movieInfo section>dl>dt:contains("タイプ")+dd').text().split(/\s+/),
    },
  },
  // gachinco closed

  { // JavBus
    id: 'JavBus',
    nameIgnore: [/fc2[-_\s]*ppv/i, /xxx-av/i, /(h|c)(4610|0930)-[a-z]+\d+/i],
    test: 'MIFD-070',
    valid: async (name) => `https://www.javbus.com/${name}`,
    getInfo: {
      id: (res, $) => res.request.uri.href.split('/')[3].toUpperCase(),
      title: 'h3',
      cover: ['.bigImage img', 'src'],
      preview: ['.sample-box', 'href'],
      censored: (res, $) => ($('.active>a[href*="uncensored"]').length ? 'Uncensored' : 'Censored'),
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
  { // JavSir // TODO FIX
    id: 'JavSir',
    nameIgnore: [/fc2[-_\s]*ppv/i, /xxx-av/i, /(h|c)(4610|0930)-[a-z]+\d+/i],
    test: '091915_156',
    valid: async (name) => `https://www.javsir.com/dvd/${name}`,
    getInfo: {
      id: (res, $) => res.request.uri.href.split('/')[4].toUpperCase(),
      title: '.page-title',
      cover: ['.page-cover', 'src'],
      censored: (res, $) => {
        const studio = $('.page-content>.list-unstyled>li:contains("廠商")>a').text();
        return getCensored(studio) || 'Censored';
      },
      actor: '.page-content>.list-unstyled>li:contains("演員")>a',
      release: ['.page-content>.list-unstyled>li:contains("發售日期")', 'text', /([\d-]+)/],
      duration: ['.page-content>.list-unstyled>li:contains("時長")', 'text', /(\d+)/],
      genre: '.page-content>.list-unstyled>li:contains("標籤")>a',
      director: '.page-content>.list-unstyled>li:contains("導演")>a',
      studio: '.page-content>.list-unstyled>li:contains("廠商")>a',
      label: '.page-content>.list-unstyled>li:contains("發行")>a',
      related: ['.dvd-title>a', 'href', /dvd\/(.*)$/],
    },
  },
  { // JavHoo
    id: 'JavHoo',
    nameIgnore: [/fc2[-_\s]*ppv/i, /xxx-av/i],
    test: 'MIFD-070',
    valid: async (name) => `https://www.javhoo.com/zh/av/${name}`,
    getInfo: {
      id: (res, $) => res.request.uri.href.split('/')[4].toUpperCase(),
      title: '.entry-title',
      cover: ['.size-full', 'src'],
      preview: ['.dt-mfp-item', 'href'],
      censored: (res, $) => ($('.category-link').text() === '無碼' ? 'Uncensored' : 'Censored'),
      actor: '.project_info>p:contains("演員")+p>span>a',
      release: ['.project_info>p:contains("發行日期")', 'text', /([\d-]+)/],
      duration: ['.project_info>p:contains("長度")', 'text', /(\d+)/],
      genre: '.project_info>p:contains("類別")+p>span>a',
      director: '.project_info>p:contains("導演")>a:nth-child(2)',
      studio: '.project_info>p:contains("製作商")>a:nth-child(2)',
      label: '.project_info>p:contains("發行商")>a:nth-child(2)',
      related: ['.related_posts>div>a', 'href', /\/av\/(.*)$/],
    },
  },
  { // Yavtube
    id: 'Yavtube',
    nameIgnore: [/fc2[-_\s]*ppv/i, /xxx-av/i, /(h|c)(4610|0930)-[a-z]+\d+/i],
    test: 'SSNI-566',
    valid: async (name) => `https://yavtube.com/movie/${name}`,
    getInfo: {
      id: (res, $) => res.request.uri.href.split('/')[4].toUpperCase(),
      title: '.content>[itemprop="name"]',
      cover: ['[itemProp="thumbnailUrl"]', 'content'],
      preview: ['.movies-images>li', 'data-src'],
      censored: (res, $) => {
        const studio = $('[itemprop="genre"]>a').text();
        return getCensored(studio) || 'Censored';
      },
      actor: '.movie-detail-container .model',
      release: '[itemprop="datePublished"]',
      duration: 'li:has([itemprop="duration"])>span:nth-child(2)',
      genre: '[itemprop="keywords"]>span',
      studio: '[itemprop="genre"]>a',
      related: ['.card a[href*="/movie/"]', 'href', /com\/movie\/(.*)$/],
    },
  },
  { // JavDB
    id: 'JavDB',
    nameIgnore: [/fc2[-_\s]*ppv/i, /(h|c)(4610|0930)-[a-z]+\d+/i],
    test: 'RHJ-199',
    valid: async (name) => {
      const [, $] = await getRes(`https://javdb.com/search?q=${name}&f=all`);
      const results = $('#videos>div>div').toArray().map((i) => ({
        id: $(i).find('.uid').text(),
        text: $(i).find('.video-title').text(),
        link: $(i).find('a').attr('href'),
      }));
      const result = results.find((i) => i.id === name);
      return result ? result.link : null;
    },
    getInfo: {
      id: '.video-panel-info>div:contains("番號")>span.value',
      title: '.title',
      cover: ['.video-cover', 'src'],
      preview: ['.preview-images>a', 'href'],
      censored: (res, $) => ($('.title').text().match(/無碼/) ? 'Uncensored' : 'Censored'),
      actor: '.video-panel-info>div:contains("演員")>span.value>a',
      release: '.video-panel-info>div:contains("時間")>span.value',
      duration: '.video-panel-info>div:contains("時長")>span.value',
      genre: '.video-panel-info>div:contains("類別")>span.value>a',
      studio: '.video-panel-info>div:contains("片商")>span.value',
    },
  },
  { // 7mmtv
    id: '7mmtv',
    test: 'xxx-av 23424',
    valid: async (name) => {
      const [, $] = await getRes({
        method: 'POST',
        uri: 'https://7mmtv.tv/zh/searchform_search/all/index.html',
        form: {
          search_keyword: name,
          search_type: 'uncensored',
          op: 'search',
        },
      });
      const results = $('.latest-korean-search>div>div').toArray().map((i) => ({
        text: $(i).find('.latest-korean-box-text>a').text(),
        link: $(i).find('.latest-korean-box-text>a').attr('href'),
      }));
      const result = results.find((i) => i.text.match(new RegExp(name, 'i')));
      return result ? result.link : null;
    },
    getInfo: {
      id: '.posts-headline:contains("番號")+.posts-message',
      title: '.post-inner-details-heading>h2',
      cover: ['.post-inner-details-img>img', 'src'],
      preview: ['.video-introduction-images-list-row img', 'src'],
      censored: (res, $) => ($('.breadcrumb-heading-row>ul>li:nth-child(2)>a').text() === '無碼AV' ? 'Uncensored' : 'Censored'),
      actor: '.actor-right-details-images a',
      release: '.posts-headline:contains("發行日期")+.posts-message',
      duration: '.posts-headline:contains("影片時長")+.posts-message',
      genre: '.posts-headline:contains("影片類別")+.posts-message a',
      label: '.posts-headline:contains("發行商")+.posts-message',
      studio: '.posts-headline:contains("製作商")+.posts-message',
      director: '.posts-headline:contains("導演")+.posts-message',
    },
  },
  { // Netflav
    id: 'Netflav',
    nameIgnore: [/fc2[-_\s]*ppv/i, /xxx-av/i, /(h|c)(4610|0930)-[a-z]+\d+/i],
    test: 'MIAA-152',
    valid: async (name) => {
      const [, $] = await getRes(`https://netflav.com/search?type=title&keyword=${name}`);
      const results = JSON.parse($('#__NEXT_DATA__').html()).props.initialState.search.docs.map((i) => ({
        link: `https://netflav.com/video?id=${i.videoId}`,
        title: i.title,
        title_en: i.title_en,
        title_zh: i.title_zh,
      }));
      const result = results.find((i) => i.title.indexOf(name) === 0);
      return result ? result.link : null;
    },
    getInfo: {
      id: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.code,
      title: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.title,
      cover: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.preview,
      preview: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.previewImages,
      censored: (res, $) => (JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.tags.includes('Uncensored') ? 'Uncensored' : 'Censored'),
      actor: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.actors.filter((i) => i.match(/^jp:/)).map((i) => i.replace(/^jp:/, '')),
      release: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.videoDate,
      duration: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.duration,
      genre: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.tags.filter((i) => i.match(/^jp:/)).map((i) => i.replace(/^jp:/, '')),
      label: (res, $) => JSON.parse($('#__NEXT_DATA__').html()).props.initialState.video.data.producer,
    },
  },
  { // JAVNAP
    id: 'JAVNAP',
    nameIgnore: [/fc2[-_\s]*ppv/i, /xxx-av/i, /(h|c)(4610|0930)-[a-z]+\d+/i],
    test: 'ABP-123', // 'GANA-2348',
    valid: async (name) => {
      const [res, $] = await getRes({
        method: 'POST',
        uri: 'https://www.javnap.com/search', // https://en.jav321.com/search
        form: {
          sn: name,
        },
      });
      return $('#vjs_sample_player').length ? res.request.uri.href : null;
    },
    getInfo: {
      getData: (res, $) => {
        const $1 = $($('.col-md-9').html().split('<br>').map((i) => `<div>${i}</div>`)
          .join(''));
        const data = {};
        for (let i = 0; i < $1.length; i++) {
          const root = $1.eq(i);
          const key = root.find('b').text();
          if (!key) continue;
          const value = root.find('a').length ? root.find('a').toArray().map((i) => $(i).text()) : root.text().replace(`${key}:`, '').trim();
          data[key] = value;
        }
        return data;
      },
      id: (res, $, data) => data.SN.toUpperCase(),
      title: '.panel-heading>h3',
      cover: (res, $) => $('body>.row>.col-md-3 .img-responsive').eq(0).attr('src'),
      preview: (res, $) => $('body>.row>.col-md-3 .img-responsive').slice(1).toArray().map((i) => $(i).attr('src')),
      censored: (res, $) => 'Undefined',
      actor: (res, $, data) => data.Stars,
      release: (res, $, data) => data['Release Date'],
      duration: (res, $, data) => data.minutes,
      genre: (res, $, data) => data.Genre,
      studio: (res, $, data) => data.Studio,
      related: '[href^="/video/"]',
    },
  },
];

const searchLibs = {
  javhoo: {
    search: async (keyword) => {
      const res = await req(`https://www.javhoo.com/en/av/${keyword}`);
      if (res.statusCode === 200) {
        const $ = cheerio.load(res.body);
        const studio = $('[href*="/studio/"]').text();
        return [studio];
      }
      return [];
    },
  },
  javlite: {
    search: async (keyword) => {
      const res = await req({
        method: 'POST',
        uri: 'https://javlite.com/e/search/index.php',
        form: {
          show: 'title',
          tempid: '1',
          tbname: 'news',
          mid: '1',
          dopost: 'search',
          keyboard: keyword,
          submit: '',
        },
      });
      if (res.statusCode === 200) {
        const $ = cheerio.load(res.body);
        return $('[id^="post"] .title>h2>a').map((index, item) => $(item).text()).toArray();
      }
      return [];
    },
  },
  avfhd: {
    search: 'https://avfhd.com/?s={searchTerms}',
    items: 'article',
  },
  duckduckgo: {
    search: `https://duckduckgo.com/html/?q={searchTerms}${encodeURIComponent(' inurl:jav')}&kl=en-us&kp=-2`,
    items: '.result__a',
  },
  googleCSE: {
    search: async (keyword) => { // return string[]
      const page = 0;
      let apiKey = 'AIzaSyCWOFOM-rXF4tL7Uhg-RbzNP65S2a6GwF4AIzaSyDukgtdUTmmk5OppUGvEIp2mqsRyzdWgTIAIzaSyDpcKQorOu0oUX5asC_6-M1ZUsqj44QJPgAIzaSyAdGWEblloAiYegOVRWkWbVpJNzjAa1VCMAIzaSyDkSpb0-_F9l6Srg9Z82c1sz15Rbm7-v4YAIzaSyCae4Sf4sKeJfAf_OXoNJVca-SFlwi7P8UAIzaSyAeKr5R7dZe_5zQO3SS7rNWQxUHyP2uR9oAIzaSyAf3rXFbeP8G1bTaFNMwWUhL7gRESRPCMQAIzaSyAxaqEHJO-zCN4zxv_zRdyBV0yJQ-jSCMAAIzaSyCgYz1MAAp9I9xtyq6t4MPG26DhvR6f_3A';
      apiKey = apiKey.substr(parseInt(Math.random() * 10) * 39, 39);
      const cx = '010023307804081171493:ooy1eodf_y0';
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&num=10&alt=json&q=${keyword}&start=${page * 10 + 1}`;

      const res = await req({
        uri: url,
        json: true,
      });
      return res.body && res.body.items ? res.body.items.map((i) => `${i.title}\n${i.snippet}\n${i.link}`) : null;
    },
  },
};

// 视频文件后缀名
const exts = ['.264', '.265', '.3g2', '.3ga', '.3gp', '.3gp2', '.3gpp', '.ac3', '.aif', '.aifc', '.alac', '.amv', '.aob', '.asf', '.avi', '.bdmv', '.bik', '.diva', '.divx', '.dsa', '.dsm', '.dsv', '.dts', '.dvr-ms', '.evo', '.f4v', '.flc', '.fli', '.flic', '.flv', '.h264', '.h265', '.hdm', '.hdmov', '.hevc', '.hm10', '.ifo', '.ismv', '.ivf', '.m1a', '.m1v', '.m2a', '.m2p', '.m2t', '.m2ts', '.m2v', '.m3u', '.m3u8', '.m4v', '.mid', '.midi', '.mk3d', '.mkv', '.mlp', '.mov', '.mp2v', '.mp4', '.mp4v', '.mpa', '.mpe', '.mpeg', '.mpg', '.mpls', '.mpv2', '.mpv4', '.mts', '.mxf', '.ofs', '.ogm', '.ogv', '.pva', '.ram', '.ratd', '.rec', '.rm', '.rme', '.rmf', '.rmi', '.rmm', '.roq', '.rp', '.rt', '.sfd', '.smil', '.smk', '.snd', '.ssif', '.swf', '.tp', '.tpe', '.tpf', '.trp', '.ts', '.tse', '.tsf', '.vc1', '.vob', '.webm', '.wm', '.wme', '.wmf', '.wmp', '.wmv', '.wtv', '.y4m', '.rmvb'];

const req = async (option, retry = 0) => {
  if (typeof option === 'string') option = { uri: option };
  option = {
    method: 'GET',
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'User-Agent': _.userAgent,
      Referer: new URL(option.uri.match(/^https?:/i) ? option.uri : uriLast).origin,
      'Cache-Control': 'max-age=0',
      Connection: 'keep-alive',
    },
    timeout: _.timeout * 1000,
    resolveWithFullResponse: true,
    simple: false,
    jar,
    strictSSL: false,
    gzip: true,
    followAllRedirects: true,
    ...option,
  };
  let uri = option.uri || option.url;
  uri = encodeURI(uri);
  delete option.url;
  if (uriLast && !uri.match(/^https?:/i)) uri = new URL(uri, uriLast).href;
  option.uri = uri;
  uriLast = uri;

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
    console.log(`${option.method}-${retry + 1}:\t${uri}`);
    res = await request(option);
  } catch (error) {
    console.error(`${option.method}-${retry + 1}:\t${error.message}`);
    if (retry < _.retry) {
      if (error.cause.errno === 'ETIMEDOUT' && error.cause.port === 443 && uri.match('http://')) {
        option.uri = uri.replace('http://', 'https://');
        delete option.url;
      }
      return req(option, retry + 1);
    }
    return error;
  }
  return res;
};

/**
 *
 * @param {number} second
 * @returns {string}
 * @summary 返回格式为`${hh}:${mm}:${ss}`的字符串
 */
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
    if (isNaN(minute)) minute = info.duration;
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

const download = async (url, target) => {
  if (fse.existsSync(target)) return;
  const res = await req({
    uri: url,
    encoding: null,
  });

  if (res instanceof Error) {
    console.error('Error:\tDownload Image Failed');
    return false;
  }

  const buffer = Buffer.from(res.body, 'utf8');
  fse.writeFileSync(target, buffer);
};

const findLibInName = async (name) => {
  const arr = [];
  for (const lib of libs) {
    if (lib.nameIgnore && lib.nameIgnore.some((re) => name.match(re))) continue;
    if (!lib.name || lib.name.some((re) => name.match(re))) arr.push(lib);
  }
  return arr;
};

const findLibInResult = async (results) => {
  const arr = [];
  for (const result of results) {
    for (const lib of libs) {
      if (lib.keywordIgnore && lib.keywordIgnore.some((re) => result.match(re))) continue;
      if (lib.keyword && lib.keyword.some((re) => result.match(re))) arr.push(lib);
    }
  }
  return arr;
};

function getCensored(studio) {
  for (const lib of libs) {
    if (lib.keyword && lib.keyword.some((i) => studio.match(i))) return lib.censored;
  }
}

async function getRes(option) {
  if (typeof option === 'string') option = { uri: option };
  const res = await req(Object.assign(option, {
    encoding: null,
  }));
  if (res instanceof Error) {
    console.error(`Error:\t${res.message}`);
    return [res];
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
  return [res, $];
}

async function getInfo(site, res, $) {
  if (res.statusCode !== 200) return {};

  const info = {};
  const data = typeof site.getInfo.getData === 'function' ? await site.getInfo.getData(res, $) : null;

  for (const key in site.getInfo) {
    if (['getData'].includes(key)) continue;
    let value = site.getInfo[key];
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
        value = await value(res, $, data);
      } catch (error) {
        // console.log(error);
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
    if (['cover', 'preview'].includes(key)) value = value.map((i) => (new URL(i, res.request.uri.href)).href);
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
  return info;
}

// Main
const args = process.argv.splice(2);
if (args.length) {
  if (args.includes('-q')) {
    args.splice(args.indexOf('-q'), 1);
    readlineSync.keyInPause = (query) => console.warn(`${query} (Hit any key)`);
    readlineSync.keyInSelect = (list, query) => {
      console.log();
      list.forEach((i, j) => console.warn(`[${j + 1}] ${i}`));
      console.warn('[0] CANCEL');
      console.log();
      console.warn(`${query} [${list.map((i, j) => j + 1).join(', ')}, 0]: 1`);
      return 0;
    };
    readlineSync.keyInYN = (query) => console.warn(`${query} [y/n]: n`) || false;
    readlineSync.keyInYNStrict = (query) => console.warn(`${query} [y/n]: n`) || false;
  }
}

const main = async () => {
  if (args.length) {
    if (args.includes('-t')) {
      let keyword = args[args.indexOf('-t') + 1];
      if (keyword && keyword.match(/^-/)) keyword = null;
      args.splice(args.indexOf('-t'), keyword ? 2 : 1);

      let sites = libs;
      if (keyword) sites = sites.filter((i) => i.id.match(new RegExp(keyword, 'i')));
      for (const site of sites) {
        console.log('\n- - - - - - - - - - -\n');
        let uri;
        try {
          uri = await site.valid(site.test);
        } catch (error) {
          console.log(error);
        }
        if (!uri) {
          console.error(`Error:\t${site.id} Maybe Changed`);
          continue;
        }

        const [res, $] = await getRes(uri);

        // 获取视频信息
        const info = await getInfo(site, res, $);
        if (!info.id || !info.title) {
          console.error(`Error:\t${site.id} Maybe Changed`);
          continue;
        }
        for (const key in site.getInfo) {
          if (['getData'].includes(key)) continue;
          if (!(key in info)) {
            console.warn(`Warn:\t${site.id} "${key}" Maybe Changed`);
          } else {
            console.log(`${key}${typeof info[key] === 'string' ? '' : `[${info[key].length}]`}:\t[${typeof info[key] === 'string' ? info[key] : info[key].map((i) => `"${i}"`).join(', ')}]`);
          }
        }
      }
      process.exit();
    }
  }

  const workdir = [].concat(process.cwd(), process.argv.splice(2)).map((i) => path.resolve(process.cwd(), i)).filter((item, index, array) => array.indexOf(item) === index && fse.existsSync(item));
  for (const thisdir of workdir) {
    const items = fse.readdirSync(thisdir).filter((i) => exts.includes(path.extname(i).toLowerCase()));
    console.log(`Amount:\t${items.length}`);

    for (const item of items) {
      const fullpath = path.resolve(thisdir, item);
      console.log('\n- - - - - - - - - - -\n');
      console.log(`File:\t${fullpath}`);

      const { name, ext } = path.parse(fullpath);
      const [, prefix, nameTrue, suffix] = name.match(/^(\[.*?\]|)(.*?)(\[.*?\]|)$/);

      // 通过文件名判断lib，来获取网址
      // let [site, uri] = await findLibInName(nameTrue);
      let sites = await findLibInName(nameTrue);

      // 当无法直接获得网址时，尝试搜索
      if (sites.every((i) => !i.name)) { // 都是通用站点，即name为false
        console.log(`Start Search:\t${nameTrue}`);

        for (const searchLib in searchLibs) {
          if (!_.searchLibsEnable.includes(searchLib)) continue;
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
          if (!results || !results.length) continue;
          results.forEach((value, index) => console.log(`Result-${index}:\t${value.replace(/\s+/g, ' ').trim()}`));

          const sitesThis = await findLibInResult(results);
          sites = sitesThis.concat(sites);
          if (sites.some((i) => i.name)) break;
        }
      }

      // 找到的site与通用的站点一起测试
      if (sites.every((i) => !i.name)) console.warn('Notice:\tCan\'t Find the Lib, Try common Libs');
      let info = {};
      for (let site of new Set(sites)) {
        console.log(`Try:\t${site.id}`);

        let uri;
        try {
          uri = await site.valid(nameTrue);
        } catch (error) {}
        if (!uri) continue;
        if (uri instanceof Array) [site, uri] = uri;

        // 获取网页
        const [res, $] = await getRes(uri);
        if (res instanceof Error) continue;

        // 获取视频信息
        let infoThis = await getInfo(site, res, $);

        if (site.name) { // 非通用
          let [wayback] = await getRes(`https://archive.org/wayback/available?url=${uri}`);
          wayback = JSON.parse(wayback.body);

          if (!infoThis.id || !infoThis.title) { // 获取信息失败
            if (wayback.archived_snapshots.closest && wayback.archived_snapshots.closest.status === '200') { // 使用时间机器
              const [res, $] = await getRes(wayback.archived_snapshots.closest.url);
              if (res instanceof Error) continue;

              infoThis = await getInfo(site, res, $);
              if (infoThis.cover) infoThis.cover = infoThis.cover.replace(/^https?:\/\/web.archive.org\/web\/.*?\//, '');
              if (infoThis.preview) infoThis.preview = [].concat(infoThis.preview).map((i) => i.replace(/^https?:\/\/web.archive.org\/web\/.*?\//, ''));
            }
          } else if (!wayback.archived_snapshots.closest) {
            await getRes(`https://web.archive.org/save/${uri}`);
          }
        }

        // 检测是否获取到主要信息，否则放弃
        if (!infoThis.id || !infoThis.title) {
          continue;
        } else {
          info = Object.assign(infoThis, { prefix, suffix, homepage: uri });
          break;
        }
      }

      // 检测是否获取到主要信息，否则放弃
      if (!info.id || !info.title) {
        console.error('Skip:\tCan\'t Get Info');
        continue;
      }

      let pathBase = replaceWithDict(_.folderSort, info).replace(/[:*?"<>|]/g, '-');
      const nameBase = replaceWithDict(_.name, info).replace(/[:*?"<>|]/g, '-');
      const targetBase = path.resolve(thisdir, pathBase, nameBase);
      pathBase = path.dirname(targetBase);
      if (!fse.existsSync(pathBase)) fse.mkdirsSync(pathBase);

      // 下载封面
      if (info.cover && _.image) {
        await download(info.cover, `${targetBase}.jpg`);
      }

      // 下载预览图
      if (info.preview && info.preview.length && _.image === 2) {
        for (let i = 0; i < info.preview.length; i++) {
          if (!info.preview[i].match(/^https?:/)) continue;
          await download(info.preview[i], `${targetBase}-${i + 1}.jpg`);
        }
      }

      // 生成nfo
      if (_.nfo) {
        console.log(`.nfo Created:\t${targetBase}.nfo`);
        nfoFile(info, `${targetBase}.nfo`); // 生成nfo文件
      }

      let target = targetBase + ext;
      const option = {};
      if (!fse.existsSync(target) || readlineSync.keyInYNStrict(`File:\t${target}\nWarn:\tFile Exists, Overwrite?`)) {
        option.overwrite = true;
      } else {
        let order = 1;
        target = `${targetBase}-${order}${ext}`;
        while (fse.existsSync(target)) {
          target = `${targetBase}-${order}${ext}`;
          order = order + 1;
        }
      }
      console.log(`File Moved:\t${target}`);
      fse.moveSync(fullpath, target, option);
      if (info.release) {
        const data = new Date(info.release);
        if (!isNaN(data.getTime())) fse.utimesSync(target, data, data);
      }
    }
  }
};

main().then(async () => {
  //
  console.log('\n- - - - - - - - - - -\n');
}, async (err) => {
  console.log('\n- - - - - - - - - - -\n');
  console.error(err);
  process.exit();
});
