(function() {
  const DOM = {
    galleryGrid: $(".gallery-grid")
  };

  let gallery = {};
  setup();

  async function setup() {
    gallery = JSON.parse(await readFile("/data/gallery.json"));

    for (let item in gallery) {
      DOM.galleryGrid.innerHTML += renderGalleryGridItem(gallery[item]);
    }
  }
})();
