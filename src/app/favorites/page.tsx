"use client";

import AppHeader from "@/components/layout/AppHeader";
import { useState } from "react";

type FavoritePlace = {
  id: number;
  name: string;
  category: string;
  lastVisited: string;
  description: string;
  icon: string;
  backgroundColor: string;
};

const favoritePlaces: FavoritePlace[] = [
  {
    id: 1,
    name: "富岡八幡宮",
    category: "神社・寺",
    lastVisited: "2026/08/09",
    description:
      "江戸最大の八幡さまとして親しまれている、歴史ある神社です。",
    icon: "⛩️",
    backgroundColor: "#dcebdd",
  },
  {
    id: 2,
    name: "木場公園",
    category: "公園",
    lastVisited: "未訪問",
    description:
      "広い芝生と豊かな緑があり、ゆっくり散歩を楽しめる公園です。",
    icon: "🌳",
    backgroundColor: "#e4efcf",
  },
  {
    id: 3,
    name: "川沿いカフェ",
    category: "カフェ",
    lastVisited: "2026/08/07",
    description:
      "川沿いの景色を眺めながら、休憩できる落ち着いたカフェです。",
    icon: "☕",
    backgroundColor: "#f1e2ce",
  },
];

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState(
    favoritePlaces.map((place) => place.id),
  );

  const [openedDetailId, setOpenedDetailId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  function toggleFavorite(id: number) {
    const isFavorite = favoriteIds.includes(id);

    if (isFavorite) {
      setFavoriteIds(
        favoriteIds.filter((favoriteId) => favoriteId !== id),
      );
      setMessage("お気に入りから削除しました。");
    } else {
      setFavoriteIds([...favoriteIds, id]);
      setMessage("お気に入りに追加しました。");
    }
  }

  function toggleDetail(id: number) {
    setOpenedDetailId(openedDetailId === id ? null : id);
  }

  function handleStartStroll(placeName: string) {
    setMessage(
      `${placeName}を選択しました。現在はモック画面のため、ページ移動は行いません。`,
    );
  }

  const favoriteCount = favoriteIds.length;

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <AppHeader active="favorites" />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <section className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#62816c]">
              FAVORITE PLACES
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#173f2d]">
              お気に入りの場所
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#617068]">
              また訪れたい散歩先を確認できます。
            </p>
          </div>

          <div className="rounded-full border border-[#d5dfd5] bg-white px-5 py-2 text-sm text-[#52675a]">
            お気に入り
            <span className="ml-2 font-bold text-[#2f7d50]">
              {favoriteCount}件
            </span>
          </div>
        </section>

        {message && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-[#cfe0d2] bg-[#edf6ee] px-5 py-4 text-sm text-[#315f42]">
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

        <section className="mt-8 space-y-5">
          {favoritePlaces.map((place) => {
            const isFavorite = favoriteIds.includes(place.id);
            const isDetailOpen = openedDetailId === place.id;

            return (
              <article
                key={place.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                  isFavorite
                    ? "border-[#d7e1d8]"
                    : "border-[#e3e6e3] opacity-65"
                }`}
              >
                <div className="grid md:grid-cols-[210px_1fr]">
                  <div
                    className="flex min-h-44 items-center justify-center"
                    style={{
                      backgroundColor: place.backgroundColor,
                    }}
                  >
                    <span
                      className="text-6xl"
                      role="img"
                      aria-label={`${place.name}の写真`}
                    >
                      {place.icon}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between p-6">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <span className="inline-flex rounded-full bg-[#edf4ed] px-3 py-1 text-xs font-medium text-[#4c6c56]">
                          {place.category}
                        </span>

                        <h2 className="mt-3 text-xl font-bold text-[#214832]">
                          {place.name}
                        </h2>

                        <p className="mt-3 text-sm text-[#68776e]">
                          {place.lastVisited === "未訪問"
                            ? "未訪問"
                            : `前回訪問：${place.lastVisited}`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(place.id)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition ${
                          isFavorite
                            ? "border-[#efd3d3] bg-[#fff4f4] text-[#c95d5d]"
                            : "border-[#d9dfda] bg-white text-[#96a198]"
                        }`}
                        aria-label={
                          isFavorite
                            ? `${place.name}をお気に入りから削除`
                            : `${place.name}をお気に入りに追加`
                        }
                      >
                        {isFavorite ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDetail(place.id)}
                        className="rounded-lg border border-[#6c8b76] px-5 py-2.5 text-sm font-semibold text-[#315f42] transition hover:bg-[#f0f5f0]"
                      >
                        {isDetailOpen ? "閉じる" : "詳細"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartStroll(place.name)}
                        className="rounded-lg bg-[#3b8458] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#32744c]"
                      >
                        ここへ散歩
                      </button>
                    </div>
                  </div>
                </div>

                {isDetailOpen && (
                  <div className="border-t border-[#e1e8e1] bg-[#fafcf9] px-6 py-5 md:ml-[210px]">
                    <p className="text-sm leading-7 text-[#56675c]">
                      {place.description}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {favoriteCount === 0 && (
          <section className="mt-8 rounded-2xl border border-dashed border-[#cbd8cc] bg-white px-6 py-14 text-center">
            <div className="text-4xl">♡</div>

            <h2 className="mt-4 text-lg font-bold text-[#31563f]">
              お気に入りの場所はありません
            </h2>

            <p className="mt-2 text-sm text-[#718078]">
              気になる場所を見つけたら、お気に入りに追加しましょう。
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
