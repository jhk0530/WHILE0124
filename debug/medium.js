// Medium RSS 피드에서 최신 발행 날짜를 가져오는 코드
// 미디엄은 크롤링 제한 있음

const Parser = require("rss-parser");
const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
  },
});

(async () => {
  const feed = await parser.parseURL("https://medium.com/feed/@axisj");
  if (feed.items && feed.items.length > 0) {
    // RSS 2.0의 경우 pubDate가 주로 사용됨
    const dates = feed.items
      .map((i) => i.pubDate || i.isoDate)
      .filter(Boolean)
      .map((d) => new Date(d));
    if (dates.length > 0) {
      const latest = new Date(Math.max(...dates));
      // 연월일(YYYY-MM-DD)만 출력
      const ymd = latest.toISOString().slice(0, 10);
      console.log("최신 발행 날짜:", ymd);
    } else {
      // RSS 2.0에서 pubDate가 없을 경우 title, link 등으로 대체 정보 제공
      console.log("날짜 정보를 찾을 수 없습니다. (RSS 2.0 pubDate 없음)");
      feed.items.forEach((item, idx) => {
        console.log(`[${idx + 1}] title: ${item.title}, link: ${item.link}`);
      });
    }
  } else {
    console.log("피드 항목이 없습니다.");
  }
})();
