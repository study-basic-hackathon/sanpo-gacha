"use client";

import Link from "next/link";
import {
  FETCH_HISTORY_ERROR,
  type FetchHistoryError,
} from "@/frontend/api/history";

const ERROR_MESSAGES: Record<
  FetchHistoryError,
  { title: string; description: string }
> = {
  [FETCH_HISTORY_ERROR.notFound]: {
    title: "散歩履歴が見つかりません",
    description:
      "削除されたか、URLが正しくない可能性があります。時間をおいてからもう一度お試しください。",
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

type HistoryLoadErrorProps = {
  error: FetchHistoryError;
  onRetry: () => void;
};

/** 履歴の取得に失敗したときの共通表示。 */
export default function HistoryLoadError({
  error,
  onRetry,
}: HistoryLoadErrorProps) {
  const { title, description } = ERROR_MESSAGES[error];

  return (
    <section
      role="alert"
      className="rounded-2xl border border-[#d7e1d8] bg-white p-10 text-center shadow-sm"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf3ec] text-3xl">
        🍃
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#214832]">{title}</h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#647469]">
        {description}
      </p>

      <div className="mt-6 flex justify-center">
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
      </div>
    </section>
  );
}
