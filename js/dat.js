(function () {
  // un-hide dat://-only elements
  const els = $('.dat-only')
  if (els.length) {
    els.forEach(el => el.classList.remove('hidden'))
  } else if (els) {
    els.classList.remove('hidden')
  }
})()