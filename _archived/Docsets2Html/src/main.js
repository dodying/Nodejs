function $ (e) {
  return document.querySelector(e)
}
function updateSelect () {
  let api = $('#language').value
  $('#languageIcon').src = `docsets/${api}/icon.png`
}
function updateResult () {
  let api = $('#language').value
  let keyword = $('#keyword').value
  if (keyword.length < 3) return
  let filter = window.data[api].filter(i => i[0].match(keyword))
  $('#result>ol').innerHTML = filter.map(i => `<li><img class="icon" src="src/images/type/${i[1]}.png"><a href="docsets/${api}/Documents/${i[2]}" onclick="show(this);return false">${i[0]}</a></li>`).join('')
}
function show (e) {
  $('#sidebar').style.width = '20%'
  $('#main').style.width = '80%'
  $('#main>iframe').style.display = 'block'
  $('#main>iframe').src = e.href
}
(async function () {
  for (let i in window.data) {
    let ele = document.createElement('option')
    ele.textContent = i
    $('#language').appendChild(ele)
  }
  updateSelect()
  $('#language').addEventListener('change', function () {
    updateSelect()
  })
  $('#keyword').addEventListener('keyup', function () {
    updateResult()
  })
})()
