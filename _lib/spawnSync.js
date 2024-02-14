// ==Headers==
// @Name:               spawnSync
// @Description:        spawnSync
// @Version:            1.0.2
// @Author:             dodying
// @Created:            2023-04-03 19:28:47
// @Modified:           2023-04-03 19:29:06
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            null
// ==/Headers==

const cp = require('child_process');

module.exports = function spawnSync(command = '', args = [], options = {}, user = { default: true, withChild: (child) => {} }) {
  return new Promise((resolve) => {
    const child = cp.spawn(command, args, options);
    // let stdout, stderr;

    if (user.default) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
      // child.stdout.on('data', data => (stdout += String(data)));
      // child.stderr.on('data', data => (stderr += String(data)));
    }
    if (user.withChild) {
      user.withChild(child);
    }
    child.on('exit', (code) => {
      let end;
      if (String(code) !== '0') {
        end = 'error';
        console.trace(`Command:\t${command}`);
        console.trace(`Command-Args:${args.map((i) => `{${i}}`).join(', ')}\n`);
        console.trace(`Exit-Code:\t${String(code)}`);
      } else {
        end = true;
      }
      resolve(end);
    });
  });
};
