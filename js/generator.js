import {$} from '/js/utils.js'

(function () {
  var songs = []
  var activeLyrics = ''

  var DOM = {
    imagePicker: $('#image-picker'),
    songPicker: $('#song-picker'),
    previewImage: $('#preview-image'),
    lyrics: $('#lyrics')
  }

  setup()

  async function setup () {
    var a = new DatArchive(window.location)
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

  // events
  DOM.songPicker.addEventListener('change', onChangeSong)
  DOM.imagePicker.addEventListener('change', onUploadImage)

  function onChangeSong (e) {
    console.log(e.target)
    var i = Number(e.target.value)
    var song = songs[i]

    DOM.lyrics.innerText = song.lyrics
  }

  function onUploadImage () {
    var file = DOM.imagePicker.files[0]
    var href = URL.createObjectURL(file)
    DOM.previewImage.src = href
  }
})()