const fs = require("fs");
const yaml = require("js-yaml");

const inputPath = "db.yml";
const outputPath = "db2.yml";

try {
  // db.yml 파일 읽기
  const fileContents = fs.readFileSync(inputPath, "utf8");
  const data = yaml.load(fileContents);

  // name과 rss 둘 중 하나라도 없으면 삭제
  const filtered = Array.isArray(data)
    ? data
        .filter((item) => item.name && item.rss)
        .map((item) => ({
          name: item.name,
          rss: item.rss,
        }))
    : [];

  // db2.yml로 저장
  fs.writeFileSync(outputPath, yaml.dump(filtered), "utf8");
  console.log("db2.yml 파일이 생성되었습니다.");
} catch (e) {
  console.error(e);
}
