import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, transactionMock } = vi.hoisted(() => {
  const transactionMock = {
    user: { findUnique: vi.fn(), delete: vi.fn() },
    strollHistory: { findMany: vi.fn(), deleteMany: vi.fn() },
    picture: { deleteMany: vi.fn() },
    strollHistoryCategory: { deleteMany: vi.fn() },
    account: { deleteMany: vi.fn() },
    session: { deleteMany: vi.fn() },
  };

  return {
    transactionMock,
    prismaMock: {
      $transaction: vi.fn(),
      user: { findUnique: vi.fn(), create: vi.fn() },
    },
  };
});

vi.mock("@/backend/lib/db/prisma", () => ({ prisma: prismaMock }));

import {
  deleteUser,
  DELETE_USER_ERROR,
} from "@/backend/usecases/auth";

const USER_ID = "user-1";

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (callback) =>
    callback(transactionMock),
  );
});

describe("deleteUser", () => {
  it("関連する認証情報と散歩履歴をトランザクションで削除する", async () => {
    transactionMock.user.findUnique.mockResolvedValue({ id: USER_ID });
    transactionMock.strollHistory.findMany.mockResolvedValue([
      { id: "history-1" },
      { id: "history-2" },
    ]);

    const result = await deleteUser(USER_ID);

    expect(result).toEqual({ success: true, value: undefined });
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(transactionMock.picture.deleteMany).toHaveBeenCalledWith({
      where: { strollHistoryId: { in: ["history-1", "history-2"] } },
    });
    expect(transactionMock.strollHistoryCategory.deleteMany).toHaveBeenCalledWith({
      where: { strollHistoryId: { in: ["history-1", "history-2"] } },
    });
    expect(transactionMock.strollHistory.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
    });
    expect(transactionMock.account.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
    });
    expect(transactionMock.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
    });
    expect(transactionMock.user.delete).toHaveBeenCalledWith({
      where: { id: USER_ID },
    });
  });

  it("ユーザーが存在しない場合はnot_foundを返し、関連データを削除しない", async () => {
    transactionMock.user.findUnique.mockResolvedValue(null);

    const result = await deleteUser(USER_ID);

    expect(result).toEqual({
      success: false,
      error: DELETE_USER_ERROR.notFound,
    });
    expect(transactionMock.strollHistory.findMany).not.toHaveBeenCalled();
    expect(transactionMock.user.delete).not.toHaveBeenCalled();
  });

  it("トランザクションに失敗した場合はunexpected_error_occurredを返す", async () => {
    prismaMock.$transaction.mockRejectedValue(new Error("database down"));

    const result = await deleteUser(USER_ID);

    expect(result).toEqual({
      success: false,
      error: DELETE_USER_ERROR.unexpected,
    });
  });
});
