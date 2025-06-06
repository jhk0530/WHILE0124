const fs = require("fs");
const Parser = require("rss-parser");
const parser = new Parser({
  customFields: {
    item: [
      ["stars", "stars"],
      ["forks", "forks"],
      ["language", "language"],
      ["languageColor", "languageColor"],
      ["addStars", "addStars"],
      ["contributors", "contributors"],
      ["description", "description"],
    ],
  },
});

const repoIcon = `<svg viewBox="0 0 24 24" width="1.2em" height="1.2em" class="text-16px" style="vertical-align:middle;margin-right:6px;">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5">
    <path d="M4 19V5a2 2 0 0 1 2-2h13.4a.6.6 0 0 1 .6.6v13.114"></path>
    <path stroke-linejoin="round" d="M15 17v5l2.5-1.6L20 22v-5"></path>
    <path d="M6 17h14"></path>
    <path stroke-linejoin="round" d="M6 17a2 2 0 1 0 0 4h5.5"></path>
  </g>
</svg>`;

async function fetchTrendingXML() {
  const url =
    "https://raw.githubusercontent.com/isboyjc/github-trending-api/main/data/daily/all.xml";
  const feed = await parser.parseURL(url);

  const lines = feed.items.slice(0, 10).map((item) => {
    // 1. Title (with icon)
    const titleLink = `<a href="${item.link}" style="font-weight:600; color:#2563eb; text-decoration:none; font-size:1.1em;">${repoIcon}${item.title}</a>`;

    // 2. Description
    const desc = item.contentSnippet
      ? `<div style="margin: 4px 0 8px 0; color:#444; font-size:smaller;">${item.contentSnippet}</div>`
      : "";

    // 3. Language badge
    let badge = "";
    if (item.language && item.languageColor) {
      badge = `<span class="keyword" style="display: inline-block; background: ${item.languageColor}; color: white; border-radius: 8px; padding: 0px 8px; margin-right: 8px; margin-left: 4px; font-size: smaller; vertical-align:middle;">${item.language}</span>`;
    }

    // 4. Stars
    const stars = item.stars
      ? `<span style="color:#444; font-size:smaller">⭐ ${item.stars}</span>`
      : "";

    // li 태그 구조로 반환
    return `<li style="list-style: none;">
<div style="padding: 6px 0 6px 0;">
  <div>${titleLink} ${badge}${stars}</div>
  ${desc}
</div>
</li>`;
  });

  fs.writeFileSync("daily.md", lines.join("\n"), "utf-8");
}

fetchTrendingXML().catch(console.error);
