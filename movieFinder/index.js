#!/usr/bin/env node

// ==Headers==
// @Name:               movieFinder
// @Description:        movieFinder
// @Version:            1.0.0
// @Author:             dodying
// @Date:               2018-02-04 13:37:23
// @Last Modified by:   dodying
// @Last Modified time: 2018-02-06 20:52:28
// @Namespace:          https://github.com/dodying/Nodejs
// @SupportURL:         https://github.com/dodying/Nodejs/issues
// @Require:            glob, pixl-xml
// ==/Headers==

//设置
const _ = {
  database: ['D:\\1', 'E:\\1', 'H:\\H\\Censored', 'H:\\H\\New', 'H:\\H\\New2', 'H:\\H\\Uncensored', 'H:\\H\\Uncensored2'],
  video: ['3g2', '3gp', 'amv', 'asf', 'avi', 'drc', 'flv', 'flv', 'flv', 'f4v', 'f4p', 'f4a', 'f4b', 'gif', 'gifv', 'm4v', 'mkv', 'mng', 'mov', 'qt', 'mp4', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'mpg', 'mpeg', 'm2v', 'mxf', 'nsv', 'ogv', 'ogg', 'rm', 'rmvb', 'roq', 'svi', 'vob', 'webm', 'wmv', 'yuv'],
  output: 'E:\\Desktop\\_\\HTML\\movie.html',
  nocover: 'E:\\Desktop\\_\\GitHub\\Nodejs\\movieFinder\\nocover.svg',
  datalist: ['女仆', '妹妹', '乱伦', '美少女', '高中女生', '艺人', '内衣', '角色扮演', '三上悠亜',
    '明里つむぎ', '橋本ありな', '佐々波綾'],
  reserve: ['rating', 'tag', 'actor']
};

//导入原生模块
const fs = require('fs');
fs.exists = path => {
  try {
    fs.statSync(path);
  } catch (err) {
    return false;
  }
  return true;
}
const path = require('path');

//导入第三方模块
const glob = require('glob');
const XML = require('pixl-xml');

//
const infoParse = text => {
  let info = XML.parse(text);
  for (let i in info) {
    if (!_['reserve'].includes(i)) {
      delete info[i];
    } else if (i === 'actor') {
      if (info[i] instanceof Array) {
        info[i] = info[i].map(i => i.name);
      } else if (info[i] instanceof Object) {
        info[i] = info[i].name;
      }
    }
  }
  return info;
};

let lst = [];
_['database'].forEach(i => {
  lst = lst.concat(glob.sync(path.resolve(i) + '\\**\\*.@(' + _['video'].join('|') + ')'));
});
console.log(lst.length);
lst = lst
  .map(i => path.parse(i))
  .map(i => Object.assign({
    file: path.resolve(i.dir, i.base),
    cover: path.resolve(i.dir, i.name + '.jpg'),
    info: path.resolve(i.dir, i.name + '.nfo')
  }, i))
  .map(i => fs.exists(i['info']) ? Object.assign(infoParse(fs.readFileSync(i['info'], 'utf-8')), i) : i);

let info = lst.map(i => `<li info="${JSON.stringify(i, ['rating', 'tag', 'actor', 'name']).replace(/"/g, '\'')}"><span><img class="cover" data-src="${fs.exists(i['cover']) ? `${i['cover']}` : _['nocover']}"></img><input class="copy" value="${i['sorttitle'] || i['name']}" type="text"></span></li>`).join('');
let datalist = _['datalist'].map(i => `<option>${i}</option>`);

