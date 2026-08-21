"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/app/lib/authenticate";
import { signIn } from "next-auth/react";
import { registerUser } from "@/frontend/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  async function handleLogin(formData: FormData) {
    setLoginError("");

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    const result = await authenticate({ email, password });

    if (!result.success) {
      setLoginError("ログインに失敗しました。");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleRegister(formData: FormData) {
    setRegisterError("");

    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");

    const result = await registerUser(email, password);

    if (!result.success) {
      setRegisterError("新規登録に失敗しました。");
      return;
    }

    const authenticateResult = await authenticate({ email, password });

    if (!authenticateResult.success) {
      setRegisterError("登録後のログインに失敗しました。");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="outer-container flex justify-center">
      <div className="main-container gap-y-4">
        {/* ロゴタイトル */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-wide text-center">
            Lazy-bear
          </h1>
        </div>
        <form
          action={async (formData) => {
            const actionType = formData.get("action");

            if (actionType === "login") {
              await handleLogin(formData);
            } else if (actionType === "register") {
              await handleRegister(formData);
            }
          }}
        >
          <div className="flex flex-col gap-y-4">
            {/* email */}
            <div className="flex flex-col">
              <label className="text-sm font-bold">メールアドレス</label>
              <input name="email" type="email" className="border p-2 rounded" />
            </div>

            {/* password */}
            <div className="flex flex-col">
              <label className="text-sm font-bold">パスワード</label>
              <input
                name="password"
                type="password"
                className="border p-2 rounded"
              />
            </div>
          </div>

          {/* ボタン群 */}
          <div className="flex flex-col items-center gap-y-4 mt-8">
            {/* ログイン */}
            <button
              type="submit"
              name="action"
              value="login"
              className="font-semibold"
              style={{
                width: "226px",
                height: "60px",
                backgroundColor: "#3C436D",
                color: "#FFFFFF",
              }}
            >
              ログイン
            </button>

            {/* 新規登録 */}
            <button
              type="submit"
              name="action"
              value="register"
              className="font-semibold"
              style={{
                width: "226px",
                height: "60px",
                backgroundColor: "#3C436D",
                color: "#FFFFFF",
              }}
            >
              新規登録してログイン
            </button>
          </div>
        </form>

        {/* エラー表示 */}
        {(loginError || registerError) && (
          <p className="mt-4 text-red-500 text-sm text-center">
            {loginError || registerError}
          </p>
        )}
      </div>
    </div>
  );
}
