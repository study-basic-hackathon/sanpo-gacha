-- 散歩履歴の動作確認用データ（stroll_history_seed.sql で投入した 'seed-' 始まりのデータ）を削除する。
--
-- 実行方法:
--   npm run seed:history -- --clean
--   （直接実行する場合）psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/seeds/stroll_history_clean.sql

BEGIN;

DELETE FROM "Picture" WHERE "strollHistoryId" LIKE 'seed-%';
DELETE FROM "StrollHistoryCategory" WHERE "strollHistoryId" LIKE 'seed-%';
DELETE FROM "StrollHistory" WHERE "id" LIKE 'seed-%';
DELETE FROM "Category" WHERE "id" LIKE 'seed-%';

-- 確認用ユーザーも消す。手動で作った履歴が残っている場合は外部キー制約で
-- 失敗するため、その履歴を消してから再実行する。
DELETE FROM "Session" WHERE "userId" LIKE 'seed-user-%';
DELETE FROM "Account" WHERE "userId" LIKE 'seed-user-%';
DELETE FROM "User" WHERE "id" LIKE 'seed-user-%';

COMMIT;
