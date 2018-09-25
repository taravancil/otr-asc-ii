onmessage = function (message) {
  var imageData = message.data.imageData.data
  var width = message.data.imageData.width
  var height = message.data.imageData.height
  var pixelSize = message.data.pixelSize

  const getPixelColor = function (data, x, y, width) {
    var red = data[(y * width * 4) + (x * 4)]
    var green = data[(y * width * 4) + (x * 4) + 1]
    var blue = data[(y * width * 4) + (x * 4) + 2]

    return `rgb(${red}, ${green}, ${blue})`
  }

  const strToArrayBuffer = function (str) {
    var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
    var bufView = new Uint16Array(buf)

    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  }

  var pxon = {
    exif: {
      datetime : new Date()
    },
    pxif: {
      pixels: []
    }
  }

  for (let x = 0; x < width; x += pixelSize) {
    for (let y = 0; y < height; y += pixelSize) {
      var color = getPixelColor(imageData, x, y, width)

      pxon.pxif.pixels.push({
        x,
        y,
        color,
        size: pixelSize
      })
    }
  }

  // use a Transferable object instead of string to handle big images
  var str =  JSON.stringify(pxon)
  var buf = strToArrayBuffer(str)
  postMessage(buf, [buf])
}
