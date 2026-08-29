"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { HistoryResponse } from "@/frontend/api/history";
import { useHistories } from "@/frontend/hooks/useHistories";
import HistoryLoadError from "@/components/history/HistoryLoadError";
import { formatDistance } from "@/frontend/utils/historyFormat";
import { summarizeMonthlyStats } from "@/frontend/utils/historySummary";
import {
  type AchievementCalendar,
  type GoalProgress,
  type WeeklySteps,
  buildAchievementCalendar,
  calcGoalProgress,
  stepAxisMax,
  summarizeWeeklySteps,
} from "@/frontend/utils/historyStatistics";

// 未取得のときに毎回新しい配列を作らないよう、空配列は使い回す。
const NO_HISTORIES: HistoryResponse[] = [];

export default function StatisticsSummary() {
  const { state, reload } = useHistories();

  const histories = useMemo(
    () => (state.status === "loaded" ? state.histories : NO_HISTORIES),
    [state],
  );

  // 集計の基準となる「今」は、取得した履歴が変わるたびに評価する。
  const summary = useMemo(() => {
    const now = new Date();
    const monthly = summarizeMonthlyStats(histories, now);

    return {
      monthly,
      weeklySteps: summarizeWeeklySteps(histories, now),
      calendar: buildAchievementCalendar(histories, now),
      progress: calcGoalProgress(monthly.totalMeter),
    };
  }, [histories]);

  if (state.status === "loading") {
    return <StatisticsSkeleton />;
  }

  if (state.status === "failed") {
    return (
      <div className="mt-8">
        <HistoryLoadError error={state.error} onRetry={reload} />
      </div>
    );
  }

  if (histories.length === 0) {
    return <EmptyStatistics />;
  }

  const { monthly, weeklySteps, calendar, progress } = summary;

  return (
    <>
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard
          label="今月の散歩"
          value={monthly.strollCount.toLocaleString("ja-JP")}
          unit="回"
          icon="👟"
        />

        <StatCard
          label="今月歩いた距離"
          value={(monthly.totalMeter / 1000).toFixed(1)}
          unit="km"
          icon="📍"
        />

        <StatCard
          label="今月の合計歩数"
          value={monthly.totalSteps.toLocaleString("ja-JP")}
          unit="歩"
          icon="🌿"
        />
      </section>

      <GoalProgressSection progress={progress} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <WeeklyStepsChart weeklySteps={weeklySteps} />

        <AchievementCalendarSection calendar={calendar} />
      </div>
    </>
  );
}

