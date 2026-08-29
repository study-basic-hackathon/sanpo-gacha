import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  strollHistory: { findMany: vi.fn() },
}));
vi.mock("@/backend/lib/db/prisma", () => ({ prisma: prismaMock }));

const { searchPlacesMock } = vi.hoisted(() => ({ searchPlacesMock: vi.fn() }));
vi.mock("@/backend/lib/places/searchPlaces", () => ({
  searchPlaces: searchPlacesMock,
}));

import {
  SEARCH_STROLL_ERROR,
  searchStroll,
  type SearchStrollPayload,
} from "@/backend/usecases/searchStroll";

const USER_ID = "user-1";
const payload: SearchStrollPayload = {
  latitude: 35.681236,
  longitude: 139.767125,
  categories: "公園",
  duration: 30,
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.strollHistory.findMany.mockResolvedValue([]);
  searchPlacesMock.mockResolvedValue([]);
});

describe("searchStroll", () => {
  it("直近1か月の訪問先を除外し、時間差が±5分の候補を返す", async () => {
    prismaMock.strollHistory.findMany.mockResolvedValue([
      { visitedPlaceId: "visited-place" },
    ]);
    searchPlacesMock.mockResolvedValue([
      // 緯度差は約2.4kmで、徒歩30分相当。
      { placeId: "matched-place", name: "木場公園", latitude: 35.70282, longitude: 139.767125 },
      { placeId: "visited-place", name: "訪問済み公園", latitude: 35.70282, longitude: 139.767125 },
      { placeId: "too-close", name: "近所の公園", latitude: 35.682, longitude: 139.767125 },
    ]);

    const result = await searchStroll(USER_ID, payload);

    expect(result).toEqual({
      success: true,
      value: {
        placeId: "matched-place",
        name: "木場公園",
        meter: expect.any(Number),
        scheduledTime: 30,
        latitude: 35.70282,
        longitude: 139.767125,
      },
    });
    expect(result.success && result.value.meter).toBeGreaterThan(2_300);
    expect(result.success && result.value.meter).toBeLessThan(2_500);
  });

  it("直近1か月の履歴だけをplaceIdに絞って取得する", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-29T00:00:00.000Z"));

    await searchStroll(USER_ID, payload);

    expect(prismaMock.strollHistory.findMany).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        visitedAt: { gte: new Date("2026-07-29T00:00:00.000Z") },
      },
      select: { visitedPlaceId: true },
    });
    vi.useRealTimers();
  });

  it("カテゴリ・現在地・時間からGoogle Places検索条件を組み立てる", async () => {
    await searchStroll(USER_ID, payload);

    expect(searchPlacesMock).toHaveBeenCalledWith(
      "公園",
      35.681236,
      139.767125,
      2_800,
    );
  });

  it("複数カテゴリの候補から、希望時間に最も近い1件だけを返す", async () => {
    searchPlacesMock
      .mockResolvedValueOnce([
        { placeId: "first", name: "神社", latitude: 35.69922, longitude: 139.767125 },
      ])
      .mockResolvedValueOnce([
        { placeId: "best", name: "公園", latitude: 35.70282, longitude: 139.767125 },
      ]);

    const result = await searchStroll(USER_ID, {
      ...payload,
      categories: "神社・寺,公園",
    });

    expect(result).toEqual({
      success: true,
      value: {
        placeId: "best",
        name: "公園",
        meter: expect.any(Number),
        scheduledTime: 30,
        latitude: 35.70282,
        longitude: 139.767125,
      },
    });
    expect(searchPlacesMock).toHaveBeenNthCalledWith(
      1,
      "神社・寺",
      35.681236,
      139.767125,
      2_800,
    );
    expect(searchPlacesMock).toHaveBeenNthCalledWith(
      2,
      "公園",
      35.681236,
      139.767125,
      2_800,
    );
  });

  it("条件に合う候補がない場合はnot_foundを返す", async () => {
    const result = await searchStroll(USER_ID, payload);

    expect(result).toEqual({
      success: false,
      error: SEARCH_STROLL_ERROR.notFound,
    });
  });

  it.each([
    [{ ...payload, latitude: 91 }],
    [{ ...payload, longitude: Number.NaN }],
    [{ ...payload, categories: "  " }],
    [{ ...payload, duration: 0 }],
  ])("不正な入力はinvalid_inputを返す: %o", async (invalidPayload) => {
    const result = await searchStroll(USER_ID, invalidPayload);

    expect(result).toEqual({
      success: false,
      error: SEARCH_STROLL_ERROR.invalidInput,
    });
    expect(prismaMock.strollHistory.findMany).not.toHaveBeenCalled();
  });

  it("DBまたはGoogle Places APIの失敗はunexpectedを返す", async () => {
    searchPlacesMock.mockRejectedValue(new Error("places down"));

    const result = await searchStroll(USER_ID, payload);

    expect(result).toEqual({
      success: false,
      error: SEARCH_STROLL_ERROR.unexpected,
    });
  });
});
