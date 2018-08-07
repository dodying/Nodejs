'use strict'

let config = {
  userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
  timeout: 60, // 请求超时(单位秒)
  proxyHTTP: 'http://user:password@host:port', // HTTP代理
  proxySocks: true, // Socks代理(有则优先使用Socks代理)
  proxySocksHost: 'host', // Socks代理-域名，留空则为localhost
  proxySocksPort: 2345, // Socks代理-端口
  proxySocksUsername: 'user', // Socks代理-验证(无则留空)
  proxySocksPassword: 'password', // Socks代理-验证(无则留空)
  folder: process.cwd(), // 要整理的目录
  rename: false, // 整理目录下的文件名是否需要处理
  folderNew: '', // 整理后存放的目录，留空则同folder
  /**
   * [folderWith description]
   * @type {String}
   * 建立层次文件夹
   * 参考lib.data
   * 留空表示不建立
   */
  folderWith: 'actor',
  emptyStr: '---', // 某属性为空时，使用的替代字符
  /**
   * [name description]
   * @type {String}
   * 重命名规则
   * ${x}
   * $1 表示原文件名开头用方括号号引用的内容
   * $2 表示原文件名末尾用方括号引用的内容
   */
  name: '$1{num}$2', // 参考lib.data
  image: 2, // 0:不下载图片, 1:下载图片, 2: 下载图片且裁剪
  imageRetry: 3, // 下载图片重试次数（仅timeou重试）
  strRemove: ['（ブルーレイディスク）'], // 要移除的字符串
  strReplace: [ // 要替换的字符串
  /**
   * eg: ['a', 'b'], ['1', '2']
   * raw: 'aaAbbB'
   * result: '111222'
   * 说明: 1.替换同一位置的文本 2.替换全局且不分大小写
   */
    [],
    []
  ],
  nfo: true, // 是否生成nfo文件(kodi格式)
  useLib: 'javbus',
  useProfile: 'default',
  profile: {
    default: {
      rename: true,
      image: 2,
      useLib: 'javbus'
    }
  }
}

module.exports = config
