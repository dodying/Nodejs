'use strict';

const config = {
  '7z': 'D:\\GreenSoftware\\_Basis\\7-Zip\\7z.exe', // 7z路径 (仅删除宣传图与压缩info.txt所需)
  loop: true, // 是否一直运行
  proxy: 'socks5://127.0.0.1:2345', // HTTP代理/SOCKS5代理
  comicFolder: 'E:\\Downloads', // 需要整理的文件夹
  libraryFolder: 'F:\\H\\###ComicLibrary', // 整理到哪个文件夹
  moveFile: true, // 是否移动文件
  globRecursive: true, // 是否递归comicFolder
  jTitle: false, // 是否重命名为日本名称
  cutLongTitle: true, // 当名称过长时，裁剪
  delIntroPic: true, // 是否删除宣传图
  introPicName: [],
  introPic: [],
  checkImageSize: true, // 是否检测图片文件大小
  checkImageRatio: false, // 是否检测图片宽高比
  rate: 1, // 图片宽高比的分界，大于则为双页
  size: 780, // 小图的宽度
  cover: false, // 是否创建同名封面
  artistMinimumItems: 3, // 对于artistTag.js
  artistTags: 3, // 对于artistTag.js
  subFolder: [ // 子文件夹
    '0.Series',
    '1.Cosplay',
    '2.Image Set',
    '3.Game CG',
    '4.Doujinshi',
    '5.Harem',
    '6.Incest',
    '7.Story arc',
    '8.Anthology',
    '9.Artist',
    '10.Other'
  ],
  subFolderDelete: 'X.Deleted',
  specialFolder: '#Star', // 特殊的子文件夹
  makeTags: [ // 是否要生成标签文件夹
    // eg: 'female: lolicon'
  ],
  subFolderTag: '#.Tag',
  incestTags: {
    grandmother: ['grandmother'],
    mother: ['mother', 'aunt'],
    sister: ['sister', 'cousin', 'brother'],
    daughter: ['daughter', 'niece', 'father'],
    granddaughter: ['granddaughter', 'grandfather']
  },
  emojiRegExp: /\u{2139}|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|\u{2328}|\u{23CF}|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|\u{24C2}|[\u{25AA}-\u{25AB}]|\u{25B6}|\u{25C0}|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|\u{260E}|\u{2611}|[\u{2614}-\u{2615}]|\u{2618}|\u{261D}|\u{2620}|[\u{2622}-\u{2623}]|\u{2626}|\u{262A}|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2648}-\u{2653}]|\u{2660}|\u{2663}|\u{2666}|\u{2668}|\u{267B}|\u{267F}|[\u{2692}-\u{2697}]|\u{2699}|[\u{269B}-\u{269C}]|[\u{26A0}-\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26B0}-\u{26B1}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|\u{26C8}|\u{26CE}|\u{26CF}|\u{26D1}|[\u{26D3}-\u{26D4}]|[\u{26E9}-\u{26EA}]|[\u{26F0}-\u{26F5}]|[\u{26F7}-\u{26FA}]|\u{26FD}|\u{2702}|\u{2705}|[\u{2708}-\u{2709}]|[\u{270A}-\u{270B}]|[\u{270C}-\u{270D}]|\u{270F}|\u{2712}|\u{2714}|\u{2716}|\u{271D}|\u{2721}|\u{2728}|[\u{2733}-\u{2734}]|\u{2744}|\u{2747}|\u{274C}|\u{274E}|[\u{2753}-\u{2755}]|\u{2757}|\u{2763}|[\u{2795}-\u{2797}]|\u{27A1}|\u{27B0}|\u{27BF}|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|\u{2B50}|\u{2B55}|\u{3030}|\u{303D}|\u{3297}|\u{3299}|\u{1F004}|\u{1F0CF}|[\u{1F170}-\u{1F171}]|\u{1F17E}|\u{1F17F}|\u{1F18E}|[\u{1F191}-\u{1F19A}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F201}-\u{1F202}]|\u{1F21A}|\u{1F22F}|[\u{1F232}-\u{1F23A}]|[\u{1F250}-\u{1F251}]|[\u{1F300}-\u{1F320}]|\u{1F321}|[\u{1F324}-\u{1F32C}]|[\u{1F32D}-\u{1F32F}]|[\u{1F330}-\u{1F335}]|\u{1F336}|[\u{1F337}-\u{1F37C}]|\u{1F37D}|[\u{1F37E}-\u{1F37F}]|[\u{1F380}-\u{1F393}]|[\u{1F396}-\u{1F397}]|[\u{1F399}-\u{1F39B}]|[\u{1F39E}-\u{1F39F}]|[\u{1F3A0}-\u{1F3C4}]|\u{1F3C5}|[\u{1F3C6}-\u{1F3CA}]|[\u{1F3CB}-\u{1F3CE}]|[\u{1F3CF}-\u{1F3D3}]|[\u{1F3D4}-\u{1F3DF}]|[\u{1F3E0}-\u{1F3F0}]|[\u{1F3F3}-\u{1F3F5}]|\u{1F3F7}|[\u{1F3F8}-\u{1F3FF}]|[\u{1F400}-\u{1F43E}]|\u{1F43F}|\u{1F440}|\u{1F441}|[\u{1F442}-\u{1F4F7}]|\u{1F4F8}|[\u{1F4F9}-\u{1F4FC}]|\u{1F4FD}|\u{1F4FF}|[\u{1F500}-\u{1F53D}]|[\u{1F549}-\u{1F54A}]|[\u{1F54B}-\u{1F54E}]|[\u{1F550}-\u{1F567}]|[\u{1F56F}-\u{1F570}]|[\u{1F573}-\u{1F579}]|\u{1F57A}|\u{1F587}|[\u{1F58A}-\u{1F58D}]|\u{1F590}|[\u{1F595}-\u{1F596}]|\u{1F5A4}|\u{1F5A5}|\u{1F5A8}|[\u{1F5B1}-\u{1F5B2}]|\u{1F5BC}|[\u{1F5C2}-\u{1F5C4}]|[\u{1F5D1}-\u{1F5D3}]|[\u{1F5DC}-\u{1F5DE}]|\u{1F5E1}|\u{1F5E3}|\u{1F5E8}|\u{1F5EF}|\u{1F5F3}|\u{1F5FA}|[\u{1F5FB}-\u{1F5FF}]|\u{1F600}|[\u{1F601}-\u{1F610}]|\u{1F611}|[\u{1F612}-\u{1F614}]|\u{1F615}|\u{1F616}|\u{1F617}|\u{1F618}|\u{1F619}|\u{1F61A}|\u{1F61B}|[\u{1F61C}-\u{1F61E}]|\u{1F61F}|[\u{1F620}-\u{1F625}]|[\u{1F626}-\u{1F627}]|[\u{1F628}-\u{1F62B}]|\u{1F62C}|\u{1F62D}|[\u{1F62E}-\u{1F62F}]|[\u{1F630}-\u{1F633}]|\u{1F634}|[\u{1F635}-\u{1F640}]|[\u{1F641}-\u{1F642}]|[\u{1F643}-\u{1F644}]|[\u{1F645}-\u{1F64F}]|[\u{1F680}-\u{1F6C5}]|[\u{1F6CB}-\u{1F6CF}]|\u{1F6D0}|[\u{1F6D1}-\u{1F6D2}]|[\u{1F6E0}-\u{1F6E5}]|\u{1F6E9}|[\u{1F6EB}-\u{1F6EC}]|\u{1F6F0}|\u{1F6F3}|[\u{1F6F4}-\u{1F6F6}]|[\u{1F6F7}-\u{1F6F8}]|[\u{1F910}-\u{1F918}]|[\u{1F919}-\u{1F91E}]|\u{1F91F}|[\u{1F920}-\u{1F927}]|[\u{1F928}-\u{1F92F}]|\u{1F930}|[\u{1F931}-\u{1F932}]|[\u{1F933}-\u{1F93A}]|[\u{1F93C}-\u{1F93E}]|[\u{1F940}-\u{1F945}]|[\u{1F947}-\u{1F94B}]|\u{1F94C}|[\u{1F950}-\u{1F95E}]|[\u{1F95F}-\u{1F96B}]|[\u{1F980}-\u{1F984}]|[\u{1F985}-\u{1F991}]|[\u{1F992}-\u{1F997}]|\u{1F9C0}|[\u{1F9D0}-\u{1F9E6}]|❤/gu,
  specialRule: [
    { // 旧版本(兼容)
      mode: 1, // 0: 任一匹配(默认) 1:所有条件匹配
      artist: 'example', // 值类型 string:相等 regexp:匹配 function:=>true 其他全部为false
      /**
       * @name folder
       * @summary move file to folder which relative to specialFolder
       * @when {0,false,null,undefined} => ''
       * @when {string match /\{.*\}/} => {.*} will be replaced by info
       * @when {string} => string
       * @when {function} => func(info)
       */
      folder: 'Path to Directory' // empty or undefined means move to specialFolder, else move to a folder named this under specialFolder // when function(info) => string
    },

    /**
     * @example
     * {
         mode: 1,
        parody: /^fate/i,
        folder: '{language}/同人/{parody:chs}/{character:chs}'
      },
      file: [Digianko (Ankoman)] Las Vegas Bitch Kengo Sekkusu Nanairo Shoubu (Fate-Grand Order) [Chinese] [黎欧×新桥月白日语社]
      info: { language: ["chinese", "translated"], parody: ["fate grand order"], character: ["artoria pendragon", "bb", "jeanne darc", "katsushika hokusai", "musashi miyamoto", "nightingale", "osakabehime", "scathach", "shielder | mash kyrielight", "souji okita | sakura saber", "ushiwakamaru"] }
      result: move to "chinese,translated\同人\Fate\BB,Shielder,冲田总司,刑部姬,南丁格尔,圣女贞德,宫本武藏,斯卡哈,牛若丸,葛饰北斋,阿尔托莉雅·潘德拉贡"
     */

    [['mode', 1], ['artist', 'example'], ['mode', 1], ['folder', 'Path to Directory']]
  ],
  parody: [{
    name: 'example',
    filter: 'example'
  }],
  removeCharacter: [
    'teitoku', // 提督
    'producer' // 制作人
  ]
};
module.exports = config;
