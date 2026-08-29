"use client";

import AppHeader from "@/components/layout/AppHeader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteUser } from "@/frontend/api/auth";
import { useLocation } from "@/frontend/contexts/LocationContext";

export default function SettingsPage() {
  const router = useRouter();
  const notificationEnabled = false;
  const [message, setMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const { location, requestCurrentLocation } = useLocation();

  async function handleLocationSetting() {
    setIsRequestingLocation(true);
    setMessage("");

    try {
      await requestCurrentLocation();
      setMessage("位置情報の利用を許可しました。");
    } catch (reason) {
      setMessage(
        reason instanceof Error
          ? reason.message
          : "現在地を取得できませんでした。",
      );
    } finally {
      setIsRequestingLocation(false);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError("");

    try {
      const result = await deleteUser();

      if (!result.success) {
        throw new Error("アカウントの削除に失敗しました。もう一度お試しください。");
      }

      router.replace("/login");
      router.refresh();
    } catch (reason) {
      setDeleteError(
        reason instanceof Error
          ? reason.message
          : "アカウントの削除に失敗しました。",
      );
      setIsDeleting(false);
    }
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

        <div className="mt-8 space-y-6">
          <section
            id="system"
            className="rounded-2xl border border-[#d7e1d8] bg-white p-7 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-bold text-[#214832]">権限設定</h2>

              <p className="mt-1 text-sm text-[#718078]">
                散歩に使用する端末の権限を確認できます。
              </p>
            </div>

            <div className="mt-6 divide-y divide-[#e5ebe5]">
              <SettingRow
                icon="📍"
                title="位置情報"
                description="現在地と散歩ルートの表示に使用します。"
                status={location ? "許可済み" : undefined}
                onClick={handleLocationSetting}
                isLoading={isRequestingLocation}
              />

              {/* 写真機能はAPIが未対応のため、準備中として無効にしている。 */}
              <SettingRow
                icon="📷"
                title="カメラ"
                description="散歩中の写真撮影に使用します。"
                onClick={() => {}}
                disabled
                comingSoon
              />
            </div>
          </section>

          <section
            id="notification"
            className="rounded-2xl border border-[#d7e1d8] bg-white p-7 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-bold text-[#214832]">通知設定</h2>

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
                  <p className="text-sm font-bold text-[#2e4636]">通知</p>

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
                disabled
                className={`relative h-7 w-12 rounded-full transition ${
                  notificationEnabled ? "bg-[#43865c]" : "bg-[#bdc7c0]"
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
                type="button"
                onClick={() => {
                  setDeleteError("");
                  setIsDeleteDialogOpen(true);
                }}
              className="rounded-xl bg-[#b34f4f] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#32744c]"
            >
              アカウントを削除
            </button>
          </div>
        </div>
      </div>

      {isDeleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#173f2d]/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
            <h2
              id="delete-account-title"
              className="text-lg font-bold text-[#214832]"
            >
              アカウントを削除しますか？
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#718078]">
              アカウントを削除すると、元に戻すことはできません。
            </p>
            {deleteError && (
              <p className="mt-3 text-sm text-[#b34f4f]" role="alert">
                {deleteError}
              </p>
            )}
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="rounded-xl border border-[#7b9683] px-5 py-3 text-sm font-bold text-[#315f42] transition hover:bg-[#f0f5f0]"
              >
                やめる
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-xl bg-[#b34f4f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#983f3f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "削除中…" : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SettingRow({
  icon,
  title,
  description,
  status,
  onClick,
  disabled = false,
  isLoading = false,
  comingSoon = false,
}: {
  icon: string;
  title: string;
  description: string;
  status?: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf4ed] text-xl">
          {icon}
        </div>

        <div>
          <p className="text-sm font-bold text-[#2e4636]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[#718078]">{description}</p>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-4"
        title={comingSoon ? "準備中の機能です" : undefined}
      >
        {comingSoon && (
          <span className="rounded-full bg-[#f1f4f1] px-2 py-0.5 text-[10px] font-semibold text-[#9aa79d]">
            準備中
          </span>
        )}

        {status && (
          <span className="rounded-full bg-[#e7f3e9] px-3 py-1 text-xs font-bold text-[#34714c]">
            {status}
          </span>
        )}

        <button
          type="button"
          onClick={onClick}
          disabled={disabled || isLoading}
          className="rounded-lg border border-[#7b9683] px-4 py-2 text-xs font-bold text-[#315f42] transition hover:bg-[#f0f5f0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "取得中…" : "設定"}
        </button>
      </div>
    </div>
  );
}
