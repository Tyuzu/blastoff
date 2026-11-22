export default function (eleventyConfig) {
  // Static assets
  eleventyConfig.addPassthroughCopy("src/assets");

  // PWA Service Worker & Root Icons (copied directly to root of _site/)
  eleventyConfig.addPassthroughCopy({ "src/pwa/sw.js": "sw.js" });
  eleventyConfig.addPassthroughCopy({ "src/pwa/favicon.png": "favicon.png" });

  // ISO 8601 date filter for sitemap.xml <lastmod>
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    const date = dateObj ? new Date(dateObj) : new Date();
    return date.toISOString();
  });

  // Collection of all indexable pages (excludes drafts, 404, or explicit noindex)
  eleventyConfig.addCollection("sitemapPages", (collectionApi) => {
    return collectionApi.getAll().filter((item) => {
      if (!item.url) return false;
      if (item.data.eleventyExcludeFromCollections) return false;
      if (item.data.robots && item.data.robots.includes("noindex")) return false;
      return true;
    });
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["html", "liquid", "md"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    dataTemplateEngine: "liquid"
  };
}