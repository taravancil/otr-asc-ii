import {$, render, timeout} from '/js/utils.js'
import {ERRORS} from '/js/const.js'

(function () {
  var a
  var songs = []
  var activeLyrics = ''

  var DOM = {
    imageUrlInput: $('input[name="image-url"]'),
    imagePicker: $('#image-picker'),
    imagePickerFeedback: $('#image-picker-feedback'),
    songPicker: $('#song-picker'),
    previewImage: $('#preview-image'),
    lyrics: $('#lyrics')
  }

  setup()

  async function setup () {
    a = new DatArchive(window.location)
    var songPaths = await a.readdir('/songs')

    for (var i = 0; i < songPaths.length; i++) {
      var song = JSON.parse(await a.readFile(`/songs/${songPaths[i]}`))
      songs.push(song)

      var songEl = document.createElement('option')
      songEl.innerText = song.title
      songEl.value = song.order
      DOM.songPicker.appendChild(songEl)
    }
    activeLyrics = songs[0].lyrics
    DOM.lyrics.innerText = activeLyrics
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

  // events
  DOM.songPicker.addEventListener('change', onChangeSong)
  DOM.imagePicker.addEventListener('change', onUploadImage)
  DOM.imageUrlInput.addEventListener('input', onChangeImageUrl)

  function onChangeSong (e) {
    var i = Number(e.target.value)
    var song = songs[i]

    DOM.lyrics.innerText = song.lyrics
  }

  function onUploadImage () {
    var file = DOM.imagePicker.files[0]
    var href = URL.createObjectURL(file)
    DOM.previewImage.src = href
  }

  async function onChangeImageUrl (e) {
    const reset = function () {
      removeClass([DOM.imagePickerFeedback, DOM.imageUrlInput], 'error')
      render(DOM.imagePickerFeedback, '')
      DOM.previewImage.src = ''
    }

    const renderPreviewImage = function (blob) {
      reset()
      DOM.previewImage.src = URL.createObjectURL(blob)
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
        renderPreviewImage(blob)
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
          renderPreviewImage(blob)
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