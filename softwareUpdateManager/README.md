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


### Priority of Some Config
#### 一些设置的优先级

1. 代理优先级(前提是设置了代理): `config.urlWithoutProxy > config.urlWithProxy > config.useProxy > software.useProxy`
2. 模式优先级: `config.specialMode > config.mode = config.commercialSoftware`


### Note
#### 说明

1. 以下软件，如果`通常版(installer)`与`便携版(portable)`功能相同则一般以绿色版优先，同时64位优先
2. 大多软件都支持自动安装
3. 带 :moneybag: 的为**商业软件**， 带 :airplane: 的需**番羽土墙**， 带 :hand: 的需**手动安装**

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
13. [Brook Tools](https://softs.loan/?dir=%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91/PC/Brook/Brook%20Tools)
14. [Brook](https://github.com/txthinking/brook/releases/latest) :airplane:
15. [Calibre](https://github.com/kovidgoyal/calibre/releases/latest) :airplane:
16. [CentBrowser](https://www.centbrowser.cn/history.html)
17. [Chrome](https://api.shuax.com/tools/getchrome) :airplane:
18. [ChromeUpdateSharp](https://csharp.love/chrome-update-tool.html)
19. [CLaunch](http://hp.vector.co.jp/authors/VA018351/claunch.html) :airplane:
20. [Cmder Mini](https://github.com/cmderdev/cmder/releases/latest) :airplane:
21. [ComicRack](http://comicrack.cyolito.com/downloads) :airplane:
22. [CopyQ](https://github.com/hluk/CopyQ/releases/latest) :airplane:
23. [cow](https://github.com/cyfdecyf/cow/releases/latest) :airplane:
24. [DevDocs Desktop](https://github.com/egoist/devdocs-desktop/releases/latest) :airplane:
25. [DiskGenius](http://www.eassos.com/download.php) :moneybag:
26. [Dism++](http://www.chuyu.me/zh-Hans/index.html)
27. [DisplayFusion](https://www.displayfusion.com/ChangeLog/) :moneybag: :airplane:
28. [DocFetcher](https://sourceforge.net/projects/docfetcher/files) :airplane:
29. [Dopamine](https://www.digimezzo.com/content/software/dopamine/) :airplane:
30. [Everything](https://www.voidtools.com/downloads/)
31. [ExtremeCopy](http://www.easersoft.com/product.html) :moneybag: :airplane:
32. [FastCopy-M](https://github.com/Mapaler/FastCopy-M/releases/latest) :airplane:
33. [FastCopy](https://fastcopy.jp/)
34. [ffmpeg](https://ffmpeg.zeranoe.com/builds/) :airplane:
35. [FileUploader](http://z-o-o-m.eu/down.htm) :airplane:
36. [firefly-proxy](https://github.com/yinghuocho/firefly-proxy/releases/latest) :airplane:
37. [FreeFileSync](https://freefilesync.org/download.php)
38. [FreeGate](https://github.com/freegate-release/website/) :airplane:
39. [GifCam](http://blog.bahraniapps.com/gifcam/) :airplane:
40. [Git for Windows Portable](https://github.com/git-for-windows/git/releases/latest) :airplane:
41. [Goflyway Tools](https://softs.loan/?dir=%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91/PC/GoFlyway/Goflyway%20Tools)
42. [goflyway](https://github.com/coyove/goflyway/releases) :airplane:
43. [golang](https://golang.org/dl/) :airplane:
44. [Honeyview](http://www.bandisoft.com/honeyview/)
45. [Hourglass](https://github.com/dziemborowicz/hourglass/releases/latest) :airplane:
46. [ImageMagick](http://www.imagemagick.org/script/download.php#windows)
47. [Inno Setup Unpacker](https://sourceforge.net/projects/innounp/files/innounp/) :airplane:
48. [Inno Setup](http://www.jrsoftware.org/isdl.php)
49. [Internet Download Manager](http://www.internetdownloadmanager.com/) :moneybag: :hand:
51. [JiJiDownForWPF](http://l.acesheep.com/bili/re.php?callback=?)
52. [LabelPlus](https://github.com/LabelPlus/LabelPlus/releases/latest) :airplane:
53. [launch4j](https://sourceforge.net/projects/launch4j/files/) :airplane:
54. [Lepton](https://github.com/hackjutsu/Lepton/releases/latest) :airplane:
55. [LICEcap](https://www.cockos.com/licecap/)
56. [MDB Viewer Plus](http://www.alexnolan.net/software/mdbplus.xml)
57. [MediaInfo-CLI](https://mediaarea.net/en/MediaInfo/Download/Windows)
58. [MediaInfo-GUI](https://mediaarea.net/en/MediaInfo/Download/Windows)
59. [MemReduct](https://github.com/henrypp/memreduct/releases/latest)
60. [MiTec EXE Explorer](http://www.mitec.cz/index.html)
61. [MiTec Task Manager DeLuxe](http://www.mitec.cz/Data/XML/data_tmxvh.xml)
62. [MPC-BE](https://sourceforge.net/projects/mpcbe/files/) :airplane:
63. [MPC-HC](https://mpc-hc.org/downloads/)
64. [Nodejs-LTS](https://nodejs.org/en/download/)
65. [Nodejs](https://nodejs.org/en/download/current/)
66. [notepad++](https://notepad-plus-plus.org/download/) :airplane:
67. [notepad2-mod](https://github.com/XhmikosR/notepad2-mod/releases/latest) :airplane:
68. [OnTopReplica](https://github.com/LorenzCK/OnTopReplica/releases/latest) :airplane:
69. [PicGo](https://github.com/Molunerfinn/PicGo/releases/latest) :airplane:
70. [PicPick](https://picpick.app/zh/download) :airplane:
71. [Piriform CCleaner](https://www.ccleaner.com/ccleaner/download) :moneybag:
72. [Piriform Defraggler](https://www.ccleaner.com/defraggler/download) :moneybag:
73. [Piriform Recuva](https://www.ccleaner.com/recuva/download) :moneybag:
74. [Piriform Speccy](https://www.ccleaner.com/speccy/download) :moneybag:
75. [PlayTime](http://www.dcmembers.com/skwire/download/playtime/) :airplane:
76. [PotPlayer](https://potplayer.daum.net/)
77. [qBittorrent](https://www.qbittorrent.org/download.php) :airplane:
78. [QTranslate](https://quest-app.appspot.com/) :airplane:
79. [Rapid Environment Editor](https://www.rapidee.com/en/download) :airplane:
80. [Registry Workshop](http://www.torchsoft.com/en/download.html) :moneybag:
81. [Resource Hacker](http://www.angusj.com/resourcehacker/)
82. [Resource Tuner](http://www.restuner.com/news-history.htm) :moneybag: :airplane:
83. [Right Click Enhancer Professional](https://rbsoft.org/downloads/right-click-enhancer/rce-professional-changelog.html) :moneybag: :airplane:
84. [Rufus](https://rufus.akeo.ie/)
85. [ScreenToGif](https://github.com/NickeManarin/ScreenToGif/releases/latest) :airplane:
86. [shadowsocks-qt5](https://github.com/shadowsocks/shadowsocks-qt5/releases/latest) :airplane: :hand:
87. [shadowsocks](https://github.com/shadowsocks/shadowsocks-windows/releases/latest) :airplane:
88. [shadowsocksr-csharp](https://github.com/shadowsocksrr/shadowsocksr-csharp/releases) :airplane:
89. [shadowsocksr-electron](https://github.com/erguotou520/electron-ssr/releases/latest) :airplane:
90. [SmartGit](https://www.syntevo.com/smartgit/download/) :moneybag:
91. [Sordum BlueLife KeyFreeze](https://www.sordum.org/7921/)
92. [Sordum Defender Injector](https://www.sordum.org/10636/)
93. [Sordum Desktop.ini Editor](https://www.sordum.org/10084/)
94. [Sordum Dns Jumper](https://www.sordum.org/7952/)
95. [Sordum Drive Letter Changer](https://www.sordum.org/8501/)
96. [Sordum Firewall App Blocker](https://www.sordum.org/8125/)
97. [Sordum Folder Painter](https://www.sordum.org/10124/)
98. [Sordum Reduce Memory](https://www.sordum.org/9197/)
99. [Sordum Reg Converter](https://www.sordum.org/8478/)
100. [Sordum Simple Run Blocker](https://www.sordum.org/8486/)
101. [Sordum Windows Update Blocker](https://www.sordum.org/9470/)
102. [SpeedCrunch](http://speedcrunch.org/download.html)
103. [SpeedyFox](https://www.crystalidea.com/speedyfox)
104. [Telegram](https://github.com/telegramdesktop/tdesktop/releases/latest) :airplane:
105. [Textify](https://rammichael.com/downloads/textify_setup.exe?changelog) :airplane:
106. [Tor Browser](https://www.torproject.org/download/download-easy.html.en) :airplane:
107. [Total Commander](https://www.ghisler.com/download.htm) :moneybag: :airplane:
108. [Total Uninstall](https://www.martau.com/uninstaller-download.php) :moneybag: :airplane:
109. [TrafficMonitor](https://github.com/zhongyang219/TrafficMonitor/releases/latest) :airplane:
110. [Transmission](https://github.com/transmission/transmission/releases/latest) :airplane:
111. [Traymond](https://github.com/fcFn/traymond/releases/latest) :airplane:
112. [ultraSurf](http://wujieliulan.com/) :airplane:
113. [Universal Extractor 2](https://github.com/Bioruebe/UniExtract2/releases/latest) :airplane:
114. [uTorrent](http://blog.utorrent.com/releases/windows/) :moneybag: :hand:
115. [v2ray](https://github.com/v2ray/v2ray-core/releases/latest) :airplane:
116. [v2rayN](https://github.com/2dust/v2rayN/releases/latest) :airplane:
117. [Velocity](https://velocity.silverlakesoftware.com/) :moneybag:
118. [Visual Studio Code](https://github.com/Microsoft/vscode/releases)
119. [Volume2](https://irzyxa.blogspot.com/p/downloads.html) :airplane:
120. [WGestures](https://github.com/yingDev/WGestures/releases/latest) :airplane:
121. [WinCDEmu Portable](http://wincdemu.sysprogs.org/portable/)
122. [Windows System Control Center](http://www.kls-soft.com/wscc/downloads.php) :airplane:
123. [WinHex](http://www.x-ways.net/winhex/) :moneybag:
124. [Xlideit Image Viewer](https://sourceforge.net/projects/xlideit/files) :airplane:
125. [XX-Net](https://github.com/XX-net/XX-Net/blob/master/code/default/download.md) :airplane:
126. [Yosoro](https://github.com/IceEnd/Yosoro/releases/latest) :airplane:
127. [zeal](https://zealdocs.org/download.html) :airplane:
128. [ZeroNet](https://github.com/HelloZeroNet/ZeroNet/releases/latest) :airplane:
129. [冰点文库下载器](http://www.bingdian001.com/?p=30) :hand:
130. [繁化姬](https://github.com/James1201/Fanhuaji-GUI-Release/releases/latest) :airplane:
