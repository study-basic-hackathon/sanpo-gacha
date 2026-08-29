import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
}));
vi.mock("next-auth/next", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/backend/lib/auth", () => ({ authOptions: {} }));

const { searchStrollMock } = vi.hoisted(() => ({ searchStrollMock: vi.fn() }));
vi.mock("@/backend/usecases/searchStroll", () => ({
  searchStroll: searchStrollMock,
  SEARCH_STROLL_ERROR: {
    invalidInput: "invalid_input",
    notFound: "not_found",
    unexpected: "unexpected_error_occurred",
  },
}));

import { POST } from "@/app/api/search-stroll/route";

const body = {
  latitude: 35.681236,
  longitude: 139.767125,
  categories: "公園",
  duration: 30,
};

function request(value: unknown) {
  return new Request("http://localhost/api/search-stroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof value === "string" ? value : JSON.stringify(value),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
  searchStrollMock.mockResolvedValue({ success: true, value: [] });
});

describe("POST /api/search-stroll", () => {
  it("認証済みユーザーの検索結果を返す", async () => {
    searchStrollMock.mockResolvedValue({
      success: true,
      value: { placeId: "place-1", name: "木場公園", meter: 2400, scheduledTime: 30 },
    });

    const response = await POST(request(body));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      placeId: "place-1",
      name: "木場公園",
      meter: 2400,
      scheduledTime: 30,
    });
    expect(searchStrollMock).toHaveBeenCalledWith("user-1", body);
  });

  it("未認証時は401を返し、ユースケースを実行しない", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const response = await POST(request(body));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "authentication_required" });
    expect(searchStrollMock).not.toHaveBeenCalled();
  });

  it("JSONが不正な場合は400を返す", async () => {
    const response = await POST(request("not-json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "invalid_input" });
  });

  it("ユースケースの入力エラーは400を返す", async () => {
    searchStrollMock.mockResolvedValue({ success: false, error: "invalid_input" });

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "invalid_input" });
  });

  it("候補がない場合は404を返す", async () => {
    searchStrollMock.mockResolvedValue({ success: false, error: "not_found" });

    const response = await POST(request(body));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: "not_found" });
  });
});
