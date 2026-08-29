"use client";

import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader";
import { FormEvent, useState } from "react";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("王さん");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [message, setMessage] = useState("");

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("変更内容を保存しました。");
  }

  function handlePermissionSetting(permissionName: string) {
    setMessage(
      `${permissionName}の設定を確認しました。現在はモック画面のため、端末の設定は変更されません。`,
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <AppHeader active="settings" />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <section>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#62816c]">
            ACCOUNT SETTINGS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#173f2d]">
            アカウント設定
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#617068]">
            ユーザー情報とアプリの権限を確認・変更できます。
          </p>
        </section>

        {message && (
          <div className="mt-7 flex items-center justify-between rounded-xl border border-[#cfe0d2] bg-[#edf6ee] px-5 py-4 text-sm text-[#315f42]">
            <p>{message}</p>

            <button
              type="button"
              onClick={() => setMessage("")}
              className="ml-5 text-lg text-[#607568] hover:text-[#234b34]"
              aria-label="メッセージを閉じる"
            >
              ×
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#d7e1d8] bg-white p-3 shadow-sm">
            <a
              href="#account"
              className="flex items-center gap-3 rounded-xl bg-[#eaf3eb] px-4 py-3 text-sm font-bold text-[#285c3d]"
            >
              <span>👤</span>
              <span>アカウント情報</span>
            </a>

            <a
              href="#notification"
              className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#53665a] transition hover:bg-[#f2f6f2]"
            >
              <span>🔔</span>
              <span>通知設定</span>
            </a>

            <a
              href="#system"
              className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#53665a] transition hover:bg-[#f2f6f2]"
            >
              <span>⚙️</span>
              <span>システム設定</span>
            </a>

            <div className="my-3 border-t border-[#e3e9e3]" />

            <Link
              href="/login"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#a35353] transition hover:bg-[#fff3f3]"
            >
              <span>↪</span>
              <span>ログアウト</span>
            </Link>
          </aside>

          <form onSubmit={handleSave} className="space-y-6">
            <section
              id="account"
              className="rounded-2xl border border-[#d7e1d8] bg-white p-7 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-bold text-[#214832]">
                  基本情報
                </h2>

                <p className="mt-1 text-sm text-[#718078]">
                  アプリ内で使用する表示名を設定します。
                </p>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="displayName"
                  className="text-sm font-bold text-[#31483a]"
                >
                  表示名
                </label>

                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#cbd7cc] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9aa69e] focus:border-[#4b8961] focus:ring-2 focus:ring-[#dcecdf]"
                />
              </div>
            </section>

            <section
              id="system"
              className="rounded-2xl border border-[#d7e1d8] bg-white p-7 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-bold text-[#214832]">
                  権限設定
                </h2>

                <p className="mt-1 text-sm text-[#718078]">
                  散歩に使用する端末の権限を確認できます。
                </p>
              </div>

              <div className="mt-6 divide-y divide-[#e5ebe5]">
                <SettingRow
                  icon="📍"
                  title="位置情報"
                  description="現在地と散歩ルートの表示に使用します。"
                  status="許可済み"
                  onClick={() => handlePermissionSetting("位置情報")}
                />

                <SettingRow
                  icon="📷"
                  title="カメラ"
                  description="散歩中の写真撮影に使用します。"
                  status="許可済み"
                  onClick={() => handlePermissionSetting("カメラ")}
                />
              </div>
            </section>

            <section
              id="notification"
              className="rounded-2xl border border-[#d7e1d8] bg-white p-7 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-bold text-[#214832]">
                  通知設定
                </h2>

                <p className="mt-1 text-sm text-[#718078]">
                  アプリからのお知らせを設定します。
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-5 rounded-xl bg-[#f7f9f6] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                    🔔
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#2e4636]">
                      通知
                    </p>

                    <p className="mt-1 text-xs text-[#718078]">
                      現在：
                      <span className="font-bold">
                        {notificationEnabled ? "ON" : "OFF"}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotificationEnabled(!notificationEnabled)
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    notificationEnabled
                      ? "bg-[#43865c]"
                      : "bg-[#bdc7c0]"
                  }`}
                  aria-label="通知設定を変更"
                  aria-pressed={notificationEnabled}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      notificationEnabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-[#3b8458] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#32744c]"
              >
                変更を保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function SettingRow({
  icon,
  title,
  description,
  status,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  status: string;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf4ed] text-xl">
          {icon}
        </div>

        <div>
          <p className="text-sm font-bold text-[#2e4636]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[#718078]">
            {description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="rounded-full bg-[#e7f3e9] px-3 py-1 text-xs font-bold text-[#34714c]">
          {status}
        </span>

        <button
          type="button"
          onClick={onClick}
          className="rounded-lg border border-[#7b9683] px-4 py-2 text-xs font-bold text-[#315f42] transition hover:bg-[#f0f5f0]"
        >
          設定
        </button>
      </div>
    </div>
  );
}
