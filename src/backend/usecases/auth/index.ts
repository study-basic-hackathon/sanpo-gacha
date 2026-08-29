import bcrypt from "bcrypt";
import { prisma } from "@/backend/lib/db/prisma";
import type { Result } from "@/backend/utils/Result";
import { success, fail } from "@/backend/utils/Result";

export const DELETE_USER_ERROR = {
  notFound: "not_found",
  unexpected: "unexpected_error_occurred",
} as const;

export type DeleteUserError =
  (typeof DELETE_USER_ERROR)[keyof typeof DELETE_USER_ERROR];

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export async function register({
  email,
  username,
  password,
}: RegisterInput): Promise<Result<string, string>> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    const rawPassword = password.trim();

    if (!normalizedEmail) {
      return fail("メールアドレスは必須です。");
    }

    if (!normalizedUsername) {
      return fail("ユーザー名は必須です。");
    }

    if (!rawPassword) {
      return fail("パスワードは必須です。");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return fail("このメールアドレスは既に登録されています。");
    }

    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const result = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedUsername,
        passwordHash,
      },
    });

    return success(result.id);
  } catch (error) {
    if (error instanceof Error) {
      return fail(error.message);
    }

    return fail("予期しないエラーが発生しました。");
  }
}

/**
 * ユーザーと、そのユーザーの認証情報・散歩履歴をまとめて削除する。
 * StrollHistory は Picture / StrollHistoryCategory から参照されるため、
 * 外部キー制約を満たす順で同一トランザクション内で削除する。
 */
export async function deleteUser(
  userId: string,
): Promise<Result<void, DeleteUserError>> {
  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        return false;
      }

      const histories = await tx.strollHistory.findMany({
        where: { userId },
        select: { id: true },
      });
      const historyIds = histories.map(({ id }) => id);

      if (historyIds.length > 0) {
        await tx.picture.deleteMany({
          where: { strollHistoryId: { in: historyIds } },
        });
        await tx.strollHistoryCategory.deleteMany({
          where: { strollHistoryId: { in: historyIds } },
        });
        await tx.strollHistory.deleteMany({ where: { userId } });
      }

      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });

      return true;
    });

    return deleted ? success(undefined) : fail(DELETE_USER_ERROR.notFound);
  } catch {
    return fail(DELETE_USER_ERROR.unexpected);
  }
}
