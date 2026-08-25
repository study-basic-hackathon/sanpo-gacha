import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock はファイル先頭に巻き上げられるため、モックは vi.hoisted で定義する。
const { getServerSessionMock, getHistoriesMock, createHistoryMock } = vi.hoisted(
  () => ({
    getServerSessionMock: vi.fn(),
    getHistoriesMock: vi.fn(),
    createHistoryMock: vi.fn(),
  }),
);

vi.mock("next-auth/next", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/backend/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/backend/usecases/history", async () => {
  const actual = await vi.importActual<
    typeof import("@/backend/usecases/history")
  >("@/backend/usecases/history");

  return {
    HISTORY_ERROR: actual.HISTORY_ERROR,
    getHistories: getHistoriesMock,
    createHistory: createHistoryMock,
  };
});

import { GET, POST } from "@/app/api/history/route";
import { fail, success } from "@/backend/utils/Result";

const USER_ID = "user-1";

const historyResponse = {
  historyId: "history-001",
  placeId: "ChIJ123456789",
  categories: "公園",
  timeTaken: 45,
  meter: 3200,
  steps: 4200,
  calories: 180.5,
  createdAt: "2026-08-19T10:30:00.000Z",
  imagePaths: ["/images/history-001/image-001.jpg"],
};

const validBody = {
  placeId: "ChIJ123456789",
  categories: "公園",
  timeTaken: 45.5,
  meter: 3200,
  steps: 4200,
  calories: 180.5,
};

function postRequest(body: unknown) {
  return new Request("http://localhost:3000/api/history", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function signedIn() {
  getServerSessionMock.mockResolvedValue({
    user: { id: USER_ID, email: "user@example.com" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/history", () => {
  it("未認証の場合は401とauthentication_requiredを返す", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      message: "authentication_required",
    });
    expect(getHistoriesMock).not.toHaveBeenCalled();
  });

  it("セッションにユーザーIDが無い場合も401を返す", async () => {
    getServerSessionMock.mockResolvedValue({ user: {} });

    const res = await GET();

    expect(res.status).toBe(401);
    expect(getHistoriesMock).not.toHaveBeenCalled();
  });

  it("認証済みの場合は200で履歴一覧を返す", async () => {
    signedIn();
    getHistoriesMock.mockResolvedValue(success([historyResponse]));

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([historyResponse]);
    expect(getHistoriesMock).toHaveBeenCalledWith(USER_ID);
  });

  it("履歴が0件でも200と空配列を返す", async () => {
    signedIn();
    getHistoriesMock.mockResolvedValue(success([]));

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([]);
  });

  it("ユースケースが失敗した場合は500を返す", async () => {
    signedIn();
    getHistoriesMock.mockResolvedValue(fail("unexpected_error_occurred"));

    const res = await GET();

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      message: "unexpected_error_occurred",
    });
  });
});

describe("POST /api/history", () => {
  it("未認証の場合は401とauthentication_requiredを返す", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const res = await POST(postRequest(validBody));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      message: "authentication_required",
    });
    expect(createHistoryMock).not.toHaveBeenCalled();
  });

  it("認証済みの場合は201で登録した履歴を返す", async () => {
    signedIn();
    createHistoryMock.mockResolvedValue(success(historyResponse));

    const res = await POST(postRequest(validBody));

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual(historyResponse);
    expect(createHistoryMock).toHaveBeenCalledWith(USER_ID, validBody);
  });

  it("入力が不正な場合は400とinvalid_inputを返す", async () => {
    signedIn();
    createHistoryMock.mockResolvedValue(fail("invalid_input"));

    const res = await POST(postRequest({ ...validBody, placeId: "" }));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "invalid_input" });
  });

  it("JSONとして解釈できないボディの場合は400を返す", async () => {
    signedIn();

    const res = await POST(postRequest("not-json"));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "invalid_input" });
    expect(createHistoryMock).not.toHaveBeenCalled();
  });

  it("ユースケースが予期しないエラーの場合は500を返す", async () => {
    signedIn();
    createHistoryMock.mockResolvedValue(fail("unexpected_error_occurred"));

    const res = await POST(postRequest(validBody));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      message: "unexpected_error_occurred",
    });
  });

  it("認証チェックはボディの解析より先に行う", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const res = await POST(postRequest("not-json"));

    expect(res.status).toBe(401);
  });
});
