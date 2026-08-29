"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocation } from "@/frontend/contexts/LocationContext";

export default function LocationPermissionPage() {
  const router = useRouter();
  const { requestCurrentLocation } = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  async function handlePermission() {
    setIsRequesting(true);
    setError(null);

    try {
      await requestCurrentLocation();
      router.push("/home");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "現在地を取得できませんでした。",
      );
      setIsRequesting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9f6] text-[#24352b]">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-48 h-72 w-72 rounded-full bg-[#e7f1e7]"
      />

      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#f7e8df]"
      />

      <header className="relative z-10 mx-auto flex h-24 max-w-[1200px] items-center px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5"
        >
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

      <section className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-20 pt-6 text-center">
        <p className="text-sm font-semibold tracking-[0.22em] text-[#b56d53]">
          LOCATION PERMISSION
        </p>

        <div className="relative mt-8 flex h-44 w-44 items-center justify-center rounded-full border border-[#d98265] bg-[#ffe6d8] shadow-[0_18px_50px_rgba(217,130,101,0.18)]">
          <div
            aria-hidden="true"
            className="absolute inset-5 rounded-full border border-dashed border-[#d9987f]"
          />

          <span aria-hidden="true" className="relative text-6xl">
            📍
          </span>
        </div>

        <h1 className="mt-10 text-3xl font-bold tracking-tight text-[#24483a] sm:text-4xl">
          現在地の利用を許可してください
        </h1>

        <div className="mt-6 max-w-2xl space-y-2 text-base leading-8 text-[#66736b]">
          <p>
            近くの目的地を提案し、散歩中の方向と距離を表示するために使用します。
          </p>

          <p>位置情報は散歩機能以外の目的には利用しません。</p>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#d5ded7] bg-white/80 px-5 py-3 text-left text-sm text-[#596a5f] shadow-sm backdrop-blur-sm">
          <span aria-hidden="true" className="text-xl">
            🔒
          </span>

          <span>位置情報は安全に取り扱い、許可なく保存しません。</span>
        </div>

        <button
          type="button"
          onClick={handlePermission}
          disabled={isRequesting}
          className="mt-10 flex h-14 min-w-[280px] items-center justify-center rounded-full bg-[#24483a] px-10 font-semibold text-white shadow-[0_10px_30px_rgba(36,72,58,0.2)] transition hover:-translate-y-0.5 hover:bg-[#19382c] hover:shadow-[0_14px_35px_rgba(36,72,58,0.25)] focus:outline-none focus:ring-4 focus:ring-[#24483a]/20"
        >
          {isRequesting ? "現在地を取得中…" : "位置情報を許可する"}
        </button>

        {error && <p role="alert" className="mt-4 text-sm text-[#b45f52]">{error}</p>}

        <p className="mt-5 text-xs leading-5 text-[#8a958e]">
          ※ 位置情報はこのアプリの利用中のみ保持します。
        </p>
      </section>
    </main>
  );
}
