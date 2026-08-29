import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock はファイル先頭に巻き上げられるため、モックは vi.hoisted で定義する。
const { prismaMock, storageMock } = vi.hoisted(() => ({
  prismaMock: {
    strollHistory: {
      findFirst: vi.fn(),
    },
    picture: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
  storageMock: {
    save: vi.fn(),
    remove: vi.fn(),
    toReferencePath: vi.fn(),
    toStorageKey: vi.fn(),
  },
}));

vi.mock("@/backend/lib/db/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/backend/lib/storage/imageStorage", async () => {
  const actual = await vi.importActual<
    typeof import("@/backend/lib/storage/imageStorage")
  >("@/backend/lib/storage/imageStorage");

  return { ...actual, getImageStorage: () => storageMock };
});

import {
  createImage,
  deleteImage,
  IMAGE_ERROR,
  MAX_IMAGE_BYTES,
} from "@/backend/usecases/image";

const USER_ID = "user-1";
const HISTORY_ID = "history-001";
const IMAGE_ID = "image-001";
const REFERENCE_PATH = "/images/history-001/abcdef.jpg";

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    historyId: HISTORY_ID,
    contentType: "image/jpeg",
    body: Buffer.from("jpeg-bytes"),
    ...overrides,
  };
}

/** Picture レコード。imagePath には参照パスが入る。 */
function pictureRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: IMAGE_ID,
    strollHistoryId: HISTORY_ID,
    imagePath: REFERENCE_PATH,
    ...overrides,
  };
}

/** 自分の履歴が見つかる状態にする。 */
function ownsHistory() {
  prismaMock.strollHistory.findFirst.mockResolvedValue({ id: HISTORY_ID });
}

beforeEach(() => {
  vi.clearAllMocks();
  storageMock.save.mockResolvedValue(undefined);
  storageMock.remove.mockResolvedValue(undefined);
  storageMock.toReferencePath.mockImplementation((key: string) => `/images/${key}`);
  storageMock.toStorageKey.mockImplementation((referencePath: string) =>
    referencePath.startsWith("/images/") ? referencePath.slice("/images/".length) : null,
  );
});

