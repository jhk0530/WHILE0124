const fs = require("fs");
const yaml = require("js-yaml");
const Parser = require("rss-parser");

// Returns yesterday's date in YYYY-MM-DD format
function getYesterdayYMD() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

(async () => {
  // Load blog feed list from YAML file
  const fileContents = fs.readFileSync("blogs.yml", "utf8");
  const data = yaml.load(fileContents);

  const yesterday = getYesterdayYMD();

  // Clear the markdown file if it exists
  fs.writeFileSync("daily.md", "");

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
          // Extract image URL from enclosure, media:content, or HTML content
          let imageUrl = "";
          if (post.enclosure && post.enclosure.url) {
            imageUrl = post.enclosure.url;
          } else if (
            post["media:content"] &&
            post["media:content"]["$"] &&
            post["media:content"]["$"].url
          ) {
            imageUrl = post["media:content"]["$"].url;
          } else if (post.content && post.content.includes("<img")) {
            const match = post.content.match(/<img[^>]+src="([^">]+)"/);
            if (match) imageUrl = match[1];
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
            // Format: YYYY-MM-DD HH:mm
            pubStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")} ${String(
              d.getHours()
            ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
          }

          // Build markdown entry
          let mdLine = `[${post.title}](${post.link})\n@${item.name}\n`;
          if (pubStr) mdLine += `${pubStr}\n`;
          if (imageUrl) mdLine += `![썸네일](${imageUrl})\n`;
          if (tags.length > 0)
            mdLine += tags.map((t) => `#${t}`).join(" ") + "\n";
          mdLine += `\n`;

          // Append to markdown file
          fs.appendFileSync("daily.md", mdLine);
        });
      } else {
        console.log(`⏭️ ${item.name}`);
      }
    } catch (e) {
      console.error(`Feed error: ${item.name} (${item.rss})`);
      console.error(`Error: ${e}`);
    }
  }

  // Print result message
  if (fs.readFileSync("daily.md", "utf8").trim()) {
    console.log("Markdown file saved: daily.md");
  } else {
    console.log("No posts found for yesterday.");
  }
  process.exit(0); // Explicitly exit the process
})();
