"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HistoryResponse } from "@/frontend/api/history";
import { useHistories } from "@/frontend/hooks/useHistories";
import HistoryLoadError from "@/components/history/HistoryLoadError";
import {
  formatDistance,
  formatDuration,
  formatPlaceName,
  formatSteps,
  formatVisitedDate,
  splitCategories,
} from "@/frontend/utils/historyFormat";
import {
  ALL_CATEGORIES,
  PERIOD,
  collectCategories,
  filterHistories,
  type Period,
} from "@/frontend/utils/historySummary";

// 未取得のときに毎回新しい配列を作らないよう、空配列は使い回す。
const NO_HISTORIES: HistoryResponse[] = [];

const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
  { value: PERIOD.all, label: "すべて" },
  { value: PERIOD.thisMonth, label: "今月" },
  { value: PERIOD.last3Months, label: "過去3か月" },
  { value: PERIOD.thisYear, label: "今年" },
];

export default function HistoryList() {
  const { state, reload } = useHistories();

  const [period, setPeriod] = useState<Period>(PERIOD.all);
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const histories = useMemo(
    () => (state.status === "loaded" ? state.histories : NO_HISTORIES),
    [state],
  );
  const categories = useMemo(() => collectCategories(histories), [histories]);

  // 絞り込みの基準となる「今」は、取得した履歴か条件が変わるたびに評価する。
  const filtered = useMemo(
    () => filterHistories(histories, { period, category }, new Date()),
    [histories, period, category],
  );

  const isLoaded = state.status === "loaded";

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end gap-5 rounded-2xl border border-[#c5cec7] bg-white p-5">
        <label>
          <span className="mb-2 block text-xs font-semibold text-[#69766e]">
            期間
          </span>

          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            disabled={!isLoaded}
            className="h-11 min-w-36 rounded-xl border border-[#c8d2ca] bg-white px-4 text-sm outline-none focus:border-[#3c7d55] disabled:cursor-not-allowed disabled:bg-[#f3f5f3] disabled:text-[#9aa79d]"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-xs font-semibold text-[#69766e]">
            カテゴリ
          </span>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={!isLoaded}
            className="h-11 min-w-36 rounded-xl border border-[#c8d2ca] bg-white px-4 text-sm outline-none focus:border-[#3c7d55] disabled:cursor-not-allowed disabled:bg-[#f3f5f3] disabled:text-[#9aa79d]"
          >
            <option value={ALL_CATEGORIES}>すべて</option>

            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {/* お気に入りとカレンダー表示はAPIが未対応のため、準備中として無効にしている。 */}
        <label
          title="準備中の機能です"
          className="flex h-11 cursor-not-allowed items-center gap-3 rounded-xl border border-[#dbe2dc] px-4 text-sm font-semibold text-[#9aa79d]"
        >
          <input type="checkbox" disabled className="h-4 w-4" />
          お気に入りのみ
          <span className="rounded-full bg-[#f1f4f1] px-2 py-0.5 text-[10px] font-semibold">
            準備中
          </span>
        </label>

        <div className="ml-auto flex h-11 overflow-hidden rounded-xl border border-[#9aaa9e]">
          <button
            type="button"
            aria-pressed="true"
            className="bg-[#3c7d55] px-5 text-sm font-semibold text-white"
          >
            表
          </button>

          <button
            type="button"
            disabled
            title="準備中の機能です"
            className="cursor-not-allowed bg-[#f3f5f3] px-5 text-sm font-semibold text-[#9aa79d]"
          >
            カレンダー
          </button>
        </div>
      </div>

      {state.status === "loading" && <HistoryTableSkeleton />}

      {state.status === "failed" && (
        <div className="mt-7">
          <HistoryLoadError error={state.error} onRetry={reload} />
        </div>
      )}

      {isLoaded &&
        (histories.length === 0 ? (
          <EmptyHistories />
        ) : (
          <>
            <HistoryTable histories={filtered} />

            <p className="mt-4 text-right text-sm text-[#7a867e]">
              {filtered.length === histories.length
                ? `全${histories.length}件の散歩記録`
                : `全${histories.length}件中${filtered.length}件を表示`}
            </p>
          </>
        ))}
    </>
  );
}

function HistoryTable({ histories }: { histories: HistoryResponse[] }) {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-[#cbd5cd] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="bg-[#eaf4e9]">
            <tr className="text-sm text-[#385843]">
              <th className="px-6 py-4 font-bold">日付</th>
              <th className="px-6 py-4 font-bold">訪れた場所</th>
              <th className="px-6 py-4 font-bold">カテゴリ</th>
              <th className="px-6 py-4 font-bold">時間</th>
              <th className="px-6 py-4 font-bold">距離</th>
              <th className="px-6 py-4 font-bold">歩数</th>
              <th className="px-6 py-4 text-center font-bold">詳細</th>
            </tr>
          </thead>

          <tbody>
            {histories.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm text-[#7a867e]"
                >
                  条件に合う散歩記録はありません。
                </td>
              </tr>
            ) : (
              histories.map((history) => (
                <tr
                  key={history.historyId}
                  className="border-t border-[#dce3de] text-sm transition hover:bg-[#fafcf9]"
                >
                  <td className="whitespace-nowrap px-6 py-5 text-[#69766e]">
                    {formatVisitedDate(history.createdAt)}
                  </td>

                  <td className="px-6 py-5 font-bold text-[#294b35]">
                    {formatPlaceName(history.placeName)}
                  </td>

                  <td className="px-6 py-5">
                    <span className="flex flex-wrap gap-2">
                      {splitCategories(history.categories).map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-[#f2f6f2] px-3 py-1 text-xs text-[#52675a]"
                        >
                          {name}
                        </span>
                      ))}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-5">
                    {formatDuration(history.timeTaken)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5">
                    {formatDistance(history.meter)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-5">
                    {formatSteps(history.steps)}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <Link
                      href={`/history/${history.historyId}`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[#829789] px-5 text-xs font-semibold text-[#405a48] transition hover:bg-[#eef4ef]"
                    >
                      見る
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyHistories() {
  return (
    <section className="mt-7 rounded-2xl border border-[#cbd5cd] bg-white p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf3ec] text-3xl">
        🚶
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#214832]">
        まだ散歩の記録がありません
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#647469]">
        散歩先を探して歩くと、ここに記録が残ります。
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

function HistoryTableSkeleton() {
  return (
    <div
      className="mt-7 animate-pulse overflow-hidden rounded-2xl border border-[#cbd5cd] bg-white"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">散歩履歴を読み込んでいます</span>

      <div className="h-14 bg-[#eaf4e9]" />

      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex items-center gap-6 border-t border-[#dce3de] px-6 py-6"
        >
          <div className="h-4 w-24 rounded bg-[#e0e8e0]" />
          <div className="h-4 w-40 rounded bg-[#e0e8e0]" />
          <div className="h-4 w-20 rounded bg-[#e0e8e0]" />
          <div className="ml-auto h-8 w-16 rounded-full bg-[#e0e8e0]" />
        </div>
      ))}
    </div>
  );
}
