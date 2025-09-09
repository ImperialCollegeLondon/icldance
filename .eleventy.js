const fs = require("fs");

const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItCaption = require("markdown-it-image-figures");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require("markdown-it-attrs");

const pluginNavigation = require("@11ty/eleventy-navigation");

const inclusiveLangPlugin = require("@11ty/eleventy-plugin-inclusive-language");
const pluginSEO = require("eleventy-plugin-seo");

const pluginCleanUrls = require("@inframanufaktur/eleventy-plugin-clean-urls");

const pluginSitemap = require("@quasibit/eleventy-plugin-sitemap");

const htmlmin = require("html-minifier-terser");

module.exports = async function (eleventyConfig) {
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("posts/**/*");
  });

  eleventyConfig.addPlugin(pluginNavigation);

  eleventyConfig.addPlugin(pluginSEO, {
    title: "Imperial College London Dance Club",
    url: "https://imperialcollegelondon.github.io/icldance/",
    image: "/assets/favicon.png",
    author: "Timothy Langer",
    options: {
      titleStyle: "minimalistic",
      imageWithBaseUrl: true,
      showPageNumbers: false,
    },
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      // Sunday, March 18 2023
      "cccc, dd LLLL yyyy"
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // https://www.11ty.dev/docs/transforms/#minify-html-output
  eleventyConfig.addTransform("htmlmin", function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });

      return minified;
    }

    // If not an HTML output, return content as-is
    return content;
  });

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    typographer: true,
    linkify: true,
  })
    .use(markdownItFootnote)
    .use(markdownItAnchor)
    .use(markdownItAttrs)
    .use(markdownItCaption, {
      figcaption: true,
    });
  eleventyConfig.setLibrary("md", markdownLibrary);

  // `images` folder contains global images used by all posts
  eleventyConfig.addPassthroughCopy("images");

  // `css` folder contains global styles
  eleventyConfig.addPassthroughCopy("css");

  // Copy any .jpg files (e.g. for posts) preserving directory structure
  eleventyConfig.addPassthroughCopy("**/*.jpg");
  eleventyConfig.addPassthroughCopy("**/*.png");
  eleventyConfig.addPassthroughCopy("**/*.svg");

  // Copy any assets (e.g. documents) preserving directory structure
  eleventyConfig.addPassthroughCopy("assets");

  // Copy robots.txt file
  eleventyConfig.addPassthroughCopy("robots.txt");

  // Copy favicon.ico
  eleventyConfig.addPassthroughCopy("favicon.ico");

  // Use pass-through file copy when in development mode
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.addPlugin(inclusiveLangPlugin);
  eleventyConfig.addPlugin(pluginCleanUrls);
  eleventyConfig.addPlugin(pluginSitemap, {
    lastModifiedProperty: "modified",
    sitemap: {
      hostname: "https://imperialcollegelondon.github.io/icldance/",
    },
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: ["md", "njk", "html", "liquid"],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // -----------------------------------------------------------------
    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Don’t worry about leading and trailing slashes, we normalize these.

    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for link URLs (it does not affect your file structure)
    // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

    // You can also pass this in on the command line using `--pathprefix`

    // Optional (default is shown)
    pathPrefix: "/icldance/",
    // -----------------------------------------------------------------

    // These are all optional (defaults are shown):
    dir: {
      // input: ".",
      // output: "/opt/icldance/_site"
      // includes: "./_includes",
      // data: "./_data",
    },
  };
};
