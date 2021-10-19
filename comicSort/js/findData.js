const fs = require('fs');
const path = require('path');

const EHT = JSON.parse(fs.readFileSync(path.join(__dirname, './../EHT.json'), 'utf-8')).data;
let Dataset = EHT;

const findData = (main, sub = undefined, textOnly = true) => {
  if (!main && !sub) return {};
  // let subRaw = sub
  if (typeof sub === 'string') sub = sub.split('|')[0].trim();

  let data;
  if (main) {
    data = Dataset.filter((i) => i.namespace === main);
    if (data.length === 0) return {};
    if (sub === undefined) {
      return {
        name: main,
        cname: data[0].frontMatters.name,
        info: data[0].frontMatters.description,
      };
    }
  } else {
    data = Dataset.filter((i) => !['rows'].includes(i.namespace) && sub.replace(/_/g, ' ') in i.data);
    if (data.length) {
      main = data[0].namespace;
    } else {
      return {};
    }
  }

  const data1 = data[0].data[sub.replace(/_/g, ' ')];
  if (data1) {
    let info = data1.intro;
    let cname = data1.name;
    if (textOnly) {
      info = info.replace(/!\[(.*?)\]\((.*?)\)/g, '').replace(/\p{Extended_Pictographic}/gu, '');
      cname = cname.replace(/!\[(.*?)\]\((.*?)\)/g, '').replace(/\p{Extended_Pictographic}/gu, '');
    }
    return {
      name: main === 'misc' ? sub : `${main}:${sub}`,
      cname,
      info,
    };
  }
  return {};
};

findData.init = (obj) => {
  Dataset = obj;
};

module.exports = findData;
