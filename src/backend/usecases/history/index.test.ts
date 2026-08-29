import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock はファイル先頭に巻き上げられるため、モックは vi.hoisted で定義する。
const prismaMock = vi.hoisted(() => ({
  strollHistory: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  category: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/backend/lib/db/prisma", () => ({ prisma: prismaMock }));

import {
  createHistory,
  getHistories,
  getHistory,
  HISTORY_ERROR,
  type CreateHistoryPayload,
} from "@/backend/usecases/history";

const USER_ID = "user-1";

function strollHistoryRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "history-001",
    userId: USER_ID,
    visitedPlaceId: "ChIJ123456789",
    placeName: "木場公園",
    visitedAt: new Date("2026-08-19T10:30:00.000Z"),
    strollTime: 45,
    meter: 3200,
    steps: 4200,
    calories: 180.5,
    categories: [{ category: { name: "公園" } }],
    pictures: [
      { imagePath: "/images/history-001/image-001.jpg" },
      { imagePath: "/images/history-001/image-002.jpg" },
    ],
    ...overrides,
  };
}

function validPayload(
  overrides: Partial<CreateHistoryPayload> = {},
): CreateHistoryPayload {
  return {
    placeId: "ChIJ123456789",
    placeName: "木場公園",
    categories: "公園",
    timeTaken: 45.5,
    meter: 3200,
    steps: 4200,
    calories: 180.5,
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

describe("getHistories", () => {
  it("ログインユーザーの散歩履歴をHistoryResponseに変換して返す", async () => {
    prismaMock.strollHistory.findMany.mockResolvedValue([
      strollHistoryRecord(),
    ]);

    const result = await getHistories(USER_ID);

    expect(result.success).toBe(true);
    expect(result.value).toEqual([
      {
        historyId: "history-001",
        placeId: "ChIJ123456789",
        placeName: "木場公園",
        categories: "公園",
        timeTaken: 45,
        meter: 3200,
        steps: 4200,
        calories: 180.5,
        createdAt: "2026-08-19T10:30:00.000Z",
        imagePaths: [
          "/images/history-001/image-001.jpg",
          "/images/history-001/image-002.jpg",
        ],
      },
    ]);
  });

  it("自分の履歴のみを新しい順で取得する", async () => {
    prismaMock.strollHistory.findMany.mockResolvedValue([]);

    await getHistories(USER_ID);

    expect(prismaMock.strollHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: USER_ID },
        orderBy: { visitedAt: "desc" },
      }),
    );
  });

  it("履歴が0件でも空配列を返す", async () => {
    prismaMock.strollHistory.findMany.mockResolvedValue([]);

    const result = await getHistories(USER_ID);

    expect(result.success).toBe(true);
    expect(result.value).toEqual([]);
  });

  it("Decimal型のcaloriesを数値に変換する", async () => {
    prismaMock.strollHistory.findMany.mockResolvedValue([
      strollHistoryRecord({ calories: { toString: () => "180.50" } }),
    ]);

    const result = await getHistories(USER_ID);

    expect(result.value?.[0].calories).toBe(180.5);
  });

  it("カテゴリが複数ある場合はカンマ区切りで返す", async () => {
    prismaMock.strollHistory.findMany.mockResolvedValue([
      strollHistoryRecord({
        categories: [
          { category: { name: "公園" } },
          { category: { name: "神社" } },
        ],
      }),
    ]);

    const result = await getHistories(USER_ID);

    expect(result.value?.[0].categories).toBe("公園,神社");
  });

  it("画像が紐づいていない場合はimagePathsが空配列になる", async () => {
    prismaMock.strollHistory.findMany.mockResolvedValue([
      strollHistoryRecord({ pictures: [] }),
    ]);

    const result = await getHistories(USER_ID);

    expect(result.value?.[0].imagePaths).toEqual([]);
  });

  it("旧データでplaceNameが未保存の場合は空文字を返す", async () => {
    prismaMock.strollHistory.findMany.mockResolvedValue([
      strollHistoryRecord({ placeName: null }),
    ]);

    const result = await getHistories(USER_ID);

    expect(result.value?.[0].placeName).toBe("");
  });

  it("DBエラー時はunexpectedを返す", async () => {
    prismaMock.strollHistory.findMany.mockRejectedValue(new Error("db down"));

    const result = await getHistories(USER_ID);

    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.unexpected);
  });
});

