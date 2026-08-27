-- 散歩履歴（/history・/history/[id]・ホームの「最近の散歩」）の動作確認用データ。
--
-- 実行方法:
--   npm run seed:history
--   （直接実行する場合）psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/seeds/stroll_history_seed.sql
--
-- 特徴:
--   - id を 'seed-' で始めているため、冒頭の DELETE によって何度でも上書き実行できる。
--   - visitedAt は now() からの相対日時で作るため、いつ実行しても
--     「今月／過去3か月／今年」の絞り込みが意味を持つ。
--   - DB には UTC で保存し画面は Asia/Tokyo で表示するため、
--     日本時間で組み立てた日時を UTC へ変換して投入する。
--
-- 確認用ログイン: seed.demo@sanpo-gacha.test / password123
--   （seed.other@sanpo-gacha.test は「他ユーザーの履歴が見えないこと」の確認用）
--
-- 注意: placeId はダミーのため、GOOGLE_PLACES_API_KEY を設定していても
--       場所名は解決されず「名称未取得の場所」と表示される。

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. 既存のシードデータを削除（外部キーの参照順に）
-- ---------------------------------------------------------------------------
DELETE FROM "Picture" WHERE "strollHistoryId" LIKE 'seed-%';
DELETE FROM "StrollHistoryCategory" WHERE "strollHistoryId" LIKE 'seed-%';
DELETE FROM "StrollHistory" WHERE "id" LIKE 'seed-%';
DELETE FROM "Category" WHERE "id" LIKE 'seed-%';

-- ---------------------------------------------------------------------------
-- 2. 確認用ユーザー（パスワードはどちらも password123）
--    User は他テーブルから参照されうるため、削除せず upsert する。
-- ---------------------------------------------------------------------------
INSERT INTO "User" ("id", "name", "email", "passwordHash", "createdAt", "updatedAt")
VALUES
  (
    'seed-user-demo',
    '散歩 太郎',
    'seed.demo@sanpo-gacha.test',
    '$2b$10$Ngl7oxrWm28TY.wsd4cFCOKoXZgBSjtmMvM4KPEwCmI73l5b/lT1O',
    now() AT TIME ZONE 'UTC',
    now() AT TIME ZONE 'UTC'
  ),
  (
    'seed-user-other',
    '散歩 花子',
    'seed.other@sanpo-gacha.test',
    '$2b$10$Ngl7oxrWm28TY.wsd4cFCOKoXZgBSjtmMvM4KPEwCmI73l5b/lT1O',
    now() AT TIME ZONE 'UTC',
    now() AT TIME ZONE 'UTC'
  )
ON CONFLICT ("id") DO UPDATE
SET "name" = EXCLUDED."name",
    "email" = EXCLUDED."email",
    "passwordHash" = EXCLUDED."passwordHash",
    "updatedAt" = EXCLUDED."updatedAt";

-- ---------------------------------------------------------------------------
-- 3. カテゴリ（カテゴリ絞り込みの選択肢になる）
--    API はカテゴリをカンマ区切りの1文字列で返すため、名前に「,」は使わない。
-- ---------------------------------------------------------------------------
INSERT INTO "Category" ("id", "name", "createdAt")
VALUES
  ('seed-category-park',     '公園',   now() AT TIME ZONE 'UTC'),
  ('seed-category-shrine',   '神社',   now() AT TIME ZONE 'UTC'),
  ('seed-category-cafe',     'カフェ', now() AT TIME ZONE 'UTC'),
  ('seed-category-river',    '海・川', now() AT TIME ZONE 'UTC'),
  ('seed-category-view',     '展望',   now() AT TIME ZONE 'UTC'),
  ('seed-category-gourmet',  'グルメ', now() AT TIME ZONE 'UTC'),
  ('seed-category-shopping', '商店街', now() AT TIME ZONE 'UTC');

