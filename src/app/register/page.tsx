"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/frontend/api/auth";
import { authenticate } from "../lib/authenticate";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setIsLoading(true);

    if (!email.trim() || !password.trim() || !passwordConfirmation.trim()) {
      setRegisterError("すべての項目を入力してください。");
      setIsLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setRegisterError("確認用パスワードが一致しません。");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser(email, password);

      if (!result.success) {
        setRegisterError("新規登録に失敗しました。");
        return;
      }

      const authenticateResult = await authenticate({
        email,
        password,
      });

      if (!authenticateResult.success) {
        setRegisterError("登録後のログインに失敗しました。");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setRegisterError("新規登録に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <header className="flex h-20 items-center border-b border-[#b7c2b9] bg-white px-8 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/sanpo-gacha-logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />

          <span className="text-xl font-bold tracking-wide text-[#285c3d]">
            さんぽガチャ
          </span>
        </Link>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex items-center justify-center bg-[#eaf4e9] px-8 py-16">
          <div className="max-w-lg">
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-[#4f765d]">
              FIND A NEW PLACE
            </p>

            <h1 className="text-4xl font-bold leading-tight text-[#254d35] lg:text-5xl">
              散歩に、
              <br />
              新しい発見を。
            </h1>

            <p className="mt-8 max-w-md leading-8 text-[#53675a]">
              気分や時間に合わせて、あなたにぴったりの散歩先を見つけます。
              いつもの街で、新しい景色に出会いましょう。
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-3xl border border-[#c5cec7] bg-white p-8 shadow-sm sm:p-10">
            <h2 className="text-3xl font-bold text-[#24352b]">
              アカウントを作成
            </h2>

            <p className="mt-3 text-sm text-[#6a786f]">
              さんぽガチャを始めるための情報を入力してください。
            </p>

            <form onSubmit={handleRegister} className="mt-8">
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    メールアドレス
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@sanpo.jp"
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-xl border border-[#bcc8bf] px-4 outline-none transition focus:border-[#3c7d55] focus:ring-4 focus:ring-[#3c7d55]/10"
                    disabled={isLoading}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    パスワード
                  </span>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="8文字以上で入力"
                    autoComplete="new-password"
                    required
                    className="h-12 w-full rounded-xl border border-[#bcc8bf] px-4 outline-none transition focus:border-[#3c7d55] focus:ring-4 focus:ring-[#3c7d55]/10"
                    disabled={isLoading}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    パスワード（確認）
                  </span>

                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(event) =>
                      setPasswordConfirmation(event.target.value)
                    }
                    placeholder="もう一度入力"
                    autoComplete="new-password"
                    required
                    className="h-12 w-full rounded-xl border border-[#bcc8bf] px-4 outline-none transition focus:border-[#3c7d55] focus:ring-4 focus:ring-[#3c7d55]/10"
                    disabled={isLoading}
                  />
                </label>
              </div>

              {registerError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-[#e5bcbc] bg-[#fff4f4] px-4 py-3 text-sm text-[#a34e4e]"
                >
                  {registerError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-[#3c7d55] font-semibold text-white transition hover:bg-[#2f6544] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "アカウントを作成中..." : "アカウントを作成"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#66756b]">
              <span>すでにアカウントをお持ちの方 </span>

              <Link
                href="/login"
                className="font-semibold text-[#3c7d55] hover:underline"
              >
                ログイン
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
