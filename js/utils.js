export function $ (querySelector) {
  return document.querySelector(querySelector)
}

export function render (targetEl, html) {
  targetEl.innerHTML = html
}

export function timeout (ms, promise) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error("Timed out"))
    }, ms)
    promise.then(resolve, reject)
  })
}