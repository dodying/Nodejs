const config = {
  loop: true, // 是否一直运行
  proxy: 'socks5://127.0.0.1:2345', // HTTP代理/SOCKS5代理
  comicFolder: 'E:\\Downloads', // 需要整理的文件夹
  libraryFolder: 'F:\\H\\###ComicLibrary', // 整理到哪个文件夹
  moveFile: true, // 是否移动文件
  globRecursive: true, // 是否递归comicFolder
  title: '{title}', // 移动文件时，重命名的格式
  cutLongTitle: true, // 当名称过长时，裁剪
  delIntroPic: true, // 是否删除宣传图
  introPicName: [],
  introPic: [],
  checkImageSize: true, // 是否检测图片文件大小
  checkImageRatio: false, // 是否检测图片宽高比
  rate: 1, // 图片宽高比的分界，大于则为双页
  size: 780, // 小图的宽度
  cover: false, // 是否创建同名封面
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
    '10.Other',
  ],
  subFolderDelete: 'X.Deleted',
  specialFolder: '#Star', // 特殊的子文件夹
  incestTags: {
    grandmother: ['grandmother'],
    mother: ['mother', 'aunt'],
    sister: ['sister', 'cousin', 'brother'],
    daughter: ['daughter', 'niece', 'father'],
    granddaughter: ['granddaughter', 'grandfather'],
  },
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
      folder: 'Path to Directory', // empty or undefined means move to specialFolder, else move to a folder named this under specialFolder // when function(info) => string
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

    [['mode', 1], ['artist', 'example'], ['mode', 1], ['folder', 'Path to Directory']],
  ],
  commonRule: [
    // 格式同specialRule
    // 不同的是，specialRule是竞争性的，而commonRule是非竞争性的
  ],
  parody: [{ // 重命名原作名
    name: 'example',
    filter: 'example',
  }],
  removeCharacter: [ // 移除角色名
    'teitoku', // 提督
    'producer', // 制作人
  ],
};
module.exports = config;