describe("createImage", () => {
  it("ストレージに保存し、参照パスをPictureに登録してImageResponseを返す", async () => {
    ownsHistory();
    prismaMock.picture.create.mockResolvedValue(pictureRecord());

    const result = await createImage(USER_ID, validInput());

    expect(result.success).toBe(true);
    expect(result.value).toEqual({
      imageId: IMAGE_ID,
      historyId: HISTORY_ID,
      imagePath: REFERENCE_PATH,
    });
  });

  it("ストレージキーは履歴IDのディレクトリと推測困難なファイル名で組み立てる", async () => {
    ownsHistory();
    prismaMock.picture.create.mockResolvedValue(pictureRecord());

    await createImage(USER_ID, validInput({ contentType: "image/png" }));

    expect(storageMock.save).toHaveBeenCalledTimes(1);
    const [key, body, contentType] = storageMock.save.mock.calls[0];

    // ファイル名はUUID。参照パスは認証を通らないため、推測できないことが保護になる。
    expect(key).toMatch(
      new RegExp(
        `^${HISTORY_ID}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.png$`,
      ),
    );
    expect(body).toEqual(Buffer.from("jpeg-bytes"));
    expect(contentType).toBe("image/png");
  });

  it("DBにはストレージキーではなく参照パスを保存する", async () => {
    ownsHistory();
    prismaMock.picture.create.mockResolvedValue(pictureRecord());

    await createImage(USER_ID, validInput());

    const [key] = storageMock.save.mock.calls[0];
    expect(prismaMock.picture.create).toHaveBeenCalledWith({
      data: { strollHistoryId: HISTORY_ID, imagePath: `/images/${key}` },
    });
  });

  it("他人の履歴、または存在しない履歴には登録できない", async () => {
    prismaMock.strollHistory.findFirst.mockResolvedValue(null);

    const result = await createImage(USER_ID, validInput());

    expect(result.success).toBe(false);
    expect(result.error).toBe(IMAGE_ERROR.notFound);
    expect(storageMock.save).not.toHaveBeenCalled();
    expect(prismaMock.picture.create).not.toHaveBeenCalled();
  });

  it("履歴の所有者チェックはuserIdを条件に含めて行う", async () => {
    ownsHistory();
    prismaMock.picture.create.mockResolvedValue(pictureRecord());

    await createImage(USER_ID, validInput());

    expect(prismaMock.strollHistory.findFirst).toHaveBeenCalledWith({
      where: { id: HISTORY_ID, userId: USER_ID },
      select: { id: true },
    });
  });

  it.each([
    ["historyIdが空", { historyId: "  " }],
    ["historyIdが文字列でない", { historyId: 123 }],
    ["対応していないContent-Type", { contentType: "image/gif" }],
    ["Content-Typeが空", { contentType: "" }],
    ["本文が空", { body: Buffer.alloc(0) }],
  ])("%s の場合はinvalid_inputを返す", async (_label, overrides) => {
    ownsHistory();

    const result = await createImage(
      USER_ID,
      validInput(overrides) as Parameters<typeof createImage>[1],
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe(IMAGE_ERROR.invalidInput);
    expect(storageMock.save).not.toHaveBeenCalled();
  });

  it("上限サイズちょうどは受け付ける", async () => {
    ownsHistory();
    prismaMock.picture.create.mockResolvedValue(pictureRecord());

    const result = await createImage(
      USER_ID,
      validInput({ body: Buffer.alloc(MAX_IMAGE_BYTES) }),
    );

    expect(result.success).toBe(true);
  });

  it("上限サイズを超える画像はinvalid_inputを返す", async () => {
    ownsHistory();

    const result = await createImage(
      USER_ID,
      validInput({ body: Buffer.alloc(MAX_IMAGE_BYTES + 1) }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe(IMAGE_ERROR.invalidInput);
    expect(storageMock.save).not.toHaveBeenCalled();
  });

  it("Picture登録に失敗した場合は保存済みのファイルを消してunexpectedを返す", async () => {
    ownsHistory();
    prismaMock.picture.create.mockRejectedValue(new Error("db down"));

    const result = await createImage(USER_ID, validInput());

    expect(result.success).toBe(false);
    expect(result.error).toBe(IMAGE_ERROR.unexpected);

    const [savedKey] = storageMock.save.mock.calls[0];
    expect(storageMock.remove).toHaveBeenCalledWith(savedKey);
  });

  it("ストレージへの保存に失敗した場合はunexpectedを返す", async () => {
    ownsHistory();
    storageMock.save.mockRejectedValue(new Error("disk full"));

    const result = await createImage(USER_ID, validInput());

    expect(result.success).toBe(false);
    expect(result.error).toBe(IMAGE_ERROR.unexpected);
    expect(prismaMock.picture.create).not.toHaveBeenCalled();
  });
});

describe("deleteImage", () => {
  it("Pictureを削除し、参照パスから求めたキーでファイルも削除する", async () => {
    prismaMock.picture.findFirst.mockResolvedValue(pictureRecord());
    prismaMock.picture.delete.mockResolvedValue(pictureRecord());

    const result = await deleteImage(USER_ID, IMAGE_ID);

    expect(result.success).toBe(true);
    expect(prismaMock.picture.delete).toHaveBeenCalledWith({ where: { id: IMAGE_ID } });
    expect(storageMock.remove).toHaveBeenCalledWith("history-001/abcdef.jpg");
  });

  it("他人の画像は削除できない", async () => {
    prismaMock.picture.findFirst.mockResolvedValue(null);

    const result = await deleteImage(USER_ID, IMAGE_ID);

    expect(result.success).toBe(false);
    expect(result.error).toBe(IMAGE_ERROR.notFound);
    expect(prismaMock.picture.delete).not.toHaveBeenCalled();
    expect(storageMock.remove).not.toHaveBeenCalled();
  });

  it("他人の画像を触れないよう、所有者を条件に含めて検索する", async () => {
    prismaMock.picture.findFirst.mockResolvedValue(pictureRecord());
    prismaMock.picture.delete.mockResolvedValue(pictureRecord());

    await deleteImage(USER_ID, IMAGE_ID);

    expect(prismaMock.picture.findFirst).toHaveBeenCalledWith({
      where: { id: IMAGE_ID, strollHistory: { userId: USER_ID } },
      select: { id: true, strollHistoryId: true, imagePath: true },
    });
  });

  it.each(["", "   "])(
    "画像IDが空文字(%s)の場合はDBを引かずnot_foundを返す",
    async (id) => {
      const result = await deleteImage(USER_ID, id);

      expect(result.success).toBe(false);
      expect(result.error).toBe(IMAGE_ERROR.notFound);
      expect(prismaMock.picture.findFirst).not.toHaveBeenCalled();
    },
  );

  it("画像の検索でDBエラーが起きた場合はunexpectedを返す", async () => {
    prismaMock.picture.findFirst.mockRejectedValue(new Error("db down"));

    const result = await deleteImage(USER_ID, IMAGE_ID);

    expect(result.success).toBe(false);
    expect(result.error).toBe(IMAGE_ERROR.unexpected);
    expect(prismaMock.picture.delete).not.toHaveBeenCalled();
  });

  it("ストレージ管理外の参照パスはレコードだけ削除する", async () => {
    prismaMock.picture.findFirst.mockResolvedValue(
      pictureRecord({ imagePath: "/sanpo-gacha-logo.png" }),
    );
    prismaMock.picture.delete.mockResolvedValue(pictureRecord());

    const result = await deleteImage(USER_ID, IMAGE_ID);

    expect(result.success).toBe(true);
    expect(storageMock.remove).not.toHaveBeenCalled();
  });

  it("ファイル削除に失敗してもレコードが消えていれば成功として扱う", async () => {
    prismaMock.picture.findFirst.mockResolvedValue(pictureRecord());
    prismaMock.picture.delete.mockResolvedValue(pictureRecord());
    storageMock.remove.mockRejectedValue(new Error("io error"));

    const result = await deleteImage(USER_ID, IMAGE_ID);

    expect(result.success).toBe(true);
  });

  it("レコード削除に失敗した場合はunexpectedを返し、ファイルも消さない", async () => {
    prismaMock.picture.findFirst.mockResolvedValue(pictureRecord());
    prismaMock.picture.delete.mockRejectedValue(new Error("db down"));

    const result = await deleteImage(USER_ID, IMAGE_ID);

    expect(result.success).toBe(false);
    expect(result.error).toBe(IMAGE_ERROR.unexpected);
    expect(storageMock.remove).not.toHaveBeenCalled();
  });
});
