import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock はファイル先頭に巻き上げられるため、モックは vi.hoisted で定義する。
const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("@/frontend/api/utils/apiClient", () => ({
  apiClient: { GET: getMock },
}));

import { fetchHistory, FETCH_HISTORY_ERROR } from "@/frontend/api/history";

const HISTORY_ID = "history-001";

const historyResponse = {
  historyId: HISTORY_ID,
  placeId: "ChIJ123456789",
  categories: "公園",
  timeTaken: 45,
  meter: 3200,
  steps: 4200,
  calories: 180.5,
  createdAt: "2026-08-19T10:30:00.000Z",
  imagePaths: ["/images/history-001/image-001.jpg"],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchHistory", () => {
  it("取得できた場合は散歩履歴を返す", async () => {
    getMock.mockResolvedValue({
      data: historyResponse,
      response: { status: 200 },
    });

    const result = await fetchHistory(HISTORY_ID);

    expect(result.success).toBe(true);
    expect(result.value).toEqual(historyResponse);
  });

  it("パスパラメータにhistoryIdを渡す", async () => {
    getMock.mockResolvedValue({
      data: historyResponse,
      response: { status: 200 },
    });

    await fetchHistory(HISTORY_ID);

    expect(getMock).toHaveBeenCalledWith("/api/history/{historyId}", {
      params: { path: { historyId: HISTORY_ID } },
    });
  });

  it.each([
    [401, FETCH_HISTORY_ERROR.unauthorized],
    [404, FETCH_HISTORY_ERROR.notFound],
    [500, FETCH_HISTORY_ERROR.unexpected],
  ])("ステータス%dの場合は%sを返す", async (status, expected) => {
    getMock.mockResolvedValue({
      data: undefined,
      error: { message: "error" },
      response: { status },
    });

    const result = await fetchHistory(HISTORY_ID);

    expect(result.success).toBe(false);
    expect(result.error).toBe(expected);
  });
});
