// ==Headers==
// @Name:               Browser-Snippet
// @Description:        Browser-Snippet
// @Version:            1.0.34
// @Author:             dodying
// @Date:               2019-2-11 15:44:13
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:
// ==/Headers==

// 导入原生模块
const fs = require('fs');

// 导入第三方模块

// Function

// Main
const main = async () => {
  const file = 'api-metadata.json';
  if (!fs.existsSync(file)) {
    console.error('No api-metadata.json');
    process.exit();
  }
  let api = fs.readFileSync(file, 'utf-8');
  try {
    api = JSON.parse(api);
  } catch (error) {
    console.error('Error api-metadata.json');
    process.exit();
  }
  const out = {};
  for (const main in api) {
    const method = Object.keys(api[main]);
    out[`browser.${main}`] = {
      prefix: `browser.${main}`,
      body: `browser.${main}.\${1|${method.join()}|}($0)`,
    };
    out[`chrome.${main}`] = {
      prefix: `chrome.${main}`,
      body: `chrome.${main}.\${1|${method.join()}|}($0)`,
    };
  }
  fs.writeFileSync('snippet.json', JSON.stringify(out, null, 2));
};

main().then(async () => {
  //
}, async (err) => {
  console.error(err);
  process.exit();
});
