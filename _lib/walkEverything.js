const path = require('path');
const req = require('./req');

let everythingUrl = 'http://localhost';
let everythingAuth = {};

const walk = async function (query, option) {
  // eslint-disable-next-line no-param-reassign
  option = { // https://www.voidtools.com/support/everything/http/
    raw: false,
    columns: ['path'],
    sort: 'path',
    root: '',
    fullpath: true,
    parents: 0,
    depth: Infinity,
    slash: false,
    count: 0,

    ...option || {},
  };
  // eslint-disable-next-line no-param-reassign
  if (option.root) query = `${option.parents === 1 ? 'parent' : 'path'}:"${option.root.replace(/[\\/]/g, '\\').replace(/\\+$/, '')}\\" ${query}`.trim();
  const res = await req({
    uri: `${everythingUrl}/?search=${encodeURIComponent(query)}&json=1${option.columns.length ? option.columns.map((i) => `&${i}_column=1`).join('') : ''}&sort=${option.sort}${option.count ? `&count=${option.count}` : ''}`,
    ...(everythingAuth.user && everythingAuth.password ? { auth: everythingAuth } : {}),
  });
  if (!res || !res.json) return option.raw ? { totalResults: 0, results: [] } : [];
  let result;
  if (option.raw) {
    result = res.json;
  } else {
    result = res.json.results.map((i) => path.normalize(`${i.path}\\${i.name}`));
    if (option.root) {
      if (option.parents > 1) {
        result = result.filter((i) => path.relative(option.root, i).split('\\').length === option.parents);
      }
      if (option.depth >= 1 && option.depth < Infinity) {
        result = result.filter((i) => path.relative(option.root, i).split('\\').length <= option.depth);
      }
      if (!option.fullpath) result = result.map((i) => path.relative(option.root, i));
    }
    if (option.slash) result = result.map((i) => i.replace(/\\/g, '/'));
  }
  return result;
};
walk.init = function (url, auth) {
  everythingUrl = url;
  everythingAuth = auth;
};

module.exports = walk;
