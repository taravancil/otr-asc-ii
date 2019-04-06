function renderGalleryGridItem(item, options = {}) {
  return `
    <a href="/${item.slug}" class="${
    options.classes ? options.classes.join(" ") : ""
  } gallery-grid-item">
      <h2 class="gallery-grid-item-title ">
        ${options.customLabel || item.title}
      </h2>

      <img class="gallery-grid-item-thumb" src="/images/gallery/${
        item.slug
      }.png"/>
    </a>
  `;
}
