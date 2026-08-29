"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import {
  searchStroll,
  type SearchStrollError,
} from "@/frontend/api/searchStroll";
import {
  saveSearchStrollResults,
  type SearchStrollCandidate,
} from "@/frontend/utils/searchStrollResults";
import { useLocation } from "@/frontend/contexts/LocationContext";

const durations = [15, 30, 45, 60];
const categories = [
  { name: "神社・寺", icon: "⛩️" },
  { name: "公園", icon: "🌳" },
  { name: "カフェ", icon: "☕" },
  { name: "景色", icon: "🌇" },
];

function errorMessage(error: SearchStrollError): string {
  if (error === "unauthorized") {
    return "セッションの有効期限が切れました。ログインし直してください。";
  }
  if (error === "invalid_input") {
    return "入力した散歩条件を確認してください。";
  }
  if (error === "not_found") {
    return "条件に合う散歩先が見つかりませんでした。";
  }
  return "散歩先の検索に失敗しました。時間をおいて再度お試しください。";
}

export default function SearchStrollPage() {
  const router = useRouter();
  const { location, requestCurrentLocation } = useLocation();
  const [duration, setDuration] = useState(30);
  const [selectedCategories, setSelectedCategories] = useState(["神社・寺"]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  }

  function handleSearch() {
    if (selectedCategories.length === 0) {
      setError("カテゴリを1つ以上選択してください。");
      return;
    }
    setIsSearching(true);
    setError(null);

    void (async () => {
      try {
        const currentLocation = location ?? (await requestCurrentLocation());
        const result = await searchStroll({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          categories: selectedCategories.join(","),
          duration,
        });

        if (!result.success) {
          setError(errorMessage(result.error));
          setIsSearching(false);
          return;
        }

        const candidate: SearchStrollCandidate = {
          ...result.value,
          category: selectedCategories.join("・"),
        };
        saveSearchStrollResults([candidate]);
        router.push("/stroll/new");
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "現在地を取得できませんでした。",
        );
        setIsSearching(false);
      }
    })();
  }

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <AppHeader />
      <div className="min-h-[calc(100vh-5rem)]">
        <aside className="border-r border-[#d1d9d3] bg-white px-7 py-9 lg:px-9">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#6d8b74]">STROLL CONDITIONS</p>
          <h1 className="mt-2 text-2xl font-bold text-[#24483a]">散歩条件</h1>

          <section className="mt-9">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf4e9]">⏱️</span>
              <div><h2 className="font-bold">散歩時間</h2><p className="mt-1 text-xs text-[#78847c]">今日歩ける時間を選んでください</p></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {durations.map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#cad4cc] bg-white px-4 py-3 transition hover:border-[#3c7d55] hover:bg-[#f1f7f2]">
                  <input type="radio" name="duration" value={value} checked={duration === value} onChange={() => setDuration(value)} className="h-4 w-4 accent-[#3c7d55]" />
                  <span className="font-semibold">{value}分</span>
                </label>
              ))}
            </div>
          </section>

          <div className="my-8 h-px bg-[#e1e6e2]" />
          <section>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6eee3]">🧭</span>
              <div><h2 className="font-bold">カテゴリ</h2><p className="mt-1 text-xs text-[#78847c]">複数選択できます</p></div>
            </div>
            <div className="mt-5 space-y-3">
              {categories.map((category) => (
                <label key={category.name} className="flex cursor-pointer items-center justify-between rounded-xl border border-[#d2dad4] px-4 py-3 transition hover:border-[#3c7d55] hover:bg-[#f1f7f2]">
                  <span className="flex items-center gap-3"><span aria-hidden="true" className="text-xl">{category.icon}</span><span className="font-semibold">{category.name}</span></span>
                  <input type="checkbox" checked={selectedCategories.includes(category.name)} onChange={() => toggleCategory(category.name)} className="h-4 w-4 rounded accent-[#3c7d55]" />
                </label>
              ))}
            </div>
          </section>

          <button type="button" onClick={handleSearch} disabled={isSearching} className="mt-9 flex h-13 w-full items-center justify-center rounded-xl bg-[#3c7d55] px-6 font-semibold text-white shadow-[0_8px_24px_rgba(60,125,85,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2f6544] disabled:cursor-not-allowed disabled:bg-[#aeb9b2]">
            {isSearching ? "検索中…" : "この条件で検索"}
          </button>
          {error && <p role="alert" className="mt-3 text-sm text-[#b45f52]">{error}</p>}
        </aside>

      </div>
    </main>
  );
}
