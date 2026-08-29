"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchHistory,
  FETCH_HISTORY_ERROR,
  type FetchHistoryError,
  type HistoryResponse,
} from "@/frontend/api/history";
import {
  formatCalories,
  formatDistance,
  formatDuration,
  formatPlaceName,
  formatSteps,
  formatVisitedAt,
  splitCategories,
} from "@/frontend/utils/historyFormat";

type HistoryDetailProps = {
  historyId: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; history: HistoryResponse }
  | { status: "failed"; error: FetchHistoryError };

export default function HistoryDetail({ historyId }: HistoryDetailProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  // 再読み込みボタンでこの値を更新し、取得の副作用を再実行させる。
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void fetchHistory(historyId).then((result) => {
      if (cancelled) {
        return;
      }

      setState(
        result.success
          ? { status: "loaded", history: result.value }
          : { status: "failed", error: result.error },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [historyId, reloadKey]);

  function handleRetry() {
    setState({ status: "loading" });
    setReloadKey((key) => key + 1);
  }

  if (state.status === "loading") {
    return <DetailSkeleton />;
  }

  if (state.status === "failed") {
    return <DetailError error={state.error} onRetry={handleRetry} />;
  }

  return <DetailContent history={state.history} />;
}

function DetailContent({ history }: { history: HistoryResponse }) {
  const categories = splitCategories(history.categories);

  return (
    <>
      <div className="mt-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#62816c]">
          STROLL RECORD
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#173f2d]">
          {`「${formatPlaceName(history.placeName)}」への散歩`}
        </h1>

        <p className="mt-2 text-sm text-[#647469]">
          {formatVisitedAt(history.createdAt)}
        </p>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#d7e1d8] bg-white shadow-sm">
        <PhotoViewer imagePaths={history.imagePaths} />

        <div className="grid grid-cols-2 divide-[#e2e8e2] border-t border-[#e2e8e2] sm:grid-cols-4 sm:divide-x">
          <ResultItem
            label="散歩時間"
            value={formatDuration(history.timeTaken)}
          />
          <ResultItem label="距離" value={formatDistance(history.meter)} />
          <ResultItem label="歩数" value={formatSteps(history.steps)} />
          <ResultItem
            label="消費カロリー"
            value={formatCalories(history.calories)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#214832]">記録の詳細</h2>

        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[#738078]">カテゴリ</dt>

            <dd className="mt-2 flex flex-wrap gap-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-[#f2f6f2] px-3 py-1 text-xs text-[#52675a]"
                  >
                    {category}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#738078]">未設定</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-[#738078]">訪れた場所</dt>

            <dd className="mt-2 break-all text-sm text-[#526258]">
              {formatPlaceName(history.placeName)}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-[#738078]">記録日時</dt>

            <dd className="mt-2 text-sm text-[#526258]">
              {formatVisitedAt(history.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-[#738078]">写真</dt>

            <dd className="mt-2 text-sm text-[#526258]">
              {history.imagePaths.length}枚
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}

function PhotoViewer({ imagePaths }: { imagePaths: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 画像ファイルを取得できないパスは、写真なしと同じ扱いにする。
  const [brokenPaths, setBrokenPaths] = useState<string[]>([]);

  const availablePaths = imagePaths.filter(
    (path) => !brokenPaths.includes(path),
  );

  if (availablePaths.length === 0) {
    return <PhotoPlaceholder />;
  }

  const currentPath =
    availablePaths[Math.min(selectedIndex, availablePaths.length - 1)];

  return (
    <div>
      <div className="relative h-[360px] bg-[#edf3ec]">
        <Image
          key={currentPath}
          src={currentPath}
          alt="散歩中に撮影した写真"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 960px"
          onError={() => setBrokenPaths((paths) => [...paths, currentPath])}
          unoptimized
        />
      </div>

      {availablePaths.length > 1 && (
        <div className="flex gap-3 overflow-x-auto border-t border-[#e2e8e2] p-4">
          {availablePaths.map((path, index) => (
            <button
              key={path}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`${index + 1}枚目の写真を表示`}
              aria-current={path === currentPath}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                path === currentPath
                  ? "border-[#3c7d55]"
                  : "border-transparent hover:border-[#b7c9bc]"
              }`}
            >
              <Image
                src={path}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="flex h-[360px] flex-col items-center justify-center bg-[#edf3ec] text-[#708076]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
        📷
      </div>

      <p className="mt-5 font-semibold">写真はありません</p>

      <p className="mt-2 text-sm">この散歩では写真が保存されていません。</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-6 animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">散歩履歴を読み込んでいます</span>

      <div className="h-4 w-32 rounded bg-[#e0e8e0]" />
      <div className="mt-3 h-9 w-72 max-w-full rounded bg-[#e0e8e0]" />
      <div className="mt-3 h-4 w-48 rounded bg-[#e0e8e0]" />

      <div className="mt-8 overflow-hidden rounded-2xl border border-[#d7e1d8] bg-white">
        <div className="h-[360px] bg-[#eaf0ea]" />

        <div className="grid grid-cols-2 border-t border-[#e2e8e2] sm:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="px-5 py-6">
              <div className="mx-auto h-3 w-16 rounded bg-[#e0e8e0]" />
              <div className="mx-auto mt-3 h-5 w-20 rounded bg-[#e0e8e0]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ERROR_MESSAGES: Record<
  FetchHistoryError,
  { title: string; description: string }
> = {
  [FETCH_HISTORY_ERROR.notFound]: {
    title: "散歩履歴が見つかりません",
    description:
      "削除されたか、URLが正しくない可能性があります。散歩履歴一覧からもう一度お試しください。",
  },
  [FETCH_HISTORY_ERROR.unauthorized]: {
    title: "ログインが必要です",
    description:
      "セッションの有効期限が切れている可能性があります。もう一度ログインしてください。",
  },
  [FETCH_HISTORY_ERROR.unexpected]: {
    title: "散歩履歴を取得できませんでした",
    description:
      "時間をおいてから、もう一度お試しください。問題が続く場合は再読み込みしてください。",
  },
};

function DetailError({
  error,
  onRetry,
}: {
  error: FetchHistoryError;
  onRetry: () => void;
}) {
  const { title, description } = ERROR_MESSAGES[error];

  return (
    <section
      role="alert"
      className="mt-8 rounded-2xl border border-[#d7e1d8] bg-white p-10 text-center shadow-sm"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf3ec] text-3xl">
        🍃
      </div>

      <h1 className="mt-5 text-xl font-bold text-[#214832]">{title}</h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#647469]">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {error === FETCH_HISTORY_ERROR.unauthorized ? (
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#3c7d55] px-6 text-sm font-semibold text-white transition hover:bg-[#336b49]"
          >
            ログインする
          </Link>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#3c7d55] px-6 text-sm font-semibold text-white transition hover:bg-[#336b49]"
          >
            再読み込み
          </button>
        )}

        <Link
          href="/history"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#829789] px-6 text-sm font-semibold text-[#405a48] transition hover:bg-[#eef4ef]"
        >
          散歩履歴に戻る
        </Link>
      </div>
    </section>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-6 text-center">
      <p className="text-xs text-[#738078]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[#24533a]">{value}</p>
    </div>
  );
}
