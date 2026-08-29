"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

type ActiveNavigation =
  | "home"
  | "history"
  | "favorites"
  | "statistics"
  | "settings";

type AppHeaderProps = {
  active?: ActiveNavigation;
  userName?: string;
};

const navigationItems: Array<{
  key: ActiveNavigation;
  href: string;
  label: string;
  // お気に入りはAPIが未対応のため、準備中として無効にしている。
  disabled?: boolean;
}> = [
  { key: "home", href: "/home", label: "ホーム" },
  { key: "history", href: "/history", label: "散歩履歴" },
  {
    key: "favorites",
    href: "/favorites",
    label: "お気に入り",
    disabled: true,
  },
  { key: "statistics", href: "/statistics", label: "統計" },
  { key: "settings", href: "/settings", label: "アカウント設定" },
];

export default function AppHeader({
  active,
  userName,
}: AppHeaderProps) {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const displayedUserName = session?.user?.name?.trim() || userName?.trim() || "ユーザー";
  const avatarText = displayedUserName.charAt(0) || "ユ";

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <header className="border-b border-[#b7c2b9] bg-white">
      <div className="mx-auto flex min-h-20 max-w-[1440px] items-center justify-between gap-8 px-8 lg:px-16">
        <Link href="/home" className="flex shrink-0 items-center gap-2.5">
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

        <nav
          aria-label="メインナビゲーション"
          className="hidden items-center gap-8 text-sm font-semibold text-[#53675a] lg:flex"
        >
          {navigationItems.map((item) => {
            if (item.disabled) {
              return (
                <span
                  key={item.key}
                  title="準備中の機能です"
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-2 text-[#9aa79d]"
                >
                  {item.label}

                  <span className="rounded-full bg-[#f1f4f1] px-2 py-0.5 text-[10px] font-semibold">
                    準備中
                  </span>
                </span>
              );
            }

            const isActive = active === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "text-[#2f6544]"
                    : "transition hover:text-[#2f6544]"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 transition hover:bg-[#f0f5f0] [&::-webkit-details-marker]:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf4e9] font-bold text-[#2f6544]">
              {avatarText}
            </span>

            <span
              className="text-xs text-[#607066] transition group-open:rotate-180"
              aria-hidden="true"
            >
              ▼
            </span>

            <span className="sr-only">ユーザーメニューを開く</span>
          </summary>

          <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-[#d2dcd3] bg-white shadow-lg">
            <div className="border-b border-[#e3e9e3] px-5 py-4">
              <p className="text-sm font-bold text-[#294936]">{displayedUserName}</p>
              <p className="mt-1 text-xs text-[#7a877e]">ログイン中</p>
            </div>

            <div className="p-2">
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#42584a] transition hover:bg-[#f0f5f0]"
              >
                <span aria-hidden="true">⚙️</span>
                <span>アカウント設定</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#a65353] transition hover:bg-[#fff2f2]"
              >
                <span aria-hidden="true">↪</span>
                <span>{isSigningOut ? "ログアウト中..." : "ログアウト"}</span>
              </button>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