describe("createHistory", () => {
  beforeEach(() => {
    prismaMock.category.findFirst.mockResolvedValue({
      id: "cat-1",
      name: "公園",
    });
    prismaMock.strollHistory.create.mockResolvedValue(strollHistoryRecord());
  });

  it("散歩履歴を登録してHistoryResponseを返す", async () => {
    const result = await createHistory(USER_ID, validPayload());

    expect(result.success).toBe(true);
    expect(result.value).toEqual({
      historyId: "history-001",
      placeId: "ChIJ123456789",
      placeName: "木場公園",
      categories: "公園",
      timeTaken: 45,
      meter: 3200,
      steps: 4200,
      calories: 180.5,
      createdAt: "2026-08-19T10:30:00.000Z",
      imagePaths: [
        "/images/history-001/image-001.jpg",
        "/images/history-001/image-002.jpg",
      ],
    });
  });

  it("ログインユーザーのIDを紐づけて登録する", async () => {
    await createHistory(USER_ID, validPayload());

    expect(prismaMock.strollHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: USER_ID,
          visitedPlaceId: "ChIJ123456789",
          meter: 3200,
          steps: 4200,
          calories: 180.5,
          categories: { create: [{ categoryId: "cat-1" }] },
        }),
      }),
    );
  });

  it("Int列に入れるためtimeTakenを丸めて登録する", async () => {
    await createHistory(USER_ID, validPayload({ timeTaken: 45.5 }));

    const { data } = prismaMock.strollHistory.create.mock.calls[0][0];
    expect(data.strollTime).toBe(46);
  });

  it("createdAt省略時は現在時刻をvisitedAtとして登録する", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-22T09:00:00.000Z"));

    await createHistory(USER_ID, validPayload());

    const { data } = prismaMock.strollHistory.create.mock.calls[0][0];
    expect(data.visitedAt).toEqual(new Date("2026-08-22T09:00:00.000Z"));

    vi.useRealTimers();
  });

  it("createdAt指定時はその値をvisitedAtとして登録する", async () => {
    await createHistory(
      USER_ID,
      validPayload({ createdAt: "2026-08-19T10:30:00Z" }),
    );

    const { data } = prismaMock.strollHistory.create.mock.calls[0][0];
    expect(data.visitedAt).toEqual(new Date("2026-08-19T10:30:00.000Z"));
  });

  it("既存カテゴリがあれば再利用し新規作成しない", async () => {
    await createHistory(USER_ID, validPayload());

    expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
      where: { name: "公園" },
    });
    expect(prismaMock.category.create).not.toHaveBeenCalled();
  });

  it("カテゴリが未登録の場合は新規作成する", async () => {
    prismaMock.category.findFirst.mockResolvedValue(null);
    prismaMock.category.create.mockResolvedValue({
      id: "cat-new",
      name: "神社",
    });

    await createHistory(USER_ID, validPayload({ categories: "神社" }));

    expect(prismaMock.category.create).toHaveBeenCalledWith({
      data: { name: "神社" },
    });
  });

  it.each([
    ["placeId", { placeId: "" }],
    ["placeId(空白のみ)", { placeId: "   " }],
    ["categories", { categories: "" }],
    ["timeTaken", { timeTaken: undefined }],
    ["meter", { meter: undefined }],
    ["steps", { steps: undefined }],
    ["calories", { calories: undefined }],
  ])("必須項目 %s が不正な場合はinvalid_inputを返す", async (_label, patch) => {
    const result = await createHistory(USER_ID, {
      ...validPayload(),
      ...patch,
    } as CreateHistoryPayload);

    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.invalidInput);
    expect(prismaMock.strollHistory.create).not.toHaveBeenCalled();
  });

  it.each([
    ["負数", -1],
    ["NaN", Number.NaN],
    ["数値以外", "3200"],
  ])("meterが%sの場合はinvalid_inputを返す", async (_label, meter) => {
    const result = await createHistory(USER_ID, {
      ...validPayload(),
      meter,
    } as CreateHistoryPayload);

    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.invalidInput);
  });

  it("createdAtが日付として解釈できない場合はinvalid_inputを返す", async () => {
    const result = await createHistory(
      USER_ID,
      validPayload({ createdAt: "not-a-date" }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.invalidInput);
    expect(prismaMock.strollHistory.create).not.toHaveBeenCalled();
  });

  it("DBエラー時はunexpectedを返す", async () => {
    prismaMock.strollHistory.create.mockRejectedValue(new Error("db down"));

    const result = await createHistory(USER_ID, validPayload());

    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.unexpected);
  });
});

