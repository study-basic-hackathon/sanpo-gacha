import AppHeader from "@/components/layout/AppHeader";
import StatisticsSummary from "@/components/statistics/StatisticsSummary";
import { MONTHLY_GOAL } from "@/frontend/utils/historyStatistics";

export default function StatisticsPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#24352b]">
      <AppHeader active="statistics" />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <section className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#62816c]">
              YOUR STROLL RECORD
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#173f2d]">
              あなたの散歩記録
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#617068]">
              毎日の散歩を振り返ってみましょう。
            </p>
          </div>

          <div className="rounded-xl border border-[#d7e1d8] bg-white px-5 py-3 text-sm shadow-sm">
            <span className="text-[#718078]">今月の目標：</span>
            <span className="font-bold text-[#285c3d]">
              週{MONTHLY_GOAL.countPerWeek}回・合計
              {MONTHLY_GOAL.meter / 1000}km
            </span>
          </div>
        </section>

        <StatisticsSummary />
      </div>
    </main>
  );
}
