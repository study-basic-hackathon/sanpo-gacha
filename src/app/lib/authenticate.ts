import { signIn } from "next-auth/react";
import type { Result } from "@/frontend/utils/Result";
import { success, fail } from "@/frontend/utils/Result";

interface AuthenticateParams {
  email: string;
  password: string;
}

export async function authenticate({
  email,
  password,
}: AuthenticateParams): Promise<Result<string, unknown>> {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
    callbackUrl: "/",
  });

  if (!result) {
    return fail("認証処理に失敗しました。");
  }

  if (result.error) {
    return fail("ユーザー名またはパスワードが間違っています。");
  }

  return success("ログインに成功しました。");
}
