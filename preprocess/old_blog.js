const fs = require("fs");
const yaml = require("js-yaml");
const Parser = require("rss-parser");

const inputPath = "db2.yml";
const outputPath = "db3.yml";
const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; RSS Reader/1.0)",
    Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
  },
});

async function processFeeds() {
  const fileContents = fs.readFileSync(inputPath, "utf8");
  const data = yaml.load(fileContents);

  // db3.yml이 이미 존재하면 기존 name, rss 조합을 읽어둠
  let existing = [];
  if (fs.existsSync(outputPath)) {
    const db3Content = fs.readFileSync(outputPath, "utf8");
    if (db3Content.trim()) {
      existing = yaml.load(db3Content);
    }
  }
  const existSet = new Set(
    Array.isArray(existing)
      ? existing.map((item) => `${item.name}|${item.rss}`)
      : []
  );

  for (const item of data) {
    const key = `${item.name}|${item.rss}`;
    if (existSet.has(key)) {
      continue;
    }
    console.log(`Processing: ${item.name}`);
    let last = null;
    try {
      const feed = await parser.parseURL(item.rss);
      if (feed.items && feed.items.length > 0) {
        const dates = feed.items
          .map((i) => i.pubDate || i.isoDate)
          .filter(Boolean)
          .map((d) => new Date(d));
        if (dates.length > 0) {
          last = new Date(Math.max(...dates)).toISOString().slice(0, 10);
        } else {
          console.log("날짜 정보를 찾을 수 없습니다. (RSS 2.0 pubDate 없음)");
          feed.items.forEach((item, idx) => {
            console.log(
              `[${idx + 1}] title: ${item.title}, link: ${item.link}`
            );
          });
        }
      } else {
        console.log("피드 항목이 없습니다.");
      }
    } catch (e) {
      last = null;
    }
    if (last === null) {
      console.log(`last가 null입니다. name: ${item.name}, rss: ${item.rss}`);
      break;
    }
    // 기존 파일에 한 항목씩 append
    // last는 YYYY-MM-DD 문자열로 저장
    const entryObj = {
      name: item.name,
      rss: item.rss,
      last: last, // 이미 YYYY-MM-DD 문자열임
    };
    const entry = yaml.dump([entryObj], { styles: { "!!str": "plain" } });
    fs.appendFileSync(outputPath, entry.replace(/^---\n/, ""), "utf8");
  }

  console.log("db3.yml 파일이 생성되었습니다.");
}

processFeeds();
