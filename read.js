const fs = require("fs");
const yaml = require("js-yaml");
const Parser = require("rss-parser");
const { Octokit } = require("@octokit/rest");

// Returns yesterday's date in YYYY-MM-DD format
function getYesterdayYMD() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "jhk0530"; // 깃허브 사용자명
const REPO_NAME = "letter"; // 저장소 이름

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const githubParser = new Parser({
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

async function appendGithubTrendingToDaily() {
  const url =
    "https://raw.githubusercontent.com/isboyjc/github-trending-api/main/data/daily/all.xml";
  const feed = await githubParser.parseURL(url);

  const lines = feed.items.slice(0, 10).map((item) => {
    // 1. Title (with icon)
    const titleLink = `<a href="${item.link}" style="font-weight:600; color:#2563eb; text-decoration:none; font-size:1.1em;">${repoIcon}${item.title}</a>`;

    // 2. Description
    const desc = item.contentSnippet
      ? `<div style="color:#444; font-size:smaller;">${item.contentSnippet}</div>`
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

  fs.appendFileSync("daily.md", lines.join("\n"), "utf-8");
}

(async () => {
  // Load blog feed list from YAML file
  const fileContents = fs.readFileSync("blogs.yml", "utf8");
  const data = yaml.load(fileContents);

  const yesterday = getYesterdayYMD();

  // Clear the markdown file if it exists
  fs.writeFileSync("daily.md", '<ul style="padding:0;">\n');

  for (const item of data) {
    // Use custom headers for non-brunch feeds
    let parser;
    if (item.rss.includes("brunch.co.kr")) {
      parser = new Parser();
    } else {
      parser = new Parser({
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    }

    try {
      // Parse the RSS feed
      const feed = await parser.parseURL(item.rss);
      // 블로그 대표 썸네일 추출 (feed.image.url)
      const blogThumbnail = feed.image && feed.image.url ? feed.image.url : "";

      // Filter posts published yesterday
      const posts = (feed.items || []).filter((i) => {
        const pub = i.pubDate || i.isoDate;
        if (!pub) return false;
        const ymd = new Date(pub).toISOString().slice(0, 10);
        return ymd === yesterday;
      });
      if (posts.length > 0) {
        console.log(`✅ ${item.name}`);
        posts.forEach((post) => {
          let imageUrl = blogThumbnail;

          // brunch.co.kr 썸네일 처리
          if (
            item.rss.includes("brunch.co.kr") &&
            imageUrl &&
            imageUrl.includes("fname=")
          ) {
            // fname= 뒤의 부분만 추출
            const fnameEncoded = imageUrl.split("fname=")[1];
            if (fnameEncoded) {
              imageUrl = decodeURIComponent(fnameEncoded);
            }
          }

          // 썸네일이 없으면 기본 이미지 사용
          if (!imageUrl) {
            imageUrl = "https://7epick.jahnen.io/uploads/thumbnail_eMg8RR.png";
          }

          // Extract tags/categories
          let tags = [];
          if (post.categories && Array.isArray(post.categories)) {
            tags = post.categories;
          } else if (post.category) {
            tags = Array.isArray(post.category)
              ? post.category
              : [post.category];
          }

          // Extract and format publish date
          let pub = post.pubDate || post.isoDate;
          let pubStr = "";
          if (pub) {
            const d = new Date(pub);
            pubStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")} ${String(
              d.getHours()
            ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
          }

          // Build markdown entry in HTML block style
          let mdLine = `<li style="list-style: none;">\n`;
          mdLine += `<div style="display: flex; padding: 10px;">\n`;
          mdLine += `<img src="${imageUrl}" alt="썸네일" style="width: 65px; height: 65px; object-fit: cover; margin-right: 15px;" />\n`;
          mdLine += `<div style="flex-grow: 1;">\n`;
          mdLine += `<div style="padding-bottom: 5px;"><a href="${post.link}">${post.title}</a></div>\n`;
          mdLine += `<div style="padding-bottom: 5px; font-size: smaller; color: gray">@${item.name}`;
          if (tags.length > 0)
            mdLine += ` ${tags
              .map(
                (t) =>
                  `<span class="keyword" style="display: inline-block; background: #FEF3C7; color: #92400E; border-radius: 8px; padding: 2px 8px; margin-right: 4px; font-size: 90%;">#${t}</span>`
              )
              .join("")}`;
          mdLine += `</div>\n`;
          if (pubStr)
            mdLine += `<div style="padding-bottom: 5px; font-size: smaller;">🕒 ${pubStr}</div>\n`;
          mdLine += `</div>\n`;
          mdLine += `</div>\n`;
          mdLine += `</li>\n\n`;

          // Append to markdown file
          fs.appendFileSync("daily.md", mdLine);
        });
      } else {
        // console.log(`⏭️ ${item.name}`);
      }
    } catch (e) {
      console.error(`Feed error: ${item.name} (${item.rss})`);
      console.error(`Error: ${e}`);

      // GitHub Issue 생성
      try {
        await octokit.issues.create({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          title: `[Feed Error] ${item.name}`,
          body: `Feed URL: ${item.rss}\n\nError:\n\`\`\`\n${
            e.stack || e
          }\n\`\`\``,
          labels: ["feed-error"],
        });
        console.log(`GitHub Issue created for ${item.name}`);
      } catch (issueErr) {
        console.error("Failed to create GitHub Issue:", issueErr);
      }
    }
  }

  // Print result message
  if (fs.readFileSync("daily.md", "utf8").trim()) {
    console.log("Markdown file saved: daily.md");
  } else {
    console.log("No posts found for yesterday.");
  }

  fs.appendFileSync("daily.md", "## GitHub Trend Repository\n");

  await appendGithubTrendingToDaily();

  fs.appendFileSync("daily.md", "</ul>\n");

  process.exit(0); // Explicitly exit the process
})();
