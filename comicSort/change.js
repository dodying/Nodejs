const fs = require('fs');


var value = {};
let data = fs.readFileSync('EHT.json', 'utf-8');;
data = JSON.parse(data).dataset;
for (let i in data) {
  let type = data[i].name;
  value[type] = {};
  for (let j in data[i].tags) {
    if (data[i].tags[j].type === 0) {
      value[type][data[i].tags[j].name] = data[i].tags[j].cname.filter(k => k.type === 0)[0].text;
    }
  }
}
fs.writeFileSync('data.json', JSON.stringify(value));
