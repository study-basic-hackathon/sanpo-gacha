"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { HistoryResponse } from "@/frontend/api/history";
import { useHistories } from "@/frontend/hooks/useHistories";
import HistoryLoadError from "@/components/history/HistoryLoadError";
import {
  formatDistance,
  formatDuration,
  formatMonthDay,
  formatPlaceName,
  splitCategories,
} from "@/frontend/utils/historyFormat";
import {
  categoryVisual,
  pickRecentHistories,
  summarizeMonthlyStats,
} from "@/frontend/utils/historySummary";

/** ホームに表示する散歩履歴の件数。 */
const RECENT_LIMIT = 3;

// 未取得のときに毎回新しい配列を作らないよう、空配列は使い回す。
const NO_HISTORIES: HistoryResponse[] = [];

export default function RecentStrolls() {
  const { state, reload } = useHistories();

  const histories = useMemo(
    () => (state.status === "loaded" ? state.histories : NO_HISTORIES),
    [state],
  );

  const recent = useMemo(
    () => pickRecentHistories(histories, RECENT_LIMIT),
    [histories],
  );

  const stats = useMemo(
    () => summarizeMonthlyStats(histories, new Date()),
    [histories],
  );

  if (state.status === "loading") {
    return <RecentStrollsSkeleton />;
  }

  if (state.status === "failed") {
    return (
      <div className="mt-8">
        <HistoryLoadError error={state.error} onRetry={reload} />
      </div>
    );
  }

  if (histories.length === 0) {
    return <EmptyRecentStrolls />;
  }

  return (
    <>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {recent.map((history) => (
          <StrollCard key={history.historyId} history={history} />
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <StatCard label="今月の散歩" value={`${stats.strollCount}回`} />
        <StatCard label="今月の合計距離" value={formatDistance(stats.totalMeter)} />
        <StatCard
          label="今月の合計時間"
          value={formatDuration(stats.totalMinutes)}
        />
      </div>
    </>
  );
}

function StrollCard({ history }: { history: HistoryResponse }) {
  const { icon, background } = categoryVisual(history.categories);
  const categories = splitCategories(history.categories);

  return (
    <Link
      href={`/history/${history.historyId}`}
      className="block overflow-hidden rounded-2xl border border-[#c5cec7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div
        className="flex h-36 items-center justify-center text-5xl"
        style={{ background }}
      >
        <span aria-hidden="true">{icon}</span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold">
            {formatPlaceName(history.placeName)}
          </h3>

          <span className="shrink-0 text-xs text-[#7a877e]">
            {formatMonthDay(history.createdAt)}
          </span>
        </div>

        <p className="mt-3 text-sm text-[#607066]">
          {[
            formatDuration(history.timeTaken),
            formatDistance(history.meter),
            ...(categories.length > 0 ? [categories.join("・")] : []),
          ].join("・")}
        </p>
      </div>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
      <p className="text-sm text-[#6e7d73]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#2f6544]">{value}</p>
    </div>
  );
}

function EmptyRecentStrolls() {
  return (
    <section className="mt-8 rounded-2xl border border-[#c5cec7] bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf3ec] text-3xl">
        🚶
      </div>

      <h3 className="mt-5 text-xl font-bold text-[#214832]">
        まだ散歩の記録がありません
      </h3>

      <p className="mt-3 text-sm leading-6 text-[#647469]">
        はじめての散歩に出かけると、ここに記録が並びます。
      </p>

      <Link
        href="/search-stroll"
        className="mx-auto mt-6 flex h-11 w-fit items-center justify-center rounded-xl bg-[#3c7d55] px-6 text-sm font-semibold text-white transition hover:bg-[#2f6544]"
      >
        散歩先を探す
      </Link>
    </section>
  );
}

function RecentStrollsSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">散歩履歴を読み込んでいます</span>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-[#c5cec7] bg-white"
          >
            <div className="h-36 bg-[#eaf0ea]" />

            <div className="p-6">
              <div className="h-5 w-32 rounded bg-[#e0e8e0]" />
              <div className="mt-4 h-4 w-40 rounded bg-[#e0e8e0]" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="rounded-2xl bg-white p-5 text-center">
            <div className="mx-auto h-4 w-24 rounded bg-[#e0e8e0]" />
            <div className="mx-auto mt-3 h-7 w-20 rounded bg-[#e0e8e0]" />
          </div>
        ))}
      </div>
    </div>
  );
}
