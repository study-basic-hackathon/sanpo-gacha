import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  IMAGE_CONTENT_TYPES,
  getImageStorage,
  imageExtensionOf,
  isSupportedImageContentType,
} from "@/backend/lib/storage/imageStorage";

const ORIGINAL_ENV = { ...process.env };

let baseDir: string;

beforeEach(async () => {
  baseDir = await mkdtemp(path.join(tmpdir(), "sanpo-image-factory-"));
  process.env.IMAGE_STORAGE_LOCAL_DIR = baseDir;
  process.env.IMAGE_STORAGE_BASE_PATH = "/images";
});

afterEach(async () => {
  process.env = { ...ORIGINAL_ENV };
  await rm(baseDir, { recursive: true, force: true });
});

describe("isSupportedImageContentType", () => {
  it.each(Object.keys(IMAGE_CONTENT_TYPES))("%s を受け付ける", (contentType) => {
    expect(isSupportedImageContentType(contentType)).toBe(true);
  });

  it.each(["image/gif", "application/pdf", "text/plain", "", "image/jpeg; charset=utf-8"])(
    "対応していない %s は受け付けない",
    (contentType) => {
      expect(isSupportedImageContentType(contentType)).toBe(false);
    },
  );
});

describe("imageExtensionOf", () => {
  it("Content-Typeに対応する拡張子を返す", () => {
    expect(imageExtensionOf("image/jpeg")).toBe(".jpg");
    expect(imageExtensionOf("image/png")).toBe(".png");
    expect(imageExtensionOf("image/webp")).toBe(".webp");
  });
});

describe("getImageStorage", () => {
  it("IMAGE_STORAGE_DRIVER未設定ならローカルストレージを返す", async () => {
    delete process.env.IMAGE_STORAGE_DRIVER;

    const storage = getImageStorage();
    await storage.save("history-001/photo.png", Buffer.from("png-bytes"), "image/png");

    expect(storage.toReferencePath("history-001/photo.png")).toBe(
      "/images/history-001/photo.png",
    );
    await expect(
      readFile(path.join(baseDir, "history-001", "photo.png")),
    ).resolves.toEqual(Buffer.from("png-bytes"));
  });

  it("IMAGE_STORAGE_DRIVER=local ならローカルストレージを返す", async () => {
    process.env.IMAGE_STORAGE_DRIVER = "local";

    const storage = getImageStorage();
    await storage.save("history-001/photo.jpg", Buffer.from("jpeg-bytes"), "image/jpeg");

    await expect(
      readFile(path.join(baseDir, "history-001", "photo.jpg")),
    ).resolves.toEqual(Buffer.from("jpeg-bytes"));
  });

  it("IMAGE_STORAGE_DRIVER=object は未実装であることが分かるエラーを投げる", () => {
    process.env.IMAGE_STORAGE_DRIVER = "object";

    expect(() => getImageStorage()).toThrowError(/object/);
  });

  it("未知のドライバはエラーを投げる", () => {
    process.env.IMAGE_STORAGE_DRIVER = "dropbox";

    expect(() => getImageStorage()).toThrowError(/dropbox/);
  });
});
