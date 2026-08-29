import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createLocalImageStorage } from "@/backend/lib/storage/localImageStorage";

const ORIGINAL_ENV = { ...process.env };

let baseDir: string;

function storage(overrides: { baseDir?: string; basePath?: string } = {}) {
  return createLocalImageStorage({ baseDir, basePath: "/images", ...overrides });
}

beforeEach(async () => {
  baseDir = await mkdtemp(path.join(tmpdir(), "sanpo-image-local-"));
});

afterEach(async () => {
  process.env = { ...ORIGINAL_ENV };
  await rm(baseDir, { recursive: true, force: true });
});

describe("既定値の解決", () => {
  it("環境変数が空文字の場合は既定値を使う", () => {
    process.env.IMAGE_STORAGE_LOCAL_DIR = "";
    process.env.IMAGE_STORAGE_BASE_PATH = "";

    const target = createLocalImageStorage();

    expect(target.toReferencePath("history-001/abc.jpg")).toBe(
      "/images/history-001/abc.jpg",
    );
  });

  it("環境変数が未設定の場合も既定値を使う", () => {
    delete process.env.IMAGE_STORAGE_LOCAL_DIR;
    delete process.env.IMAGE_STORAGE_BASE_PATH;

    const target = createLocalImageStorage();

    expect(target.toReferencePath("history-001/abc.jpg")).toBe(
      "/images/history-001/abc.jpg",
    );
  });

  it("環境変数で参照パスの接頭辞を差し替えられる", () => {
    process.env.IMAGE_STORAGE_BASE_PATH = "/uploads";

    const target = createLocalImageStorage();

    expect(target.toReferencePath("history-001/abc.jpg")).toBe(
      "/uploads/history-001/abc.jpg",
    );
  });
});

describe("toReferencePath", () => {
  it("ストレージキーを参照パスに変換する", () => {
    expect(storage().toReferencePath("history-001/abc.jpg")).toBe(
      "/images/history-001/abc.jpg",
    );
  });

  it("接頭辞は設定に従う", () => {
    expect(
      storage({ basePath: "/uploads/photos" }).toReferencePath("history-001/abc.jpg"),
    ).toBe("/uploads/photos/history-001/abc.jpg");
  });

  it("接頭辞の末尾のスラッシュは重複させない", () => {
    expect(storage({ basePath: "/images/" }).toReferencePath("history-001/abc.jpg")).toBe(
      "/images/history-001/abc.jpg",
    );
  });
});

describe("toStorageKey", () => {
  it("参照パスをストレージキーに戻す", () => {
    expect(storage().toStorageKey("/images/history-001/abc.jpg")).toBe(
      "history-001/abc.jpg",
    );
  });

  it("接頭辞が一致しないパスはこのストレージの管理外としてnullを返す", () => {
    expect(storage().toStorageKey("/sanpo-gacha-logo.png")).toBeNull();
    expect(storage().toStorageKey("https://example.com/images/abc.jpg")).toBeNull();
  });

  it("接頭辞が途中までしか一致しないパスはnullを返す", () => {
    expect(storage().toStorageKey("/images-archive/abc.jpg")).toBeNull();
  });

  it("キーが空になるパスはnullを返す", () => {
    expect(storage().toStorageKey("/images")).toBeNull();
    expect(storage().toStorageKey("/images/")).toBeNull();
  });

  it("親ディレクトリを辿るパスはnullを返す", () => {
    expect(storage().toStorageKey("/images/../../etc/passwd")).toBeNull();
  });

  it("toReferencePath と往復できる", () => {
    const target = storage();

    expect(target.toStorageKey(target.toReferencePath("history-001/abc.jpg"))).toBe(
      "history-001/abc.jpg",
    );
  });
});

describe("save", () => {
  it("キーが示すパスにファイルを書き出す", async () => {
    await storage().save("history-001/photo.jpg", Buffer.from("jpeg-bytes"), "image/jpeg");

    const written = await readFile(path.join(baseDir, "history-001", "photo.jpg"));
    expect(written).toEqual(Buffer.from("jpeg-bytes"));
  });

  it("ディレクトリが存在しない場合は作成する", async () => {
    const target = storage({ baseDir: path.join(baseDir, "not", "created", "yet") });

    await target.save("history-001/photo.png", Buffer.from("png-bytes"), "image/png");

    const written = await readFile(
      path.join(baseDir, "not", "created", "yet", "history-001", "photo.png"),
    );
    expect(written).toEqual(Buffer.from("png-bytes"));
  });

  it.each(["../escaped.jpg", "history-001/../../escaped.jpg", "/etc/passwd.jpg"])(
    "ベースディレクトリの外を指すキー %s は拒否する",
    async (key) => {
      await expect(
        storage().save(key, Buffer.from("bytes"), "image/jpeg"),
      ).rejects.toThrowError();
    },
  );
});

describe("remove", () => {
  it("保存したファイルを削除する", async () => {
    const target = storage();
    await target.save("history-001/photo.jpg", Buffer.from("jpeg-bytes"), "image/jpeg");

    await target.remove("history-001/photo.jpg");

    await expect(stat(path.join(baseDir, "history-001", "photo.jpg"))).rejects.toThrow();
  });

  it("存在しないファイルの削除はエラーにしない", async () => {
    await expect(storage().remove("history-001/missing.jpg")).resolves.toBeUndefined();
  });

  it("ベースディレクトリの外のファイルは削除しない", async () => {
    const target = storage({ baseDir: path.join(baseDir, "images") });
    const outside = path.join(baseDir, "secret.jpg");
    await writeFile(outside, "secret");

    await target.remove("../secret.jpg");

    await expect(stat(outside)).resolves.toBeDefined();
  });
});
