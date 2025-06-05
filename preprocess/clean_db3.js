const fs = require("fs");
const yaml = require("js-yaml");

const inputPath = "db3.yml";
const outputPath = "db4.yml";

const fileContents = fs.readFileSync(inputPath, "utf8");
const data = yaml.load(fileContents);

const filtered = data.filter((item) => {
  if (!item.last) return false;
  // last가 YYYY-MM-DD 형식일 때 연도 추출
  const year = parseInt(item.last.slice(0, 4), 10);
  return year >= 2024;
});

fs.writeFileSync(
  outputPath,
  yaml.dump(filtered, { styles: { "!!str": "plain" } }),
  "utf8"
);
console.log(
  `필터링 완료: ${filtered.length}개 항목이 남았습니다. 결과는 ${outputPath}에 저장되었습니다.`
);
