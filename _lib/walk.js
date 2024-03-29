const fs = require('fs');
const path = require('path');

const getValue = (value, dafaultValue) => {
  if (value instanceof Array) {
  } else if (value instanceof RegExp || typeof value === 'string') {
    value = [].concat(value);
  } else if (typeof value === 'number') {
    value = [].concat(value.toString());
  } else {
    value = dafaultValue;
  }
  return value;
};

class Option {
  constructor(dir, other = {}) {
    this.dir = dir;
    Object.assign(this, {
      fullpath: true,
      nodir: false,
      nofile: false,
      recursive: true,
    }, other);
    this.ignore = getValue(this.ignore, []);
    this.ignoreDir = getValue(this.ignoreDir, []);
    this.ignoreFile = getValue(this.ignoreFile, []);

    this.match = getValue(this.match, null);
    this.matchDir = getValue(this.matchDir, null);
    this.matchFile = getValue(this.matchFile, null);
  }
}

/**
 * @description get file under {dir}
 * @returns {Array} files list
 * @param {string} dir A path
 * @param {object} option
 */

const walk = function (dir, option = {}) {
  // console.log('walk', dir);
  option = new Option(dir, option);

  let output = [];
  let list = [];
  try {
    list = fs.readdirSync(dir);
  } catch (error) { /* noop */ }
  for (const file of list) {
    const fullpath = path.join(dir, file);
    if (option.ignore.some((i) => fullpath.match(i))) continue;
    if (option.match && !option.match.some((i) => fullpath.match(i))) continue;

    const name = option.fullpath ? fullpath : path.relative(option.dir, fullpath);
    if (fs.existsSync(fullpath) && fs.statSync(fullpath).isDirectory()) { // isDirectory
      const dirname = path.basename(file);
      if (option.ignoreDir.some((i) => dirname.match(i))) continue;
      if (option.matchDir && !option.matchDir.some((i) => dirname.match(i))) continue;

      if (!option.nodir) output.push(name);
      if (option.recursive) output = output.concat(walk(fullpath, option) || []);
    } else {
      const basename = path.basename(file);
      if (option.ignoreFile.some((i) => basename.match(i))) continue;
      if (option.matchFile && !option.matchFile.some((i) => basename.match(i))) continue;

      if (option.match && !option.match.some((i) => file.match(i))) continue;
      if (!option.nofile) output.push(name);
    }
  }
  return output;
};
walk.sync = async function (dir, option = {}) {
  // console.log('walk', dir);
  option = new Option(dir, option);

  let output = [];
  let list = [];
  try {
    list = await fs.promises.readdir(dir);
  } catch (error) { /* noop */ }
  for (const file of list) {
    const fullpath = path.join(dir, file);
    if (option.ignore.some((i) => fullpath.match(i))) continue;
    if (option.match && !option.match.some((i) => fullpath.match(i))) continue;

    const name = option.fullpath ? fullpath : path.relative(option.dir, fullpath);
    if (fs.existsSync(fullpath) && fs.statSync(fullpath).isDirectory()) { // isDirectory
      const dirname = path.basename(file);
      if (option.ignoreDir.some((i) => dirname.match(i))) continue;
      if (option.matchDir && !option.matchDir.some((i) => dirname.match(i))) continue;

      if (!option.nodir) output.push(name);
      if (option.recursive) output = output.concat(await walk.sync(fullpath, option) || []);
    } else {
      const basename = path.basename(file);
      if (option.ignoreFile.some((i) => basename.match(i))) continue;
      if (option.matchFile && !option.matchFile.some((i) => basename.match(i))) continue;

      if (option.match && !option.match.some((i) => file.match(i))) continue;
      if (!option.nofile) output.push(name);
    }
  }
  return output;
};

module.exports = walk;
