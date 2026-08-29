import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// 型のみの参照なので、imageStorage との循環インポートは実行時には残らない。
import type {
  ImageStorage,
  ImageStorageKey,
} from "@/backend/lib/storage/imageStorage";

/** 既定の保存先。Next.js が静的配信できるのは public 配下だけなのでその中に置く。 */
const DEFAULT_RELATIVE_DIR = path.join("public", "images");

/** 既定の参照パスの接頭辞。DEFAULT_RELATIVE_DIR から public を除いたもの。 */
const DEFAULT_BASE_PATH = "/images";

export interface LocalImageStorageOptions {
  /** 実ファイルの保存先ディレクトリ。 */
  baseDir?: string;

  /** 参照パスの接頭辞。baseDir が public 配下のどこに当たるかと対応させる。 */
  basePath?: string;
}

/**
 * キーをベースディレクトリ配下の絶対パスへ変換する。
 * ".." や絶対パスでベースディレクトリの外を指すキーは null を返す。
 */
function resolveKey(baseDir: string, key: ImageStorageKey): string | null {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, key);

  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    return null;
  }

  return resolved;
}

/**
 * ローカルファイルシステムに画像を保存する ImageStorage 実装。
 * 保存したファイルは Next.js の public 配下として静的配信される。
 */
export function createLocalImageStorage(
  options: LocalImageStorageOptions = {},
): ImageStorage {
  // env.example のように空文字で定義されている場合も既定値に落とすため ?? ではなく || を使う。
  const baseDir =
    options.baseDir ||
    process.env.IMAGE_STORAGE_LOCAL_DIR?.trim() ||
    path.join(process.cwd(), DEFAULT_RELATIVE_DIR);

  // 末尾のスラッシュは参照パスを組み立てるときに重複するため落としておく。
  const basePath = (
    options.basePath ||
    process.env.IMAGE_STORAGE_BASE_PATH?.trim() ||
    DEFAULT_BASE_PATH
  ).replace(/\/+$/, "");

  return {
    toReferencePath(key) {
      return `${basePath}/${key}`;
    },

    toStorageKey(referencePath) {
      const prefix = `${basePath}/`;

      if (!referencePath.startsWith(prefix)) {
        return null;
      }

      const key = referencePath.slice(prefix.length);

      // 空のキーや、ベースディレクトリの外に出るキーは扱わない。
      if (!key || !resolveKey(baseDir, key)) {
        return null;
      }

      return key;
    },

    async save(key, body) {
      const filePath = resolveKey(baseDir, key);

      if (!filePath) {
        throw new Error(`画像ストレージキーが不正です: ${key}`);
      }

      // Content-Type は拡張子で表現するため、ローカル実装では保存しない。
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, body);
    },

    async remove(key) {
      const filePath = resolveKey(baseDir, key);

      if (!filePath) {
        return;
      }

      await rm(filePath, { force: true });
    },
  };
}
