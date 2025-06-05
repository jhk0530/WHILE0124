# note.md

1. db.yml: **original db**
   - process_db_yml.js 로 rss, name이 없는 아이템 삭제 후 db2.yml로 저장
2. db2.yml
   - using old_blog.js로 가장 최근 글이 발행된 날짜를 추출, db3.yml 생성.
3. db3.yml
   - clean_db3.js로 2024년 이후에 마지막 글이 작성된 아이템만 남기고 db4.yml로 저장
4. db4.yml: **final db**
   - read.js로 어제 발행된 글만 수집
   - brunch 블로그는 별도의 파싱 로직 필요
   - blogs.yml로 이름 변경

- 오류 발생한 블로그는 deleted.yaml에 저장
