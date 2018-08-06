import {$} from '/js/utils.js'

(function () {
  var songs = []
  var activeLyrics = ''

  var DOM = {
    songPicker: $('#song-picker'),
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

  function onChangeSong (e) {
    console.log(e.target)
    var i = Number(e.target.value)
    var song = songs[i]

    DOM.lyrics.innerText = song.lyrics
  }
})()