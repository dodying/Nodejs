// ==Headers==
// @Name:               copyInfo
// @Description:        copyInfo
// @Version:            1.0.365
// @Author:             dodying
// @Created:            2020-01-18 15:55:20
// @Modified:           2021-08-05 20:39:24
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            clipboardy,fs-extra,jszip,readline-sync
// ==/Headers==

// usage: text []file

// 设置

// 导入原生模块
// const path = require('path')

// 导入第三方模块
const JSZip = require('jszip');
const fse = require('fs-extra');
const readlineSync = require('readline-sync');
const clipboardy = require('clipboardy');
const _ = require('../config');

const getTitleMain = require('../js/getTitleMain');
const parseInfo = require('../js/parseInfo');
const findData = require('../js/findData');

// Function
const unique = (arr) => [...(new Set(arr))];
const escape = (text) => text.replace(/[\\/:*?"<>|]/g, '-').replace(/\.$/, '').replace(/\p{Extended_Pictographic}/gu, '');
// const escape2 = text => text.replace(/[:*?"<>|]/g, '-').replace(/\.$/, '').replace(/\p{Extended_Pictographic}/gu, '')

// Main
const main = async () => {
  const [text, ...files] = process.argv.slice(2);
  console.log({ text, files });

  const textLib = {
    Series: '\n[[\'folder\', \'./../0.Series/【】[!{artist:chs}]!{jTitle:main}\'], [\'mode\', 1], [\'title\', /!{title:main}/i], [\'!{artist}\']],',
    '[Group]Series': '\n[[\'folder\', \'./../0.Series/【】[!{group:chs}]!{jTitle:main}\'], [\'mode\', 1], [\'title\', /!{title:main}/i], [\'group\', \'!{group}\']],',

    'Series-Parody': '\n[[\'folder\', \'./../0.Series/【同人-!{parody:chs}】[!{artist:chs}]!{jTitle:main}\'], [\'mode\', 1], [\'title\', /!{title:main}/i], [\'!{artist}\'], [\'parody\', \'!{parody}\']],',
    '[Group]Series-Parody': '\n[[\'folder\', \'./../0.Series/【同人-!{parody:chs}】[!{group:chs}]!{jTitle:main}\'], [\'mode\', 1], [\'title\', /!{title:main}/i], [\'group\', \'!{group}\'], [\'parody\', \'!{parody}\']],',

    'Series-Parody-NoTitle': '\n[[\'folder\', \'./../0.Series/【#同人-!{parody:chs}】!{artist:chs}\'], [\'mode\', 1], [\'parody\', \'!{parody}\'], [\'!{artist}\']],',
    '[Group]Series-Parody-NoTitle': '\n[[\'folder\', \'./../0.Series/【#同人-!{parody:chs}】!{group:chs}\'], [\'mode\', 1], [\'parody\', \'!{parody}\'], [\'group\', \'!{group}\']],',

    Artist: '\n[[\'folder\', \'[#Artist]/!{artist:chs}\'], [\'!{artist}\']],',
    '[Group]Artist': '\n[[\'folder\', \'[#Artist]/!{group:chs}\'], [\'group\', \'!{group}\']],',
  };

  const parodyAlias = [
    ['出包王女', 'ToLove'],
    ['刀剑神域', 'SAO'],
    ['地下城与勇士', 'DNF'],
    ['东方Project', '东方'],
    ['化物语', '物语'],
    ['舰队Collection', '舰C'],
    ['路人女主的养成方法', '路人女主'],
    ['魔法科高中的劣等生', '魔劣'],
    ['偶像大师', 'im@'],
    ['轻音少女', '轻音'],
    ['少女与战车', '战车女'],
    ['圣诞之吻', '圣吻'],
    ['食戟之灵', '食戟'],
    ['我的妹妹不可能那么可爱', '俺妹'],
    ['我的朋友很少', '友少'],
    ['无限斯特拉托斯', 'IS'],
    ['在地下城寻求邂逅是否搞错了什么', '地下城邂逅'],
    ['Love Live! Sunshine!!', 'LLSS'],
    ['LoveLive!', 'LL'],
    ['VOCALOID', 'V家'],
    [/^Fate\//i, 'Fate'],
    [/光之美少女/, '光美'],
    ['精灵宝可梦', 'PM'],
    ['Free! 男子游泳部', 'Free'],
    ['请问您今天要来点兔子吗？', '点兔'],
    [/高达/, '高达'],
    ['我的青春恋爱物语果然有问题', '俺春物'],
  ];

  const varsRe = /!{(.*?)}/;
  const kanaRe = /^[あアいイうウえエおオかカきキくクけケこコさサしシすスせセそソたタちチつツてテとトなナにニぬヌねネのノはハひヒふフへヘほホまマみミむムめメもモやヤゆユよヨらラりリるルれレろロわワをヲんンがガぎギぐグげゲごゴざザじジずズぜゼぞゾだダぢヂづヅでデどドばバびビぶブべベぼボぱパぴピぷプぺペぽポゃャゅュょョ]/;

  const mainTag = ['language', 'reclass', 'parody', 'character', 'group', 'artist', 'female', 'male', 'misc'];
  const toDeleteInfo = ['page'];

  const output = [];

  for (const file of files) {
    let textCopy = text;

    // 读取数据
    const targetData = fse.readFileSync(file);
    const jszip = new JSZip();
    let zip;
    try {
      zip = await jszip.loadAsync(targetData);
    } catch (error) {
      console.error(`Error:\t无法读取文件 "${file}"`);
      // readlineSync.keyInPause('Press any key to Continue')
      continue;
    }

    // 查看列表
    const fileList = Object.keys(zip.files);

    // 检测有无info.txt
    if (fileList.filter((item) => item.match(/(^|\/)info\.txt$/)).length === 0) {
      console.warn('压缩档内不存在info.txt: ', file);
      return new Error('no info.txt');
    }

    // 读取info.txt
    const infoFile = fileList.find((item) => item.match(/(^|\/)info\.txt$/));
    const data = await zip.files[infoFile].async('text');
    const info = parseInfo(data);
    if (info.parody && info.parody.includes('original')) info.parody.splice(info.parody.indexOf('original'), 1);
    if (info.parody && info.parody.length === 0) delete info.parody;
    if (info.parody && info.parody.some((i) => _.parody.some((j) => i.match(j.filter)))) {
      info.parody = info.parody.map((i) => {
        for (let j = 0; j < _.parody.length; j++) {
          if (i.match(_.parody[j].filter)) return _.parody[j].name;
        }
        return i;
      });
      info.parody = unique(info.parody);
    }

    toDeleteInfo.forEach((i) => delete info[i]);

    mainTag.forEach((i) => {
      if (info[i]) {
        let arr = [];
        for (const j of info[i]) {
          let value = findData(i, j, true).cname;
          if (value && value.match(kanaRe)) value = null;

          if (!value && i === 'artist' && info[i].length === 1) {
            let nameJpn = info.jTitle.match(/\[(.*?)\]/)[1];
            if (nameJpn.match(/\(.*?\)/)) nameJpn = nameJpn.match(/\((.*?)\)/)[1];
            value = nameJpn;
          }
          if (value && value.match(kanaRe)) value = null;

          if (!value) {
            value = j.split('|')[0].trim();
            value = value.split(' ').map((i) => `${i[0] ? i[0].toUpperCase() : ''}${i.slice(1)}`).join(' ');
            value = value.split('-').map((i) => `${i[0] ? i[0].toUpperCase() : ''}${i.slice(1)}`).join('-');
          }
          arr.push(value);
        }
        info[`${i}:chs`] = arr;

        arr = [];
        for (const j of info[i]) {
          const value = j.split('|')[0].trim();
          arr.push(value);
        }
        info[i] = arr;
      }
    });

    info['title:main'] = getTitleMain(info.title)[0];
    info['title:main'] = escape(info['title:main']);

    info['jTitle:main'] = getTitleMain(info.jTitle)[0];
    info['jTitle:main'] = escape(info['jTitle:main']);

    if (info['jTitle:main'].match(kanaRe)) info['jTitle:main'] = info['title:main'];

    if (info['parody:chs']) {
      for (let i = 0; i < info['parody:chs'].length; i++) {
        for (const rule of parodyAlias) {
          const parody = info['parody:chs'][i];
          const matched = typeof rule[0] === 'string' ? parody === rule[0] : parody.match(rule[0]);
          if (matched) info['parody:chs'][i] = rule[1];
        }
      }
      console.log(info['parody:chs']);
      // process.exit()
    }
    console.log(info);

    if (!textCopy) {
      textCopy = '';
      if (!info.artist || (info.artist.length >= 2 && info.group && info.group.length === 1)) textCopy = `${textCopy}[Group]`;
      textCopy = `${textCopy}Series`;
      if (info.parody) {
        if (info.parody.length >= 2) info['parody:chs'] = 'Various';
        textCopy = `${textCopy}-Parody`;
      }
    }
    if (textCopy in textLib) textCopy = textLib[textCopy];

    let result;
    while ((result = textCopy.match(varsRe))) {
      let value;
      const [raw, key] = result;
      if (key in info) {
        value = info[key];
      } else {
        value = readlineSync.question(`${key}:\t`);
        info[key] = value;
      }
      if (value && value instanceof Array) value = value.sort().join(',');
      textCopy = textCopy.split(raw).join(value);
    }
    output.push(textCopy);
  }

  clipboardy.writeSync(output.join('\n'));
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit();
});