describe("getHistory", () => {
  it("指定したIDの散歩履歴をHistoryResponseに変換して返す", async () => {
    prismaMock.strollHistory.findFirst.mockResolvedValue(strollHistoryRecord());

    const result = await getHistory(USER_ID, "history-001");

    expect(result.success).toBe(true);
    expect(result.value).toEqual({
      historyId: "history-001",
      placeId: "ChIJ123456789",
      placeName: "木場公園",
      categories: "公園",
      timeTaken: 45,
      meter: 3200,
      steps: 4200,
      calories: 180.5,
      createdAt: "2026-08-19T10:30:00.000Z",
      imagePaths: [
        "/images/history-001/image-001.jpg",
        "/images/history-001/image-002.jpg",
      ],
    });
  });

  it("IDとログインユーザーの両方を条件に検索する", async () => {
    prismaMock.strollHistory.findFirst.mockResolvedValue(strollHistoryRecord());

    await getHistory(USER_ID, "history-001");

    expect(prismaMock.strollHistory.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "history-001", userId: USER_ID },
      }),
    );
  });

  it("該当する履歴が無い場合はnotFoundを返す", async () => {
    prismaMock.strollHistory.findFirst.mockResolvedValue(null);

    const result = await getHistory(USER_ID, "history-999");

    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.notFound);
  });

  it("他人の履歴は取得できずnotFoundを返す", async () => {
    // where に userId を含めるため、他人の履歴は検索結果が null になる。
    prismaMock.strollHistory.findFirst.mockResolvedValue(null);

    const result = await getHistory("other-user", "history-001");

    expect(prismaMock.strollHistory.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "history-001", userId: "other-user" },
      }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.notFound);
  });

  it.each([
    ["空文字", ""],
    ["空白のみ", "   "],
  ])("historyIdが%sの場合はDBを引かずnotFoundを返す", async (_label, id) => {
    const result = await getHistory(USER_ID, id);

    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.notFound);
    expect(prismaMock.strollHistory.findFirst).not.toHaveBeenCalled();
  });

  it("Decimal型のcaloriesを数値に変換する", async () => {
    prismaMock.strollHistory.findFirst.mockResolvedValue(
      strollHistoryRecord({ calories: { toString: () => "180.50" } }),
    );

    const result = await getHistory(USER_ID, "history-001");

    expect(result.value?.calories).toBe(180.5);
  });

  it("カテゴリが複数ある場合はカンマ区切りで返す", async () => {
    prismaMock.strollHistory.findFirst.mockResolvedValue(
      strollHistoryRecord({
        categories: [
          { category: { name: "公園" } },
          { category: { name: "神社" } },
        ],
      }),
    );

    const result = await getHistory(USER_ID, "history-001");

    expect(result.value?.categories).toBe("公園,神社");
  });

  it("画像が紐づいていない場合はimagePathsが空配列になる", async () => {
    prismaMock.strollHistory.findFirst.mockResolvedValue(
      strollHistoryRecord({ pictures: [] }),
    );

    const result = await getHistory(USER_ID, "history-001");

    expect(result.value?.imagePaths).toEqual([]);
  });

  it("DBエラー時はunexpectedを返す", async () => {
    prismaMock.strollHistory.findFirst.mockRejectedValue(new Error("db down"));

    const result = await getHistory(USER_ID, "history-001");

    expect(result.success).toBe(false);
    expect(result.error).toBe(HISTORY_ERROR.unexpected);
  });
});
