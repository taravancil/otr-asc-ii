const fs = require("fs");

const ORIGIN = "https://otrii.taravancil.com";
const GALLERY = "../data/gallery.json";

let gallery;
let galleryKeys;
fs.readFile(GALLERY, { encoding: "utf8" }, (_, data) => {
  gallery = JSON.parse(data);
  galleryKeys = Object.keys(gallery);

  for (let item in gallery) {
    fs.mkdir(`../${item}`, err => {
      const html = renderItem(gallery[item]);
      fs.writeFile(`../${item}/index.html`, html, err => {
        if (err) throw err;
        console.log(`✅ /${item}`);
      });
    });
  }
});

// rendering
function renderItem(item) {
  const date = new Date(item.date + "T03:24:00");

  const photoCreditTooltip =
    item.photoCredit === "uncredited" ? renderCreditTooltip() : "";

  return `
    ${renderBeginPage(item)}
    ${renderBreadcrumbs(item)}
    ${renderWidthNotice()}

    <main role="main" class="current-item">
      <div class="flex current-item-image-wrapper">
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
    </main>

    ${renderGalleryNav(item)}
    ${renderCredits()}
    ${renderScripts()}
    ${renderEndPage()}
  `;
}

function renderBeginPage(item) {
  return `<!DOCTYPE html><html lang="en">${renderHeadGalleryItem(
    item
  )}<body class="gallery-item"><style>body { --jay-z-blue: blue;--error-red: red;--highlight-yellow: yellow;}</style>`;
}

function loadIframeScript() {
  return '<script>$("iframe").classList.add("transparent");window.setTimeout(function() {$("iframe").classList.remove("transparent");}, 500);</script>';
}

function resizeIframeScript() {
  return "<script>function resizeIframe(iframe) {iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight}px`;}</script>";
}

function renderScripts() {
  return `
    <script src="/js/utils.js"></script>
    ${loadIframeScript()}
    ${resizeIframeScript()}
    <script src="/js/gallery-grid-item.js"></script>
    <script src="/js/gallery-item.js"></script>
  `;
}

function renderEndPage() {
  return "</body></html>";
}
function renderHeadIndex() {
  const title = "OTR (ASC)II";
  const description = "A collection of OTR II-themed ASCII art by Tara Vancil";

  return `
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <title>OTR ASC(II)</title>
      <link rel="shortcut icon" href="/favicon.png" />

      <meta name="author" content="Tara Vancil" />
      <meta name="description" content="" />

      <meta property="og:url" content="${ORIGIN}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="/favicon.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@taravancil" />
      <meta name="twitter:creator" content="@taravancil" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${ORIGIN}/images/gallery/${slug}.png" />

      <link rel="stylesheet" href="/css/shared.css" />
      <link rel="stylesheet" href="/css/home.css" />
    </head>
  `;
}
function renderHeadGalleryItem({ title, lyrics, slug }) {
  // most social cards can't handle newlines, just render first line
  const description = lyrics.split("\n")[0] + "...";

  return `
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <title>${title}</title>
      <link rel="shortcut icon" href="/favicon.png" />

      <meta name="author" content="Tara Vancil" />
      <meta name="description" content="${description}" />

      <meta property="og:url" content="${ORIGIN}/${slug}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="/favicon.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@taravancil" />
      <meta name="twitter:creator" content="@taravancil" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${ORIGIN}/images/gallery/${slug}.png" />

      <link rel="stylesheet" href="/css/shared.css" />
      <link rel="stylesheet" href="/css/gallery-item.css" />
      <link rel="stylesheet" href="/css/ascii.css" />
    </head>
  `;
}

function renderBreadcrumbs({ title }) {
  return `
    <nav role="navigation" class="breadcrumbs">
      <a href="/#gallery" class="breadcrumb">Home</a>
      &gt;
      <span class="breadcrumb">${title}</span>
    </nav>
  `;
}

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

function renderGalleryNav({ slug }) {
  const currentKeyIdx = galleryKeys.indexOf(slug);

  let previousItem = null;
  if (currentKeyIdx > 0) {
    previousItem = gallery[galleryKeys[currentKeyIdx - 1]];
  }

  let nextItem = null;
  if (currentKeyIdx < galleryKeys.length) {
    nextItem = gallery[galleryKeys[currentKeyIdx + 1]];
  }

  let randomItem = null;
  while (!randomItem) {
    const k = galleryKeys[(galleryKeys.length * Math.random()) << 0];
    const forbidden = [slug];
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
    <nav class="gallery-grid current-item-navigation">
      ${
        previousItem
          ? renderGalleryGridItem(previousItem, {
              customLabel: `<strong>Previous</strong><br><br>${
                previousItem.title
              }`
            })
          : ""
      }
      ${renderGalleryGridItem(randomItem, {
        customLabel: "<strong>Random</strong>"
      })}
      ${
        nextItem
          ? renderGalleryGridItem(nextItem, {
              customLabel: `<strong>Next</strong><br><br>${nextItem.title}`
            })
          : ""
      }
    </nav>`;
}

function renderWidthNotice() {
  return '<div id="width-notice" class="small-text flex z-top"><span>Gallery items look best on larger screens</span><button type="btn" class="btn">Dismiss</button></div>';
}

function renderCredits() {
  return `
    <div aria-hidden="true" class="hive-spacer"></div>
      <div class="thank-you columns white-bg">
        <div class="col col-3-5">
          <h2 class="inline-heading">
            <strong>
              Never forget to say thank you
            </strong>
          </h2>
          <p>
            This project is my expression of gratitude to Beyoncé, Jay-Z, Parkwood Entertainment, and Roc Nation for making OTR II happen.
          </p>

          <p>
            To the dancers, stylists, designers, videographers, photographers, choreographers, publicists, band members, vocalists, seamstresses, creative directors, and every single person who had a hand in bringing OTR II to life—<em>thank you</em>.
          </p>

          <p>
            xo <a href="https://taravancil.com">Tara</a>
          </p>
        </div>

        <div class="thank-you__about-me col col-2-5">
          <p>
            I'm <a href="https://taravancil.com">Tara Vancil</a>, a software developer at <a href="https://glitch.com">Glitch</a>. I build things on the Web, sometimes useful, sometimes silly, other times just plain weird.
          </p>

          <p>
            Subscribe to my newsletter to get updates about new projects
          </p>

          <form action="https://tinyletter.com/taravancil" method="post" target="popupwindow" onsubmit="window.open('https://tinyletter.com/taravancil', 'popupwindow', 'scrollbars=yes,width=800,height=600');return true">
              <label class="std-label" for="tlemail">
                <strong>Your email address</strong>
              </label>

            <div class="flex">
              <input type="email" name="email" id="tlemail" />
              <input type="hidden" value="1" name="embed"/>
              <button class="btn">Subscribe</button>
            </div>
          </form>
        </div>
      </div>
      <div aria-hidden="true" class="hive-spacer"></div>
  `;
}

function renderCreditTooltip() {
  return '<div class="help-tooltip tooltip-container small-text" data-tooltip-content="Know who took this photo? Email me! contact@taravancil.com">?</div>';
}

// utils
function dateStr(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  return `
    ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}
  `;
}
