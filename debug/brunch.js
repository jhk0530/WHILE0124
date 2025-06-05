// brunch blog에서 피드 가져오는 예제 코드

const Parser = require("rss-parser");

// const url = "https://brunch.co.kr/rss/@@3Y0";
// const url = "https://all-dev-kang.tistory.com/rss";

let parser;
if (url.includes("brunch.co.kr")) {
  // brunch.co.kr이면 헤더 없이 생성
  parser = new Parser();
} else {
  // 그 외에는 헤더 추가
  parser = new Parser({
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
}

(async () => {
  try {
    const feed = await parser.parseURL(url);
    console.log(feed);
  } catch (e) {
    console.error("에러:", e);
  }
})();
