'use strict';
const now = new Date();
const [year, month, date, hours, minutes, seconds] = [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()].map(i => i.toString().padStart(2, '0'));

const data = {
  author: 'dodying',
  nativeModule: ['assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'crypto', 'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers', 'tls', 'trace_events', 'tty', 'dgram', 'url', 'util', 'v8', 'vm', 'worker_threads', 'zlib', '', 'sys', '_linklist', 'constants'],
  now: now.getTime(),
  nowStr: `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
};
module.exports = data;
