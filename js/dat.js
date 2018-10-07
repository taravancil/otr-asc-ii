var readFile
var a

(function () {
  readFile = readFileFetch

  if (window.DatArchive) {
    a = new DatArchive(window.location)

    // use DatArchive.readFile for readFile
    readFile = readFileDat

    // un-hide dat://-only elements
    const els = $('.dat-only')
    if (els && els.length) {
      els.forEach(el => el.classList.remove('hidden'))
    } else if (els) {
      els.classList.remove('hidden')
    }
  }
})()