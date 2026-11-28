const fs = require("node:fs/promises");
const express = require("express");
const Movie = require("../models/movies");
const { normalizeMediaUrl } = require("../utils/mediaUrl");

const siteName = "Kinolar Olami";
const defaultOrigin = "https://kino-olami.uz";
const projection = "title description homeImg titleImg category -_id";
const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (value) => String(value).replace(/[&<>"']/g, (key) => entities[key]);
const jsonLd = (value, id) =>
  `<script id="${id}" type="application/ld+json">${JSON.stringify(value).replace(/</g, "\\u003c")}</script>`;
const text = (value) => typeof value === "string" ? value.trim() : "";
const getTitle = (title) => text(title?.uz) || text(title?.ru) || text(title);
const getDescription = (description, lang) => {
  const localized = description?.[lang] || description?.uz || description?.ru || description;
  return text(localized?.text) || text(localized);
};
const moviePath = (id) => `/movie/${id}`;
const movieUrl = (origin, id) => `${origin}${moviePath(id)}`;

function getImage(movie, origin, lang) {
  const candidates = [movie.homeImg, movie.titleImg].flatMap((image) =>
    [image?.[lang], image?.uz, image?.ru, image].map(text)
  );
  const value = normalizeMediaUrl(candidates.find((image) => image && image !== "none"));
  if (!value) return "";
  try {
    const url = new URL(value, origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function renderMovie(html, movie, origin, url) {
  const lang = !text(movie.title?.uz) && text(movie.title?.ru) ? "ru" : "uz";
  const title = getTitle(movie.title);
  const description = getDescription(movie.description, lang);
  const image = getImage(movie, origin, lang);
  const pageTitle = `${title} | ${siteName}`;
  const meta = (attribute, name, value) =>
    `<meta ${attribute}="${name}" content="${escape(value)}" />`;
  const tags = [
    `<title>${escape(pageTitle)}</title>`,
    meta("name", "description", description),
    meta("property", "og:title", pageTitle),
    meta("property", "og:description", description),
    meta("property", "og:url", url),
    meta("property", "og:type", "video.movie"),
    image && meta("property", "og:image", image),
    `<link rel="canonical" href="${escape(url)}" />`,
    jsonLd({
      "@context": "https://schema.org",
      "@type": ["tvSeries", "turkishSeries"].includes(movie.category) ? "TVSeries" : "Movie",
      name: title,
      url,
      description: description || undefined,
      image: image || undefined,
    }, "movie-json-ld"),
  ].filter(Boolean).join("\n");
  return html
    .replace('<html lang="uz">', `<html lang="${lang}">`)
    .replace(/<title>[^<]*<\/title>|<meta name="description"[^>]*>|<meta property="og:type"[^>]*>/g, "")
    .replace("</head>", () => `${tags}\n</head>`)
    .replace('<div id="root"></div>', () =>
      `<div id="root"><main><h1>${escape(title)}</h1>${description ? `<p>${escape(description)}</p>` : ""}</main></div>`);
}

function createSeoRoutes(indexPath) {
  const router = express.Router();
  const siteUrl = new URL(process.env.SITE_URL || defaultOrigin);
  if (!["http:", "https:"].includes(siteUrl.protocol) || siteUrl.href !== `${siteUrl.origin}/`) {
    throw new Error("SITE_URL must be an HTTP(S) origin");
  }
  const origin = siteUrl.origin;
  router.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  });

  router.get("/sitemap.xml", async (_req, res) => {
    const seen = new Set();
    const entries = [`<url><loc>${escape(origin)}/</loc></url>`];
    const movies = Movie.find().sort({ movieId: 1 }).select("movieId title updatedAt -_id").lean().cursor();
    for await (const movie of movies) {
      const { movieId, updatedAt } = movie;
      if (!Number.isSafeInteger(movieId) || movieId < 1 || seen.has(movieId) || !getTitle(movie.title)) continue;
      seen.add(movieId);
      const lastmod = updatedAt instanceof Date && Number.isFinite(updatedAt.getTime())
        ? `<lastmod>${updatedAt.toISOString()}</lastmod>` : "";
      entries.push(`<url><loc>${escape(movieUrl(origin, movieId))}</loc>${lastmod}</url>`);
    }
    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`
    );
  });

  if (!indexPath) return router;

  const readIndex = async () => {
    const html = await fs.readFile(indexPath, "utf8");
    return html.replace("</head>", () =>
      `<meta name="site-origin" content="${escape(origin)}" /></head>`);
  };

  router.get("/", async (_req, res) => {
    const html = await readIndex();
    const tags = `<link rel="canonical" href="${escape(origin)}/" />\n` +
      jsonLd({ "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: `${origin}/` }, "website-json-ld");
    res.type("html").send(html.replace("</head>", () => `${tags}\n</head>`));
  });

  router.get("/movie/:id", async (req, res) => {
    const id = Number(req.params.id);
    const movie = /^\d+$/.test(req.params.id) && Number.isSafeInteger(id) && id > 0
      ? await Movie.findOne({ movieId: id }).select(projection).lean()
      : null;
    const html = await readIndex();
    if (!movie) return res.status(404).type("html").send(html);
    const canonicalPath = moviePath(id);
    if (req.path !== canonicalPath) return res.redirect(301, canonicalPath);
    const url = movieUrl(origin, id);
    if (!getTitle(movie.title)) return res.set("X-Robots-Tag", "noindex").type("html").send(html);
    return res.type("html").send(renderMovie(html, movie, origin, url));
  });

  return router;
}

module.exports = createSeoRoutes;
