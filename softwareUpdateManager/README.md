<!-- TOC -->

- [SoftwareUpdateManager](#softwareupdatemanager)
  - [软件更新管理器](#软件更新管理器)
    - [Usage](#usage)
      - [使用说明](#使用说明)
    - [Software Example](#software-example)
      - [软件示例](#软件示例)
    - [Priority of Some Config](#priority-of-some-config)
      - [一些设置的优先级](#一些设置的优先级)
    - [Note](#note)
      - [说明](#说明)
    - [Supported Software](#supported-software)
      - [支持的软件](#支持的软件)

<!-- /TOC -->

# SoftwareUpdateManager
## 软件更新管理器

### Usage
#### 使用说明

0. 使用前，请先复制一份`config.js`，并按其中注释修改
1. `node index.js 7z AIMP`
  检查并更新这些软件(多个软件用`空格`间隔) (忽略更新间隔)
2. `node index.js -filter abc`
  检查并更新路径匹配的软件(多个匹配条件用`,`相隔) (忽略更新间隔)
3. `node index.js -onlycheck`
  获取网上软件的最新版本号，并写入`database.json` (忽略更新间隔)
  效果: 忽略当前最新版本
4. `node index.js -list`
  列出`database.json`中的软件及版本
5. `node index.js -makemd`
  根据`software`文件夹下的`js`文件创建`README.md`


### Software Example
#### 软件示例

请参照`software\Telegram.js`
```js
'use strict'

let data = {
  // ?commercial: true/false,
  // ?useProxy: true/false,
  useProxy: true,
  url: 'https://github.com/telegramdesktop/tdesktop/releases/latest',
  version: {
    selector: '.release-header a'
    // attr:
    // 1. text or omitted => text()
    // 2. html => html()
    // 3. other => attr(other)
    //
    // ?match:
    // 1. omitted => /([\d.]+)/[1]
    // 2. /other/ => /other/[1]
    // ---
    // or func: async (res, $) => { return version }
  },
  /**
   * download:
   * omitted => open url
   */
  download: {
    // --- mode 0
    // selector: 'a:contains("Download Portable Zip 64-bit")',
    // attr: 'href',
    // match: '', // omitted => /(.*)/[1]
    // --- mode 1
    // plain: 'url/to/download'
    //   you can use variables with {}
    //   defined variables:
    //     version: the latest version
    // --- mode 2
    // func: async (res, $) => { return url }
    selector: 'a[href$=".zip"]:has(small.text-gray)',
    attr: 'href',
    // ?output:
    // save to which
    // if start with .(dot), it'll be named as software + output
    // or omitted: software + extension according to download url
    output: 'Telegram.zip' // this is same as '.zip' or omitted
  },
  /**
   * omitted => install manually
   * install: async function(output, iPath)
   * @returns {boolean} if install completed
   * @param {string} output the path to the install pack file.
   * @param {string} iPath the path to the bin file.
   */
  install: function (output, iPath) {
    return require('./../js/install')(output, iPath)
  }
  /**
   * beforeInstall: async function(output, iPath)
   * afterInstall: async function(output, iPath)
   */
}
module.exports = data

```

### Priority of Some Config
#### 一些设置的优先级

1. 代理优先级(前提是设置了代理): `config.urlWithoutProxy > config.urlWithProxy > config.useProxy > software.useProxy`
2. 模式优先级: `config.specialMode > config.mode = config.commercialSoftware`


### Note
#### 说明

1. 以下软件，如果`通常版(installer)`与`便携版(portable)`功能相同则一般以绿色版优先，同时64位优先
2. 大多软件都支持自动安装
3. 带 :moneybag: 的为**商业软件**， 带 :airplane: 的需**番羽土墙**， 带 :hand: 的需**手动安装**
4. 这些站点默认视作 :airplane: : [SourceForge](https://sourceforge.net), [Github](https://github.com)

### Supported Software
#### 支持的软件

1. [7+ Taskbar Tweaker](https://rammichael.com/downloads/7tt_setup.exe?changelog) :airplane:
2. [7-Zip](https://www.7-zip.org/download.html)
3. [Actual Title Buttons](https://www.actualtools.com/titlebuttons/) :moneybag: :airplane:
4. [AIMP](http://www.aimp.ru/?do=download) :airplane:
5. [Anki](https://apps.ankiweb.net/) :airplane:
6. [Any Video Converter Ultimate](https://www.any-video-converter.com/products/for_video_ultimate/whatnew.php) :moneybag: :airplane:
7. [AnyDesk](https://anydesk.com/platforms/windows) :moneybag:
8. [aria2](https://github.com/aria2/aria2/releases/latest) :airplane:
9. [AutoHotkey](https://www.autohotkey.com/download/)
10. [AutoIt](https://www.autoitscript.com/site/autoit/downloads/)
11. [Bandizip](https://www.bandisoft.com/bandizip/)
12. [Beyond Compare](http://scootersoftware.com/download.php?zz=dl4) :moneybag:
13. [BiglyBT](https://github.com/BiglySoftware/BiglyBT/releases/latest) :airplane: :hand:
14. [Brook Tools](https://softs.loan/?dir=%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91/PC/Brook/Brook%20Tools)
15. [Brook](https://github.com/txthinking/brook/releases/latest) :airplane:
16. [Calibre](https://github.com/kovidgoyal/calibre/releases/latest) :airplane:
17. [CentBrowser](https://www.centbrowser.cn/history.html)
18. [Chrome](https://api.shuax.com/tools/getchrome) :airplane:
19. [ChromeUpdateSharp](https://csharp.love/chrome-update-tool.html)
20. [CLaunch](http://hp.vector.co.jp/authors/VA018351/claunch.html) :airplane:
21. [Cmder Mini](https://github.com/cmderdev/cmder/releases/latest) :airplane:
22. [ComicRack](http://comicrack.cyolito.com/downloads) :airplane:
23. [CopyQ](https://github.com/hluk/CopyQ/releases/latest) :airplane:
24. [cow](https://github.com/cyfdecyf/cow/releases/latest) :airplane:
25. [DB Browser for SQLite](https://github.com/sqlitebrowser/sqlitebrowser/releases/latest) :airplane:
26. [DevDocs Desktop](https://github.com/egoist/devdocs-desktop/releases/latest) :airplane:
27. [DiskGenius](http://www.eassos.com/download.php) :moneybag:
28. [Dism++](http://www.chuyu.me/zh-Hans/index.html)
29. [DisplayFusion](https://www.displayfusion.com/ChangeLog/) :moneybag: :airplane:
30. [DocFetcher](https://sourceforge.net/projects/docfetcher/files) :airplane:
31. [Dopamine](https://www.digimezzo.com/content/software/dopamine/) :airplane:
32. [Eric's Movie Database](http://www.emdb.eu/)
33. [Evernote](https://evernote.com/intl/zh-cn/download) :hand:
34. [Everything](https://www.voidtools.com/downloads/)
35. [ExtremeCopy](http://www.easersoft.com/product.html) :moneybag: :airplane:
36. [FastCopy-M](https://github.com/Mapaler/FastCopy-M/releases/latest) :airplane:
37. [FastCopy](https://fastcopy.jp/)
38. [ffmpeg](https://ffmpeg.zeranoe.com/builds/) :airplane:
39. [FileUploader](http://z-o-o-m.eu/down.htm) :airplane:
40. [firefly-proxy](https://github.com/yinghuocho/firefly-proxy/releases/latest) :airplane:
41. [FreeFileSync](https://freefilesync.org/download.php)
42. [FreeGate](https://github.com/freegate-release/website/) :airplane:
43. [GifCam](http://blog.bahraniapps.com/gifcam/) :airplane:
44. [Git for Windows Portable](https://github.com/git-for-windows/git/releases/latest) :airplane:
45. [Goflyway Tools](https://softs.loan/?dir=%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91/PC/GoFlyway/Goflyway%20Tools)
46. [goflyway](https://github.com/coyove/goflyway/releases) :airplane:
47. [golang](https://golang.org/dl/) :airplane:
48. [Honeyview](http://www.bandisoft.com/honeyview/)
49. [Hourglass](https://github.com/dziemborowicz/hourglass/releases/latest) :airplane:
50. [ImageMagick](http://www.imagemagick.org/script/download.php#windows)
51. [Inno Setup Unpacker](https://sourceforge.net/projects/innounp/files/innounp/) :airplane:
52. [Inno Setup](http://www.jrsoftware.org/isdl.php)
53. [Internet Download Manager](http://www.internetdownloadmanager.com/) :moneybag: :hand:
55. [JiJiDownForWPF](http://l.acesheep.com/bili/re.php?callback=?)
56. [LabelPlus](https://github.com/LabelPlus/LabelPlus/releases/latest) :airplane:
57. [launch4j](https://sourceforge.net/projects/launch4j/files/) :airplane:
58. [Lepton](https://github.com/hackjutsu/Lepton/releases/latest) :airplane:
59. [LICEcap](https://www.cockos.com/licecap/)
60. [MDB Viewer Plus](http://www.alexnolan.net/software/mdbplus.xml)
61. [MediaInfo-CLI](https://mediaarea.net/en/MediaInfo/Download/Windows)
62. [MediaInfo-GUI](https://mediaarea.net/en/MediaInfo/Download/Windows)
63. [MeGUI](https://sourceforge.net/projects/megui/files) :airplane:
64. [MemReduct](https://github.com/henrypp/memreduct/releases/latest)
65. [MiTec EXE Explorer](http://www.mitec.cz/index.html)
66. [MiTec Task Manager DeLuxe](http://www.mitec.cz/Data/XML/data_tmxvh.xml)
67. [MPC-BE](https://sourceforge.net/projects/mpcbe/files/) :airplane:
68. [MPC-HC](https://mpc-hc.org/downloads/)
69. [Nodejs-LTS](https://nodejs.org/en/download/)
70. [Nodejs](https://nodejs.org/en/download/current/)
71. [notepad++](https://notepad-plus-plus.org/download/) :airplane:
72. [notepad2-mod](https://github.com/XhmikosR/notepad2-mod/releases/latest) :airplane:
73. [nTurn](https://www.ntrun.com/) :hand:
74. [Office Tool Plus](https://otp.landian.la/zh-cn/)
75. [OnTopReplica](https://github.com/LorenzCK/OnTopReplica/releases/latest) :airplane:
76. [PicGo](https://github.com/Molunerfinn/PicGo/releases/latest) :airplane:
77. [PicPick](https://picpick.app/zh/download) :airplane:
78. [Piriform CCleaner](https://www.ccleaner.com/ccleaner/download) :moneybag:
79. [Piriform Defraggler](https://www.ccleaner.com/defraggler/download) :moneybag:
80. [Piriform Recuva](https://www.ccleaner.com/recuva/download) :moneybag:
81. [Piriform Speccy](https://www.ccleaner.com/speccy/download) :moneybag:
82. [PlayTime](http://www.dcmembers.com/skwire/download/playtime/) :airplane:
83. [PotPlayer](https://potplayer.daum.net/)
84. [qBittorrent](https://www.qbittorrent.org/download.php) :airplane:
85. [QTranslate](https://quest-app.appspot.com/) :airplane:
86. [Rapid Environment Editor](https://www.rapidee.com/en/download) :airplane:
87. [Registry Workshop](http://www.torchsoft.com/en/download.html) :moneybag:
88. [Resource Hacker](http://www.angusj.com/resourcehacker/)
89. [Resource Tuner](http://www.restuner.com/news-history.htm) :moneybag: :airplane:
90. [Right Click Enhancer Professional](https://rbsoft.org/downloads/right-click-enhancer/rce-professional-changelog.html) :moneybag: :airplane:
91. [Rufus](https://rufus.akeo.ie/)
92. [ScreenToGif](https://github.com/NickeManarin/ScreenToGif/releases/latest) :airplane:
93. [shadowsocks-qt5](https://github.com/shadowsocks/shadowsocks-qt5/releases/latest) :airplane: :hand:
94. [shadowsocks](https://github.com/shadowsocks/shadowsocks-windows/releases/latest) :airplane:
95. [shadowsocksr-csharp](https://github.com/shadowsocksrr/shadowsocksr-csharp/releases) :airplane:
96. [shadowsocksr-electron](https://github.com/erguotou520/electron-ssr/releases/latest) :airplane:
97. [SmartGit](https://www.syntevo.com/smartgit/download/) :moneybag:
98. [Sordum BlueLife KeyFreeze](https://www.sordum.org/7921/)
99. [Sordum Defender Injector](https://www.sordum.org/10636/)
100. [Sordum Desktop.ini Editor](https://www.sordum.org/10084/)
101. [Sordum Dns Jumper](https://www.sordum.org/7952/)
102. [Sordum Drive Letter Changer](https://www.sordum.org/8501/)
103. [Sordum Firewall App Blocker](https://www.sordum.org/8125/)
104. [Sordum Folder Painter](https://www.sordum.org/10124/)
105. [Sordum Reduce Memory](https://www.sordum.org/9197/)
106. [Sordum Reg Converter](https://www.sordum.org/8478/)
107. [Sordum Simple Run Blocker](https://www.sordum.org/8486/)
108. [Sordum Windows Update Blocker](https://www.sordum.org/9470/)
109. [SpeedCrunch](http://speedcrunch.org/download.html)
110. [SpeedyFox](https://www.crystalidea.com/speedyfox)
111. [Telegram](https://github.com/telegramdesktop/tdesktop/releases/latest) :airplane:
112. [Textify](https://rammichael.com/downloads/textify_setup.exe?changelog) :airplane:
113. [Tor Browser](https://www.torproject.org/download/download-easy.html.en) :airplane:
114. [Total Commander](https://www.ghisler.com/download.htm) :moneybag: :airplane:
115. [Total Uninstall](https://www.martau.com/uninstaller-download.php) :moneybag: :airplane:
116. [TrafficMonitor](https://github.com/zhongyang219/TrafficMonitor/releases/latest) :airplane:
117. [Transmission](https://github.com/transmission/transmission/releases/latest) :airplane:
118. [Traymond](https://github.com/fcFn/traymond/releases/latest) :airplane:
119. [ultraSurf](http://wujieliulan.com/) :airplane:
120. [Universal Extractor 2](https://github.com/Bioruebe/UniExtract2/releases/latest) :airplane:
121. [Unreal Commander](https://x-diesel.com/?download)
122. [uTorrent](http://blog.utorrent.com/releases/windows/) :moneybag: :hand:
123. [v2ray](https://github.com/v2ray/v2ray-core/releases/latest) :airplane:
124. [v2rayN](https://github.com/2dust/v2rayN/releases/latest) :airplane:
125. [Velocity](https://velocity.silverlakesoftware.com/) :moneybag:
126. [Video Download Manager](https://github.com/ingbyr/VDM/releases/latest) :airplane:
127. [Visual Studio Code](https://github.com/Microsoft/vscode/releases)
128. [Volume2](https://irzyxa.blogspot.com/p/downloads.html) :airplane:
129. [WGestures](https://github.com/yingDev/WGestures/releases/latest) :airplane:
130. [WinCDEmu Portable](http://wincdemu.sysprogs.org/portable/)
131. [Windows System Control Center](http://www.kls-soft.com/wscc/downloads.php) :airplane:
132. [WinHex](http://www.x-ways.net/winhex/) :moneybag:
133. [Xlideit Image Viewer](https://sourceforge.net/projects/xlideit/files) :airplane:
134. [XX-Net](https://github.com/XX-net/XX-Net/blob/master/code/default/download.md) :airplane:
135. [Yosoro](https://github.com/IceEnd/Yosoro/releases/latest) :airplane:
136. [zeal](https://zealdocs.org/download.html) :airplane:
137. [ZeroNet](https://github.com/HelloZeroNet/ZeroNet/releases/latest) :airplane:
138. [冰点文库下载器](http://www.bingdian001.com/?p=30) :hand:
139. [繁化姬](https://github.com/James1201/Fanhuaji-GUI-Release/releases/latest) :airplane:

