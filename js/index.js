(function(){
  // init
  const DOM = {
  	ascii: document.getElementById('ascii')
  }

  var lyrics = ''
  var pxon = ''
  var files

  var pxonWorker = new Worker('pxon.js')

  const setup = async function () {
  	files = new DatArchive(window.location)

  	// read the lyrics and get pxon
  	lyrics = await files.readFile('lyrics/BOSS.txt')
  	pxon = JSON.parse(await files.readFile('pxon/boss.json'))

  	renderLyrics(lyrics, pxon.pxif.pixels)
  }

  const renderLyrics = function (lyrics, pixels) {
  	var html = ''
  	var column = '<div class="column">'
  	var currentColumn = 0
  	var lyricsIdx = 0

  	var width = pixels.reduce((acc, pixel) => {
  	  return pixel.x > acc ? pixel.x : acc
  	}, 0)

  	for (let i = 0; i <= pixels.length; i++) {
      const pixel = pixels[i]

      if (pixel) {
      	lyricsIdx = (pixel.x / 3) + (pixel.y / 3) * (width / 3)
	      var char = lyrics[lyricsIdx % lyrics.length]
      }

	  	if (pixel.x > currentColumn) {
	   	  currentColumn = pixel.x
	  	  column += '</div>'
	  	  html += column
	  	  column = '<div class="column">'
	  	}

	    column += `<span class="char" style="color: ${pixel.color};">${char}</span><br>`
  	}

  	ascii.innerHTML = html
  }

  setup()
  // event listeners
})()