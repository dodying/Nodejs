'use strict';

const data = {
  req: {
    proxy: 'http://127.0.0.1:8118',
    request: {
      headers: {
        // Authorization: 'token xxx'
      },
      timeout: 60 * 1000
    },
    withProxy: [
      'dayi.org.cn'
    ],
    autoProxy: true
  },
  origin: 'https://api2.dayi.org.cn/',
  thread: 10
};
module.exports = data;
