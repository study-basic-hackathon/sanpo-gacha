"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  loadSearchStrollResults,
  type SearchStrollCandidate,
} from "@/frontend/utils/searchStrollResults";
import { startNewStroll } from "@/frontend/utils/strollProgress";

export default function NewStrollPage() {
  const router = useRouter();
  const destination = useSyncExternalStore<SearchStrollCandidate | null>(
    () => () => {},
    () => loadSearchStrollResults()[0] ?? null,
    () => null,
  );

  const [checkedSafety, setCheckedSafety] = useState(true);
  const [checkedScreen, setCheckedScreen] = useState(true);

  const canStart = !!destination && checkedSafety && checkedScreen;

  function handleStart() {
    if (canStart) {
      startNewStroll();
      router.push("/stroll");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <header className="border-b border-[#c8d1ca] bg-white">
        <div className="mx-auto flex h-20 max-w-[1100px] items-center px-6">
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
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#24483a]">
            出発前の確認
          </h1>

          <p className="mt-3 text-sm text-[#66736b]">
            散歩先と安全事項を確認してから出発しましょう。
          </p>
        </div>

        <div className="mt-9 rounded-3xl border border-[#d8cbaa] bg-white p-7 shadow-sm sm:p-9">
          <p className="text-sm font-semibold text-[#77847b]">目的地</p>

          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7e9df] text-2xl">
              ⛩️
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#24483a]">
                {destination?.name ?? "目的地が選択されていません"}
              </h2>

              <p className="mt-1 text-sm text-[#718078]">
                {destination?.category ?? "検索画面から候補を選択してください"}
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 divide-x divide-[#dfe5e0] rounded-2xl bg-[#f4f7f4] py-5">
            <div className="text-center">
              <p className="text-xs text-[#78847c]">予定時間</p>
              <p className="mt-2 text-lg font-bold text-[#2f6544]">
                {destination ? `約${destination.scheduledTime}分` : "-"}
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-[#78847c]">距離</p>
              <p className="mt-2 text-lg font-bold text-[#2f6544]">
                {destination ? `${(destination.meter / 1000).toFixed(1)} km` : "-"}
              </p>
            </div>
          </div>

          <div className="my-8 h-px bg-[#e1e6e2]" />

          <div>
            <h3 className="text-lg font-bold">安全確認</h3>

            <p className="mt-1 text-sm text-[#728078]">
              出発前に2つの項目を確認してください。
            </p>

            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[#d7dfd9] p-4 transition hover:bg-[#f6faf6]">
                <input
                  type="checkbox"
                  checked={checkedSafety}
                  onChange={(event) =>
                    setCheckedSafety(event.target.checked)
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-[#3c7d55]"
                />

                <span>
                  <span className="block font-semibold">
                    周囲の安全を確認しました
                  </span>

                  <span className="mt-1 block text-sm text-[#748078]">
                    車や自転車、歩行者に注意して出発します。
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[#d7dfd9] p-4 transition hover:bg-[#f6faf6]">
                <input
                  type="checkbox"
                  checked={checkedScreen}
                  onChange={(event) =>
                    setCheckedScreen(event.target.checked)
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-[#3c7d55]"
                />

                <span>
                  <span className="block font-semibold">
                    歩きながら画面を見続けません
                  </span>

                  <span className="mt-1 block text-sm text-[#748078]">
                    地図を見るときは、安全な場所で立ち止まります。
                  </span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            disabled={!canStart}
            onClick={handleStart}
            className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-[#24483a] font-semibold text-white transition hover:bg-[#19382c] disabled:cursor-not-allowed disabled:bg-[#aeb9b2]"
          >
            散歩を始める
          </button>

          <Link
            href="/search-stroll"
            className="mt-4 flex h-11 w-full items-center justify-center text-sm font-semibold text-[#52675a] hover:underline"
          >
            条件を変更する
          </Link>

          {!canStart && (
            <p className="mt-3 text-center text-xs text-[#b45f52]">
              {destination
                ? "安全確認の2項目にチェックしてください。"
                : "検索画面から目的地を選択してください。"}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