let html = `<!DOCTYPE html><html>
<head>
  <title>movieFinder</title>
  <script src="https://rawgit.com/tuupola/jquery_lazyload/2.x/lazyload.js"></script>
  <style>
    #searchContainer{position:fixed;top:0;left:0;width:100%;height:24px;text-align:center;}
    #search{width:30%}
    #searchBtn{float:right;cursor:pointer;}
    #showContainer{position:fixed;top:24px;left:0;width:100%;height:60%;text-align:center;background:black;}
    #show{height:calc(100% - 2px);margin:1px 0;}
    #info{position:fixed;right:0;background-color:#FFF;}
    #info>span{margin:0 1px;}
    #showToggle{position:fixed;right:0px;background-color:#F00;cursor:pointer;}
    #gallery{position:fixed;bottom:0;left:0;width:100%;height:calc(40% - 24px);overflow:auto;}
    #gallery>ul>li{list-style:none;display:inline-table;text-align:center;}
    #gallery>ul>li>span>input{width:66px;}
    .hide{display:none!important;}
    .cover{display:block;min-width:60px;height:80px;margin:0 auto;}
    .keyword{cursor:pointer;}
  </style>
</head>
<body>
  <div id="searchContainer">
    <input id="search" type="text" list="searchList">
    <datalist id="searchList">${datalist}</datalist>
    <img id="searchBtn" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4gIDxwYXRoIGQ9Ik0yMS43LDIwLjNsLTEuNCwxLjRsLTUuNC01LjRjLTEuMywxLTMsMS43LTQuOSwxLjcgYy00LjQsMC04LTMuNi04LThjMC00LjQsMy42LTgsOC04YzQuNCwwLDgsMy42LDgsOGMwLDEuOC0wLjYsMy41LTEuNyw0LjlMMjEuNywyMC4zeiBNMTAsNGMtMy4zLDAtNiwyLjctNiw2czIuNyw2LDYsNnM2LTIuNyw2LTYgUzEzLjMsNCwxMCw0eiIvPjwvc3ZnPg==">
  </div>
  <div id="showContainer">
    <img id="show"></img>
    <span id="info"></span>
    <span id="showToggle">▲</span>
  </div>
  <div id="gallery"><ul>
  ${info}
  </ul></div>
  <script>
    lazyload(document.querySelectorAll('.cover'));

    const videos = [...document.querySelectorAll('#gallery>ul>li')];
    videos.forEach(i => {
      i.info = JSON.parse(i.getAttribute('info').replace(/'/g, '"'));
      i.info['keyword'] = [].concat(...Object.values(i.info)).join(',');
      i.removeAttribute('info');
    });
    const _search = document.getElementById('search');
    const _show = document.getElementById('show');
    const _info = document.getElementById('info');
    const updateFilter = () => {
      let q = _search.value.split(/\\s+/);
      if (q.length === 0) return;
      let result = videos;
      q.forEach(i => {
        if (i.match(/^[\\d\\.]+$/)) {
          result = result.filter(_ => !isNaN(_.info.rating) && _.info.rating * 1 >= i * 1);
        } else {
          result = result.filter(_ => _.info.keyword.match(i));
        }
      });
      videos.forEach(i => {
        if (result.includes(i)) {
          i.removeAttribute('class');
        } else {
          i.setAttribute('class', 'hide');
        }
      });
    };
    _search.addEventListener('keyup', () => {
      updateFilter();
    })
    document.addEventListener('mousemove', e => {
      let target = e.target;
      if (target.className === 'copy') target = target.parentNode;
      if (target.childElementCount === 2 && target.children[0].className === 'cover') target = target.children[0];
      if (target.className === 'cover') {
        _show.src = target.src;
        let info = target.parentNode.parentNode.info;
        let html = 'Name: ' + info.name;
        if (info.tag) html += '<br>Tag: ' + info.tag.map(i => '<span class="keyword">' + i + '</span>').join('');
        if (info.actor) html += '<br>Actor: ' + (info.actor instanceof Array ? info.actor.map(i => '<span class="keyword">' + i + '</span>').join('') : '<span class="keyword">' + info.actor + '</span>');
        if (info.rating) html += '<br>Rating: ' + info.rating;
        _info.innerHTML = html;
      }
    });
    document.addEventListener('dblclick', e => {
      let target = e.target;
      if (target.className === 'cover') target = target.parentNode;
      if (target.childElementCount === 2 && target.children[1].className === 'copy') target = target.children[1];
      if (target.className === 'copy') {
        target.select();
        document.execCommand('copy');
        _info.innerHTML += '<br>已复制 ' + target.value;
      }
    });
    document.addEventListener('click', e => {
      if (e.target.id === 'searchBtn') {
        updateFilter();
      } else if (e.target.id === 'showToggle') {
        if (document.getElementById('showContainer').style.height) {
          document.getElementById('showContainer').style.height = '';
          document.getElementById('gallery').style.height = '';
          e.target.textContet = '▲';
        } else {
          document.getElementById('showContainer').style.height = '86px';
          document.getElementById('gallery').style.height = 'calc(100% - 100px)';
          e.target.textContet = '▼';
        }
      } else if (e.target.className === 'keyword') {
        let value = _search.value;
        let keyword = e.target.textContent;
        if (value.indexOf(keyword) >= 0) {
          value = value.replace(keyword, '').replace(/\s+/g, ' ').trim();
        } else {
          value += (value ? ' ' : '') + keyword;
        }
        _search.value = value;
        updateFilter();
      }
    });
  </script>
</body>
</html>`;
fs.writeFileSync(_['output'], html);
