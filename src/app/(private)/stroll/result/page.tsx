"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createHistory } from "@/frontend/api/history";
import { loadSearchStrollResults, type SearchStrollCandidate } from "@/frontend/utils/searchStrollResults";
import { getFinalStrollSummary, type StrollSummary } from "@/frontend/utils/strollProgress";

const AVERAGE_STEPS_PER_MINUTE = 100;
const AVERAGE_CALORIES_PER_MINUTE = 3.5;

export default function StrollResultPage() {
  const router = useRouter();
  const destination = useSyncExternalStore<SearchStrollCandidate | null>(
    () => () => {},
    () => loadSearchStrollResults()[0] ?? null,
    () => null,
  );
  const [summary, setSummary] = useState<StrollSummary>({ elapsedSeconds: 0, meter: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const results = useMemo(() => {
    const elapsedMinutes = summary.elapsedSeconds / 60;
    const steps = Math.round(elapsedMinutes * AVERAGE_STEPS_PER_MINUTE);
    const calories = Math.round(elapsedMinutes * AVERAGE_CALORIES_PER_MINUTE);

    return [
      { value: `${Math.floor(elapsedMinutes)}分`, label: "歩いた時間" },
      { value: `${summary.meter.toLocaleString("ja-JP")} m`, label: "距離" },
      { value: `${steps.toLocaleString("ja-JP")}歩`, label: "歩数（目安）" },
      { value: `${calories} kcal`, label: "消費（目安）" },
    ];
  }, [summary]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSummary(getFinalStrollSummary()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSave() {
    if (!destination) return;
    setIsSaving(true);
    setSaveError(null);
    const elapsedMinutes = summary.elapsedSeconds / 60;
    const result = await createHistory({
      placeId: destination.placeId,
      placeName: destination.name,
      categories: destination.category,
      timeTaken: elapsedMinutes,
      meter: summary.meter,
      steps: Math.round(elapsedMinutes * AVERAGE_STEPS_PER_MINUTE),
      calories: Math.round(elapsedMinutes * AVERAGE_CALORIES_PER_MINUTE),
    });
    if (!result.success) {
      setSaveError("散歩記録の保存に失敗しました。");
      setIsSaving(false);
      return;
    }
    router.push(`/history/${result.value.historyId}`);
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

      <section className="mx-auto max-w-[1100px] px-6 py-10 sm:py-14">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dcebdc] text-3xl text-[#285c3d]">
            ✓
          </div>

          <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-[#719078]">
            STROLL COMPLETE
          </p>

          <h1 className="mt-3 text-3xl font-bold text-[#24483a] sm:text-4xl">
            到着しました！
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#66736b]">
            今日もおつかれさまでした。
            <br className="sm:hidden" />
            散歩の記録を確認しましょう。
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-3xl overflow-hidden rounded-3xl border border-[#cbd5cd] bg-white shadow-sm">
          <div className="bg-[#eaf4e9] px-6 py-8 sm:px-10">
            <p className="text-center text-xs font-semibold tracking-[0.12em] text-[#719078]">
              今回の目的地
            </p>

            <div className="mt-5 flex items-center justify-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                ⛩️
              </div>

              <div>
                <p className="text-sm text-[#66736b]">
                  {destination?.category ?? "カテゴリ未設定"}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#24483a]">
                  {destination?.name ?? "目的地未設定"}
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-[#dce3de] sm:grid-cols-4">
            {results.map((result, index) => (
              <div
                key={result.label}
                className={[
                  "px-4 py-6 text-center",
                  index % 2 !== 0
                    ? "border-l border-[#dce3de]"
                    : "",
                  index >= 2
                    ? "border-t border-[#dce3de] sm:border-t-0"
                    : "",
                  index > 0
                    ? "sm:border-l sm:border-[#dce3de]"
                    : "",
                ].join(" ")}
              >
                <p className="text-xl font-bold text-[#2f6544]">
                  {result.value}
                </p>

                <p className="mt-2 text-xs text-[#77837b]">
                  {result.label}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#dce3de] px-6 py-7 sm:px-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!destination || isSaving}
                className="flex h-12 items-center justify-center rounded-full bg-[#24483a] px-6 font-semibold text-white transition hover:bg-[#19382c]"
              >
                {isSaving ? "保存中…" : "散歩を記録する"}
              </button>

              <Link
                href="/share/1"
                className="flex h-12 items-center justify-center rounded-full border border-[#829789] bg-white px-6 font-semibold text-[#405a48] transition hover:bg-[#f1f6f2]"
              >
                写真と一緒にシェア
              </Link>
            </div>
            {saveError && <p role="alert" className="mt-4 text-center text-sm text-[#b45f52]">{saveError}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
