import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteMock } = vi.hoisted(() => ({ deleteMock: vi.fn() }));

vi.mock("@/frontend/api/utils/apiClient", () => ({
  apiClient: { DELETE: deleteMock },
}));

import {
  deleteUser,
  DELETE_USER_ERROR,
} from "@/frontend/api/auth";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("deleteUser", () => {
  it("ユーザー削除APIを呼び出し、204なら成功を返す", async () => {
    deleteMock.mockResolvedValue({ response: { status: 204 } });

    const result = await deleteUser();

    expect(deleteMock).toHaveBeenCalledWith("/api/auth/user");
    expect(result).toEqual({ success: true, value: undefined });
  });

  it.each([
    [401, DELETE_USER_ERROR.unauthorized],
    [404, DELETE_USER_ERROR.notFound],
    [500, DELETE_USER_ERROR.unexpected],
  ])("ステータス%dなら%sを返す", async (status, expected) => {
    deleteMock.mockResolvedValue({ response: { status } });

    const result = await deleteUser();

    expect(result).toEqual({ success: false, error: expected });
  });
});
