import {$, render, timeout} from '/js/utils.js'
import {ERRORS} from '/js/const.js'

(function () {
  var a
  var songs = []
  var currentLyrics = ''
  var currentCustomLyrics = ''

  var DOM = {
    imageUrlInput: $('input[name="image-url"]'),
    imagePicker: $('#image-picker'),
    imagePickerFeedback: $('#image-picker-feedback'),
    imageDragContainer: $('#image-drag-container'),
    previewImage: $('#preview-image'),
    previewImageCaption: $('#preview-image-caption'),
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
    a = new DatArchive(window.location)
    var songPaths = await a.readdir('/songs')
    songPaths = songPaths.sort()

    for (var i = 0; i < songPaths.length; i++) {
      var song = JSON.parse(await a.readFile(`/songs/${songPaths[i]}`))
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

  function renderPreviewImage (opts) {
    render(DOM.previewImageCaption, opts.filename)
    if (opts.blob) {
      DOM.previewImage.src = URL.createObjectURL(opts.blob)
    } else if (opts.href) {
      DOM.previewImage.src = opts.href
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

    function stripLyrics (lyrics) {
      // strip all non-number or letter characters
      return lyrics.replace(/[^a-zA-Z0-9]/g, '');
    }

    DOM.ascii.innerHTML = html
    removeClass([DOM.asciiContainer], 'hidden')
    $('html').scrollTop = 0
    addClass([$('body')], 'noscroll')
    DOM.generateButton.innerText = 'Generate'
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


  function onChangeSong (e) {
    var i = Number(e.target.value)
    var song = songs[i]

    DOM.lyrics.innerText = song.lyrics
    DOM.lyrics.scrollTop = 0
    currentLyrics = song.rawLyrics
  }

  function onInputLyrics (e) {
    currentCustomLyrics = e.target.innerText
  }

  function onChangeLyricType (e) {
    var type = e.target.id

    if (type === 'eil') {
      DOM.songPickerWrapper.classList.remove('hidden')
      DOM.lyrics.removeAttribute('contenteditable')
      currentLyrics = songs[Number(DOM.songPicker.value)].lyrics
    } else if (type === 'custom') {
      DOM.songPickerWrapper.classList.add('hidden')
      DOM.lyrics.setAttribute('contenteditable', true)
      DOM.lyrics.focus()
      currentLyrics = currentCustomLyrics
    } else {
      currentLyrics =  ''
    }
    DOM.lyrics.innerText = currentLyrics
  }

  function onDragEnterImageDragContainer (e) {
    DOM.imageDragContainer.classList.add('dragging')
  }

  function onStopDragging () {
    DOM.imageDragContainer.classList.remove('dragging')
  }

  function onDragOverImageDragContainer (e) {
    e.preventDefault()
  }

  function onDropImageDragContainer (e) {
    var file
    if (e.dataTransfer.items) {
      var file = e.dataTransfer.items[0]
      if (file.kind === 'file' && file.type.startsWith('image/')) {
        file = files[i].getAsFile()
        console.log(file.name)
      }
    } else {
      file = e.dataTransfer.files[0]
    }

    DOM.imageDragContainer.classList.remove('dragging')
  }

  function onUploadImage () {
    var file = DOM.imagePicker.files[0]
    var href = URL.createObjectURL(file)

    DOM.imageUrlInput.value = ''
    renderPreviewImage({href, filename: file.path})
  }

  async function onChangeImageUrl (e) {
    const reset = function () {
      removeClass([DOM.imagePickerFeedback, DOM.imageUrlInput], 'error')
      render(DOM.imagePickerFeedback, '')
      render(DOM.previewImageCaption, '')
      DOM.previewImage.src = ''
    }

    const setErrors = function (msg) {
      addClass([DOM.imagePickerFeedback, DOM.imageUrlInput], 'error')
      render(DOM.imagePickerFeedback, msg)
    }

    var url = e.target.value.trim()
    reset()

    // if there's no input, reset
    if (!url.length) {
      return
    }

    try {
      var urlp = new URL(url)
    } catch (err) {
      setErrors(ERRORS.invalidImageUrl)
      return
    }

    // add a spinner to the input
    render(DOM.imagePickerFeedback, 'Fetching image <span class="loading"></span>')

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