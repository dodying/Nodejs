### SoftwareUpdateManager
#### 软件更新管理器

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

### Supported Software
#### 支持的软件
1. [7+ Taskbar Tweaker](https://rammichael.com/downloads/7tt_setup.exe?changelog)
2. [7-Zip](https://www.7-zip.org/download.html)
3. [Actual Title Buttons](https://www.actualtools.com/titlebuttons/)
4. [AIMP](http://www.aimp.ru/?do=download)
5. [Anki](https://apps.ankiweb.net/)
6. [Any Video Converter Ultimate](https://www.any-video-converter.com/products/for_video_ultimate/whatnew.php)
7. [AnyDesk](https://anydesk.com/platforms/windows)
8. [AutoHotkey](https://www.autohotkey.com/download/)
9. [AutoIt](https://www.autoitscript.com/site/autoit/downloads/)
10. [Bandizip](https://www.bandisoft.com/bandizip/)
11. [Brook Tools](https://softs.loan/?dir=%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91/PC/Brook/Brook%20Tools)
12. [Brook](https://github.com/txthinking/brook/releases/latest)
13. [Calibre](https://github.com/kovidgoyal/calibre/releases/latest)
14. [CentBrowser](https://www.centbrowser.cn/history.html)
15. [Chrome](https://api.shuax.com/tools/getchrome)
16. [ChromeUpdateSharp](https://csharp.love/chrome_update_tool.html)
17. [CLaunch](http://hp.vector.co.jp/authors/VA018351/claunch.html)
18. [Cmder Mini](https://github.com/cmderdev/cmder/releases/latest)
19. [ComicRack](http://comicrack.cyolito.com/downloads)
20. [CopyQ](https://github.com/hluk/CopyQ/releases/latest)
21. [cow](https://github.com/cyfdecyf/cow/releases/latest)
22. [DevDocs Desktop](https://github.com/egoist/devdocs-desktop/releases/latest)
23. [DiskGenius](http://www.eassos.com/download.php)
24. [Dism++](http://www.chuyu.me/zh-Hans/index.html)
25. [DisplayFusion](https://www.displayfusion.com/ChangeLog/)
26. [DocFetcher](https://sourceforge.net/projects/docfetcher/files)
27. [Dopamine](https://www.digimezzo.com/content/software/dopamine/)
28. [Everything](https://www.voidtools.com/downloads/)
29. [ExtremeCopy](http://www.easersoft.com/product.html)
30. [ffmpeg](https://ffmpeg.zeranoe.com/builds/)
31. [firefly-proxy](https://github.com/yinghuocho/firefly-proxy/releases/latest)
32. [FolderPainter](https://www.sordum.org/10124/)
33. [FreeGate](https://github.com/freegate-release/website/)
34. [Git for Windows Portable](https://github.com/git-for-windows/git/releases/latest)
35. [Goflyway Tools](https://softs.loan/?dir=%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91/PC/GoFlyway/Goflyway%20Tools)
36. [goflyway](https://github.com/coyove/goflyway/releases)
37. [golang](https://golang.org/dl/)
38. [Honeyview](http://www.bandisoft.com/honeyview/)
39. [Hourglass](https://github.com/dziemborowicz/hourglass/releases/latest)
40. [ImageMagick](http://www.imagemagick.org/script/download.php#windows)
41. [Inno Setup Unpacker](https://sourceforge.net/projects/innounp/files/innounp/)
42. [Internet Download Manager](http://www.internetdownloadmanager.com/)
43. [JiJiDownForWPF](http://l.acesheep.com/bili/re.php?callback=?)
44. [LabelPlus](https://github.com/LabelPlus/LabelPlus/releases/latest)
45. [launch4j](https://sourceforge.net/projects/launch4j/files/)
46. [Lepton](https://github.com/hackjutsu/Lepton/releases/latest)
47. [MediaInfo-CLI](https://mediaarea.net/en/MediaInfo/Download/Windows)
48. [MediaInfo-GUI](https://mediaarea.net/en/MediaInfo/Download/Windows)
49. [MemReduct](https://github.com/henrypp/memreduct/releases/latest)
50. [MPC-BE](https://sourceforge.net/projects/mpcbe/files/)
51. [MPC-HC](https://mpc-hc.org/downloads/)
52. [Nodejs-LTS](https://nodejs.org/en/download/)
53. [Nodejs](https://nodejs.org/en/download/current/)
54. [notepad++](https://notepad-plus-plus.org/download/)
55. [OnTopReplica](https://github.com/LorenzCK/OnTopReplica/releases/latest)
56. [PicGo](https://github.com/Molunerfinn/PicGo/releases/latest)
57. [PicPick](https://picpick.app/zh/download)
58. [PlayTime](http://www.dcmembers.com/skwire/download/playtime/)
59. [PotPlayer](https://potplayer.daum.net/)
60. [Registry Workshop](http://www.torchsoft.com/en/download.html)
61. [Resource Tuner](http://www.restuner.com/news-history.htm)
62. [Right Click Enhancer Professional](https://rbsoft.org/downloads/right-click-enhancer/rce-professional-changelog.html)
63. [shadowsocks-qt5](https://github.com/shadowsocks/shadowsocks-qt5/releases/latest)
64. [shadowsocks](https://github.com/shadowsocks/shadowsocks-windows/releases/latest)
65. [shadowsocksr-csharp](https://github.com/shadowsocksrr/shadowsocksr-csharp/releases)
66. [shadowsocksr-electron](https://github.com/erguotou520/electron-ssr/releases/latest)
67. [SmartGit](https://www.syntevo.com/smartgit/download/)
68. [SpeedCrunch](http://speedcrunch.org/download.html)
69. [Telegram](https://github.com/telegramdesktop/tdesktop/releases/latest)
70. [Textify](https://rammichael.com/downloads/textify_setup.exe?changelog)
71. [Tor Browser](https://www.torproject.org/download/download-easy.html.en)
72. [Total Commander](https://www.ghisler.com/download.htm)
73. [Total Uninstall](https://www.martau.com/uninstaller-download.php)
74. [TrafficMonitor](https://github.com/zhongyang219/TrafficMonitor/releases/latest)
75. [ultraSurf](http://wujieliulan.com/)
76. [Universal Extractor 2](https://github.com/Bioruebe/UniExtract2/releases/latest)
77. [uTorrent](http://blog.utorrent.com/releases/windows/)
78. [v2ray](https://github.com/v2ray/v2ray-core/releases/latest)
79. [v2rayN](https://github.com/2dust/v2rayN/releases/latest)
80. [Velocity](https://velocity.silverlakesoftware.com/)
81. [Visual Studio Code](https://github.com/Microsoft/vscode/releases)
82. [Volume2](https://irzyxa.blogspot.com/p/downloads.html)
83. [WGestures](https://github.com/yingDev/WGestures/releases/latest)
84. [Windows System Control Center](http://www.kls-soft.com/wscc/downloads.php)
85. [WinHex](http://www.x-ways.net/winhex/)
86. [XX-Net](https://github.com/XX-net/XX-Net/blob/master/code/default/download.md)
87. [Yosoro](https://github.com/IceEnd/Yosoro/releases/latest)
88. [zeal](https://zealdocs.org/download.html)
89. [ZeroNet](https://github.com/HelloZeroNet/ZeroNet/releases/latest)
