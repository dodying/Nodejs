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
7. [AutoHotkey](https://www.autohotkey.com/download/)
8. [AutoIt](https://www.autoitscript.com/site/autoit/downloads/)
9. [Bandizip](https://www.bandisoft.com/bandizip/)
10. [Brook Tools](https://softs.loan/?dir=%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91/PC/Brook/Brook%20Tools)
11. [Brook](https://github.com/txthinking/brook/releases/latest)
12. [Calibre](https://github.com/kovidgoyal/calibre/releases/latest)
13. [CentBrowser](https://www.centbrowser.cn/history.html)
14. [Chrome](https://api.shuax.com/tools/getchrome)
15. [ChromeUpdateSharp](https://csharp.love/chrome_update_tool.html)
16. [CLaunch](http://hp.vector.co.jp/authors/VA018351/claunch.html)
17. [Cmder Mini](https://github.com/cmderdev/cmder/releases/latest)
18. [ComicRack](http://comicrack.cyolito.com/downloads)
19. [CopyQ](https://github.com/hluk/CopyQ/releases/latest)
20. [cow](https://github.com/cyfdecyf/cow/releases/latest)
21. [DevDocs Desktop](https://github.com/egoist/devdocs-desktop/releases/latest)
22. [DiskGenius](http://www.eassos.com/download.php)
23. [Dism++](http://www.chuyu.me/zh-Hans/index.html)
24. [DisplayFusion](https://www.displayfusion.com/ChangeLog/)
25. [DocFetcher](https://sourceforge.net/projects/docfetcher/files)
26. [Dopamine](https://www.digimezzo.com/content/software/dopamine/)
27. [Everything](https://www.voidtools.com/downloads/)
28. [ExtremeCopy](http://www.easersoft.com/product.html)
29. [firefly-proxy](https://github.com/yinghuocho/firefly-proxy/releases/latest)
30. [FolderPainter](https://www.sordum.org/10124/)
31. [FreeGate](https://github.com/freegate-release/website/)
32. [Git for Windows Portable](https://github.com/git-for-windows/git/releases/latest)
33. [Goflyway Tools](https://softs.loan/?dir=%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91/PC/GoFlyway/Goflyway%20Tools)
34. [goflyway](https://github.com/coyove/goflyway/releases)
35. [golang](https://golang.org/dl/)
36. [Honeyview](http://www.bandisoft.com/honeyview/)
37. [Internet Download Manager](http://www.internetdownloadmanager.com/)
38. [JiJiDownForWPF](http://l.acesheep.com/bili/re.php?callback=?)
39. [LabelPlus](https://github.com/LabelPlus/LabelPlus/releases/latest)
40. [launch4j](https://sourceforge.net/projects/launch4j/files/)
41. [Lepton](https://github.com/hackjutsu/Lepton/releases/latest)
42. [MemReduct](https://github.com/henrypp/memreduct/releases/latest)
43. [MPC-BE](https://sourceforge.net/projects/mpcbe/files/)
44. [MPC-HC](https://mpc-hc.org/downloads/)
45. [Nodejs-LTS](https://nodejs.org/en/download/)
46. [Nodejs](https://nodejs.org/en/download/current/)
47. [notepad++](https://notepad-plus-plus.org/download/)
48. [OnTopReplica](https://github.com/LorenzCK/OnTopReplica/releases/latest)
49. [PicGo](https://github.com/Molunerfinn/PicGo/releases/latest)
50. [PicPick](https://picpick.app/zh/download)
51. [PlayTime](http://www.dcmembers.com/skwire/download/playtime/)
52. [PotPlayer](https://potplayer.daum.net/)
53. [Registry Workshop](http://www.torchsoft.com/en/download.html)
54. [Resource Tuner](http://www.restuner.com/news-history.htm)
55. [Right Click Enhancer Professional](https://rbsoft.org/downloads/right-click-enhancer/rce-professional-changelog.html)
56. [shadowsocks-qt5](https://github.com/shadowsocks/shadowsocks-qt5/releases/latest)
57. [shadowsocks](https://github.com/shadowsocks/shadowsocks-windows/releases/latest)
58. [shadowsocksr-csharp](https://github.com/shadowsocksrr/shadowsocksr-csharp/releases)
59. [shadowsocksr-electron](https://github.com/erguotou520/electron-ssr/releases/latest)
60. [SmartGit](https://www.syntevo.com/smartgit/download/)
61. [SpeedCrunch](http://speedcrunch.org/download.html)
62. [Telegram](https://github.com/telegramdesktop/tdesktop/releases/latest)
63. [Textify](https://rammichael.com/downloads/textify_setup.exe?changelog)
64. [Total Commander](https://www.ghisler.com/download.htm)
65. [Total Uninstall](https://www.martau.com/uninstaller-download.php)
66. [TrafficMonitor](https://github.com/zhongyang219/TrafficMonitor/releases/latest)
67. [ultraSurf](http://wujieliulan.com/)
68. [Universal Extractor 2](https://github.com/Bioruebe/UniExtract2/releases/latest)
69. [uTorrent](http://blog.utorrent.com/releases/windows/)
70. [v2ray](https://github.com/v2ray/v2ray-core/releases/latest)
71. [v2rayN](https://github.com/2dust/v2rayN/releases/latest)
72. [Velocity](https://velocity.silverlakesoftware.com/)
73. [Visual Studio Code](https://github.com/Microsoft/vscode/releases)
74. [Volume2](https://irzyxa.blogspot.com/p/downloads.html)
75. [WGestures](https://github.com/yingDev/WGestures/releases/latest)
76. [Windows System Control Center](http://www.kls-soft.com/wscc/downloads.php)
77. [WinHex](http://www.x-ways.net/winhex/)
78. [XX-Net](https://github.com/XX-net/XX-Net/blob/master/code/default/download.md)
79. [Yosoro](https://github.com/IceEnd/Yosoro/releases/latest)
80. [zeal](https://zealdocs.org/download.html)
81. [ZeroNet](https://github.com/HelloZeroNet/ZeroNet/releases/latest)