function GoalProgressSection({ progress }: { progress: GoalProgress }) {
  const achieved = progress.remainingMeter === 0;

  return (
    <section className="mt-6 rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-[#214832]">今月の目標</h2>

          <p className="mt-1 text-sm text-[#6b796f]">
            {achieved
              ? "今月の目標を達成しました。"
              : `あと${formatDistance(progress.remainingMeter)}で目標達成です。`}
          </p>
        </div>

        <p className="text-sm font-bold text-[#2f7350]">
          {(progress.achievedMeter / 1000).toFixed(1)} /{" "}
          {progress.goalMeter / 1000} km
        </p>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e6eee6]">
        <div
          className="h-full rounded-full bg-[#4c9365]"
          style={{ width: `${Math.min(progress.ratePercent, 100)}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-[#7a877e]">
        <span>0 km</span>
        <span>達成率 {progress.ratePercent}%</span>
        <span>{progress.goalMeter / 1000} km</span>
      </div>
    </section>
  );
}

function WeeklyStepsChart({ weeklySteps }: { weeklySteps: WeeklySteps[] }) {
  const axisMax = stepAxisMax(weeklySteps);

  // 目盛りは上から4等分し、最大値から0までのラベルを並べる。
  const axisLabels = [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
    Math.round(axisMax * ratio).toLocaleString("ja-JP"),
  );

  return (
    <section className="rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-[#214832]">週間の歩数</h2>

        <p className="mt-1 text-sm text-[#718078]">
          今週の歩数を曜日ごとに表示しています。
        </p>
      </div>

      <div className="mt-8 grid grid-cols-[52px_1fr] gap-4">
        <div className="flex h-64 flex-col justify-between pb-7 text-right text-xs text-[#829087]">
          {axisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="relative h-64">
          <div className="absolute inset-x-0 top-0 border-t border-[#e5ebe5]" />
          <div className="absolute inset-x-0 top-[25%] border-t border-[#e5ebe5]" />
          <div className="absolute inset-x-0 top-[50%] border-t border-[#e5ebe5]" />
          <div className="absolute inset-x-0 top-[75%] border-t border-[#e5ebe5]" />
          <div className="absolute inset-x-0 bottom-7 border-t border-[#d7e1d8]" />

          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-around gap-3">
            {weeklySteps.map((item) => (
              <div
                key={item.day}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 text-xs font-semibold text-[#456550]">
                  {item.steps.toLocaleString("ja-JP")}
                </span>

                <div className="flex h-[190px] w-full max-w-12 items-end">
                  <div
                    className="w-full rounded-t-lg bg-[#72a982]"
                    style={{ height: `${(item.steps / axisMax) * 100}%` }}
                  />
                </div>

                <span className="mt-2 text-xs font-medium text-[#65746a]">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AchievementCalendarSection({
  calendar,
}: {
  calendar: AchievementCalendar;
}) {
  return (
    <section className="rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#214832]">達成カレンダー</h2>

          <p className="mt-1 text-sm text-[#718078]">
            散歩した日に印がつきます。
          </p>
        </div>

        <p className="text-sm font-bold text-[#315f42]">
          {calendar.year}年{calendar.month}月
        </p>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-medium text-[#718078]">
        <span>月</span>
        <span>火</span>
        <span>水</span>
        <span>木</span>
        <span>金</span>
        <span className="text-[#4d7290]">土</span>
        <span className="text-[#b76767]">日</span>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: calendar.leadingBlankCount }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {calendar.days.map((item) => (
          <div
            key={item.day}
            className={`relative flex aspect-square items-center justify-center rounded-full text-sm ${
              item.achieved
                ? "bg-[#4c9365] font-bold text-white"
                : "text-[#53655a]"
            }`}
          >
            {item.day}

            {item.achieved && <span className="sr-only">散歩達成</span>}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 text-xs text-[#6c7a70]">
        <span className="h-3 w-3 rounded-full bg-[#4c9365]" />
        <span>散歩をした日</span>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  icon: string;
}) {
  return (
    <article className="rounded-2xl border border-[#d7e1d8] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6d7b72]">{label}</p>

          <p className="mt-3 text-3xl font-bold text-[#24533a]">
            {value}
            <span className="ml-1 text-base font-semibold">{unit}</span>
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf4ed] text-xl">
          {icon}
        </div>
      </div>
    </article>
  );
}

function EmptyStatistics() {
  return (
    <section className="mt-8 rounded-2xl border border-[#d7e1d8] bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf3ec] text-3xl">
        📊
      </div>

      <h2 className="mt-5 text-xl font-bold text-[#214832]">
        まだ集計できる記録がありません
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#647469]">
        散歩の記録が増えると、歩数や達成カレンダーがここに並びます。
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

function StatisticsSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">散歩記録を読み込んでいます</span>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#d7e1d8] bg-white p-6"
          >
            <div className="h-4 w-24 rounded bg-[#e0e8e0]" />
            <div className="mt-4 h-8 w-28 rounded bg-[#e0e8e0]" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[#d7e1d8] bg-white p-6">
        <div className="h-5 w-28 rounded bg-[#e0e8e0]" />
        <div className="mt-5 h-3 rounded-full bg-[#e6eee6]" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#d7e1d8] bg-white p-6"
          >
            <div className="h-5 w-32 rounded bg-[#e0e8e0]" />
            <div className="mt-8 h-64 rounded-xl bg-[#eff3ef]" />
          </div>
        ))}
      </div>
    </div>
  );
}
