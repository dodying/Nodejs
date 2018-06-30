'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
let config = {
  'globRecursive': false,
  'comicFolder': 'F:\\Temp',
  'libraryFolder': 'F:\\ComicLibrary',
  'jTitle': false,
  'checkImageSize': true,
  'rateD': 1.1,
  'rateS': 0.9,
  'sizeD': 1280,
  'sizeS': 780,
  'cover': true,
  'subFolder': [
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
  'specialFolder': '#Star',
  'specialRule': [
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
      'artist': 'shousan bouzu | shioyama bou',
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
      'artist': 'azuma yuki | mitsubishi mikoto',
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
      'artist': 'tachibana omina | ominaeshi',
      'folder': '[后宫]立花オミナ'
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
      'folder': '[纯爱]ninoko'
    }, {
      'artist': 'akino sora',
      'folder': 'akino sora'
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
      'artist': 'nekometaru | necometal',
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
      'artist': 'usashiro mani | mani',
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
      'artist': /endou okito/,
      'folder': 'endou okito'
    }, {
      'Uploader': 'HUILENDASI',
      'folder': '[后宫]鬼畜王汉化组'
    }, {
      'title': /想抱(雷媽|雷妈)/,
      'folder': '[萝莉]想抱雷妈汉化组'
    }, {
      'female': 'netorare',
      'folder': '[标签]女性:NTR'
    }
  ],
  'parody': [{
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
  'removeCharacter': [
    'teitoku', //提督
    'producer', //制作人
    'kazuto kirigaya' //桐谷和人
  ]
};
exports.default = config;
