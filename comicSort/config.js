'use strict'

let config = {
  '7z': 'D:\\GreenSoftware\\_Basis\\7-Zip\\7z.exe',
  proxy: 'http://127.0.0.1:2346',
  globRecursive: true,
  comicFolder: 'F:\\Temp',
  libraryFolder: 'F:\\ComicLibraryNew',
  jTitle: false,
  delIntroPic: true,
  introPic: [ '01c9b75a4f', '047379e168', '04c7df9318', '08f78aed5a', '096712ffd7', '09fe6b9a55', '0b34a8553b', '0cebce8abd', '0de93ecf0d', '0ec8fc9b72', '0f480f45a4', '0fe76e7ef3', '10027a8e65', '10970b069b', '10f227dc03', '11c7c2baf0', '13536e68df', '153267b08d', '17f9d9ba37', '1877d56115', '1c6a1e52af', '1db1203303', '1e402f0f53', '1edeab5112', '1f3ba78557', '1f9f5f0455', '218a909563', '21eb59053f', '220fe636f3', '22b1d4ebd4', '232e2a58dd', '2494482757', '26a6238844', '2716ad4d6c', '279244b5d9', '27dddf4c0c', '28c583d537', '296fdd3d46', '2dbecc067f', '2f9c7c93bf', '314e942ff8', '327579d54b', '3590841471', '35db0e958e', '3844b1cb1e', '3d0ad385e2', '3de6720c2e', '3e2d10e613', '40c68fca53', '42f952f114', '43067d768b', '4354346b0f', '45019d91e7', '4812b50afe', '4a1e4ec359', '4b06c068a9', '4d6b8506d3', '4dbde53805', '51991d0bb9', '51e3b40649', '5230467b48', '5512077961', '561595013b', '57099854b7', '5c0cb48a81', '5c1f1558c1', '5c6d42c811', '5d0770c2f4', '5ebea5e33d', '5f24a9d3e5', '5fe30304c3', '6215ff4e19', '62c4cab030', '63b5c215bb', '64209bac21', '648ec7d480', '65a2c9cafa', '683f48d8e8', '694f58e45e', '696e67202c', '69ff83db2a', '6a1f841bfe', '6ac16b45ca', '6b04214926', '6d58eb8ec6', '6e56a2ba2f', '6fb883e08e', '7070783c22', '709d72526d', '7155d6da0c', '724b736b85', '72cde6d709', '7374ce0813', '76cace658d', '76eb58fb06', '777b84d450', '78500842f0', '7a177d153c', '7a326e8812', '7b88fccc0b', '7ba38927f1', '7f7daa231f', '80d6e2739c', '80f82ac025', '81e88b4743', '8459f073c9', '8575c161e3', '88a81a5919', '8b7d43e713', '8c6cdc818b', '8ca2275327', '8e21688aff', '9108df6263', '91e1921760', '9219a21b5c', '936123901c', '94149929c5', '9514cd71b0', '975d300af2', '9962ef2da0', '99a5b3329c', '9a2db889fc', '9bf2c60988', '9c886361b7', '9d1afcfa9f', '9fd0569cf0', 'a067351faf', 'a270087bf4', 'a34aedff53', 'a4c62781b7', 'a4f14d384e', 'a52efe6a52', 'a559f2a2ce', 'a63cb2f101', 'a90d4d4842', 'aac5a755cf', 'ab31dc6dfc', 'ac47b07a80', 'ad6eb5f7f6', 'ae82a2990c', 'aeda509902', 'af3b48d59b', 'b290f6796b', 'b3b922542f', 'b40da3921e', 'b52e58da52', 'b538de4398', 'b5f93ceea4', 'b7d79f4b9a', 'b7e4932d52', 'b9a2f6e4fa', 'bb8cb1f8a3', 'bb956b36f4', 'bd42c475b7', 'be3393a4f7', 'be990c6fd3', 'c2ad27379a', 'c30fe49512', 'c3ae070961', 'c493e654e5', 'c78220c4f3', 'c7a88f9784', 'c8d2ff755b', 'c9e23490e9', 'cb33309296', 'cba27b6c5b', 'cc480dfa5c', 'cea1eed92a', 'cee7227cc5', 'cf5e9f826d', 'd1b3f69da1', 'd226489fc4', 'd2f32d160c', 'd408cc8bcd', 'd5e5719bbb', 'd6195cd4d0', 'd7286fd2cc', 'd7436f77a6', 'd7d55f85cc', 'dbb6accf9a', 'dc4461c674', 'dc81823121', 'ddd81dc53a', 'df536ccecc', 'e05c770585', 'e0e8b6e529', 'e21670f4e7', 'e342bc5b98', 'e4e4abf3ff', 'e4f2df0dd0', 'e56892250c', 'e5ed033033', 'e7db8c9963', 'e88dab0d1f', 'e8d095da2c', 'ebd7ed2c62', 'ec5af0fc50', 'edba62ab8e', 'ee471c07b3', 'ee9af0c06d', 'eec614534a', 'f08b54c152', 'f0a803e94b', 'f727a96e54', 'f753701608', 'f79eac3b6d', 'f8c8ea8eb4', 'fa71e5ba84', 'fa881d015c', 'fb2b3a3034', 'fb336d9e48', 'fb6a20ffc7', 'fb71027a31', 'fd8c04296d', 'ff0992e487', 'ffa6cd83f9' ],
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
