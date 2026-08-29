import bcrypt from "bcrypt";
import { prisma } from "@/backend/lib/db/prisma";
import type { Result } from "@/backend/utils/Result";
import { success, fail } from "@/backend/utils/Result";

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
