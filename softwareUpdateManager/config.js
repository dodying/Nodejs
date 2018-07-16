'use strict'
/* eslint-disable comma-dangle */

let config = {
  mode: 2, // 模式(对于免费软件) 0:只检查有无新版本 1.下载新版本安装包后不自动安装 2.下载并自动安装新版本
  commercialMode: 0, // 对于商业软件 0:只检查有无新版本 1.下载新版本安装包后不自动安装 2.下载并自动安装新版本
  specialMode: { // 为特定软件设置特定模式(最优先)
    'SmartGit': 2,
    'Velocity': 2
  },
  useProxy: 1, // 是否使用代理(包括请求与下载) 0.不使用 1.如果配置中声明，则使用 2.强制使用
  rootPath: 'D:/GreenSoftware', // 根路径
  checkInterval: 7, // 检测更新的间隔(单位天)
  userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
  urlWithProxy: [ // 请求与下载的链接如果匹配任一，则走代理

  ],
  urlWithoutProxy: [ // 请求与下载的链接如果匹配任一，则不走代理(最优先)
    'sourceforge',
    'github'
  ],
  request: {// 请求相关
    timeout: 60, // 请求超时(单位秒)
    proxyHTTP: 'http://127.0.0.1:2346', // HTTP代理(http://user:password@host:port)
    proxySocks: true, // Socks代理(有则优先使用Socks代理)
    proxySocksHost: '127.0.0.1', // Socks代理-域名，留空则为localhost
    proxySocksPort: 2345, // Socks代理-端口
    proxySocksUsername: '', // Socks代理-验证(无则留空)
    proxySocksPassword: '' // Socks代理-验证(无则留空)
  },
  download: { // 下载相关
    quiet: false, // 不显示进度
    retry: 5, // 重试次数(0表示无数次)
    timeout: 600, // 超时(单位秒，0表示无超时)
    proxy: '127.0.0.1:2346', // HTTP代理，留空则不使用代理
    urlWithoutHeader: [ // 下载链接如果匹配任一，则下载时不包括Header，Header包括userAgent/referer
      'sourceforge.net'
    ]
  },
  preserveArchive: true, // 安装后是否保留安装包
  saveVersion: true, // 是否保存版本信息(推荐true)
  excludeGlobal: [ // 安装中要排除的文件/文件夹
    /^uninstall.exe/i, // 相对于软件根路径,
    /^uninstaller.exe/i,
    /^uninst.exe/i,
    '\\$PLUGINSDIR',
    '^Setup.exe',
    '.msi$'
  ],
  software: { // 要启用更新的软件
    // Basis
    '7-Zip': '_Basis/7-Zip/7z.exe', // 路径(相对于rootPath，可使用绝对路径)
    'Bandizip': '_Basis/Bandizip/Bandizip64.exe',
    'Calibre': '_Media/Calibre Portable/calibre-portable.exe',
    'CentBrowser': '_Basis/CentBrowser/chrome.exe',
    'Chrome': '_Basis/Chrome/chrome.exe',
    'ChromeUpdateSharp': '_Basis/Chrome/ChromeUpdateSharp.exe',
    'Internet Download Manager': '_Basis/IDM/IDMan.exe', // 共享软件
    'Telegram': '_Basis/Telegram/Telegram.exe',
    'uTorrent': '_Basis/uTorrent/uTorrent.exe', // 共享软件
    // Batch
    'Inno Setup Unpacker': '_Batch/innounp.exe',
    'MediaInfo-CLI': '_Batch/MediaInfo.exe',
    'ffmpeg': '_Batch/ffmpeg/ffmpeg.exe',
    'ImageMagick': '_Batch/ImageMagick/magick.exe',
    // Enhancer
    '7+ Taskbar Tweaker': '_Enhancer/7+ Taskbar Tweaker/7+ Taskbar Tweaker.exe',
    'Actual Title Buttons': '_Enhancer/Actual Title Buttons/ActualTitleButtonsCenter64.exe', // 共享软件
    'CLaunch': '_Enhancer/CLaunch/CLaunch.exe',
    'CopyQ': '_Enhancer/CopyQ/copyq.exe',
    'Dism++': '_Enhancer/Dism++/Dism++x64.exe',
    'DisplayFusion': '_Enhancer/DisplayFusion/DisplayFusion.exe', // 共享软件
    'Everything': '_Enhancer/Everything/Everything.exe',
    'ExtremeCopy': '_Enhancer/ExtremeCopy/ExtremeCopy.exe', // 共享软件
    'FolderPainter': '_Enhancer/FolderPainter/FolderPainter.exe',
    'MemReduct': '_Enhancer/MemReduct/64/memreduct.exe',
    'OnTopReplica': '_Enhancer/OnTopReplica/OnTopReplica.exe',
    'DiskGenius': '_Enhancer/PartitionGuru/PartitionGuru.exe', // 共享软件
    'PicGo': '_Enhancer/PicGo/PicGo.exe',
    'Registry Workshop': '_Enhancer/Registry Workshop/RegWorkshopX64.exe', // 共享软件
    'Right Click Enhancer Professional': '_Enhancer/Right Click Enhancer Professional/Right Click Enhancer Professional.exe', // 共享软件
    'Textify': '_Enhancer/Textify/Textify.exe',
    'Total Uninstall': '_Enhancer/Total Uninstall/Tu.exe', // 共享软件
    'Total Commander': '_Enhancer/TotalCMD64/Totalcmd64.exe', // 共享软件
    'TrafficMonitor': '_Enhancer/TrafficMonitor/TrafficMonitor.exe',
    'Universal Extractor 2': '_Enhancer/Universal Extractor 2/UniExtract.exe',
    'Volume2': '_Enhancer/Volume2/Volume2.exe',
    'WGestures': '_Enhancer/WGestures/WGestures.exe',
    'Windows System Control Center': '_Enhancer/WSCC/wscc.exe',
    // Media
    'AIMP': '_Media/AIMP/AIMP.exe',
    'Any Video Converter Ultimate': '_Media/Any Video Converter Ultimate/AVCUltimate.exe', // 共享软件
    'ComicRack': '_Media/ComicRack/ComicRack.exe',
    'DocFetcher': '_Media/DocFetcher/DocFetcher.exe',
    'Dopamine': '_Media/Dopamine/Dopamine.exe',
    'Honeyview': '_Media/Honeyview/Honeyview.exe',
    'JiJiDownForWPF': '_Media/JJDown/JiJiDownForWPF.exe',
    'LabelPlus': '_Media/LabelPlus/LabelPlus.exe',
    'MPC-BE': '_Media/MPC-BE/mpc-be64.exe',
    'MPC-HC': '_Media/MPC-HC/mpc-hc64.exe',
    'PicPick': '_Media/PicPick/picpick.exe',
    'PlayTime': '_Media/PlayTime/PlayTime.exe',
    'PotPlayer': '_Media/PotPlayer/PotPlayerMini64.exe',
    // Program
    'AutoHotkey': '_Program/AutoHotkey/AutoHotkeyU64.exe',
    'AutoIt': '_Program/autoit/AutoIt3_x64.exe',
    'Cmder Mini': '_Program/cmder/Cmder.exe',
    'DevDocs Desktop': '_Program/DevDocs/DevDocs.exe',
    'golang': '_Program/go/bin/go.exe',
    'launch4j': '_Program/launch4j/launch4j.exe',
    'Lepton': '_Program/Lepton/Lepton.exe',
    'Nodejs-LTS': '_Program/nodejs/node.exe',
    'notepad++': '_Program/notepad++/notepad++.exe',
    'Git for Windows Portable': '_Program/PortableGit/git-bash.exe',
    'Resource Tuner': '_Program/Resource Tuner/Resource.Tuner.exe', // 共享软件
    'SmartGit': '_Program/SmartGit/bin/smartgit64.exe', // 共享软件
    'Velocity': '_Program/Velocity/Velocity.exe', // 共享软件
    'Visual Studio Code': '_Program/VSCode/Code.exe',
    'WinHex': '_Program/WinHex/WinHex.exe', // 共享软件
    'Yosoro': '_Program/Yosoro/Yosoro.exe',
    'zeal': '_Program/zeal/zeal.exe',
    // Proxy
    'Brook': '_Proxy/Brook/Brook.exe',
    'Brook Tools': '_Proxy/Brook/Brook Tools.exe',
    'cow': '_Proxy/cow/cow.exe',
    'FreeGate': '_Proxy/FreeGate/fgp.exe',
    'ultraSurf': '_Proxy/FreeGate/u.exe',
    'goflyway': '_Proxy/Goflyway/goflyway.exe',
    'Goflyway Tools': '_Proxy/Goflyway/Goflyway Tools.exe',
    'shadowsocks': '_Proxy/Shadowsocks/Shadowsocks.exe',
    // 'shadowsocks-qt5': '_Proxy/Shadowsocks/ss-qt5.exe',
    'shadowsocksr-csharp': '_Proxy/Shadowsocks/ShadowsocksR-dotnet4.0.exe',
    'v2ray': '_Proxy/v2ray/v2ray.exe',
    'v2rayN': '_Proxy/v2ray/v2rayN.exe',
    'XX-Net': '_Proxy/XX-Net/start.bat',
    'ZeroNet': '_Proxy/ZeroNet/ZeroNet.exe',
    'firefly-proxy': '_Proxy/firefly.exe',
    // Study
    'Anki': '_Study/Anki/anki.exe',
    'SpeedCrunch': '_Study/SpeedCrunch/speedcrunch.exe',
    // Tool
  }
}

module.exports = config
