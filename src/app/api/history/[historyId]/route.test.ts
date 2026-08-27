import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock はファイル先頭に巻き上げられるため、モックは vi.hoisted で定義する。
const { getServerSessionMock, getHistoryMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  getHistoryMock: vi.fn(),
}));

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
    getHistory: getHistoryMock,
  };
});

import { GET } from "@/app/api/history/[historyId]/route";
import { fail, success } from "@/backend/utils/Result";

const USER_ID = "user-1";
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

function getRequest(historyId = HISTORY_ID) {
  return {
    req: new Request(`http://localhost:3000/api/history/${historyId}`),
    context: { params: Promise.resolve({ historyId }) },
  };
}

function signedIn() {
  getServerSessionMock.mockResolvedValue({
    user: { id: USER_ID, email: "user@example.com" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/history/{historyId}", () => {
  it("未認証の場合は401とauthentication_requiredを返す", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const { req, context } = getRequest();
    const res = await GET(req, context);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      message: "authentication_required",
    });
    expect(getHistoryMock).not.toHaveBeenCalled();
  });

  it("セッションにユーザーIDが無い場合も401を返す", async () => {
    getServerSessionMock.mockResolvedValue({ user: {} });

    const { req, context } = getRequest();
    const res = await GET(req, context);

    expect(res.status).toBe(401);
    expect(getHistoryMock).not.toHaveBeenCalled();
  });

  it("認証済みの場合は200で散歩履歴の詳細を返す", async () => {
    signedIn();
    getHistoryMock.mockResolvedValue(success(historyResponse));

    const { req, context } = getRequest();
    const res = await GET(req, context);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(historyResponse);
  });

  it("パスパラメータのhistoryIdとログインユーザーIDをユースケースへ渡す", async () => {
    signedIn();
    getHistoryMock.mockResolvedValue(success(historyResponse));

    const { req, context } = getRequest(HISTORY_ID);
    await GET(req, context);

    expect(getHistoryMock).toHaveBeenCalledWith(USER_ID, HISTORY_ID);
  });

  it("履歴が存在しない場合は404とnot_foundを返す", async () => {
    signedIn();
    getHistoryMock.mockResolvedValue(fail("not_found"));

    const { req, context } = getRequest("history-999");
    const res = await GET(req, context);

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ message: "not_found" });
  });

  it("ユースケースが予期しないエラーの場合は500を返す", async () => {
    signedIn();
    getHistoryMock.mockResolvedValue(fail("unexpected_error_occurred"));

    const { req, context } = getRequest();
    const res = await GET(req, context);

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      message: "unexpected_error_occurred",
    });
  });

  it("認証チェックはパスパラメータの解決より先に行う", async () => {
    getServerSessionMock.mockResolvedValue(null);

    // await されない場合に未処理の Promise 拒否とならないよう catch を付ける。
    const params = Promise.reject<{ historyId: string }>(
      new Error("params should not be awaited"),
    );
    params.catch(() => {});

    const res = await GET(new Request("http://localhost:3000/api/history/x"), {
      params,
    });

    expect(res.status).toBe(401);
  });
});
