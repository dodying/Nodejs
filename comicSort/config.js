'use strict'

let config = {
  '7z': 'D:\\GreenSoftware\\_Basis\\7-Zip\\7z.exe',
  proxy: 'http://127.0.0.1:2346',
  globRecursive: true,
  comicFolder: 'F:\\Temp',
  libraryFolder: 'F:\\ComicLibrary',
  jTitle: false,
  delIntroPic: true,
  introPicName: [
    '999.jpg$',
    'zCREDIT',
    'i_.jpg',
    '招募圖',
    '無邪気'
  ],
  introPic: [ '016010d081', '018cf700aa', '01c9b75a4f', '03dfd45b65', '047379e168', '04bea28d2a', '04c7df9318', '04f2745795', '054452994e', '060ff6b88a', '08d37f6b6f', '08db14c5fb', '08f78aed5a', '096712ffd7', '09fe6b9a55', '0a1f173ad2', '0b1dc7ca50', '0b34a8553b', '0b49e9bc3e', '0b813739ae', '0cebce8abd', '0de93ecf0d', '0e902c64b9', '0ec8fc9b72', '0f480f45a4', '0fe76e7ef3', '10027a8e65', '10970b069b', '10f227dc03', '11c7c2baf0', '13536e68df', '13ca6ae716', '148ffe52cf', '153267b08d', '15bca23fbb', '1698667693', '169ceb67b1', '16bad5f198', '16e4580674', '172de1c3ed', '17f9d9ba37', '1877d56115', '1b7328d570', '1c6a1e52af', '1cbd0a78c1', '1d4bf2a5e4', '1db1203303', '1df1481970', '1e402f0f53', '1edeab5112', '1f3ba78557', '1f9f5f0455', '1fd1b724d3', '2135299bf8', '218a909563', '219e58c6de', '21eb59053f', '22023c1bca', '220fe636f3', '22b1d4ebd4', '232e2a58dd', '2494482757', '24ed1721d7', '25334d86b6', '25f7346649', '264a887408', '26a6238844', '26aadc2ae8', '2716ad4d6c', '2724e04a82', '2781eeb785', '279244b5d9', '27a976edab', '27dddf4c0c', '28c583d537', '296fdd3d46', '2ac648aea4', '2ae4f0fb00', '2ce0ad6785', '2dbecc067f', '2dcfdc3ee8', '2f84851f64', '2f9c7c93bf', '30d516237a', '314e942ff8', '31808ba9c1', '327579d54b', '337a323d4e', '33e6d8b7a5', '33ef5d951f', '344074e51a', '34c4edf7d9', '3590841471', '35db0e958e', '3818a08dca', '3844b1cb1e', '3972bfe7da', '3a013c82e0', '3bf808e462', '3d0ad385e2', '3de6720c2e', '3e2d10e613', '3f2e24384b', '3f96fc6867', '40ae0bb68f', '40c68fca53', '40d24325e2', '416ba8064c', '42c5fef87e', '42f952f114', '43067d768b', '4354346b0f', '45019d91e7', '470d48db06', '47fbb8314c', '4812b50afe', '48263c6966', '4a1e4ec359', '4b06c068a9', '4c8b85ec13', '4cbe8f6296', '4d669f7d9b', '4d6b8506d3', '4dbde53805', '4fb5911581', '5159308dcd', '51991d0bb9', '51c1833d5b', '51cee1d169', '51e3b40649', '5230467b48', '524c3e991f', '526b573833', '5512077961', '5597befc46', '561595013b', '57099854b7', '58262210ee', '5c0cb48a81', '5c1f1558c1', '5c6d42c811', '5d0770c2f4', '5e01bea82a', '5e477bea1c', '5ebea5e33d', '5efd924755', '5f087f25c1', '5f24a9d3e5', '5fe30304c3', '60d039be38', '617cb9ee78', '6215ff4e19', '62c4cab030', '63b5c215bb', '64209bac21', '648ec7d480', '65a2c9cafa', '65d3f159eb', '683f48d8e8', '694f58e45e', '696e67202c', '699596ebc5', '69acfbc4a8', '69ff83db2a', '6a1f841bfe', '6ac16b45ca', '6b04214926', '6b09fe4a5d', '6d58eb8ec6', '6d5a966037', '6df42be9ea', '6e56a2ba2f', '6f9c7ac572', '6fb883e08e', '7070783c22', '707653555f', '709d72526d', '7155d6da0c', '724b736b85', '72cde6d709', '7374ce0813', '75ef43007d', '76cace658d', '76eb58fb06', '7743a977a7', '777b84d450', '78500842f0', '791507ee71', '79a59ac0fc', '7a177d153c', '7a326e8812', '7a8fd3f7a5', '7b32b123b3', '7b88fccc0b', '7ba38927f1', '7c846bebbe', '7de0f50694', '7e41e1c3a7', '7ed49f02ac', '7f396e6ec7', '7f550ba04b', '7f79b5333d', '7f7daa231f', '80d6e2739c', '80f82ac025', '8106528162', '813d190bd8', '81e88b4743', '82af1400c4', '830e524b81', '8459f073c9', '84daff674d', '8575c161e3', '88a81a5919', '8a93b02a4f', '8ac62f62b8', '8b6db875e8', '8b7d43e713', '8c6cdc818b', '8ca2275327', '8d9dbc22da', '8e21688aff', '8e4fbee17b', '8f1ece77e8', '906259baea', '9108df6263', '91e1921760', '921654d5ad', '9219a21b5c', '936123901c', '93aff68749', '94051ad85e', '94149929c5', '9514cd71b0', '953219e1b8', '9603652514', '963a15b84d', '975d300af2', '977db41a74', '97bb1dc4f2', '9815b8ea17', '98368b5557', '9962ef2da0', '9990b4539e', '99a5b3329c', '9a2db889fc', '9b95a88b6a', '9bf2c60988', '9c886361b7', '9d1afcfa9f', '9d2f05b41b', '9dee2acf79', '9f1d28e3b7', '9fa2bef8a4', '9fd0569cf0', 'a067351faf', 'a270087bf4', 'a34aedff53', 'a4c62781b7', 'a4f14d384e', 'a527b460d4', 'a52efe6a52', 'a55425ad56', 'a559f2a2ce', 'a587193e63', 'a63cb2f101', 'a6e7df0e9c', 'a86751111b', 'a90d4d4842', 'aac5a755cf', 'ab31dc6dfc', 'ab420ea71b', 'ac47b07a80', 'aca7515c29', 'ad6eb5f7f6', 'ad89477fc3', 'ae82a2990c', 'aeda509902', 'aee561c2fc', 'af3b48d59b', 'b0e7135e54', 'b10f90d4ce', 'b26e12ab13', 'b290f6796b', 'b3b922542f', 'b3f1f78b80', 'b40da3921e', 'b52e58da52', 'b538de4398', 'b5f93ceea4', 'b6e98e8793', 'b722e9b14d', 'b7b5471436', 'b7d79f4b9a', 'b7e4932d52', 'b85a93ae8f', 'b9a2f6e4fa', 'b9ab1ab2b4', 'ba1f524099', 'bb8cb1f8a3', 'bb956b36f4', 'bd0a01f39d', 'bd42c475b7', 'be3393a4f7', 'be45564ef0', 'be990c6fd3', 'c09e1bb373', 'c2ab9f4d3a', 'c2ad27379a', 'c30fe49512', 'c3ae070961', 'c493e654e5', 'c4a3c908c3', 'c4b4d72e62', 'c53fafa24a', 'c6388722f0', 'c6564423b7', 'c715ce0db2', 'c78220c4f3', 'c7a88f9784', 'c8d2ff755b', 'c9e23490e9', 'cb33309296', 'cba27b6c5b', 'cbae52149e', 'cbe61f2fb0', 'cc480dfa5c', 'ce4d7ac49a', 'cea1eed92a', 'ced068ff17', 'cee7227cc5', 'cf5e9f826d', 'd031369aeb', 'd12a0ab27a', 'd18cc10c91', 'd1b3f69da1', 'd226489fc4', 'd2b0a297c4', 'd2f32d160c', 'd408cc8bcd', 'd4431da9b9', 'd53075f965', 'd5e5719bbb', 'd6195cd4d0', 'd68dea75b2', 'd7286fd2cc', 'd7436f77a6', 'd7d55f85cc', 'd92353a239', 'd992cc56c2', 'dab85fb084', 'db34fc83da', 'dbb6accf9a', 'dc4461c674', 'dc534d0049', 'dc584fcb05', 'dc81823121', 'dc84f93bd7', 'ddd81dc53a', 'de43868215', 'ded0096230', 'df536ccecc', 'df9d2eff4e', 'e05c770585', 'e0e8b6e529', 'e21670f4e7', 'e26ee417eb', 'e342bc5b98', 'e3e93e8c82', 'e4b1be0381', 'e4e4abf3ff', 'e4f2df0dd0', 'e55e8dd787', 'e56892250c', 'e5ed033033', 'e7db8c9963', 'e7db8daf6c', 'e857913ca8', 'e88dab0d1f', 'e8d095da2c', 'e952b00c34', 'e9a1261f55', 'ebd7ed2c62', 'ec0a80402c', 'ec5af0fc50', 'edab9fedf8', 'edba62ab8e', 'ee471c07b3', 'ee9af0c06d', 'eec614534a', 'ef39abd9ef', 'f08b54c152', 'f0a803e94b', 'f0ad42dc13', 'f16fb5a788', 'f2f6531140', 'f58de36a5f', 'f6245b7e42', 'f673afb8cc', 'f727a96e54', 'f753701608', 'f79eac3b6d', 'f899197946', 'f8c8ea8eb4', 'fa71e5ba84', 'fa881d015c', 'fac871811e', 'fb2b3a3034', 'fb54c3529b', 'fb6a20ffc7', 'fb71027a31', 'fd8c04296d', 'feb55c69be', 'ff0992e487', 'ff8a5b550c', 'ff8c665356', 'ffa6cd83f9' ],
  checkImageSize: true,
  rate: 1,
  size: 780,
  cover: true,
  subFolder: [
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
  specialFolder: '#Star',
  specialRule: [
    {
      'misc': 'webtoon',
      'folder': '[Webtoon]'
    }, {
      'group': 'shoujo kishidan',
      'folder': '[彩图 服装]少女騎士団'
    }, {
      'artist': 'fei',
      'folder': '[丰满]Fei'
    }, {
      'artist': 'maekawa hayato',
      'folder': '[后宫 乱伦 姊]Maekawa Hayato'
    }, {
      'artist': 'marui maru',
      'folder': '[后宫 正太萝莉]丸居まる'
    }, {
      'artist': 'ohtomo takuji',
      'group': 'number2',
      'folder': '[后宫 中出]大友卓二'
    }, {
      'artist': 'sasamori tomoe',
      'folder': '[后宫 中出]笹森トモエ'
    }, {
      'artist': 'akatsuki myuuto',
      'folder': '[后宫]赤月みゅうと'
    }, {
      'artist': 'kamino ryu-ya',
      'folder': '[后宫]上乃龍也'
    }, {
      'artist': 'mizuryu kei',
      'folder': '[乱交]水龍敬'
    }, {
      'artist': 'shimanto shisakugata',
      'folder': '[萝莉]40010試作型'
    }, {
      'artist': 'kamisiro ryu',
      'folder': '[女仆]神代竜'
    }, {
      'artist': 'michiking',
      'folder': '[正太]Michiking'
    }, {
      'group': 'abgrund',
      'folder': 'abgrund'
    }, {
      'artist': 'ogadenmon',
      'folder': 'illumination'
    }, {
      'group': 'moonphase',
      'artist': 'yuran',
      'folder': '[彩图]MoonPhase'
    }, {
      'group': 'redrop',
      'folder': 'ReDrop'
    }, {
      'artist': 'yuuki hagure',
      'folder': '[巨乳]憂姫はぐれ'
    }, {
      'artist': 'kisaragi gunma',
      'folder': '[后宫]如月群真'
    }, {
      'artist': 'ichihaya',
      'folder': '[萝莉]Ichihaya'
    }, {
      'artist': 'fujisaki hikari',
      'folder': '[萝莉]藤崎ひかり'
    }, {
      'artist': 'shousan bouzu',
      'folder': '[巨乳萝莉]しょうさん坊主'
    }, {
      'artist': 'katsurai yoshiaki',
      'folder': '[后宫]桂井よしあき'
    }, {
      'artist': 'sasachinn',
      'folder': '[萝莉]Sasachinn'
    }, {
      'artist': 'kidou muichi',
      'folder': '[萝莉]Kidou Muichi'
    }, {
      'artist': 'maimu-maimu',
      'folder': '[后宫-乱伦]舞六まいむ'
    }, {
      'artist': 'suihei sen',
      'folder': '水平线'
    }, {
      'artist': 'kiyomiya ryo',
      'folder': '[萝莉]kiyomiya ryo'
    }, {
      'artist': 'shika yuno',
      'folder': 'shika yuno'
    }, {
      'artist': 'ichinomiya yuu',
      'folder': '一宫夕羽'
    }, {
      'artist': 'kujou danbo',
      'folder': '[萝莉]九条だんぼ'
    }, {
      'artist': 'rokusyou kokuu',
      'folder': '[萝莉]rokusyou kokuu'
    }, {
      'artist': 'taniguchi-san',
      'folder': '[性转]谷口さん'
    }, {
      'artist': 'uekan',
      'folder': 'uekan'
    }, {
      'artist': 'adumi kazuki',
      'folder': '[萝莉]あづみ一樹'
    }, {
      'artist': 'batsu',
      'folder': '[萝莉]batsu'
    }, {
      'artist': 'b-ginga',
      'folder': 'b-ginga'
    }, {
      'artist': 'nanaroba hana',
      'folder': 'ななろば華'
    }, {
      'artist': 'geko',
      'folder': '[药物]geko'
    }, {
      'artist': 'hamao',
      'folder': 'hamao'
    }, {
      'artist': 'sody',
      'folder': '[萝莉]sody'
    }, {
      'artist': 'isao',
      'folder': 'isao'
    }, {
      'artist': 'endou hiroto',
      'folder': '[全彩]远藤弘土'
    }, {
      'artist': 'ichiri',
      'folder': '[萝莉]ichiri'
    }, {
      'artist': 'sekiya asami',
      'folder': '[萝莉]sekiya asami'
    }, {
      'artist': 'henreader',
      'folder': '[萝莉]へんりいだ'
    }, {
      'artist': 'mitsurugi aoi',
      'folder': '能都くるみ'
    }, {
      'artist': 'nekomata naomi',
      'folder': 'nekomata naomi'
    }, {
      'artist': 'fukuyama naoto',
      'folder': '[后宫]复八磨直兔'
    }, {
      'artist': 'sumisaki yuduna',
      'folder': '[萝莉]sumisaki yuduna'
    }, {
      'artist': 'benzou',
      'folder': '[游戏CG]benzou'
    }, {
      'artist': 'natsuka q-ya',
      'folder': '[后宫]奈塚Q弥'
    }, {
      'artist': 'shiokonbu',
      'folder': 'shiokonbu'
    }, {
      'artist': 'nikusoukyuu',
      'folder': '肉そうきゅー'
    }, {
      'artist': 'yuizaki kazuya',
      'folder': '[萝莉]yuizaki kazuya'
    }, {
      'artist': 'azuma yuki',
      'folder': '[萝莉]azuma yuki'
    }, {
      'artist': 'azuma yuki',
      'folder': '[萝莉]azuma yuki'
    }, {
      'artist': 'rubi-sama',
      'folder': '[萝莉]rubi-sama'
    }, {
      'artist': 'sabashi renya',
      'folder': '左橋レンヤ'
    }, {
      'artist': 'shiun',
      'folder': 'shiun'
    }, {
      'artist': 'inue shinsuke',
      'folder': '犬江しんすけ'
    }, {
      'artist': 'yahiro pochi',
      'folder': '八尋ぽち'
    }, {
      'artist': 'sekine hajime',
      'folder': '咳寝はじめ'
    }, {
      'artist': 'kinnotama',
      'folder': '[萝莉]kinnotama'
    }, {
      'artist': 'tachibana omina',
      'folder': '[后宫]立花オミナ'
    }, {
      'artist': 'tamagoro',
      'folder': '[萝莉 Bitch]tamagoro'
    }, {
      'artist': 'emily',
      'folder': '[纯爱]emily'
    }, {
      'artist': 'mikemono yuu',
      'folder': '[纯爱]神毛物由宇'
    }, {
      'artist': 'ninoko',
      'folder': '[纯爱型援助]ninoko'
    }, {
      'artist': 'akino sora',
      'folder': '[妹]akino sora'
    }, {
      'artist': 'takei ooki',
      'folder': 'takei ooki'
    }, {
      'artist': 'shindou',
      'folder': 'shindou'
    }, {
      'artist': 'turiganesou',
      'folder': 'turiganesou'
    }, {
      'artist': 'mizuyuki',
      'folder': 'mizuyuki'
    }, {
      'artist': 'ekakibit',
      'folder': '[萝莉]ekakibit'
    }, {
      'artist': 'nekometaru',
      'folder': '[萝莉]nekometaru'
    }, {
      'artist': 'bizen',
      'folder': '[萝莉]bizen'
    }, {
      'artist': 'shouji ayumu',
      'folder': '[萝莉]小路あゆむ'
    }, {
      'artist': 'kiya shii',
      'folder': '[妹 萝莉]木谷椎'
    }, {
      'mode': 1,
      'artist': 'sugaishi',
      'parody': 'to love-ru',
      'folder': '[同人]出包王女'
    }, {
      'artist': 'sugaishi',
      'folder': '[纯爱]sugaishi'
    }, {
      'artist': 'usashiro mani',
      'folder': '[萝莉]usashiro mani'
    }, {
      'artist': 'tamano kedama',
      'folder': '[萝莉]tamano kedama'
    }, {
      'artist': 'nakasone haiji',
      'folder': '[萝莉]nakasone haiji'
    }, {
      'artist': 'inari',
      'folder': 'inari'
    }, {
      'artist': 'takayaki',
      'folder': 'takayaki'
    }, {
      'artist': 'hitsujibane shinobu',
      'folder': 'hitsujibane shinobu'
    }, {
      'artist': 'endou okito',
      'folder': '[彩图]endou okito'
    }, {
      'artist': 'shiwasu no okina',
      'folder': '[后宫]師走の翁'
    }, {
      'artist': 'miyahara ayumu',
      'folder': '[后宫]宫原步'
    }, {
      'Uploader': 'HUILENDASI',
      'folder': '[后宫]鬼畜王汉化组'
    }, {
      'title': /想抱(雷媽|雷妈)/,
      'folder': '[萝莉]想抱雷妈汉化组'
    }, {
      'mode': 1,
      'female': 'netorare',
      'parody': /.*/,
      'folder': '[标签]女性:NTR\\同人'
    }, {
      'mode': 1,
      'female': 'netorare',
      'misc': 'story arc',
      'folder': '[标签]女性:NTR\\故事线'
    }, {
      'female': 'netorare',
      'folder': '[标签]女性:NTR'
    }
  ],
  parody: [{
    name: 'Fate',
    filter: /^fate/gi
  }, {
    name: '光之美少女',
    filter: /precure/gi
  }, {
    name: 'Love Live!',
    filter: /^love live/gi
  }, {
    name: '高达',
    filter: /gundam/gi
  }, {
    name: '勇者斗恶龙',
    filter: /dragon quest/gi
  }, {
    name: '最终幻想',
    filter: /final fantasy/gi
  }, {
    name: '女神异闻录',
    filter: /persona/gi
  }, {
    name: 'Muv-Luv',
    filter: /^muv-luv/gi
  }, {
    name: 'houkago play',
    filter: /^houkago play/gi
  }, {
    name: 'seraph of the end',
    filter: /^seraph of the end/gi
  }, {
    name: '战场女武神',
    filter: /valkyria chronicles/gi
  }],
  removeCharacter: [
    'teitoku', // 提督
    'producer', // 制作人
    'kazuto kirigaya' // 桐谷和人
  ]
}
module.exports = config
