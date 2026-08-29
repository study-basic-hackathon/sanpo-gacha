"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";


export default function SharePage() {
  const params = useParams<{ id: string }>();
  const [message, setMessage] = useState("");

  const stroll = {
    id: params.id,
    place: "富岡八幡宮",
    date: "2026年8月9日",
    distance: "1.6km",
    duration: "24分",
    steps: "2,340歩",
  };

  function handleSaveImage() {
    setMessage(
      "画像保存は現在モック機能です。カードの画像生成は実装時に対応します。",
    );
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("共有リンクをコピーしました。");
    } catch {
      setMessage(
        "リンクをコピーできませんでした。ブラウザの設定をご確認ください。",
      );
    }
  }

  async function handleShare() {
    const shareData = {
      title: "今日のさんぽ",
      text: `${stroll.place}まで散歩しました！ ${stroll.distance}・${stroll.duration}・${stroll.steps} #さんぽガチャ`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setMessage("共有画面を開きました。");
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setMessage("共有を開始できませんでした。");
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        setMessage(
          "このブラウザは共有機能に対応していないため、内容をコピーしました。",
        );
      } catch {
        setMessage("共有機能を利用できませんでした。");
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f7f2] text-[#24352b]">
      <header className="border-b border-[#d7e1d8] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
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

          <Link
            href="/stroll/result"
            className="text-sm font-medium text-[#53675a] transition hover:text-[#285c3d]"
          >
            ← 結果画面に戻る
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <section className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#62816c]">
            SHARE YOUR STROLL
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#173f2d]">
            散歩の思い出を共有
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#617068]">
            今日の散歩をカードにして共有できます。
          </p>
        </section>

        {message && (
          <div className="mx-auto mt-7 flex max-w-2xl items-center justify-between rounded-xl border border-[#cfe0d2] bg-[#edf6ee] px-5 py-4 text-left text-sm text-[#315f42]">
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

        <section className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[28px] border border-[#cad8cb] bg-white shadow-[0_18px_50px_rgba(41,77,52,0.12)]">
          <div className="px-8 pb-7 pt-8 sm:px-10">
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-[#68816f]">
                  今日のさんぽ
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#204b34]">
                  {stroll.place}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f2e8] text-2xl">
                🌿
              </div>
            </div>
          </div>

          <div className="relative mx-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#dcebdc] via-[#cde1d1] to-[#aed0b8] sm:mx-8">
            <div className="relative flex h-[320px] items-center justify-center">
              <div className="absolute left-[8%] top-[12%] h-16 w-16 rounded-full bg-[#fff6c7]" />

              <div className="absolute bottom-0 left-0 h-[42%] w-full bg-[#8db89a]" />

              <div className="absolute bottom-0 left-[-10%] h-[34%] w-[70%] rounded-tr-[100%] bg-[#719d7e]" />

              <div className="absolute bottom-0 right-[-10%] h-[28%] w-[65%] rounded-tl-[100%] bg-[#5f8d6c]" />

              <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/80 bg-white/75 text-6xl shadow-lg backdrop-blur-sm">
                ⛩️
              </div>

              <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-[#375943] shadow-sm">
                選択した写真
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 pt-7 sm:px-10">
            <div className="grid grid-cols-3 divide-x divide-[#e0e7e0] rounded-xl bg-[#f7faf6] py-4">
              <ShareStat label="距離" value={stroll.distance} />
              <ShareStat label="時間" value={stroll.duration} />
              <ShareStat label="歩数" value={stroll.steps} />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="font-bold text-[#36744f]">
                #さんぽガチャ
              </p>

              <p className="text-xs text-[#78867d]">
                {stroll.date}
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-xl border border-[#d7e1d8] bg-white px-5 py-4">
          <span className="mt-0.5 text-lg">🔒</span>

          <div>
            <p className="text-sm font-bold text-[#385443]">
              プライバシーについて
            </p>

            <p className="mt-1 text-xs leading-6 text-[#6e7c73]">
              正確な現在地や自宅位置は共有されません。
            </p>
          </div>
        </div>

        <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleSaveImage}
            className="rounded-xl border border-[#6f8c78] bg-white px-5 py-3 text-sm font-bold text-[#315f42] transition hover:bg-[#f0f5f0]"
          >
            画像を保存
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-xl border border-[#6f8c78] bg-white px-5 py-3 text-sm font-bold text-[#315f42] transition hover:bg-[#f0f5f0]"
          >
            リンクをコピー
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl bg-[#3b8458] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#32744c]"
          >
            共有する
          </button>
        </div>

        <p className="mt-5 text-center text-xs leading-6 text-[#859087]">
          ※ 現在はモック画面です。画像の保存機能は実装されていません。
        </p>
      </div>
    </main>
  );
}

function ShareStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-3 text-center">
      <p className="text-xs text-[#748177]">{label}</p>
      <p className="mt-2 text-lg font-bold text-[#24533a]">
        {value}
      </p>
    </div>
  );
}
