(function () {
  var a
  var songs = []
  var currentSong = {}
  var currentLyrics = ''
  var currentCustomLyrics = ''
  var readFile = readFileFetch

  const ERRORS = {
    invalidProtocol: 'Please enter a dat:// or https:// URL',
    invalidImageUrl: 'Please enter a valid image URL (.png, .jpg, .jpeg)',
    invalidFileType: 'Invalid file type',
    timedOut: 'File not found. Request timed out',
    notFound: 'File not found'
  }

  const SONG_PATHS = [
    '0-SUMMER.json',
    '1-APESHIT.json',
    '2-BOSS.json',
    '3-NICE.json',
    '4-713.json',
    '5-FRIENDS.json',
    '6-HEARDABOUTUS.json',
    '7-BLACKEFFECT.json',
    '8-LOVEHAPPY.json',
  ]

  var DOM = {
    imageUrlInput: $('input[name="image-url"]'),
    imagePicker: $('#image-picker'),
    imagePickerFeedback: $('#image-picker-feedback'),
    imageDragContainer: $('#image-drag-container'),
    previewImage: $('.preview-image'),
    submitFooter: $('.form-submit-footer'),
    songPicker: $('.song-picker'),
    songPickerWrapper: $('label[for="song-picker"]'),
    lyricType: $('input[name="lyric-type"]'),
    lyrics: $('.lyrics-preview'),
    tidalLink: $('.tidal-link'),
    ascii: $('#ascii'),
    asciiContainer: $('.ascii-container'),
    closeAsciiButton: $('.close-ascii-btn'),
    generateButton: $('.generate-btn'),
    downloadHtmlLink: $('.download-html-link'),
    downloadHtmlButton: $('.download-html-btn')
  }

  setup()

  async function setup () {
    var readFile = readFileFetch

    if (window.DatArchive) {
      a = new DatArchive(window.location)
      readFile = readFileDat
    }

    for (var i = 0; i < SONG_PATHS.length; i++) {
      var song = JSON.parse(await readFile(`/songs/${SONG_PATHS[i]}`))
      songs.push(song)

      var songEl = document.createElement('option')
      songEl.innerText = song.title
      songEl.value = song.order
      DOM.songPicker.appendChild(songEl)
    }

    currentSong = songs[0]
    currentLyrics = currentSong.lyrics
    DOM.lyrics.innerText = currentSong.lyrics
    render(DOM.tidalLink, renderTidalLink(currentSong))
  }

  // utils
  async function readFileDat (path) {
    const data = await a.readFile(path, 'utf8')
    return data
  }

  async function readFileFetch (path) {
    const res = await fetch(path)
    return res.text()
  }

  function removeClass (els, classStr) {
    for (var el of els) {
      el.classList.remove(classStr)
    }
  }

  function addClass (els, classStr) {
    for (var el of els) {
      el.classList.add(classStr)
    }
  }

  function arrayBufferToStr (buf) {
    var uintArray = new Uint16Array(buf)
    var str = ''

    uintArray.forEach(function (byte) {
      str += String.fromCharCode(byte)
    })

    return str
  }

  function stripLyrics (lyrics) {
    // strip all non-number or letter characters
    return lyrics.replace(/[^a-zA-Z0-9]/g, '');
  }

  // rendering
  function reset () {
    removeClass([DOM.imagePickerFeedback, DOM.imageUrlInput], 'error')
    DOM.previewImage.src = ''
  }

  function renderTidalLink (song) {
    return `
      <a href=${song.tidalLink} target="_blank">▶︎ Listen to ${song.title} on TIDAL</a>
    `
  }

  function renderPreviewImage (opts) {
    DOM.imagePickerFeedback.innerText = opts.filename
    removeClass([DOM.imagePickerFeedback], 'error')
    removeClass([DOM.submitFooter], 'hidden')

    var src = ''
    if (opts.blob) {
      src = URL.createObjectURL(opts.blob)
    } else if (opts.href) {
      src = opts.href
    }

    DOM.previewImage.forEach(function (img) {
      img.src = src
    })
  }

  function renderAscii (lyrics, pxon) {
    var pixels = JSON.parse(pxon).pxif.pixels

    var html = ''
    var column = '<div class="column">'
    var currentColumn = 0
    var lyricsIdx = 0

    var width = pixels.reduce((acc, pixel) => {
      return pixel.x > acc ? pixel.x : acc
    }, 0)

    for (let i = 0; i < pixels.length; i++) {
      const pixel = pixels[i]

      if (pixel) {
        lyricsIdx = (pixel.x / 3) + (pixel.y / 3) * (width / 3)
        var char = lyrics[lyricsIdx % lyrics.length]

        if (pixel.x > currentColumn) {
          currentColumn = pixel.x
          column += '</div>'
          html += column
          column = '<div class="column">'
        }

        if (char) {
          var shadow =  `text-shadow: .4px .4px ${pixel.color};`
          var color = `color: ${pixel.color};`
          column += `<span class="char" style="${color} ${shadow}">${char}</span><br>`

        }
      }
    }

    DOM.ascii.innerHTML = html
    removeClass([DOM.asciiContainer], 'hidden')
    $('html').scrollTop = 0
    addClass([$('body')], 'noscroll')
    DOM.generateButton.innerHTML =  'Generate ASCII <span class="btn-icon btn-icon--right" aria-hidden="true">&rarr;</span>'
  }

  // events
  DOM.songPicker.addEventListener('change', onChangeSong)
  DOM.lyrics.addEventListener('input', onInputLyrics)
  DOM.lyricType.forEach(el => el.addEventListener('change', onChangeLyricType))
  DOM.imagePicker.addEventListener('change', onUploadImage)
  DOM.imageUrlInput.addEventListener('input', onChangeImageUrl)
  DOM.imageDragContainer.addEventListener('dragenter', onDragEnterImageDragContainer)
  DOM.imageDragContainer.addEventListener('dragend', onStopDragging)
  DOM.imageDragContainer.addEventListener('dragleave', onStopDragging)
  DOM.imageDragContainer.addEventListener('dragover', onDragOverImageDragContainer)
  DOM.imageDragContainer.addEventListener('drop', onDropImageDragContainer)
  DOM.closeAsciiButton.addEventListener('click', onCloseAscii)
  DOM.generateButton.addEventListener('click', onGenerate)
  DOM.downloadHtmlButton.addEventListener('click', onClickDownloadHtmlButton)

  function onCloseAscii () {
    addClass([DOM.asciiContainer], 'hidden')
    removeClass([$('body')], 'noscroll')
  }

  function onGenerate () {
    DOM.generateButton.innerText = 'Reading image...'
    DOM.previewImage[0].style.opacity = '0'
    DOM.previewImage[0].style.height = 'auto'
    generatePXON(DOM.previewImage[0])
    DOM.previewImage[0].style.height = '50px'
    DOM.previewImage[0].style.opacity = '1'
  }

  function generatePXON (image) {
    // draw image on a canvas
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')

    var scale
    var newWidth = image.width
    var newHeight = image.height

    if (image.width >= image.height && image.width > 350) {
      scale = 350 / image.width
      newWidth = image.width * scale
      newHeight = image.height * scale
    } else if (image.height > image.width && image.height > 350) {
      scale = 350 / image.height
      newWidth = image.width * scale
      newHeight = image.height * scale
    }

    tempCanvas.width = newWidth
    tempCanvas.height = newHeight

    tempCtx.drawImage(image, 0, 0, newWidth, newHeight)

    // get image data from the canvas
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)

    var pxonWorker = new Worker('/js/pxon.js')

    pxonWorker.onmessage = function (message) {
      var PXON = arrayBufferToStr(message.data)

      DOM.generateButton.innerText = 'Rendering ASCII...'
      renderAscii(stripLyrics(currentLyrics), PXON)
    }

    pxonWorker.postMessage({
      imageData,
      pixelSize: 3
    })
  }

  function onChangeSong (e) {
    var i = Number(e.target.value)
    var song = songs[i]

    DOM.lyrics.innerText = song.lyrics
    render(DOM.tidalLink, renderTidalLink(song))
    DOM.lyrics.scrollTop = 0
    currentSong = song
    currentLyrics = song.lyrics
  }

  function onInputLyrics (e) {
    currentCustomLyrics = e.target.innerText
    currentLyrics = currentCustomLyrics
  }

  function onChangeLyricType (e) {
    var type = e.target.id

    var currentSong = songs[Number(DOM.songPicker.value)]
    if (type === 'eil') {
      DOM.songPickerWrapper.classList.remove('hidden')
      DOM.lyrics.removeAttribute('contenteditable')
      render(DOM.tidalLink, renderTidalLink(currentSong))
      currentLyrics = currentSong.lyrics
    } else if (type === 'custom') {
      DOM.songPickerWrapper.classList.add('hidden')
      DOM.lyrics.setAttribute('contenteditable', true)
      DOM.lyrics.focus()
      render(DOM.tidalLink, '')
      currentLyrics = currentCustomLyrics
    } else {
      currentLyrics =  ''
    }
    DOM.lyrics.innerText = currentLyrics
  }

  function onDragEnterImageDragContainer (e) {
    DOM.imagePickerFeedback.innerText = ''
    DOM.imageDragContainer.classList.add('dragging')
  }

  function onStopDragging () {
    DOM.imageDragContainer.classList.remove('dragging')
  }

  function onDragOverImageDragContainer (e) {
    e.preventDefault()
  }

  function onDropImageDragContainer (e) {
    e.preventDefault()

    if (e.dataTransfer.items) {
      var data = e.dataTransfer.items[0]

      // data *may* be an image dragged from the browser
      if (data.kind === 'string' && data.type.match('^text/plain')) {
        var url = ''
        data.getAsString(function (str) {
          fetchImage(str)
        })
      } else if (data.kind === 'file' && data.type.match('^image/')) {
        var file = data.getAsFile()
        var href = URL.createObjectURL(file)
        var filename = file.path || file.name || ''
        renderPreviewImage({href, filename})
      } else {
        addClass([DOM.imagePickerFeedback], 'error')
        render(DOM.imagePickerFeedback, ERRORS.invalidFileType)
      }
    }
    DOM.imageDragContainer.classList.remove('dragging')
  }

  function onUploadImage () {
    var file = DOM.imagePicker.files[0]
    var href = URL.createObjectURL(file)
    var filename = file.path || file.name || ''

    DOM.imageUrlInput.value = ''
    renderPreviewImage({href, filename})
  }

  function onChangeImageUrl (e) {
    var url = e.target.value.trim()
    reset()

    // if there's no input, reset
    if (!url.length) {
      return
    }

    fetchImage(url)
  }

  async function onClickDownloadHtmlButton () {
    var parts = DOM.imagePickerFeedback.innerText.split('/')
    var filename = parts[parts.length - 1].split('.')[0]
    var html = await generateAsciiHtml()

    DOM.downloadHtmlLink.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(html)
    )

    DOM.downloadHtmlLink.setAttribute('download', `${filename}.html`)
    DOM.downloadHtmlLink.click()
  }

  async function generateAsciiHtml () {
    var css = await readFile('/css/ascii.css')

    return `
      <html>
        <style>${css}</style>
        <div id="ascii">${DOM.ascii.innerHTML}</div>
      </html>
    `
  }

  async function fetchImage (url) {
    const setErrors = function (msg) {
      addClass([DOM.imagePickerFeedback, DOM.imageUrlInput], 'error')
      render(DOM.imagePickerFeedback, msg)
    }

    reset()
    try {
      var urlp = new URL(url)
    } catch (err) {
      setErrors(ERRORS.invalidImageUrl)
      return
    }

    // add a loading indicator to the input
    DOM.imagePickerFeedback.innerText = 'Fetching image...'

    // if it's a dat URL, use DatArchive.readFile() to fetch the image
    if (urlp.protocol === 'dat:') {
      try {
        var rawUrl = await DatArchive.resolveName(url)
        var archive = new DatArchive(rawUrl)
        var buf = await archive.readFile(urlp.pathname, 'binary')
        var blob = new Blob([buf])

        reset()
        renderPreviewImage({blob, filename: url})
      } catch (err) {
        var errorMessage = ''

        switch (err.name) {
          case 'NotFoundError':
            errorMessage = ERRORS.notFound
            break
          case 'InvalidDomainName':
            errorMessage = ERRORS.notFound
            break
          default:
            errorMessage = 'Oops. Something went wrong'
        }

        setErrors(errorMessage)
      }
    } else if (urlp.protocol.startsWith('http')) {
      try {
        var res = await timeout(2000, experimental.globalFetch(url))
        var blob = await res.blob()

        if (blob.type.startsWith('image')) {
          reset()
          renderPreviewImage({blob, filename: url})
        } else {
          setErrors(ERRORS.notFound)
        }
      } catch (err) {
        setErrors(ERRORS.timedOut)
      }
    } else {
      setErrors(ERRORS.invalidProtocol)
    }
  }
})()