(function () {
  const DOM = {
    galleryGrid: $('.gallery-grid'),
    currentItem: $('.current-item')
  }

  // state
  let currentItem = null
  let nextItem = null
  let prevItem = null
  let gallery = {}

  setup()

  async function setup () {
    gallery = JSON.parse(await readFile('/data/gallery.json'))

    loadURL()

    // TODO remove loading indicator after setup
    // render()
    for (let item in gallery) {
      DOM.galleryGrid.innerHTML += renderGalleryGridItem(gallery[item])
    }
  }

  function loadURL () {
    console.log('loadURL')
    if (window.location.hash) {
      const key = window.location.hash.slice(1)

      if (gallery[key]) {
        currentItem = gallery[key]
        DOM.currentItem.innerHTML = renderCurrentItem(currentItem)
        DOM.currentItem.classList.remove('hidden')
        $('iframe').classList.add('transparent')

        // TODO nextItem, prevItem
        // $('iframe').classList.remove('hidden-but-not')

        window.setTimeout(function () {
          $('iframe').classList.remove('transparent')
        }, 600)

      } else {
        // TODO 404
      }
    } else if (currentItem) {
      DOM.currentItem.remove()
    }
  }

  // events
  window.addEventListener('hashchange', loadURL)

  // rendering
  function renderGalleryGridItem (item) {
    return `
      <a href="#${item.slug}" class="gallery-grid-item">
        <h2 class="gallery-grid-item-title small-text">${item.title}</h2>
        <img class="gallery-grid-item-thumb" src="/images/gallery/${item.slug}.png">
      </div>
    `
  }

  function renderCurrentItem (item) {
    const date = new Date(item.date + 'T03:24:00')

    return `
      <div class="conatiner">
        <a href="/" class="small-text">Back to gallery</a>
      </div>

      <iframe src="/data/gallery/${item.slug}.html"></iframe>

      <div class="current-item-info">
        <h1 class="current-item-title large-text">${item.title}</h1>
        <p class="current-item-lyrics small-text"><em>${item.lyrics}</em></p>
        <div class="current-item-credits flex small-text">
          Photo by ${item.photoCredit} - ${dateStr(date)} in ${item.city}
          (<a href="${item.photoURL}" target="_blank">View original</a>)

          <div class="current-item-listen-link">
            <span aria-hidden="true">▶</span>
            <a href="${item.trackURL}" target="_blank">
              Listen to "${item.trackTitle}"
            </a>
          </div>
        </div>
      </div>
    `
  }
})()