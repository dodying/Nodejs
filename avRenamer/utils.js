// ==Headers==
// @Name:               utils
// @Description:        utils
// @Version:            1.0.158
// @Author:             dodying
// @Created:            2024-02-17 22:46:44
// @Modified:           2024-07-22 19:13:19
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

// 导入原生模块
const fs = require('node:fs');
const path = require('node:path');
const {
  dotexts, rename,
} = require('../@private/__video');
const walk = require('../_lib/walk');

// 导入第三方模块

// 设置

// Function
function move(workdir, depth = 1) {
  for (const dir of workdir) {
    const folders = depth >= 1 ? walk(dir, {
      nodir: false, nofile: true, endswithslash: true, depth,
    }) : [dir];
    for (const root of folders) {
      console.log('move', root);
      let enum1 = 0;
      const max = 30;
      const files = fs.readdirSync(root).map((i) => path.join(root, i)).filter((i) => fs.statSync(i).isFile()).sort();
      const filesMap = files.reduce((result, cv, ci, arr) => {
        const { renamed } = rename(path.parse(cv).name.replace(/\[thumbs\]/, ''));
        // eslint-disable-next-line no-param-reassign
        if (!(renamed in result)) result[renamed] = [];
        result[renamed].push(cv);
        return result;
      }, {});
      const filesMovie = files.filter((i) => dotexts.includes(path.extname(i).toLowerCase()));
      while (filesMovie.length) {
        enum1 = enum1 + 1;
        const folder = path.join(root, String(enum1));
        fs.mkdirSync(folder, { recursive: true });
        if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) continue;
        let count = fs.readdirSync(folder).filter((i) => dotexts.includes(path.extname(i))).length;
        console.log(`move to ${enum1}`, max - count);
        while (filesMovie.length && count < max) {
          const [file] = filesMovie.splice(0, 1);
          if (!fs.existsSync(file)) continue;
          count = count + 1;
          const { renamed } = rename(path.parse(file).name.replace(/\[thumbs\]/, ''));
          for (const i of filesMap[renamed]) {
            console.log(root, path.basename(i), path.join(String(enum1), path.basename(i)));
            try { fs.renameSync(i, path.join(folder, path.basename(i))); } catch (error) { /* noop */ }
          }
        }
      }
    }
  }
}
function unfold(workdir) {
  for (const root of workdir) {
    console.log('unfold', root);
    const all = walk(root, { nodir: false, nofile: false, endswithslash: true });
    const obj = all.reduce((result, cv, ci, arr) => {
      if (cv.endsWith('\\')) {
        // eslint-disable-next-line no-param-reassign
        result[cv] = result[cv] || [];
      } else {
        const dir = `${path.dirname(cv)}\\`;
        // eslint-disable-next-line no-param-reassign
        if (!(dir in result)) result[dir] = [];
        result[dir].push(cv);
      }
      return result;
    }, {});
    for (const [dir, files] of Object.entries(obj)) {
      if (files.filter((file) => dotexts.includes(path.extname(file).toLowerCase())).length <= 2) {
        for (const file of files) {
          const { name, ext } = path.parse(file);
          const dir1 = path.dirname(path.dirname(file));
          let fileNew = path.join(dir1, name + ext);
          let count = 1;
          while (fs.existsSync(fileNew)) {
            count = count + 1;
            fileNew = path.join(dir1, `${name} (${count})${ext}`);
          }
          console.log(`RENAME ${file}\n    => ${fileNew}`);
          fs.renameSync(file, fileNew);
        }
        if (fs.readdirSync(dir).length === 0) {
          console.log('REMOVE EMPTY FOLDER:\t', dir);
          try { fs.rmSync(dir, { recursive: true }); } catch (error) { /* noop */ }
        }
      }
    }
  }
}

// Main
const main = async () => {
  const args = process.argv.slice(2);
  const workdir = (args.slice(1).length ? args.slice(1) : [process.cwd()]).map((i) => path.resolve(process.cwd(), i)).filter((item, index, array) => array.indexOf(item) === index && fs.existsSync(item));
  if (['h', 'help', '-h', '--help'].includes(args[0])) {
    console.log({
      'h,help': '显示帮助',
      move: '移动文件到数字文件夹（每个文件夹100个文件）',
      moveN: 'N为数字，移动文件到数字文件夹（每个文件夹100个文件），包含N级子目录',
      unfold: '移动子文件夹下中只有单个文件的，移动该文件到根目录',
      umN: 'unfold + moveN',
    });
  } else if (args[0].match(/^move(\d*)$/)) {
    const depth = parseInt(args[0].match(/^move(\d*)$/)[1], 10);
    move(workdir, depth);
  } else if (args[0] === 'unfold') {
    unfold(workdir);
  } else if (args[0].match(/^um(\d*)$/)) {
    const depth = parseInt(args[0].match(/^um(\d*)$/)[1], 10);
    unfold(workdir);
    move(workdir, depth);
  }
};

main().then(async () => {
  //
}, async (error) => {
  console.trace(error);
  process.exit(1);
});
