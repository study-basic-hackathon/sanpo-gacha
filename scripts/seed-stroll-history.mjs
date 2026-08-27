/**
 * 散歩履歴の動作確認用データを投入するスクリプト。
 *
 *   npm run seed:history              投入（何度実行しても同じ状態になる）
 *   npm run seed:history -- --clean   投入したデータを削除する
 *   npm run seed:history -- --help    使い方を表示する
 *
 * 接続先は DATABASE_URL。ローカル以外（Neon などの共有DB）を指している場合は
 * 誤って書き換えないよう、--allow-remote を付けない限り中断する。
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import pg from "pg";

const SEEDS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "prisma",
  "seeds",
);

const SEED_SQL = path.join(SEEDS_DIR, "stroll_history_seed.sql");
const CLEAN_SQL = path.join(SEEDS_DIR, "stroll_history_clean.sql");

/** ローカル開発用とみなすDBホスト。docker compose のサービス名 db を含む。 */
const LOCAL_HOSTS = ["db", "localhost", "127.0.0.1", "::1"];

const DEMO_LOGIN = "seed.demo@sanpo-gacha.test / password123";

const USAGE = `使い方: node scripts/seed-stroll-history.mjs [options]

  --clean          動作確認用データを削除する（投入はしない）
  --allow-remote   ローカル以外のDBに対しても実行する
  --help           このヘルプを表示する
`;

function parseArgs(argv) {
  const options = { clean: false, allowRemote: false, help: false };

  for (const arg of argv) {
    switch (arg) {
      case "--clean":
        options.clean = true;
        break;
      case "--allow-remote":
        options.allowRemote = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`不明なオプションです: ${arg}`);
    }
  }

  return options;
}

/** 接続先の情報を取り出す。パスワードは表示しないため取り出さない。 */
function describeTarget(databaseUrl) {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: url.port || "5432",
    database: url.pathname.replace(/^\//, ""),
    isLocal: LOCAL_HOSTS.includes(url.hostname),
  };
}

/** 投入後の内容を一覧で確認するためのクエリ。日時は日本時間で表示する。 */
const SUMMARY_QUERY = `
SELECT
  u."email" AS "ユーザー",
  h."id" AS "履歴ID",
  to_char(h."visitedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD HH24:MI') AS "訪問日時(JST)",
  string_agg(DISTINCT c."name", ',') AS "カテゴリ",
  h."strollTime" AS "分",
  h."meter" AS "m",
  h."steps" AS "歩数",
  h."calories" AS "kcal",
  count(DISTINCT p."id") AS "写真"
FROM "StrollHistory" h
JOIN "User" u ON u."id" = h."userId"
LEFT JOIN "StrollHistoryCategory" hc ON hc."strollHistoryId" = h."id"
LEFT JOIN "Category" c ON c."id" = hc."categoryId"
LEFT JOIN "Picture" p ON p."strollHistoryId" = h."id"
WHERE h."id" LIKE 'seed-%'
GROUP BY u."email", h."id", h."visitedAt", h."strollTime", h."meter", h."steps", h."calories"
ORDER BY u."email", h."visitedAt" DESC
`;

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(USAGE);
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL が設定されていません。docker compose exec app 経由で実行するか、.env を読み込んでください。",
    );
  }

  const target = describeTarget(databaseUrl);

  console.log(
    `接続先: ${target.host}:${target.port}/${target.database}` +
      (target.isLocal ? "" : "（ローカル以外）"),
  );

  if (!target.isLocal && !options.allowRemote) {
    throw new Error(
      `ローカル以外のDB(${target.host})です。共有DBを書き換えないよう中断しました。意図的な場合は --allow-remote を付けてください。`,
    );
  }

  const sqlPath = options.clean ? CLEAN_SQL : SEED_SQL;
  const sql = await readFile(sqlPath, "utf8");

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    // SQLファイル側に BEGIN / COMMIT を書いているため、ここではそのまま流す。
    await client.query(sql);

    if (options.clean) {
      console.log("動作確認用データを削除しました。");
      return;
    }

    const summary = await client.query(SUMMARY_QUERY);

    console.table(summary.rows);
    console.log(`投入した散歩履歴: ${summary.rowCount}件`);
    console.log(`確認用ログイン: ${DEMO_LOGIN}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
