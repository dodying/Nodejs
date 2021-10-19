const parseInfo = (text) => {
  let downloadTime;
  if (text.match(/Downloaded at (.*)/)) {
    downloadTime = text.match(/Downloaded at (.*)/)[1];
    downloadTime = downloadTime.replace(/下午|上午/, '');
    downloadTime = new Date(downloadTime);
  }
  downloadTime = !downloadTime || isNaN(downloadTime.getTime()) ? new Date() : downloadTime;
  downloadTime = downloadTime.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  // .toLocaleString('zh-cn', {
  //   hour12: false
  // });

  text = text.replace(/(Downloaded at|Generated by).*/g, '').replace(/\r\n> /g, '\r\n');
  const lines = text.split(/\n/).map((i) => i.trimRight());
  const info = {};
  const output = {
    title: lines[0],
    jTitle: (lines[1].match(/^http/) ? lines[0] : lines[1]) || lines[0],
    page: [],
    downloadTime,
    tagString: [],
  };
  const tags = ['language', 'reclass', 'artist', 'group', 'parody', 'character', 'female', 'male', 'misc'];
  for (const i of lines) {
    if (i.match(/^http/)) {
      output.web = i.replace(/http:/, 'https:').replace(/#\d+$/, '').replace(/(g.|)e-hentai.org/, 'exhentai.org');
      if (output.web.match(/e[x-]hentai.org/)) {
        [output.gid, output.token] = output.web.split('/').slice(4, 6);
      } else if (output.web.match(/nhentai.net/)) {
        output.gid = `nh-${output.web.split('/')[4]}`;
      }
      break;
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^Page \d+:/)) {
      const re = lines[i].match(/^Page (\d+):\s+(.*)$/);
      output.page[re[1] * 1] = {
        url: re[2],
        id: re[2].split('/')[4],
      };
      lines.splice(i, 1);
      i--;
    } else if (lines[i].match(/^Image \d+:/)) {
      const re = lines[i].match(/^Image (\d+):\s+(.*)$/);
      output.page[re[1] * 1].name = re[2];
      lines.splice(i, 1);
      i--;
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const lineThis = lines[i];
    const arr = lineThis.split(': ');
    if (arr.length > 1) {
      if (!(arr[0] in info)) info[arr[0]] = tags.includes(arr[0]) ? arr[1].split(', ').sort() : arr[1];
      if (tags.includes(arr[0])) {
        output.tagString.push(lineThis);
        lines.splice(i, 1);
        i--;
      }
    }
  }

  ['Tags:'].forEach((i) => {
    if (lines.includes(i)) lines.splice(lines.indexOf(i), 1);
  });

  Object.assign(output, info);

  if ('parody' in info) output.series = info.parody;

  if ('Length' in info) output.length = info.Length.match(/^\d+/)[0];

  if (lines.indexOf('Uploader Comment:') >= 0) {
    output.summary = lines.slice(lines.indexOf('Uploader Comment:') + 1).join('\r\n').trim();
  } else {
    output.summary = '';
  }

  if (info.Category) {
    output.genre = info.Category.match('FREE HENTAI') ? info.Category.match('FREE HENTAI (.*?) GALLERY')[1] : info.Category;
    output.genre = output.genre.toUpperCase();
    output.Category = output.genre;
  }

  if (info.Language) output.lang = (info.Language.match('Chinese') || (info.language && info.language.includes('chinese'))) ? 'zh' : info.Language.match('English') ? 'en' : 'ja';

  output.bw = !('misc' in info && info.misc.indexOf('full color') >= 0);

  if ('Rating' in info) output.rating = info.Rating;

  output.tags = [].concat(info.male, info.female, info.misc).filter((i) => i).sort();
  output.tagString = output.tagString.join('\n');

  return output;
};

module.exports = parseInfo;
