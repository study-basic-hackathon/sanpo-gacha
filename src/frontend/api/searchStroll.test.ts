import { beforeEach, describe, expect, it, vi } from "vitest";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));
vi.mock("@/frontend/api/utils/apiClient", () => ({
  apiClient: { POST: postMock },
}));

import {
  searchStroll,
  SEARCH_STROLL_ERROR,
  type SearchStrollPayload,
} from "@/frontend/api/searchStroll";

const payload: SearchStrollPayload = {
  latitude: 35.681236,
  longitude: 139.767125,
  categories: "公園",
  duration: 30,
};

const response = {
  placeId: "ChIJ123456789",
  name: "木場公園",
  meter: 2400,
  scheduledTime: 30,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("searchStroll", () => {
  it("散歩条件をAPIへ送信し、目的地候補を返す", async () => {
    postMock.mockResolvedValue({ data: response, response: { status: 200 } });

    const result = await searchStroll(payload);

    expect(postMock).toHaveBeenCalledWith("/api/search-stroll", { body: payload });
    expect(result).toEqual({ success: true, value: response });
  });

  it.each([
    [400, SEARCH_STROLL_ERROR.invalidInput],
    [401, SEARCH_STROLL_ERROR.unauthorized],
    [404, SEARCH_STROLL_ERROR.notFound],
    [500, SEARCH_STROLL_ERROR.unexpected],
  ])("ステータス%dの場合は%sを返す", async (status, expected) => {
    postMock.mockResolvedValue({
      data: undefined,
      error: { message: "error" },
      response: { status },
    });

    const result = await searchStroll(payload);

    expect(result).toEqual({ success: false, error: expected });
  });
});
