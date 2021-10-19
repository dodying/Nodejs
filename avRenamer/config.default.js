const config = {
  userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
  timeout: 60, // 请求超时(单位秒)
  proxyHTTP: 'http://user:password@host:port', // HTTP代理
  proxySocks: true, // Socks代理(有则优先使用Socks代理)
  proxySocksHost: 'host', // Socks代理-域名，留空则为localhost
  proxySocksPort: 2345, // Socks代理-端口
  proxySocksUsername: 'user', // Socks代理-验证(无则留空)
  proxySocksPassword: 'password', // Socks代理-验证(无则留空)
  retry: 5, // 请求重试次数
  searchLibsEnable: ['javhoo', 'javlite', 'avfhd', 'duckduckgo', 'googleCSE'], // 要启用的搜索引擎

  /**
   * [folderSort description]
   * @type {String}
   * 建立层次文件夹
   * 参考lib.getInfo
   * 留空表示不建立
   */
  folderSort: '{censored}/{actor}', // 整理后存放的目录, 相对于进行整理的目录
  emptyStr: '---', // 某属性为空时，使用的替代字符
  /**
   * [name description]
   * @type {String}
   * 重命名规则
   * {x} // 参考lib.getInfo
   * {prefix} 表示原文件名开头用方括号号引用的内容
   * {suffix} 表示原文件名末尾用方括号引用的内容
   */
  name: '{prefix}{id}{suffix}',
  image: 1, // 是否下载图片，0不下载，1下载封面，2下载封面及预览图
  strReplace: [ // 要替换的字符串
  /**
   * eg: ['a', '1'], ['b', '2']
   * raw: 'aaAbbB'
   * result: '111222'
   * 说明: 1.替换同组直接的文本 2.替换全局且不分大小写
   */
    ['（ブルーレイディスク）', ''],
  ],
  nfo: true, // 是否生成nfo文件(kodi格式)
};

module.exports = config;
