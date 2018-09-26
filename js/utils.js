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