-- ---------------------------------------------------------------------------
-- 4. 散歩履歴
--    visited_at_jst には「日本時間での日時」を書き、
--    最後にまとめて UTC へ変換して "visitedAt" に格納する。
-- ---------------------------------------------------------------------------
WITH base AS (
  SELECT
    now() AT TIME ZONE 'Asia/Tokyo'                      AS jst_now,
    date_trunc('month', now() AT TIME ZONE 'Asia/Tokyo') AS jst_month_start,
    date_trunc('year',  now() AT TIME ZONE 'Asia/Tokyo') AS jst_year_start
),
records (id, user_id, place_id, visited_at_jst, stroll_time, meter, steps, calories) AS (
  -- 直近の散歩（一覧の先頭・ホームの「最近の散歩」に出る／写真2枚）
  SELECT 'seed-history-001'::text, 'seed-user-demo'::text, 'ChIJ-SEED-kiba-park'::text,
         b.jst_now - interval '2 hours',
         45::int, 3200::int, 4300::int, 158.20::numeric(6,2)
  FROM base b

  -- カテゴリ2件・距離1km未満（「850 m」表記）の確認
  UNION ALL
  SELECT 'seed-history-002', 'seed-user-demo', 'ChIJ-SEED-fukagawa-cafe',
         b.jst_now - interval '1 day 3 hours',
         25, 850, 1100, 42.50
  FROM base b

  -- 最小値まわり（「5分」「120 m」）の確認／写真なし
  UNION ALL
  SELECT 'seed-history-003', 'seed-user-demo', 'ChIJ-SEED-machikado-bench',
         b.jst_now - interval '6 hours',
         5, 120, 150, 4.50
  FROM base b

  -- 写真なし → 詳細画面のプレースホルダ表示の確認
  UNION ALL
  SELECT 'seed-history-004', 'seed-user-demo', 'ChIJ-SEED-tomioka-hachimangu',
         b.jst_now - interval '4 days',
         70, 5100, 6800, 251.75
  FROM base b

  -- 4時間・2万歩超え（「4時間」「20,500歩」）／写真3枚のサムネイル切替
  UNION ALL
  SELECT 'seed-history-005', 'seed-user-demo', 'ChIJ-SEED-arakawa-riverside',
         b.jst_now - interval '9 days',
         240, 15200, 20500, 754.90
  FROM base b

  -- 必ず「今月」に入る1件（月初09:30）／125分＝「2時間5分」／画像パスが壊れている場合の確認
  UNION ALL
  SELECT 'seed-history-006', 'seed-user-demo', 'ChIJ-SEED-sumida-terrace',
         b.jst_month_start + interval '9 hours 30 minutes',
         125, 9800, 13200, 486.30
  FROM base b

  -- 先月（「過去3か月」に入り「今月」からは外れる）
  UNION ALL
  SELECT 'seed-history-007', 'seed-user-demo', 'ChIJ-SEED-sunamachi-ginza',
         b.jst_month_start - interval '1 month' + interval '15 hours',
         55, 2600, 3500, 129.00
  FROM base b

  -- 2か月前（「過去3か月」の内側の境界）
  UNION ALL
  SELECT 'seed-history-008', 'seed-user-demo', 'ChIJ-SEED-kiyosumi-teien',
         b.jst_month_start - interval '2 months' + interval '8 hours',
         40, 2100, 2800, 103.60
  FROM base b

  -- 3か月前（「過去3か月」の外側の境界）
  UNION ALL
  SELECT 'seed-history-009', 'seed-user-demo', 'ChIJ-SEED-tokyo-tower',
         b.jst_month_start - interval '3 months' + interval '10 hours',
         90, 6400, 8600, 317.45
  FROM base b

  -- 昨年12月（「今年」から外れる）
  UNION ALL
  SELECT 'seed-history-010', 'seed-user-demo', 'ChIJ-SEED-meiji-jingu',
         b.jst_year_start - interval '1 month' + interval '11 hours',
         105, 7300, 9800, 361.10
  FROM base b

  -- 別ユーザーの履歴（demo でログインしても見えないことの確認）
  UNION ALL
  SELECT 'seed-history-101', 'seed-user-other', 'ChIJ-SEED-yoyogi-park',
         b.jst_now - interval '3 hours',
         60, 4200, 5600, 207.30
  FROM base b
)
INSERT INTO "StrollHistory"
  ("id", "userId", "visitedPlaceId", "visitedAt", "strollTime", "meter", "steps", "calories")
SELECT
  r.id,
  r.user_id,
  r.place_id,
  (r.visited_at_jst AT TIME ZONE 'Asia/Tokyo') AT TIME ZONE 'UTC',
  r.stroll_time,
  r.meter,
  r.steps,
  r.calories
FROM records r;

-- ---------------------------------------------------------------------------
-- 5. 履歴とカテゴリの紐付け（1履歴に複数カテゴリを付けたものも含む）
-- ---------------------------------------------------------------------------
INSERT INTO "StrollHistoryCategory" ("strollHistoryId", "categoryId")
VALUES
  ('seed-history-001', 'seed-category-park'),
  ('seed-history-002', 'seed-category-cafe'),
  ('seed-history-002', 'seed-category-gourmet'),
  ('seed-history-003', 'seed-category-cafe'),
  ('seed-history-004', 'seed-category-shrine'),
  ('seed-history-005', 'seed-category-river'),
  ('seed-history-006', 'seed-category-river'),
  ('seed-history-006', 'seed-category-park'),
  ('seed-history-007', 'seed-category-shopping'),
  ('seed-history-007', 'seed-category-gourmet'),
  ('seed-history-008', 'seed-category-park'),
  ('seed-history-009', 'seed-category-view'),
  ('seed-history-010', 'seed-category-shrine'),
  ('seed-history-101', 'seed-category-park');

-- ---------------------------------------------------------------------------
-- 6. 写真
--    public/ 配下の既存ファイルを指すため、詳細画面で実際に表示できる。
--    1つの履歴の中でパスが重複しないようにしている（サムネイルの key が重複するため）。
--    seed-history-006 だけは存在しないパスにして、読み込み失敗時の
--    「写真はありません」フォールバックを確認できるようにしている。
-- ---------------------------------------------------------------------------
INSERT INTO "Picture" ("id", "strollHistoryId", "imagePath")
VALUES
  ('seed-picture-001-1', 'seed-history-001', '/sanpo-gacha-logo.png'),
  ('seed-picture-001-2', 'seed-history-001', '/globe.svg'),
  ('seed-picture-002-1', 'seed-history-002', '/window.svg'),
  ('seed-picture-005-1', 'seed-history-005', '/sanpo-gacha-logo.png'),
  ('seed-picture-005-2', 'seed-history-005', '/file.svg'),
  ('seed-picture-005-3', 'seed-history-005', '/vercel.svg'),
  ('seed-picture-006-1', 'seed-history-006', '/seed/not-found-photo.png'),
  ('seed-picture-007-1', 'seed-history-007', '/next.svg'),
  ('seed-picture-008-1', 'seed-history-008', '/globe.svg'),
  ('seed-picture-010-1', 'seed-history-010', '/sanpo-gacha-logo.png'),
  ('seed-picture-101-1', 'seed-history-101', '/sanpo-gacha-logo.png');

COMMIT;
