(function() {
  const DOM = {
    galleryGrid: $(".gallery-grid"),
    currentItem: $(".current-item")
  };

  // state
  let currentItem = null;
  let gallery = {};

  setup();

  async function setup() {
    gallery = JSON.parse(await readFile("/data/gallery.json"));

    loadURL();

    // TODO remove loading indicator after setup
    // render()
    for (let item in gallery) {
      DOM.galleryGrid.innerHTML += renderGalleryGridItem(gallery[item]);
    }
  }

  function loadURL() {
    if (window.location.hash) {
      const key = window.location.hash.slice(1);

      if (key === "gallery") {
        currentItem = null;
        DOM.currentItem.classList.add("hidden");
        $("html").scrollTop = $("#gallery").offsetTop;
      } else if (gallery[key]) {
        currentItem = gallery[key];
        DOM.currentItem.innerHTML = renderCurrentItem(currentItem);
        DOM.currentItem.classList.remove("hidden");
        $("iframe").classList.add("transparent");

        window.setTimeout(function() {
          const iframe = $("iframe");
          iframe.classList.remove("transparent");
        }, 600);
        $("html").scrollTop = 0;
      } else {
        // TODO 404
      }
    } else if (currentItem) {
      DOM.currentItem.classList.add("hidden");
    }
  }

  // events
  window.addEventListener("hashchange", loadURL);

  // rendering
  function renderCredits() {
    return "";
    return `
      <div class="credits flex white-bg">
        <div>
        <h2 class="inline-heading">Never forget to say thank you</h2>
          <p>
            This project is my expression of gratitude to Beyoncé, Jay-Z, Parkwood Entertainment, and Roc Nation for making OTR II happen.
          </p>

          <p>
            To the dancers, costume designers, videographers, photographers, choreographers, publicists, band members, vocalists, seamstresses, creative directors, and every single person who had a hand in bringing OTR II to life—<em>thank you</em>.
          </p>

          <p>
            xo <a href="https://taravancil.com">Tara Vancil</a>
          </p>
        </div>

        <form action="https://tinyletter.com/taravancil" method="post" target="popupwindow" onsubmit="window.open('https://tinyletter.com/taravancil', 'popupwindow', 'scrollbars=yes,width=800,height=600');return true">
          <p>
            <label for="tlemail">Enter your email address</label>
          </p>

          <div class="flex">
            <input type="email" name="email" id="tlemail" />
            <input type="hidden" value="1" name="embed"/>
            <button class="btn">Subscribe</button>
          </div>
        </form>
      </div>
    `;
  }

  function renderGalleryGridItem(item, options = {}) {
    return `
      <a href="#${item.slug}" class="${
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

  function renderCurrentItem(item) {
    const date = new Date(item.date + "T03:24:00");

    let photoCreditTooltip = "";
    if (item.photoCredit === "uncredited") {
      photoCreditTooltip = `<div class="help-tooltip tooltip-container small-text" data-tooltip-content="Know who took this photo? Email me! contact@taravancil.com">?</div>`;
    }

    const keys = Object.keys(gallery);
    const currentKeyIdx = keys.indexOf(item.slug);

    let previousItem = null;
    if (currentKeyIdx > 0) {
      previousItem = gallery[keys[currentKeyIdx - 1]];
    }

    let nextItem = null;
    if (currentKeyIdx < keys.length) {
      nextItem = gallery[keys[currentKeyIdx + 1]];
    }

    let randomItem = null;
    while (!randomItem) {
      const k = keys[(keys.length * Math.random()) << 0];
      const forbidden = [item.slug];
      if (previousItem) {
        forbidden.push(previousItem.slug);
      }
      if (nextItem) {
        forbidden.push(nextItem.slug);
      }
      if (forbidden.indexOf(gallery[k].slug) === -1) {
        randomItem = gallery[k];
      }
    }

    return `
      <div class="current-item-container">
        <nav role="navigation" class="breadcrumbs">
          <a href="#gallery" class="breadcrumb">Home</a>
          &gt;
          <span class="breadcrumb">${item.title}</span>
        </nav>

        <div class="flex">
        <div class="current-item-image">
          <iframe src="/data/gallery/${
            item.slug
          }.html" onload="resizeIframe(this);"></iframe>
        </div>

        <div class="current-item-info">
          <p class="current-item-lyrics"><em>${item.lyrics}</em></p>

          <div class="current-item-listen-link">
            ${item.trackType ? "" : '<span aria-hidden="true">▶</span>'}
            <a href="${item.trackURL}" target="_blank">
              ${item.trackType || "Listen to"} ${item.trackTitle}
            </a>
          </div>
        </div>
      </div>

      <div class="current-item-credits">
        <div class="inline-flex">
          Photo by ${item.photoCredit} ${photoCreditTooltip}
        </div>

        <div>
          ${dateStr(date)} in ${item.city} (<a href="${
      item.photoURL
    }" target="_blank">View original</a>)
        </div>
      </div>

      <div class="gallery-grid current-item-navigation">
        ${
          previousItem
            ? renderGalleryGridItem(previousItem, {
                classes: [
                  "gallery-suggested-nav-item",
                  "gallery-grid-item--blue"
                ],
                customLabel: `<strong>Previous</strong><br><br>${
                  previousItem.title
                }`
              })
            : ""
        }
        ${renderGalleryGridItem(randomItem, {
          classes: [
            "gallery-suggested-nav-item",
            "gallery-suggested-nav-item--random"
          ],
          customLabel: "<strong>Random</strong>"
        })}
        ${
          nextItem
            ? renderGalleryGridItem(nextItem, {
                classes: [
                  "gallery-suggested-nav-item",
                  "gallery-grid-item--yellow"
                ],
                customLabel: `<strong>Next</strong><br><br>${nextItem.title}`
              })
            : ""
        }
      </div>
      </div>
      ${renderCredits()}
    `;
  }
})();
