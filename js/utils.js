function $ (querySelector) {
  var els = document.querySelectorAll(querySelector)

  return els.length > 1 ? els : els[0]
}

function render (targetEl, html) {
  targetEl.innerHTML = html
}

function timeout (ms, promise) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error("Timed out"))
    }, ms)
    promise.then(resolve, reject)
  })
}

async function readFileDat (path) {
  const data = await a.readFile(path, 'utf8')
  return data
}

async function readFileFetch (path) {
  const res = await fetch(path)
  return res.text()
}