function $(e) {
  return document.querySelector(e);
}
function updateSelect() {
  const api = $('#language').value;
  $('#languageIcon').src = `docsets/${api}/icon.png`;
}
function updateResult() {
  const api = $('#language').value;
  const keyword = $('#keyword').value;
  if (keyword.length < 3) return;
  const filter = window.data[api].filter((i) => i[0].match(keyword));
  $('#result>ol').innerHTML = filter.map((i) => `<li><img class="icon" src="src/images/type/${i[1]}.png"><a href="docsets/${api}/Documents/${i[2]}" onclick="show(this);return false">${i[0]}</a></li>`).join('');
}
function show(e) {
  $('#sidebar').style.width = '20%';
  $('#main').style.width = '80%';
  $('#main>iframe').style.display = 'block';
  $('#main>iframe').src = e.href;
}
(async function () {
  for (const i in window.data) {
    const ele = document.createElement('option');
    ele.textContent = i;
    $('#language').appendChild(ele);
  }
  updateSelect();
  $('#language').addEventListener('change', () => {
    updateSelect();
  });
  $('#keyword').addEventListener('keyup', () => {
    updateResult();
  });
}());
