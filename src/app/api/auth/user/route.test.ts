import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, deleteUserMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  deleteUserMock: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/backend/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/backend/usecases/auth", () => ({
  DELETE_USER_ERROR: {
    notFound: "not_found",
    unexpected: "unexpected_error_occurred",
  },
  deleteUser: deleteUserMock,
}));

import { DELETE } from "@/app/api/auth/user/route";
import { fail, success } from "@/backend/utils/Result";

const USER_ID = "user-1";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/auth/user", () => {
  it("未認証なら401を返す", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const response = await DELETE();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "authentication_required",
    });
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("セッションにユーザーIDが無い場合も401を返す", async () => {
    getServerSessionMock.mockResolvedValue({ user: {} });

    const response = await DELETE();

    expect(response.status).toBe(401);
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("認証済みユーザーを削除すると204を返す", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: USER_ID } });
    deleteUserMock.mockResolvedValue(success(undefined));

    const response = await DELETE();

    expect(response.status).toBe(204);
    expect(deleteUserMock).toHaveBeenCalledWith(USER_ID);
  });

  it("ユーザーが存在しない場合は404を返す", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: USER_ID } });
    deleteUserMock.mockResolvedValue(fail("not_found"));

    const response = await DELETE();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: "not_found" });
  });

  it("削除処理に失敗した場合は500を返す", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: USER_ID } });
    deleteUserMock.mockResolvedValue(fail("unexpected_error_occurred"));

    const response = await DELETE();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "unexpected_error_occurred",
    });
  });
});
